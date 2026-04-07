// src/routes/orders.js
const express = require('express')
const router  = express.Router()
const { db }  = require('../config/firebase')
const { verifyFirebaseToken } = require('../middleware/authMiddleware')
const { sendOrderConfirmation, sendStatusUpdateEmail } = require('../services/emailService')

const ORDERS_COL   = 'orders'
const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

// ── POST /api/orders — Place a new order (public) ─────────────────────────
router.post('/', async (req, res) => {
  try {
    const { customer, address, items, total } = req.body

    // Basic validation
    if (!customer?.email || !customer?.name || !items?.length || !total) {
      return res.status(400).json({ error: 'Missing required order fields' })
    }

    const orderData = {
      customer,
      address,
      items,
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await db.collection(ORDERS_COL).add(orderData)
    const orderId = docRef.id

    // Send confirmation email — non-blocking
    sendOrderConfirmation({ orderId, customer, address, items, total })
      .catch(err => console.error('Confirmation email failed:', err.message))

    res.status(201).json({ orderId, message: 'Order placed successfully' })
  } catch (err) {
    console.error('Place order error:', err)
    res.status(500).json({ error: 'Failed to place order' })
  }
})

// ── GET /api/orders — Get all orders (admin only) ─────────────────────────
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const snap = await db.collection(ORDERS_COL)
      .orderBy('createdAt', 'desc')
      .get()
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json(orders)
  } catch (err) {
    console.error('Fetch orders error:', err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// ── GET /api/orders/track/:orderId — Track by ID (public) ─────────────────
router.get('/track/:orderId', async (req, res) => {
  try {
    const doc = await db.collection(ORDERS_COL).doc(req.params.orderId).get()
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' })
    res.json({ id: doc.id, ...doc.data() })
  } catch (err) {
    console.error('Track order error:', err)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// ── GET /api/orders/track/email/:email — Track by email (public) ──────────
router.get('/track/email/:email', async (req, res) => {
  try {
    const snap = await db.collection(ORDERS_COL)
      .where('customer.email', '==', req.params.email)
      .orderBy('createdAt', 'desc')
      .get()
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json(orders)
  } catch (err) {
    console.error('Track by email error:', err)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// ── GET /api/orders/:id — Get single order (admin only) ───────────────────
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const doc = await db.collection(ORDERS_COL).doc(req.params.id).get()
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' })
    res.json({ id: doc.id, ...doc.data() })
  } catch (err) {
    console.error('Fetch order error:', err)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// ── PATCH /api/orders/:id/status — Update order status (admin only) ───────
router.patch('/:id/status', verifyFirebaseToken, async (req, res) => {
  try {
    const { status } = req.body
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` })
    }

    const docRef = db.collection(ORDERS_COL).doc(req.params.id)
    const doc    = await docRef.get()
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' })

    await docRef.update({ status, updatedAt: new Date().toISOString() })

    // Send status update email — non-blocking
    const order = doc.data()
    if (order.customer?.email) {
      sendStatusUpdateEmail({
        orderId: req.params.id,
        customer: order.customer,
        status,
      }).catch(err => console.error('Status email failed:', err.message))
    }

    res.json({ message: `Order status updated to "${status}"` })
  } catch (err) {
    console.error('Update status error:', err)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

// ── PATCH /api/orders/:id/courier — Save courier & tracking number (admin) ─
router.patch('/:id/courier', verifyFirebaseToken, async (req, res) => {
  try {
    const { courierName, courierTrackingNo } = req.body
    const docRef = db.collection(ORDERS_COL).doc(req.params.id)
    const doc    = await docRef.get()
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' })

    await docRef.update({
      courierName:      courierName      || null,
      courierTrackingNo: courierTrackingNo || null,
      updatedAt: new Date().toISOString(),
    })

    res.json({ message: 'Courier info saved' })
  } catch (err) {
    console.error('Courier update error:', err)
    res.status(500).json({ error: 'Failed to update courier info' })
  }
})

// ── PATCH /api/orders/:id/payment — Mark order as paid (admin only) ───────
router.patch('/:id/payment', verifyFirebaseToken, async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body
    const docRef = db.collection(ORDERS_COL).doc(req.params.id)
    const doc    = await docRef.get()
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' })

    await docRef.update({
      paymentStatus: paymentStatus || 'paid',
      paymentId:     paymentId || null,
      updatedAt:     new Date().toISOString(),
    })

    res.json({ message: 'Payment status updated' })
  } catch (err) {
    console.error('Update payment error:', err)
    res.status(500).json({ error: 'Failed to update payment status' })
  }
})

module.exports = router
