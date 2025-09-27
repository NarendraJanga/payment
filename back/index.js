```js
// index.js
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

const Payment = require("./models/Payment");

const app = express();

// ✅ Allow all origins (any frontend can access)
app.use(cors());
app.use(express.json()); // parse JSON bodies

// Create Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1) Create order route
app.post("/api/create-order", async (req, res) => {
  try {
    let { amount } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // amount expected from frontend in rupees (e.g., 100 => ₹100)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      payment_capture: 1, // auto capture
    };

    const order = await razorpay.orders.create(options);

    // Save a record with status 'created'
    const paymentRecord = await Payment.create({
      orderId: order.id,
      amount: amountInPaise,
      status: "created",
      currency: order.currency,
    });

    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      razorpayKey: process.env.RAZORPAY_KEY_ID, // frontend needs this
      receipt: order.receipt,
    });
  } catch (err) {
    console.error("create-order error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 2) Verify payment
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const isValid = generated_signature === razorpay_signature;

    const paymentRecord = await Payment.findOne({ orderId: razorpay_order_id });

    if (!paymentRecord) {
      await Payment.create({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: isValid ? "paid" : "failed",
      });
    } else {
      paymentRecord.paymentId = razorpay_payment_id;
      paymentRecord.signature = razorpay_signature;
      paymentRecord.status = isValid ? "paid" : "failed";
      await paymentRecord.save();
    }

    if (isValid) {
      return res.json({ ok: true, msg: "Payment verified successfully" });
    } else {
      return res.status(400).json({ ok: false, msg: "Invalid signature" });
    }
  } catch (err) {
    console.error("verify-payment error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// 3) Webhook endpoint
app.post(
  "/api/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const webhookSecret = process.env.WEBHOOK_SECRET || "";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(req.body);
    const digest = shasum.digest("hex");

    if (digest === signature) {
      try {
        const event = JSON.parse(req.body.toString());
        console.log("Webhook verified. Event:", event.event);

        if (
          event.event === "payment.captured" ||
          event.event === "payment.authorized"
        ) {
          const payload = event.payload.payment.entity;
          const orderId = payload.order_id;
          const paymentId = payload.id;
          const status = payload.status;

          const rec = await Payment.findOne({ orderId });
          if (rec) {
            rec.paymentId = paymentId;
            rec.status = status;
            rec.meta = payload;
            await rec.save();
          } else {
            await Payment.create({
              orderId,
              paymentId,
              status,
              amount: payload.amount,
              currency: payload.currency,
              meta: payload,
            });
          }
        }

        res.json({ status: "ok" });
      } catch (e) {
        console.error("webhook handling error:", e);
        res.status(500).json({ error: "Webhook processing error" });
      }
    } else {
      console.warn("⚠️ Webhook signature mismatch");
      res.status(400).json({ error: "Invalid webhook signature" });
    }
  }
);

// simple health
app.get("/", (req, res) => res.send("backend is running"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
```
