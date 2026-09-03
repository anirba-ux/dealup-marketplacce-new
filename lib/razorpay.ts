import Razorpay from "razorpay";

// =====================================================
// Razorpay Server Configuration
// =====================================================
//
// IMPORTANT:
// - This file runs only on the server.
// - RAZORPAY_KEY_SECRET must NEVER be exposed to
//   client-side code.
// - For now we are using Razorpay TEST credentials.
//
// =====================================================

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

// =====================================================
// Validate Environment Variables
// =====================================================

if (!keyId) {
  throw new Error(
    "RAZORPAY_KEY_ID is not configured.",
  );
}

if (!keySecret) {
  throw new Error(
    "RAZORPAY_KEY_SECRET is not configured.",
  );
}

// =====================================================
// Razorpay Client
// =====================================================

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// =====================================================
// Public Key
//
// This can be safely returned to the frontend.
// =====================================================

export const razorpayKeyId = keyId;