// scripts/migrateToMySQL.js — one-time migration from Firestore to MySQL
require('dotenv').config()
const admin = require('firebase-admin')
const pool  = require('../src/config/mysql')

// Init Firebase Admin using separate env vars
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  })
}
const db = admin.firestore()

async function migrate() {
  console.log('Starting Firestore → MySQL migration...')
  const conn = await pool.getConnection()
  let productsCount = 0, ordersCount = 0

  try {
    // ── Migrate products ────────────────────────────────────
    const productSnap = await db.collection('products').get()
    for (const doc of productSnap.docs) {
      const p = doc.data()
      const images = (p.images || []).filter(img => !img.startsWith('data:'))
      await conn.query(
        `INSERT IGNORE INTO products
          (id, name, flavour, tag, price, weight, description,
           long_description, benefits, highlights, images, gradient, stock, active)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          doc.id, p.name, p.flavour, p.tag, p.price || 0,
          p.weight, p.description, p.longDescription,
          JSON.stringify(p.benefits || []),
          JSON.stringify(p.highlights || []),
          JSON.stringify(images),
          p.gradient, p.stock || 0,
          p.active !== false ? 1 : 0,
        ]
      )
      productsCount++
      console.log(`  ✓ Product: ${p.name}`)
    }

    // ── Migrate orders ──────────────────────────────────────
    const orderSnap = await db.collection('orders').get()
    for (const doc of orderSnap.docs) {
      const o = doc.data()
      await conn.query(
        `INSERT IGNORE INTO orders
          (id, customer_name, email, phone, address, city, state,
           pincode, total, status, payment_status, courier_name, tracking_number)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          doc.id,
          o.customer?.name || '',
          o.customer?.email || '',
          o.customer?.phone || '',
          o.address?.line || o.customer?.address || '',
          o.address?.city || o.customer?.city || '',
          o.address?.state || o.customer?.state || '',
          o.address?.pincode || o.customer?.pincode || '',
          o.total || 0,
          o.status || 'pending',
          o.paymentStatus || 'unpaid',
          o.courierName || null,
          o.courierTrackingNo || null,
        ]
      )
      for (const item of (o.items || [])) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, name, price, quantity, weight)
           VALUES (?,?,?,?,?,?)`,
          [doc.id, item.id || null, item.name, item.price, item.quantity, item.weight || null]
        )
      }
      ordersCount++
    }

    console.log(`\n✅ Migration complete!`)
    console.log(`   Products migrated: ${productsCount}`)
    console.log(`   Orders migrated:   ${ordersCount}`)
    console.log(`\n⚠️  Base64 images skipped — re-upload via admin panel using image URLs.`)
  } catch(e) {
    console.error('Migration error:', e.message)
  } finally {
    conn.release()
    process.exit(0)
  }
}

migrate()
