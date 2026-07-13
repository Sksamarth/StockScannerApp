const axios = require('axios')

const UPSTOX_BASE = 'https://api.upstox.com/v2'

// Market category → instrument keys mapping (Nifty 50 symbols as example)
const MARKET_SYMBOLS = {
  'Nifty 50': [
    'NSE_EQ|INE002A01018', 'NSE_EQ|INE001A01036', 'NSE_EQ|INE009A01021',
    'NSE_EQ|INE062A01020', 'NSE_EQ|INE040A01034', 'NSE_EQ|INE397D01024',
    'NSE_EQ|INE030A01027', 'NSE_EQ|INE154A01025', 'NSE_EQ|INE467B01029',
    'NSE_EQ|INE585B01010',
  ],
  'Bank Nifty': [
    'NSE_EQ|INE238A01034', 'NSE_EQ|INE040A01034', 'NSE_EQ|INE062A01020',
    'NSE_EQ|INE090A01021', 'NSE_EQ|INE476A01014',
  ],
}

const TIMEFRAME_MAP = {
  '5min': '5minute',
  '15min': '15minute',
  '30min': '30minute',
  '1day': 'day',
}

async function fetchCandles(instrumentKey, timeframe, accessToken) {
  const interval = TIMEFRAME_MAP[timeframe] || '15minute'
  const today = new Date().toISOString().split('T')[0]
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const url = `${UPSTOX_BASE}/historical-candle/${encodeURIComponent(instrumentKey)}/${interval}/${today}/${from}`

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  })
  return res.data?.data?.candles || []
}

function calcEMA(prices, period) {
  if (prices.length < period) return null
  const k = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k)
  return ema
}

function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return null
  let gains = 0, losses = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff > 0) gains += diff
    else losses -= diff
  }
  const rs = gains / (losses || 1)
  return 100 - 100 / (1 + rs)
}

function buildStockData(candles, symbol) {
  if (!candles.length) return null
  // candles: [timestamp, open, high, low, close, volume, oi]
  const closes = candles.map((c) => c[4])
  const latest = candles[candles.length - 1]
  const prev = candles[candles.length - 2]

  return {
    symbol,
    open: latest[1],
    high: latest[2],
    low: latest[3],
    close: latest[4],
    volume: latest[5],
    prev_close: prev?.[4] || latest[4],
    ema_9: calcEMA(closes, 9),
    ema_21: calcEMA(closes, 21),
    ema_50: calcEMA(closes, 50),
    rsi: calcRSI(closes),
    avg_volume: candles.slice(-20).reduce((s, c) => s + c[5], 0) / 20,
  }
}

module.exports = { fetchCandles, buildStockData, MARKET_SYMBOLS }
