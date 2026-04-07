// src/services/emailService.js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

// ── Shared email wrapper ───────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  })
}

// ── Order confirmation email ───────────────────────────────────────────────
async function sendOrderConfirmation({ orderId, customer, address, items, total }) {
  const itemsRows = items.map(i => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8d8;">${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8d8;text-align:center;">×${i.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8d8;text-align:right;font-weight:600;">₹${i.price * i.quantity}</td>
    </tr>
  `).join('')

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#faf7f2;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(90,50,20,0.10);">

      <!-- Header -->
      <div style="background:#3a2112;padding:32px 40px;text-align:center;">
        <div style="font-size:1.6rem;font-weight:900;color:#f5f0e8;letter-spacing:-0.5px;">
          Makhana<span style="color:#c9a84c;font-style:italic;">Magic</span>
        </div>
        <div style="color:rgba(245,240,232,0.6);font-size:0.82rem;margin-top:4px;letter-spacing:0.12em;text-transform:uppercase;">
          Order Confirmation
        </div>
      </div>

      <!-- Body -->
      <div style="padding:36px 40px;">
        <h2 style="font-size:1.4rem;color:#3a2112;margin:0 0 8px;">
          Thanks for your order, ${customer.name}! 🎉
        </h2>
        <p style="color:#9c8b7a;font-size:0.92rem;margin:0 0 28px;line-height:1.6;">
          We've received your order and will confirm it shortly. Here's a summary of what you ordered.
        </p>

        <!-- Order ID box -->
        <div style="background:#fef3d8;border-radius:10px;padding:14px 18px;margin-bottom:28px;border:1px solid rgba(201,168,76,0.3);">
          <div style="font-size:0.72rem;color:#9c8b7a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Order ID</div>
          <div style="font-family:monospace;font-weight:700;color:#3a2112;font-size:0.95rem;word-break:break-all;">#${orderId}</div>
        </div>

        <!-- Items table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <thead>
            <tr style="background:#f5f0e8;">
              <th style="padding:10px 12px;text-align:left;font-size:0.75rem;color:#9c8b7a;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Item</th>
              <th style="padding:10px 12px;text-align:center;font-size:0.75rem;color:#9c8b7a;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:0.75rem;color:#9c8b7a;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <!-- Total -->
        <div style="display:flex;justify-content:space-between;padding:14px 12px;background:#f5f0e8;border-radius:8px;margin-bottom:28px;">
          <span style="font-weight:700;color:#3a2112;">Total Paid</span>
          <span style="font-weight:700;color:#3a2112;font-size:1.1rem;">₹${total}</span>
        </div>

        <!-- Address -->
        <div style="margin-bottom:28px;">
          <div style="font-size:0.75rem;color:#9c8b7a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;font-weight:600;">Delivery Address</div>
          <div style="font-size:0.9rem;color:#5c3d2e;line-height:1.7;">
            ${address.line}<br/>
            ${address.city}, ${address.state} — ${address.pincode}
          </div>
        </div>

        <!-- Track CTA -->
        <div style="text-align:center;margin-bottom:8px;">
          <a href="${process.env.FRONTEND_URL}/track" style="display:inline-block;background:#3a2112;color:#e8cc7a;padding:14px 32px;border-radius:3rem;font-size:0.9rem;font-weight:600;text-decoration:none;">
            Track Your Order →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:20px 40px;border-top:1px solid #f0e8d8;text-align:center;">
        <p style="font-size:0.78rem;color:#9c8b7a;margin:0;line-height:1.7;">
          Questions? Reply to this email or contact us at ${process.env.MAIL_USER}<br/>
          © 2025 MakhanaMagic · Premium Fox Nuts from Bihar
        </p>
      </div>
    </div>
  </body>
  </html>
  `

  await sendEmail({
    to: customer.email,
    subject: `Order Confirmed! #${orderId} — MakhanaMagic 🍿`,
    html,
  })
}

// ── Order status update email ──────────────────────────────────────────────
async function sendStatusUpdateEmail({ orderId, customer, status }) {
  const STATUS_MESSAGES = {
    confirmed: {
      emoji: '✅',
      headline: 'Your order has been confirmed!',
      body: 'Our team is packing your makhanas with care. You will receive another update once your order ships.',
    },
    shipped: {
      emoji: '🚚',
      headline: 'Your order is on the way!',
      body: 'Your makhanas have been handed over to the courier. Use your Order ID to track the latest status.',
    },
    delivered: {
      emoji: '🎉',
      headline: 'Your order has been delivered!',
      body: 'We hope you enjoy your makhanas! If you have any feedback or issues, please reach out to us.',
    },
    cancelled: {
      emoji: '❌',
      headline: 'Your order has been cancelled.',
      body: 'Your order has been cancelled. If you did not request this or need help, please contact us right away.',
    },
  }

  const msg = STATUS_MESSAGES[status]
  if (!msg) return // don't send for 'pending' — confirmation already sent

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#faf7f2;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(90,50,20,0.10);">

      <div style="background:#3a2112;padding:32px 40px;text-align:center;">
        <div style="font-size:1.6rem;font-weight:900;color:#f5f0e8;">
          Makhana<span style="color:#c9a84c;font-style:italic;">Magic</span>
        </div>
        <div style="color:rgba(245,240,232,0.6);font-size:0.82rem;margin-top:4px;letter-spacing:0.12em;text-transform:uppercase;">
          Order Update
        </div>
      </div>

      <div style="padding:36px 40px;text-align:center;">
        <div style="font-size:3rem;margin-bottom:16px;">${msg.emoji}</div>
        <h2 style="font-size:1.35rem;color:#3a2112;margin:0 0 12px;">${msg.headline}</h2>
        <p style="color:#9c8b7a;font-size:0.92rem;line-height:1.7;max-width:380px;margin:0 auto 28px;">${msg.body}</p>

        <div style="background:#fef3d8;border-radius:10px;padding:14px 18px;margin-bottom:28px;display:inline-block;text-align:left;min-width:260px;border:1px solid rgba(201,168,76,0.3);">
          <div style="font-size:0.72rem;color:#9c8b7a;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;">Order ID</div>
          <div style="font-family:monospace;font-weight:700;color:#3a2112;font-size:0.95rem;word-break:break-all;">#${orderId}</div>
        </div>

        <div>
          <a href="${process.env.FRONTEND_URL}/track" style="display:inline-block;background:#3a2112;color:#e8cc7a;padding:14px 32px;border-radius:3rem;font-size:0.9rem;font-weight:600;text-decoration:none;">
            Track Your Order →
          </a>
        </div>
      </div>

      <div style="padding:20px 40px;border-top:1px solid #f0e8d8;text-align:center;">
        <p style="font-size:0.78rem;color:#9c8b7a;margin:0;">
          © 2025 MakhanaMagic · Premium Fox Nuts from Bihar
        </p>
      </div>
    </div>
  </body>
  </html>
  `

  await sendEmail({
    to: customer.email,
    subject: `${msg.emoji} Order ${status.charAt(0).toUpperCase() + status.slice(1)} — #${orderId}`,
    html,
  })
}

module.exports = { sendOrderConfirmation, sendStatusUpdateEmail }
