const express = require('express')
const supabase = require('../supabase')
const router = express.Router()

router.get('/', async (req, res) => {
  const api_key = req.headers['x-api-key']
  if (!api_key) return res.status(401).json({ error: 'Unauthorized' })

  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('api_key', api_key)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.post('/', async (req, res) => {
  const api_key = req.headers['x-api-key']
  const { name, code } = req.body
  if (!api_key) return res.status(401).json({ error: 'Unauthorized' })

  const { data, error } = await supabase
    .from('strategies')
    .insert({ name, code, api_key })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.put('/:id', async (req, res) => {
  const api_key = req.headers['x-api-key']
  const { name, code } = req.body

  const { data, error } = await supabase
    .from('strategies')
    .update({ name, code, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('api_key', api_key)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const api_key = req.headers['x-api-key']

  const { error } = await supabase
    .from('strategies')
    .delete()
    .eq('id', req.params.id)
    .eq('api_key', api_key)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

module.exports = router
