# Backend (back) — Razorpay Order & Verification

## Setup
1. Copy `.env.example` to `.env` and fill your Razorpay credentials:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `WEBHOOK_SECRET`
   - `FRONTEND_URL` (e.g., http://localhost:3000)

2. Install deps:
   ```
   cd back
   npm install
   ```

3. Run:
   ```
   npm run dev
   ```

## Endpoints
- `POST /api/create-order` — body: `{ amount: 100 }` (INR)
- `POST /api/verify-payment` — body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
- `POST /api/webhook` — configure this URL in Razorpay dashboard for webhooks
