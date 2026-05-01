require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const pool       = require('./config/mysql')
const productsRouter = require('./routes/products')
const ordersRouter   = require('./routes/orders')

const app  = express()
const PORT = process.env.PORT || 4000

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://trymaakhanastores.com',
]

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))

app.use('/api/products', productsRouter)
app.use('/api/orders',   ordersRouter)

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'mysql connected' })
  } catch(e) {
    res.status(500).json({ status: 'error', db: e.message })
  }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
