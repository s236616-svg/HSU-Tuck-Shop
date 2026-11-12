import express from 'express'
import crypto from 'node:crypto'
import { requireAuth } from '../auth.js'

const router = express.Router()

function sha256(v) {
  return crypto.createHash('sha256').update(String(v)).digest('hex')
}

// GET /api/orders (current user's orders)
router.get('/', requireAuth, (req, res) => {
  const { db } = req.app.locals
  const rows = db.prepare(`
    SELECT o.*, 
      (SELECT json_group_array(json_object('product_id', oi.product_id, 'quantity', oi.quantity, 'unit_price', oi.unit_price)) FROM order_items oi WHERE oi.order_id = o.id) AS items
    FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC
  `).all(req.user.sub)
  res.json(rows.map(toOrderPayload))
})

// GET /api/orders/all (staff/admin only — all orders)
router.get('/all', requireAuth, (req, res) => {
  if (!req.user.roles?.includes('staff') && !req.user.roles?.includes('admin')) return res.status(403).json({ error: 'forbidden' })
  const { db } = req.app.locals
  const rows = db.prepare(`
    SELECT o.*, 
      (SELECT json_group_array(json_object('product_id', oi.product_id, 'quantity', oi.quantity, 'unit_price', oi.unit_price)) FROM order_items oi WHERE oi.order_id = o.id) AS items
    FROM orders o ORDER BY o.created_at DESC
  `).all()
  res.json(rows.map(toOrderPayload))
})

// POST /api/orders (create new order)
router.post('/', requireAuth, (req, res) => {
  const { db } = req.app.locals
  const { items, paymentMethod, slotId } = req.body || {}
    console.log('🔑 JWT User ID:', req.user.sub)
    const dbUser = db.prepare('SELECT id FROM users WHERE id = ?').get(req.user.sub)
    console.log('🗄️ Database User ID:', dbUser ? dbUser.id : 'NOT FOUND')

  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'empty_cart' })
  if (!paymentMethod || !slotId) return res.status(400).json({ error: 'missing_fields' })

  try {
    const create = db.transaction(() => {
      let slot = db.prepare('SELECT * FROM time_slots WHERE id = ?').get(slotId)
      if (!slot) {
        // Fallback: just grab the first available slot from the database
        slot = db.prepare('SELECT * FROM time_slots WHERE booked < capacity LIMIT 1').get()
      }
      if (!slot) throw new Error('slot_not_found')
      if (slot.booked >= slot.capacity) throw new Error('slot_full')

      let total = 0
      const validated = []
      for (const item of items) {
        const p = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId)
        if (!p) throw new Error(`product_not_found:${item.productId}`)
        if (p.stock < item.quantity) throw new Error(`insufficient_stock:${p.name_en}`)
        total += p.price * item.quantity
        validated.push({ product: p, quantity: item.quantity })
      }

      const lastId = db.prepare("SELECT id FROM orders ORDER BY CAST(SUBSTR(id, 2) AS INTEGER) DESC LIMIT 1").get()
      const nextNum = lastId ? (parseInt(lastId.id.replace('#','')) + 1) : 4821
      const orderId = `#${nextNum}`
      const pickupCode = String(Math.floor(1000 + Math.random() * 9000))
      
          const now = new Date().toISOString()
      const paymentStatus = paymentMethod === 'counter' ? 'reserved' : 'paid'

      console.log('1. Inserting Order:', orderId, 'User:', req.user.sub, 'Slot:', slot.id)
      db.prepare(`INSERT INTO orders (id, user_id, status, payment_method, payment_status, slot_id, slot_time, location, total, pickup_code_hash, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
        .run(orderId, req.user.sub, 'PAID', paymentMethod, paymentStatus, slot.id, `${slot.start_time}–${slot.end_time}`, slot.location, total, sha256(pickupCode), now)

      console.log('2. Inserting Order Items')
      for (const { product, quantity } of validated) {
        console.log('   - Product:', product.id, 'Qty:', quantity)
        db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)').run(orderId, product.id, quantity, product.price)
        db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(quantity, product.id)
      }

      console.log('3. Updating Time Slot')
      db.prepare('UPDATE time_slots SET booked = booked + 1 WHERE id = ?').run(slot.id)

      console.log('4. Inserting Notification')
      db.prepare('INSERT INTO notifications (id, user_id, kind, message_en, message_zh, read, created_at) VALUES (?,?,?,?,?,?,?)').run(`n_${Date.now()}`, req.user.sub, 'order', `Order ${orderId} placed`, `訂單 ${orderId} 已下單`, 0, now)
      console.log('5. Order completed successfully!')
      
      return { orderId, pickupCode, total, slot, paymentStatus }
    })

    const result = create()
    const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.orderId)
    const itemsRows = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(result.orderId)
    res.status(201).json({ ...toOrderPayload({ ...orderRow, items: JSON.stringify(itemsRows) }), pickup_code: result.pickupCode })
    } catch (err) {
    console.error("🔴 ORDER ERROR:", err.message); // <--- ADD THIS LINE
    const msg = err.message || 'unknown_error'
    if (msg.includes('slot_full') || msg.includes('stock')) return res.status(409).json({ error: msg })
    res.status(500).json({ error: 'server_error' })
  }
})

// PATCH /api/orders/:id/status (staff only)
router.patch('/:id/status', requireAuth, (req, res) => {
  const { db } = req.app.locals
  const { status } = req.body || {}
  if (!req.user.roles?.includes('staff') && !req.user.roles?.includes('admin')) return res.status(403).json({ error: 'forbidden' })

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!order) return res.status(404).json({ error: 'not_found' })

  const now = new Date().toISOString()
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, order.id)
  
  if (status === 'READY') db.prepare('UPDATE orders SET ready_at = ? WHERE id = ?').run(now, order.id)
  if (status === 'COLLECTED') db.prepare('UPDATE orders SET collected_at = ? WHERE id = ?').run(now, order.id)

  const msgEn = status === 'READY' ? `Order ${order.id} is ready` : `Order ${order.id} is ${status}`
  const msgZh = status === 'READY' ? `訂單 ${order.id} 已可取貨` : `訂單 ${order.id} 狀態：${status}`
  db.prepare('INSERT INTO notifications (id, user_id, kind, message_en, message_zh, read, created_at) VALUES (?,?,?,?,?,?,?)').run(`n_${Date.now()}`, order.user_id, 'order', msgEn, msgZh, 0, now)

  res.json({ ok: true, id: order.id, status })
})

// POST /api/orders/:id/verify (staff only — verify code and mark collected)
router.post('/:id/verify', requireAuth, (req, res) => {
  const { db } = req.app.locals
  const { code } = req.body || {}
  if (!req.user.roles?.includes('staff') && !req.user.roles?.includes('admin')) return res.status(403).json({ error: 'forbidden' })

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!order) return res.status(404).json({ error: 'not_found' })
  
  if (sha256(code) !== order.pickup_code_hash) return res.status(401).json({ error: 'wrong_code' })

  db.prepare('UPDATE orders SET status = ?, collected_at = ? WHERE id = ?').run('COLLECTED', new Date().toISOString(), order.id)
  res.json({ ok: true, id: order.id, status: 'COLLECTED' })
})

function toOrderPayload(row) {
  let items = []
  try { items = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []) } catch {}
  return {
    id: row.id, status: row.status, payment_method: row.payment_method, payment_status: row.payment_status,
    slot_id: row.slot_id, slot_time: row.slot_time, location: row.location, total: row.total,
    items, created_at: row.created_at, ready_at: row.ready_at, collected_at: row.collected_at,
  }
}

export default router