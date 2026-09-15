// =====================================================
// Cashfree Server Configuration
// =====================================================
//
// Server-side only.
// NEVER expose CASHFREE_SECRET_KEY to client-side code.
//
// =====================================================

const appId = process.env.CASHFREE_APP_ID;

const secretKey =
  process.env.CASHFREE_SECRET_KEY;

const environment =
  process.env.CASHFREE_ENVIRONMENT || "SANDBOX";

if (!appId) {
  throw new Error(
    "CASHFREE_APP_ID is not configured.",
  );
}

if (!secretKey) {
  throw new Error(
    "CASHFREE_SECRET_KEY is not configured.",
  );
}

const baseUrl =
  environment === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export const cashfreeConfig = {
  appId,
  secretKey,
  baseUrl,
  apiVersion: "2025-01-01",
  environment,
} as const;