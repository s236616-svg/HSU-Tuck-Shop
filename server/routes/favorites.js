import express from 'express'
import { requireAuth } from '../auth.js'

const router = express.Router()

router.get('/', requireAuth, (req, res) => {
  const { db } = req.app.locals
  const rows = db.prepare('SELECT product_id FROM favorites WHERE user_id = ?').all(req.user.sub)
  res.json(rows.map(r => r.product_id))
})

router.post('/', requireAuth, (req, res) => {
  const { db } = req.app.locals
  const { productId } = req.body || {}
  if (!productId) return res.status(400).json({ error: 'missing_product' })
  
  try {
    db.prepare('INSERT OR IGNORE INTO favorites (user_id, product_id, created_at) VALUES (?, ?, ?)')
      .run(req.user.sub, productId, new Date().toISOString())
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:productId', requireAuth, (req, res) => {
  const { db } = req.app.locals
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND product_id = ?').run(req.user.sub, req.params.productId)
  res.json({ ok: true })
})

export default router