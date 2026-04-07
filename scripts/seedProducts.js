// scripts/seedProducts.js
// ─────────────────────────────────────────────────────────────────────────────
// One-time script to seed all Valmiki Foods products into Firestore.
// Run from inside the makhana-backend folder:
//   node scripts/seedProducts.js
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config()
const { db } = require('../src/config/firebase')

const products = [
  {
    name: 'Himalayan Pink Salt Makhana',
    flavour: 'Salted',
    tag: 'Bestseller',
    price: 0,
    weight: '100g',
    emoji: '🧂',
    gradient: 'linear-gradient(135deg, #fef3d8, #f5d98b)',
    description: 'Lightly seasoned with pure Himalayan pink salt. Clean, crunchy, and timeless.',
    longDescription: 'Our Himalayan Pink Salt makhanas are slow-roasted to a perfect golden crunch and finished with a gentle dusting of mineral-rich pink Himalayan salt. No artificial flavours, no preservatives — just the pure, honest taste of Bihar\'s finest fox nuts. The go-to snack for the whole family.',
    benefits: ['High Protein', 'Low Calorie', 'Gluten Free'],
    highlights: ['Hand-harvested from Mithila ponds', 'Slow roasted, never fried', 'Pure Himalayan pink salt', 'Sealed for freshness'],
    nutrition: { calories: '347 kcal', protein: '9.7g', carbs: '76.9g', fat: '0.1g', fibre: '14.5g' },
    stock: 100,
    active: true,
  },
  {
    name: 'Masala Makhana',
    flavour: 'Spicy',
    tag: 'Popular',
    price: 0,
    weight: '100g',
    emoji: '🌶️',
    gradient: 'linear-gradient(135deg, #ffe8d6, #f5b87a)',
    description: 'A bold Indian masala blend that makes every bite an explosion of flavour.',
    longDescription: 'Inspired by the rich spice traditions of India, our Masala Makhana is coated in a perfectly balanced blend of cumin, coriander, chaat masala, and red chilli. Tangy, spicy, and completely irresistible — this is desi snacking at its finest.',
    benefits: ['No Artificial Flavour', 'Vegan', 'No MSG'],
    highlights: ['Real Indian spice blend', 'Chaat masala finish', 'No artificial colours', 'Vegan friendly'],
    nutrition: { calories: '352 kcal', protein: '9.4g', carbs: '74.2g', fat: '0.8g', fibre: '13.8g' },
    stock: 100,
    active: true,
  },
  {
    name: 'Cheese Makhana',
    flavour: 'Cheesy',
    tag: 'Kids Favourite',
    price: 0,
    weight: '100g',
    emoji: '🧀',
    gradient: 'linear-gradient(135deg, #fff8dc, #f5e0a0)',
    description: 'Rich, creamy cheese flavour that makes healthy snacking feel indulgent.',
    longDescription: 'All the joy of cheesy snacks without the guilt! Our Cheese Makhana uses a natural cheese seasoning to deliver that rich, savory flavour you love. Crunchy, cheesy, and totally addictive — kids and adults both can\'t stop at one handful.',
    benefits: ['Kids Friendly', 'No Artificial Colour', 'Natural Cheese Flavour'],
    highlights: ['Natural cheese seasoning', 'No artificial colours', 'Crunchy texture', 'Great for kids'],
    nutrition: { calories: '368 kcal', protein: '9.0g', carbs: '73.5g', fat: '1.8g', fibre: '13.2g' },
    stock: 100,
    active: true,
  },
  {
    name: 'Peri-Peri Makhana',
    flavour: 'Spicy',
    tag: 'Hot Pick',
    price: 0,
    weight: '100g',
    emoji: '🔥',
    gradient: 'linear-gradient(135deg, #fde8e8, #f5a0a0)',
    description: 'Smoky African peri-peri heat that builds with every crunch.',
    longDescription: 'For those who crave bold, fiery flavours — our Peri-Peri Makhana delivers. Coated in a smoky blend of African bird\'s eye chilli, paprika, garlic, and a hint of lemon, the heat builds slowly and lingers satisfyingly. Our most reordered flavour for a reason.',
    benefits: ['Metabolism Boost', 'Vegan', 'No MSG'],
    highlights: ['Real chilli, no artificial heat', 'Smoky paprika blend', 'Vegan certified', 'No MSG ever'],
    nutrition: { calories: '355 kcal', protein: '9.3g', carbs: '73.8g', fat: '0.9g', fibre: '13.6g' },
    stock: 100,
    active: true,
  },
  {
    name: 'Himalayan Salt & Pepper Makhana',
    flavour: 'Classic',
    tag: 'Classic',
    price: 0,
    weight: '100g',
    emoji: '🫙',
    gradient: 'linear-gradient(135deg, #e8f0f5, #b5ccd4)',
    description: 'The perfect balance of Himalayan salt and freshly cracked black pepper.',
    longDescription: 'Simple, sophisticated, and utterly satisfying. Our Himalayan Salt & Pepper Makhana combines the mineral richness of pink Himalayan salt with the warm kick of coarsely cracked black pepper. A timeless pairing that elevates this ancient superfood.',
    benefits: ['High Protein', 'Low Calorie', 'Natural Spices'],
    highlights: ['Pink Himalayan salt', 'Freshly cracked pepper', 'No preservatives', 'Simple clean ingredients'],
    nutrition: { calories: '348 kcal', protein: '9.6g', carbs: '76.5g', fat: '0.2g', fibre: '14.3g' },
    stock: 100,
    active: true,
  },
  {
    name: 'Pudina Makhana',
    flavour: 'Minty',
    tag: 'Refreshing',
    price: 0,
    weight: '100g',
    emoji: '🌿',
    gradient: 'linear-gradient(135deg, #e8f5e2, #b5d4a0)',
    description: 'Cool, refreshing mint with a hint of spice — uniquely Indian and utterly fresh.',
    longDescription: 'Inspired by the classic pudina chutney, our Pudina Makhana delivers a burst of cool, refreshing mint with a gentle spice undertone. Light, fragrant, and deeply satisfying — perfect for those who want something flavourful yet fresh. A uniquely Indian flavour experience.',
    benefits: ['Digestive Aid', 'Refreshing', 'Natural Mint'],
    highlights: ['Real mint extract', 'Refreshing cool finish', 'Digestive friendly', 'Ayurvedic herbs'],
    nutrition: { calories: '344 kcal', protein: '9.8g', carbs: '76.2g', fat: '0.1g', fibre: '14.6g' },
    stock: 100,
    active: true,
  },
]

async function seed() {
  console.log('\n🍿 Valmiki Foods — Seeding products to Firestore...\n')

  const existing = await db.collection('products').get()
  if (!existing.empty) {
    console.log(`⚠️  Found ${existing.size} existing product(s) in Firestore.`)
    console.log('   Delete them first from Firebase Console → Firestore → products collection.')
    console.log('   Or run with --force to seed anyway:\n')
    if (!process.argv.includes('--force')) {
      console.log('Aborting. Run with --force to proceed.\n')
      process.exit(0)
    }
    console.log('--force detected. Proceeding...\n')
  }

  let success = 0, failed = 0

  for (const product of products) {
    try {
      const docRef = await db.collection('products').add({
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      console.log(`  ✅  ${product.emoji}  ${product.name.padEnd(36)} → ${docRef.id}`)
      success++
    } catch (err) {
      console.log(`  ❌  ${product.name} — FAILED: ${err.message}`)
      failed++
    }
  }

  console.log(`\n──────────────────────────────────────────────`)
  console.log(`  Seeded:  ${success} product(s)`)
  if (failed > 0) console.log(`  Failed:  ${failed} product(s)`)
  console.log(`──────────────────────────────────────────────`)
  console.log(`\n✓ Done! Go to /admin/products to set prices and review.\n`)
  console.log(`  Note: All prices are set to 0 — update them in the admin panel.\n`)
  process.exit(0)
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message)
  console.error('   Make sure your .env has valid Firebase Admin credentials.\n')
  process.exit(1)
})
