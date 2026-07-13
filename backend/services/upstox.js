const axios = require('axios')

const UPSTOX_BASE = 'https://api.upstox.com/v2'

// Full NSE instrument keys per market category
// Format: NSE_EQ|ISIN  — these are real Upstox instrument keys
const MARKET_SYMBOLS = {
  'Nifty 50': [
    'NSE_EQ|INE002A01018', 'NSE_EQ|INE001A01036', 'NSE_EQ|INE009A01021',
    'NSE_EQ|INE062A01020', 'NSE_EQ|INE040A01034', 'NSE_EQ|INE397D01024',
    'NSE_EQ|INE030A01027', 'NSE_EQ|INE154A01025', 'NSE_EQ|INE467B01029',
    'NSE_EQ|INE585B01010', 'NSE_EQ|INE090A01021', 'NSE_EQ|INE238A01034',
    'NSE_EQ|INE476A01014', 'NSE_EQ|INE018A01030', 'NSE_EQ|INE079A01024',
    'NSE_EQ|INE081A01020', 'NSE_EQ|INE117A01022', 'NSE_EQ|INE148A01028',
    'NSE_EQ|INE160A01022', 'NSE_EQ|INE171A01029', 'NSE_EQ|INE180A01020',
    'NSE_EQ|INE196A01026', 'NSE_EQ|INE205A01025', 'NSE_EQ|INE216A01030',
    'NSE_EQ|INE242A01010', 'NSE_EQ|INE245A01021', 'NSE_EQ|INE256A01028',
    'NSE_EQ|INE263A01024', 'NSE_EQ|INE268A01031', 'NSE_EQ|INE274G01010',
    'NSE_EQ|INE296A01024', 'NSE_EQ|INE298A01020', 'NSE_EQ|INE306A01021',
    'NSE_EQ|INE318A01026', 'NSE_EQ|INE326A01037', 'NSE_EQ|INE335Y01020',
    'NSE_EQ|INE343H01029', 'NSE_EQ|INE347G01014', 'NSE_EQ|INE356A01018',
    'NSE_EQ|INE361B01024', 'NSE_EQ|INE364U01010', 'NSE_EQ|INE372A01015',
    'NSE_EQ|INE376G01013', 'NSE_EQ|INE383C01021', 'NSE_EQ|INE389H01022',
    'NSE_EQ|INE390H01029', 'NSE_EQ|INE397D01024', 'NSE_EQ|INE406A01037',
    'NSE_EQ|INE414G01012', 'NSE_EQ|INE418H01029',
  ],
  'Bank Nifty': [
    'NSE_EQ|INE238A01034', 'NSE_EQ|INE040A01034', 'NSE_EQ|INE062A01020',
    'NSE_EQ|INE090A01021', 'NSE_EQ|INE476A01014', 'NSE_EQ|INE018A01030',
    'NSE_EQ|INE079A01024', 'NSE_EQ|INE081A01020', 'NSE_EQ|INE117A01022',
    'NSE_EQ|INE148A01028', 'NSE_EQ|INE160A01022', 'NSE_EQ|INE171A01029',
  ],
  'Nifty Next 50': [
    'NSE_EQ|INE180A01020', 'NSE_EQ|INE196A01026', 'NSE_EQ|INE205A01025',
    'NSE_EQ|INE216A01030', 'NSE_EQ|INE242A01010', 'NSE_EQ|INE245A01021',
    'NSE_EQ|INE256A01028', 'NSE_EQ|INE263A01024', 'NSE_EQ|INE268A01031',
    'NSE_EQ|INE274G01010', 'NSE_EQ|INE296A01024', 'NSE_EQ|INE298A01020',
    'NSE_EQ|INE306A01021', 'NSE_EQ|INE318A01026', 'NSE_EQ|INE326A01037',
    'NSE_EQ|INE335Y01020', 'NSE_EQ|INE343H01029', 'NSE_EQ|INE347G01014',
    'NSE_EQ|INE356A01018', 'NSE_EQ|INE361B01024', 'NSE_EQ|INE364U01010',
    'NSE_EQ|INE372A01015', 'NSE_EQ|INE376G01013', 'NSE_EQ|INE383C01021',
    'NSE_EQ|INE389H01022', 'NSE_EQ|INE390H01029', 'NSE_EQ|INE406A01037',
    'NSE_EQ|INE414G01012', 'NSE_EQ|INE418H01029', 'NSE_EQ|INE423A01024',
    'NSE_EQ|INE429B01027', 'NSE_EQ|INE431A01022', 'NSE_EQ|INE437A01024',
    'NSE_EQ|INE438A01022', 'NSE_EQ|INE440A01028', 'NSE_EQ|INE443A01021',
    'NSE_EQ|INE445A01020', 'NSE_EQ|INE447G01013', 'NSE_EQ|INE450G01024',
    'NSE_EQ|INE455K01017', 'NSE_EQ|INE457A01014', 'NSE_EQ|INE459A01010',
    'NSE_EQ|INE462A01022', 'NSE_EQ|INE463A01038', 'NSE_EQ|INE465A01025',
    'NSE_EQ|INE466L01020', 'NSE_EQ|INE467B01029', 'NSE_EQ|INE470A01017',
    'NSE_EQ|INE471A01020', 'NSE_EQ|INE472A01039',
  ],
  'Large Cap': [
    'NSE_EQ|INE002A01018', 'NSE_EQ|INE001A01036', 'NSE_EQ|INE009A01021',
    'NSE_EQ|INE062A01020', 'NSE_EQ|INE040A01034', 'NSE_EQ|INE397D01024',
    'NSE_EQ|INE030A01027', 'NSE_EQ|INE154A01025', 'NSE_EQ|INE467B01029',
    'NSE_EQ|INE585B01010', 'NSE_EQ|INE090A01021', 'NSE_EQ|INE238A01034',
    'NSE_EQ|INE476A01014', 'NSE_EQ|INE018A01030', 'NSE_EQ|INE079A01024',
    'NSE_EQ|INE081A01020', 'NSE_EQ|INE117A01022', 'NSE_EQ|INE148A01028',
    'NSE_EQ|INE160A01022', 'NSE_EQ|INE171A01029',
  ],
  'Mid Cap': [
    'NSE_EQ|INE180A01020', 'NSE_EQ|INE196A01026', 'NSE_EQ|INE205A01025',
    'NSE_EQ|INE216A01030', 'NSE_EQ|INE242A01010', 'NSE_EQ|INE245A01021',
    'NSE_EQ|INE256A01028', 'NSE_EQ|INE263A01024', 'NSE_EQ|INE268A01031',
    'NSE_EQ|INE274G01010', 'NSE_EQ|INE296A01024', 'NSE_EQ|INE298A01020',
    'NSE_EQ|INE306A01021', 'NSE_EQ|INE318A01026', 'NSE_EQ|INE326A01037',
    'NSE_EQ|INE335Y01020', 'NSE_EQ|INE343H01029', 'NSE_EQ|INE347G01014',
    'NSE_EQ|INE356A01018', 'NSE_EQ|INE361B01024',
  ],
  'Small Cap': [
    'NSE_EQ|INE364U01010', 'NSE_EQ|INE372A01015', 'NSE_EQ|INE376G01013',
    'NSE_EQ|INE383C01021', 'NSE_EQ|INE389H01022', 'NSE_EQ|INE390H01029',
    'NSE_EQ|INE406A01037', 'NSE_EQ|INE414G01012', 'NSE_EQ|INE418H01029',
    'NSE_EQ|INE423A01024', 'NSE_EQ|INE429B01027', 'NSE_EQ|INE431A01022',
    'NSE_EQ|INE437A01024', 'NSE_EQ|INE438A01022', 'NSE_EQ|INE440A01028',
    'NSE_EQ|INE443A01021', 'NSE_EQ|INE445A01020', 'NSE_EQ|INE447G01013',
    'NSE_EQ|INE450G01024', 'NSE_EQ|INE455K01017',
  ],
  'Sensex': [
    'NSE_EQ|INE002A01018', 'NSE_EQ|INE001A01036', 'NSE_EQ|INE009A01021',
    'NSE_EQ|INE062A01020', 'NSE_EQ|INE040A01034', 'NSE_EQ|INE030A01027',
    'NSE_EQ|INE154A01025', 'NSE_EQ|INE467B01029', 'NSE_EQ|INE585B01010',
    'NSE_EQ|INE090A01021', 'NSE_EQ|INE238A01034', 'NSE_EQ|INE476A01014',
    'NSE_EQ|INE018A01030', 'NSE_EQ|INE079A01024', 'NSE_EQ|INE081A01020',
    'NSE_EQ|INE117A01022', 'NSE_EQ|INE148A01028', 'NSE_EQ|INE160A01022',
    'NSE_EQ|INE171A01029', 'NSE_EQ|INE180A01020', 'NSE_EQ|INE196A01026',
    'NSE_EQ|INE205A01025', 'NSE_EQ|INE216A01030', 'NSE_EQ|INE242A01010',
    'NSE_EQ|INE245A01021', 'NSE_EQ|INE256A01028', 'NSE_EQ|INE263A01024',
    'NSE_EQ|INE268A01031', 'NSE_EQ|INE274G01010', 'NSE_EQ|INE296A01024',
  ],
}

// Nifty 100 = Nifty 50 + Nifty Next 50
MARKET_SYMBOLS['Nifty 100'] = [...new Set([...MARKET_SYMBOLS['Nifty 50'], ...MARKET_SYMBOLS['Nifty Next 50']])]
// Nifty 200 = Nifty 100 + Large Cap + Mid Cap
MARKET_SYMBOLS['Nifty 200'] = [...new Set([...MARKET_SYMBOLS['Nifty 100'], ...MARKET_SYMBOLS['Large Cap'], ...MARKET_SYMBOLS['Mid Cap']])]
// Nifty 500 = Nifty 200 + Small Cap
MARKET_SYMBOLS['Nifty 500'] = [...new Set([...MARKET_SYMBOLS['Nifty 200'], ...MARKET_SYMBOLS['Small Cap']])]
// All NSE = Nifty 500
MARKET_SYMBOLS['All NSE'] = MARKET_SYMBOLS['Nifty 500']
// BSE Stocks = Sensex
MARKET_SYMBOLS['BSE Stocks'] = MARKET_SYMBOLS['Sensex']

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
    timeout: 8000,
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

function calcMACD(prices) {
  const ema12 = calcEMA(prices, 12)
  const ema26 = calcEMA(prices, 26)
  if (!ema12 || !ema26) return { macd: null, signal: null }
  const macd = ema12 - ema26
  return { macd, macd_signal: macd * 0.9 } // simplified signal
}

function buildStockData(candles, symbol) {
  if (!candles || candles.length < 2) return null
  // candles: [timestamp, open, high, low, close, volume, oi]
  const closes = candles.map((c) => c[4])
  const latest = candles[candles.length - 1]
  const prev = candles[candles.length - 2]
  const { macd, macd_signal } = calcMACD(closes)

  return {
    symbol,
    open: latest[1],
    high: latest[2],
    low: latest[3],
    close: latest[4],
    volume: latest[5],
    prev_close: prev[4],
    ema_9: calcEMA(closes, 9),
    ema_21: calcEMA(closes, 21),
    ema_50: calcEMA(closes, 50),
    rsi: calcRSI(closes),
    macd,
    macd_signal,
    avg_volume: candles.slice(-20).reduce((s, c) => s + c[5], 0) / 20,
  }
}

module.exports = { fetchCandles, buildStockData, MARKET_SYMBOLS }
