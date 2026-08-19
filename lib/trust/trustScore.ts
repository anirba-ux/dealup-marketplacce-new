// =====================================================
// DealUp Trust Engine
// =====================================================
//
// This file contains ONLY trust calculation logic.
//
// IMPORTANT:
// - No database access here.
// - No API calls here.
// - No frontend logic here.
// - Never trust a score sent by the client.
//
// The server will collect verification + behaviour
// signals and pass them into this engine.
//
// =====================================================

/* =====================================================
   Types
===================================================== */

export type TrustLevel =
  | "new"
  | "basic"
  | "verified"
  | "trusted"
  | "restricted";

export interface TrustSignals {
  // ---------------------------------------------------
  // Verification
  // ---------------------------------------------------

  phoneVerified: boolean;

  selfieVerified: boolean;

  locationVerified: boolean;

  // ---------------------------------------------------
  // Seller History
  // ---------------------------------------------------

  accountAgeDays: number;

  successfulListings: number;

  completedSales: number;

  // ---------------------------------------------------
  // Negative History
  // ---------------------------------------------------

  confirmedBadHistory: number;

  confirmedFraudReports: number;

  confirmedSpamReports: number;

  rejectedListings: number;

  removedListings: number;

  // ---------------------------------------------------
  // Behaviour Signals
  // ---------------------------------------------------

  duplicateImagePosts: number;

  repeatedListings: number;

  priceChanges: number;

  abnormalPriceEvents: number;

  locationChanges: number;

  suspiciousActivity: number;
}

/* =====================================================
   Result
===================================================== */

export interface TrustScoreResult {
  score: number;

  level: TrustLevel;

  verifiedSeller: boolean;

  trustedSeller: boolean;

  reasons: string[];

  positiveSignals: string[];

  negativeSignals: string[];
}

/* =====================================================
   Helpers
===================================================== */

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    Math.max(value, min),
    max,
  );
}

function safeNumber(
  value: number,
): number {
  return Number.isFinite(value)
    ? value
    : 0;
}

/* =====================================================
   Calculate Trust Score
===================================================== */

export function calculateTrustScore(
  signals: TrustSignals,
): TrustScoreResult {
  // ===================================================
  // Normalize numbers
  // ===================================================

  const accountAgeDays = Math.max(
    0,
    safeNumber(signals.accountAgeDays),
  );

  const successfulListings =
    Math.max(
      0,
      safeNumber(signals.successfulListings),
    );

  const completedSales =
    Math.max(
      0,
      safeNumber(signals.completedSales),
    );

  const confirmedBadHistory =
    Math.max(
      0,
      safeNumber(signals.confirmedBadHistory),
    );

  const confirmedFraudReports =
    Math.max(
      0,
      safeNumber(signals.confirmedFraudReports),
    );

  const confirmedSpamReports =
    Math.max(
      0,
      safeNumber(signals.confirmedSpamReports),
    );

  const rejectedListings =
    Math.max(
      0,
      safeNumber(signals.rejectedListings),
    );

  const removedListings =
    Math.max(
      0,
      safeNumber(signals.removedListings),
    );

  const duplicateImagePosts =
    Math.max(
      0,
      safeNumber(signals.duplicateImagePosts),
    );

  const repeatedListings =
    Math.max(
      0,
      safeNumber(signals.repeatedListings),
    );

  const priceChanges =
    Math.max(
      0,
      safeNumber(signals.priceChanges),
    );

  const abnormalPriceEvents =
    Math.max(
      0,
      safeNumber(signals.abnormalPriceEvents),
    );

  const locationChanges =
    Math.max(
      0,
      safeNumber(signals.locationChanges),
    );

  const suspiciousActivity =
    Math.max(
      0,
      safeNumber(signals.suspiciousActivity),
    );

  // ===================================================
  // Score
  // ===================================================

  let score = 50;

  const positiveSignals: string[] = [];

  const negativeSignals: string[] = [];

  const reasons: string[] = [];

  // ===================================================
  // POSITIVE — Phone Verification
  // ===================================================

  if (signals.phoneVerified) {
    score += 12;

    positiveSignals.push(
      "Phone number verified",
    );
  }

  // ===================================================
  // POSITIVE — Selfie Verification
  // ===================================================

  if (signals.selfieVerified) {
    score += 18;

    positiveSignals.push(
      "Identity/selfie verified",
    );
  }

  // ===================================================
  // POSITIVE — Location Verification
  // ===================================================

  if (signals.locationVerified) {
    score += 12;

    positiveSignals.push(
      "Product location verified",
    );
  }

  // ===================================================
  // POSITIVE — Account History
  // ===================================================

  if (accountAgeDays >= 30) {
    score += 3;

    positiveSignals.push(
      "Established account",
    );
  }

  if (accountAgeDays >= 180) {
    score += 3;

    positiveSignals.push(
      "Long-term account history",
    );
  }

  // ===================================================
  // POSITIVE — Seller Activity
  // ===================================================

  if (successfulListings >= 3) {
    score += 3;

    positiveSignals.push(
      "Consistent listing history",
    );
  }

  if (completedSales >= 1) {
    score += 4;

    positiveSignals.push(
      "Completed sales history",
    );
  }

  if (completedSales >= 5) {
    score += 3;

    positiveSignals.push(
      "Strong completed sales history",
    );
  }

  // ===================================================
  // NEGATIVE — Bad History
  // ===================================================

  if (confirmedBadHistory > 0) {
    const penalty =
      Math.min(
        confirmedBadHistory * 15,
        45,
      );

    score -= penalty;

    negativeSignals.push(
      "Confirmed negative seller history",
    );
  }

  // ===================================================
  // NEGATIVE — Fraud Reports
  // ===================================================

  if (confirmedFraudReports > 0) {
    const penalty =
      Math.min(
        confirmedFraudReports * 20,
        60,
      );

    score -= penalty;

    negativeSignals.push(
      "Confirmed fraud-related reports",
    );
  }

  // ===================================================
  // NEGATIVE — Spam Reports
  // ===================================================

  if (confirmedSpamReports > 0) {
    const penalty =
      Math.min(
        confirmedSpamReports * 6,
        24,
      );

    score -= penalty;

    negativeSignals.push(
      "Confirmed spam reports",
    );
  }

  // ===================================================
  // NEGATIVE — Rejected Listings
  // ===================================================

  if (rejectedListings > 0) {
    const penalty =
      Math.min(
        rejectedListings * 3,
        15,
      );

    score -= penalty;

    negativeSignals.push(
      "Rejected listings detected",
    );
  }

  // ===================================================
  // NEGATIVE — Removed Listings
  // ===================================================

  if (removedListings > 0) {
    const penalty =
      Math.min(
        removedListings * 5,
        25,
      );

    score -= penalty;

    negativeSignals.push(
      "Removed listings detected",
    );
  }

  // ===================================================
  // NEGATIVE — Duplicate Images
  // ===================================================

  if (duplicateImagePosts > 0) {
    const penalty =
      Math.min(
        duplicateImagePosts * 6,
        30,
      );

    score -= penalty;

    negativeSignals.push(
      "Duplicate product images detected",
    );
  }

  // ===================================================
  // NEGATIVE — Repeated Listings
  // ===================================================

  if (repeatedListings > 0) {
    const penalty =
      Math.min(
        repeatedListings * 5,
        25,
      );

    score -= penalty;

    negativeSignals.push(
      "Repeated product listings detected",
    );
  }

  // ===================================================
  // NEGATIVE — Price Changes
  // ===================================================

  if (priceChanges >= 3) {
    const penalty =
      Math.min(
        (priceChanges - 2) * 2,
        12,
      );

    score -= penalty;

    negativeSignals.push(
      "Frequent price changes detected",
    );
  }

  // ===================================================
  // NEGATIVE — Abnormal Pricing
  // ===================================================

  if (abnormalPriceEvents > 0) {
    const penalty =
      Math.min(
        abnormalPriceEvents * 7,
        35,
      );

    score -= penalty;

    negativeSignals.push(
      "Unusual pricing behaviour detected",
    );
  }

  // ===================================================
  // NEGATIVE — Location Changes
  // ===================================================

  if (locationChanges >= 2) {
    const penalty =
      Math.min(
        (locationChanges - 1) * 4,
        20,
      );

    score -= penalty;

    negativeSignals.push(
      "Frequent product location changes detected",
    );
  }

  // ===================================================
  // NEGATIVE — Suspicious Activity
  // ===================================================

  if (suspiciousActivity > 0) {
    const penalty =
      Math.min(
        suspiciousActivity * 8,
        40,
      );

    score -= penalty;

    negativeSignals.push(
      "Suspicious activity detected",
    );
  }

  // ===================================================
  // Final Score
  // ===================================================

  score = Math.round(
    clamp(score, 0, 100),
  );

  // ===================================================
  // Serious Risk
  // ===================================================

  const seriousRisk =
    confirmedFraudReports > 0 ||
    confirmedBadHistory >= 2 ||
    suspiciousActivity >= 3;

  // ===================================================
  // VERIFIED SELLER
  //
  // Required:
  //
  // Phone
  // Selfie
  // Location
  // No serious confirmed bad history
  // ===================================================

  const verifiedSeller =
    signals.phoneVerified &&
    signals.selfieVerified &&
    signals.locationVerified &&
    !seriousRisk;

  // ===================================================
  // TRUSTED SELLER
  //
  // Trusted is intentionally harder.
  // ===================================================

  const trustedSeller =
    verifiedSeller &&
    score >= 80 &&
    !seriousRisk &&
    duplicateImagePosts === 0 &&
    abnormalPriceEvents === 0 &&
    suspiciousActivity === 0;

  // ===================================================
  // Trust Level
  // ===================================================

  let level: TrustLevel = "new";

  if (seriousRisk || score < 30) {
    level = "restricted";
  } else if (trustedSeller) {
    level = "trusted";
  } else if (verifiedSeller) {
    level = "verified";
  } else if (score >= 60) {
    level = "basic";
  } else {
    level = "new";
  }

  // ===================================================
  // Reasons
  // ===================================================

  if (verifiedSeller) {
    reasons.push(
      "Phone, identity and location verification completed.",
    );
  }

  if (trustedSeller) {
    reasons.push(
      "Seller meets DealUp trusted seller requirements.",
    );
  }

  if (negativeSignals.length > 0) {
    reasons.push(
      "Some risk signals require monitoring.",
    );
  }

  if (level === "restricted") {
    reasons.push(
      "Seller has significant risk signals.",
    );
  }

  // ===================================================
  // Return
  // ===================================================

  return {
    score,

    level,

    verifiedSeller,

    trustedSeller,

    reasons,

    positiveSignals,

    negativeSignals,
  };
}