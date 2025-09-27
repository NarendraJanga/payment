import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      navigate("/pay");
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="su-page-container">
      {/* Main card container */}
      <div className="su-success-card">
        {/* Header */}
        <h2 className="su-header">🎉 Payment Successful!</h2>
        {/* Thank you message */}
        <p className="su-thank-you">
          Thank you for your payment. Your transaction has been securely processed.
        </p>
        {/* Checkmark SVG */}
        <div className="su-checkmark-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="su-checkmark-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="green"
            strokeWidth="4"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {/* Countdown message */}
        <p className="su-countdown">
          Redirecting back to payment page in <strong>{countdown}</strong> seconds...
        </p>
        {/* Additional info and button */}
        <div className="su-additional-info">
          <p className="su-info-text">
            If you are not redirected automatically, please click the button below.
          </p>
          <button
            className="su-redirect-btn"
            onClick={() => (window.location.href = "/pay")}
          >
            Go to Payment Page
          </button>
        </div>
        {/* Footer */}
        <div className="su-footer-text">
          &copy; 2024 YourCompany. All rights reserved.
        </div>
      </div>
    </div>
  );
}