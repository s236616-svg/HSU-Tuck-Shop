import dotenv from 'dotenv'
dotenv.config({ path: './server/.env' })
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { db } from './db.js'

import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import orderRoutes from './routes/orders.js'
import favoriteRoutes from './routes/favorites.js'

const app = express()
app.locals.db = db

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: 'http://localhost:8443', credentials: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/favorites', favoriteRoutes)

app.get('/api/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`))