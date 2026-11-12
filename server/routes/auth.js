import express from 'express'
import bcrypt from 'bcrypt'
import { hashPassword, verifyPassword, signToken } from '../auth.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { db } = req.app.locals
  const { fullName, email, username, password, phone, isHsu, programme, yearOfEntrance, studentId } = req.body || {}

  if (!fullName || !email || !username || !password) return res.status(400).json({ error: 'missing_fields' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'invalid_email' })
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) return res.status(400).json({ error: 'invalid_username' })
  if (!(password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password))) return res.status(400).json({ error: 'weak_password' })

  const exists = db.prepare('SELECT 1 FROM users WHERE lower(email) = lower(?) OR lower(username) = lower(?)').get(email, username)
  if (exists) return res.status(409).json({ error: 'already_exists' })

  const id = `u_${Date.now()}`
  const passwordHash = await hashPassword(password)
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO users (
      id, email, username, password_hash, full_name, phone,
      is_hsu_student, programme, year_of_entrance, student_id,
      roles, wallet_balance, loyalty_stamps, created_at, last_login
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, email, username, passwordHash, fullName, phone || null,
    isHsu ? 1 : 0, programme || null, yearOfEntrance || null, studentId || null,
    JSON.stringify(['student']), 0, 0, now, now,
  )

  const token = signToken({ sub: id, roles: ['student'] })
  res.cookie('hsu_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.json({
    id, username, fullName, email, roles: ['student'], programme, yearOfEntrance,
    studentId, phone: phone || null, walletBalance: 0, loyaltyStamps: 0,
    avatarUrl: null, lastLoginAt: now
  })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { db } = req.app.locals
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' })

  const user = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email)
  if (!user) return res.status(401).json({ error: 'invalid_credentials' })

  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })

  const now = new Date().toISOString()
  db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id)
  db.prepare('INSERT INTO audit_log (user_id, action, ip, created_at) VALUES (?,?,?,?)').run(user.id, 'login', req.ip, now)

  const roles = JSON.parse(user.roles)
  const token = signToken({ sub: user.id, roles })
  res.cookie('hsu_token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 })
  
  res.json({
    id: user.id, username: user.username, fullName: user.full_name, email: user.email,
    roles: JSON.parse(user.roles), programme: user.programme, yearOfEntrance: user.year_of_entrance,
    studentId: user.student_id, phone: user.phone, walletBalance: user.wallet_balance,
    loyaltyStamps: user.loyalty_stamps, avatarUrl: user.avatar_url, lastLoginAt: now
  })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('hsu_token')
  res.json({ ok: true })
})

export default router