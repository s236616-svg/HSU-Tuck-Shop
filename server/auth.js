import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export async function hashPassword(plain) { return bcrypt.hash(plain, 10) }
export async function verifyPassword(plain, hash) { return bcrypt.compare(plain, hash) }
export function signToken(payload) { return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }) }
export function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex') }

// Check if the user is logged in via the cookie
export function requireAuth(req, res, next) {
  const token = req.cookies?.hsu_token
  if (!token) return res.status(401).json({ error: 'missing_session' })
  
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'invalid_session' })
  }
}

// Check if the API request has the Bearer token
export function requireApiToken(req, res, next) {
  const header = req.headers.authorization || ''
  const m = header.match(/^Bearer\s+(.+)$/i)
  if (!m) return res.status(401).json({ error: 'missing_token' })
  
  const providedToken = m[1].trim()
  const validToken = process.env.API_TOKEN || 'test-token'

  if (providedToken !== validToken) {
    return res.status(401).json({ error: 'invalid_token' })
  }
  
  next()
}