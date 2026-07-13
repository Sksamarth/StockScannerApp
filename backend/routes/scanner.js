const express = require('express')
const supabase = require('../supabase')
const { fetchCandles, buildStockData, MARKET_SYMBOLS } = require('../services/upstox')
const router = express.Router()

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

router.post('/run', async (req, res) => {
  const access_token = req.headers['x-access-token']
  const api_key = req.headers['x-api-key']
  const { market, timeframe, strategy_id } = req.body

  if (!access_token) return res.status(401).json({ error: 'No access token' })

  // Load strategy
  let strategyCode = null
  if (strategy_id) {
    const { data } = await supabase.from('strategies').select('code').eq('id', strategy_id).single()
    strategyCode = data?.code
  }

  const symbols = MARKET_SYMBOLS[market] || MARKET_SYMBOLS['Nifty 50']
  const alerts = []
  let scanned = 0

  // Scan in batches of 5 to avoid rate limits
  for (let i = 0; i < symbols.length; i += 5) {
    const batch = symbols.slice(i, i + 5)
    await Promise.all(
      batch.map(async (instrumentKey) => {
        try {
          const candles = await fetchCandles(instrumentKey, timeframe, access_token)
          const stockData = buildStockData(candles, instrumentKey.split('|')[1] || instrumentKey)
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
        }
      })
    )
  }

  res.json({
    alerts,
    stats: { scanned, matched: alerts.length, lastScan: new Date().toISOString() },
  })
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
