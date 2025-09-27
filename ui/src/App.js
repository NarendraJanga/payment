import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaymentPage from "./components/pages/PaymentPage";
import SuccessPage from "./components/pages/SuccessPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Default route now points to PaymentPage */}
        <Route path="/" element={<PaymentPage />} />
        <Route path="/pay" element={<PaymentPage />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </Router>
  );
}
