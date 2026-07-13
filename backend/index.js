require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')

const authRoutes = require('./routes/auth')
const strategyRoutes = require('./routes/strategies')
const scannerRoutes = require('./routes/scanner')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/strategies', strategyRoutes)
app.use('/scanner', scannerRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
