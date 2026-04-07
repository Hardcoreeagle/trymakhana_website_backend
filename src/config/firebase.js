// src/config/firebase.js
const admin = require('firebase-admin')

if (!admin.apps.length) {
  // Support both formats:
  // 1. FIREBASE_SERVICE_ACCOUNT as full JSON string
  // 2. Separate FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
  let credential

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    credential = admin.credential.cert(serviceAccount)
  } else {
    credential = admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  }

  admin.initializeApp({ credential })
}

module.exports = admin
