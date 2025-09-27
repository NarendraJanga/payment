import React, { useState } from "react";
import axios from "axios";
// Removed useNavigate since we won't navigate after success
// import { useNavigate } from "react-router-dom";

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  // const navigate = useNavigate(); // Not used now

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      showMessage("⚠️ Please enter a valid amount", "warning");
      return;
    }

    setLoading(true);

    // Load Razorpay SDK
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      showMessage("❌ Failed to load Razorpay SDK", "danger");
      setLoading(false);
      return;
    }

    // Create order first
    let orderData;
    try {
      const { data } = await axios.post(
        "https://payment-back22.onrender.com/api/create-order",
        { amount }
      );
      orderData = data; // contains order_id, amount, currency, razorpayKey
    } catch (err) {
      console.error(err);
      showMessage("❌ Error creating order.", "danger");
      setLoading(false);
      return;
    }

    // Prepare Razorpay options
    const { id: order_id, amount: order_amount, currency, razorpayKey } = orderData;

    const options = {
      key: razorpayKey,
      amount: order_amount.toString(),
      currency,
      name: "Freelance Services",
      description: "Secure Payment for Web Development",
      order_id,
      theme: { color: "#0d6efd" },
      prefill: {
        name: "Client",
        email: "client@example.com",
        contact: "9876543210",
      },
      handler: async (response) => {
        // Verify payment after success
        try {
          const verify = await axios.post(
            "https://payment-back22.onrender.com/api/verify-payment",
            response
          );
          if (verify.data.ok) {
            // Removed navigation, show success message instead
            showMessage("✅ Payment successful!", "success");
          } else {
            showMessage("⚠️ Payment verification failed.", "danger");
          }
        } catch (err) {
          console.error(err);
          showMessage("❌ Error verifying payment.", "danger");
        }
      },
    };

    // Initialize Razorpay and open
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (res) => {
      console.error("Payment failed", res.error);
      showMessage("❌ Payment failed: " + res.error.description, "danger");
    });
    rzp.open();

    setLoading(false);
  };

  return (
    <div className="page-background">
      {message && (
        <div
          className={`alert alert-${message.type} text-center slide-alert`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: "100vh",
        }}
      >
        <div className="payment-card">
          <div className="payment-header">💳 Make a Payment</div>
          <p className="payment-description">
            Professional Web Development • Secure Online Payment
          </p>

          <div className="payment-input-group">
            <input
              type="number"
              placeholder="Enter amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="custom-input"
            />
            <button
              onClick={handlePayment}
              disabled={loading}
              className="pay-btn"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
          <div className="security-note">🔒 Transactions secured by Razorpay</div>
        </div>
      </div>
    </div>
  );
}