// src/index.js
require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const ordersRouter   = require('./routes/orders')
const productsRouter = require('./routes/products')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/orders',   ordersRouter)
app.use('/api/products', productsRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MakhanaMagic API', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ┌──────────────────────────────────────┐
  │   🍿 MakhanaMagic API running        │
  │   http://localhost:${PORT}               │
  └──────────────────────────────────────┘
  `)
})
