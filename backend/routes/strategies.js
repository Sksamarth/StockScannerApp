const express = require('express')
const supabase = require('../supabase')
const router = express.Router()

// Middleware to validate API key
const validateApiKey = (req, res, next) => {
  const api_key = req.headers['x-api-key']
  
  if (!api_key || api_key === 'default-key') {
    console.warn('Missing or invalid API key')
    return res.status(401).json({ error: 'Missing x-api-key header. Please log in first.' })
  }
  
  next()
}

router.get('/', validateApiKey, async (req, res) => {
  try {
    const api_key = req.headers['x-api-key']

    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('api_key', api_key)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching strategies:', error)
      return res.status(500).json({ error: error.message })
    }
    
    res.json(data || [])
  } catch (err) {
    console.error('Error fetching strategies:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', validateApiKey, async (req, res) => {
  try {
    const api_key = req.headers['x-api-key']
    const { name, code } = req.body

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' })
    }

    const { data, error } = await supabase
      .from('strategies')
      .insert({ name, code, api_key })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating strategy:', error)
      return res.status(500).json({ error: error.message })
    }
    
    res.json(data)
  } catch (err) {
    console.error('Error creating strategy:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', validateApiKey, async (req, res) => {
  try {
    const api_key = req.headers['x-api-key']
    const { name, code } = req.body

    const { data, error } = await supabase
      .from('strategies')
      .update({ name, code, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('api_key', api_key)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating strategy:', error)
      return res.status(500).json({ error: error.message })
    }
    
    res.json(data)
  } catch (err) {
    console.error('Error updating strategy:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', validateApiKey, async (req, res) => {
  try {
    const api_key = req.headers['x-api-key']

    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', req.params.id)
      .eq('api_key', api_key)

    if (error) {
      console.error('Supabase error deleting strategy:', error)
      return res.status(500).json({ error: error.message })
    }
    
    res.json({ success: true })
  } catch (err) {
    console.error('Error deleting strategy:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
