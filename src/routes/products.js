// src/routes/products.js
const express = require('express')
const router  = express.Router()
const { db }  = require('../config/firebase')
const { verifyFirebaseToken } = require('../middleware/authMiddleware')

const PRODUCTS_COL = 'products'

// ── GET /api/products/public — active products only, no auth ─────────────
router.get('/public', async (req, res) => {
  try {
    const snap = await db.collection(PRODUCTS_COL).orderBy('createdAt', 'asc').get()
    const products = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.active !== false)
    res.json(products)
  } catch (err) {
    console.error('Fetch public products error:', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// ── GET /api/products — all products (admin) ─────────────────────────────
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const snap = await db.collection(PRODUCTS_COL).orderBy('createdAt', 'asc').get()
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json(products)
  } catch (err) {
    console.error('Fetch products error:', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// ── POST /api/products — add product (admin) ──────────────────────────────
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const data = {
      ...req.body,
      active:    req.body.active !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const docRef = await db.collection(PRODUCTS_COL).add(data)
    res.status(201).json({ id: docRef.id, message: 'Product added' })
  } catch (err) {
    console.error('Add product error:', err)
    res.status(500).json({ error: 'Failed to add product' })
  }
})

// ── PUT /api/products/:id — update full product (admin) ───────────────────
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const docRef = db.collection(PRODUCTS_COL).doc(req.params.id)
    const doc = await docRef.get()
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' })
    await docRef.update({ ...req.body, updatedAt: new Date().toISOString() })
    res.json({ message: 'Product updated' })
  } catch (err) {
    console.error('Update product error:', err)
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// ── PATCH /api/products/:id/toggle — show/hide product (admin) ────────────
router.patch('/:id/toggle', verifyFirebaseToken, async (req, res) => {
  try {
    const { active } = req.body
    const docRef = db.collection(PRODUCTS_COL).doc(req.params.id)
    const doc = await docRef.get()
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' })
    await docRef.update({ active, updatedAt: new Date().toISOString() })
    res.json({ message: `Product ${active ? 'shown' : 'hidden'}` })
  } catch (err) {
    console.error('Toggle product error:', err)
    res.status(500).json({ error: 'Failed to toggle product' })
  }
})

// ── DELETE /api/products/:id — delete product (admin) ─────────────────────
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const docRef = db.collection(PRODUCTS_COL).doc(req.params.id)
    const doc = await docRef.get()
    if (!doc.exists) return res.status(404).json({ error: 'Product not found' })
    await docRef.delete()
    res.json({ message: 'Product deleted' })
  } catch (err) {
    console.error('Delete product error:', err)
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

module.exports = router
