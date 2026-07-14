const express = require('express')
const { randomUUID } = require('crypto')
const supabase = require('../supabase')
const { fetchCandles, buildStockData, MARKET_SYMBOLS } = require('../services/upstox')
const router = express.Router()
const activeScans = new Map()

// Simple in-process strategy runner (eval-based for user Python-like JS strategies)
// For production, use a sandboxed worker. Here we support JSON-rule strategies.
function runStrategy(strategyCode, stockData) {
  try {
    // Wrap user code: expect it to define a scan function
    const fn = new Function(
      'stock_data',
      `
      ${strategyCode}
      if (typeof scan === 'function') return scan(stock_data);
      return null;
      `
    )
    return fn(stockData)
  } catch {
    return null
  }
}

async function runScan({ access_token, api_key, market, timeframe, strategy_id, onProgress }) {
  let strategyCode = null
  if (strategy_id) {
    const { data } = await supabase.from('strategies').select('code').eq('id', strategy_id).single()
    strategyCode = data?.code
  }

  const symbols = MARKET_SYMBOLS[market] || MARKET_SYMBOLS['Nifty 50']
  const alerts = []
  let scanned = 0
  let processed = 0

  const reportProgress = (currentStock = null) => {
    onProgress?.({ processed, total: symbols.length, currentStock })
  }

  // Scan in batches of 5 to avoid rate limits
  for (let i = 0; i < symbols.length; i += 5) {
    const batch = symbols.slice(i, i + 5)
    await Promise.all(
      batch.map(async (instrumentKey) => {
        const symbol = instrumentKey.split('|')[1] || instrumentKey
        reportProgress(symbol)
        try {
          const candles = await fetchCandles(instrumentKey, timeframe, access_token)
          const stockData = buildStockData(candles, symbol)
          if (!stockData) return
          scanned++

          let result = null
          if (strategyCode) {
            result = runStrategy(strategyCode, stockData)
          } else {
            // Default: EMA 9/21 crossover
            if (stockData.ema_9 && stockData.ema_21 && stockData.ema_9 > stockData.ema_21) {
              result = { signal: 'BUY', reason: 'EMA 9 > EMA 21' }
            }
          }

          if (result?.signal) {
            const change = (((stockData.close - stockData.prev_close) / stockData.prev_close) * 100).toFixed(2)
            alerts.push({
              symbol: stockData.symbol,
              price: stockData.close,
              change: parseFloat(change),
              volume: stockData.volume,
              signal: result.signal,
              reason: result.reason,
              timeframe,
              time: new Date().toISOString(),
            })

            // Save alert to Supabase
            await supabase.from('alerts').insert({
              symbol: stockData.symbol,
              price: stockData.close,
              signal: result.signal,
              reason: result.reason,
              timeframe,
              api_key,
              strategy_id: strategy_id || null,
            })
          }
        } catch {
          // Skip failed symbols silently
        } finally {
          processed++
          reportProgress(symbol)
        }
      })
    )
  }

  return {
    alerts,
    stats: { scanned, matched: alerts.length, lastScan: new Date().toISOString() },
  }
}

router.post('/start', async (req, res) => {
  const access_token = req.headers['x-access-token']
  const api_key = req.headers['x-api-key']
  const { market, timeframe, strategy_id } = req.body

  if (!access_token) return res.status(401).json({ error: 'No access token' })

  const id = randomUUID()
  const job = {
    apiKey: api_key,
    status: 'running',
    progress: { processed: 0, total: (MARKET_SYMBOLS[market] || MARKET_SYMBOLS['Nifty 50']).length, currentStock: null },
    result: null,
  }
  activeScans.set(id, job)

  runScan({
    access_token,
    api_key,
    market,
    timeframe,
    strategy_id,
    onProgress: (progress) => { job.progress = progress },
  })
    .then((result) => {
      job.status = 'complete'
      job.result = result
      job.progress = { ...job.progress, processed: job.progress.total, currentStock: null }
    })
    .catch((error) => {
      job.status = 'error'
      job.error = error.message || 'Scan failed'
    })

  res.status(202).json({ job_id: id })
})

router.get('/progress/:id', (req, res) => {
  const job = activeScans.get(req.params.id)
  if (!job || job.apiKey !== req.headers['x-api-key']) return res.status(404).json({ error: 'Scan not found' })

  res.json({ status: job.status, progress: job.progress, result: job.result, error: job.error })
})

// Kept for compatibility with existing API clients.
router.post('/run', async (req, res) => {
  const access_token = req.headers['x-access-token']
  const api_key = req.headers['x-api-key']
  if (!access_token) return res.status(401).json({ error: 'No access token' })

  try {
    const result = await runScan({ ...req.body, access_token, api_key })
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message || 'Scan failed' })
  }
})

// Alert history
router.get('/alerts/history', async (req, res) => {
  const api_key = req.headers['x-api-key']
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('api_key', api_key)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Clear alert history
router.delete('/alerts/history', async (req, res) => {
  const api_key = req.headers['x-api-key']
  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('api_key', api_key)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

module.exports = router
