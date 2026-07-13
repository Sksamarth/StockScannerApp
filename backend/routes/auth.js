const express = require('express')
const axios = require('axios')
const router = express.Router()

// Validate Upstox credentials by calling profile endpoint
router.post('/validate', async (req, res) => {
  const { access_token, api_key } = req.body
  if (!access_token) return res.status(400).json({ error: 'access_token required' })

  try {
    const response = await axios.get('https://api.upstox.com/v2/user/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
      },
    })
    res.json({ profile: response.data.data })
  } catch (err) {
    const msg = err.response?.data?.message || 'Invalid credentials'
    res.status(401).json({ error: msg })
  }
})

// OAuth token exchange
router.post('/token', async (req, res) => {
  const { code, api_key, api_secret, redirect_uri } = req.body
  try {
    const params = new URLSearchParams({
      code,
      client_id: api_key,
      client_secret: api_secret,
      redirect_uri,
      grant_type: 'authorization_code',
    })
    const response = await axios.post('https://api.upstox.com/v2/login/authorization/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    res.json(response.data)
  } catch (err) {
    res.status(400).json({ error: err.response?.data?.message || 'Token exchange failed' })
  }
})

module.exports = router
