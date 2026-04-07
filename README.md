# 🍿 MakhanaMagic — Backend API

Node.js + Express + Firebase Admin backend for MakhanaMagic.

---

## Stack
- **Node.js + Express** — API server
- **Firebase Admin SDK** — Firestore access (server-side)
- **Nodemailer + Gmail** — Order confirmation & status update emails

---

## Project Structure

```
makhana-backend/
├── src/
│   ├── index.js                  # Express server entry point
│   ├── config/
│   │   └── firebase.js           # Firebase Admin SDK init
│   ├── middleware/
│   │   └── authMiddleware.js     # Firebase token verification
│   ├── routes/
│   │   └── orders.js             # All order endpoints
│   └── services/
│       └── emailService.js       # Nodemailer email templates
├── .env.example                  # Copy to .env and fill in values
├── .gitignore
└── package.json
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST   | /api/orders | Public | Place a new order + send confirmation email |
| GET    | /api/orders | Admin | Get all orders |
| GET    | /api/orders/track/:orderId | Public | Track order by ID |
| GET    | /api/orders/track/email/:email | Public | Track orders by email |
| GET    | /api/orders/:id | Admin | Get single order |
| PATCH  | /api/orders/:id/status | Admin | Update status + send email |
| PATCH  | /api/orders/:id/payment | Admin | Update payment status |
| GET    | /health | Public | Health check |

---

## Setup Instructions

### Step 1 — Install dependencies
```bash
cd makhana-backend
npm install
```

### Step 2 — Create your .env file
```bash
cp .env.example .env
```

### Step 3 — Fill in Firebase Admin credentials

1. Go to **Firebase Console → Project Settings → Service Accounts**
2. Click **"Generate new private key"** → downloads a JSON file
3. Copy these values from the JSON into your `.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR KEY\n-----END PRIVATE KEY-----\n"
```

> ⚠️ Keep the quotes around FIREBASE_PRIVATE_KEY and keep the \n characters as-is

### Step 4 — Set up Gmail for Nodemailer

1. Use a Gmail account for the business (e.g. orders@makhanamagic.com)
2. Enable **2-Factor Authentication** on that Gmail account
3. Go to **Google Account → Security → App Passwords**
4. Generate an App Password for "Mail"
5. Paste it in `.env`:

```env
MAIL_USER=yourstore@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx
MAIL_FROM=MakhanaMagic <yourstore@gmail.com>
```

### Step 5 — Run the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:4000**
Health check: **http://localhost:4000/health**

---

## Deploying (when ready)

### Railway (recommended)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```
Set all `.env` variables in Railway dashboard → Variables tab.

### Render
1. Push code to GitHub
2. New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables in the dashboard

---

## Frontend Connection

In your frontend project, create a `.env` file:
```env
VITE_API_URL=http://localhost:4000
```

After deploying backend, update to:
```env
VITE_API_URL=https://your-backend.railway.app
```
