// =====================================================
// Seller Verification Status
// =====================================================

export type SellerVerificationStatus =
  | "unverified"
  | "pending"
  | "action_required"
  | "verified"
  | "rejected"
  | "suspended";

// =====================================================
// Seller Trust Level
// =====================================================

export type SellerTrustLevel =
  | "low"
  | "basic"
  | "trusted"
  | "highly_trusted";

// =====================================================
// Seller Trust Signals
// =====================================================

export interface SellerTrustSignals {
  duplicateImagePosts: number;

  repeatedListings: number;

  priceChanges: number;

  abnormalPriceEvents: number;

  locationChanges: number;

  suspiciousActivity: number;
}

// =====================================================
// Seller Trust Result
// =====================================================

export interface SellerTrustResult {
  score: number;

  level: SellerTrustLevel;

  riskScore: number;

  seriousRisk: boolean;

  trustedSeller: boolean;

  calculatedAt: Date;

  penalties: {
    duplicateImage: number;

    repeatedListing: number;

    priceChange: number;

    abnormalPrice: number;

    locationChange: number;

    suspiciousActivity: number;
  };
}

// =====================================================
// Calculate Seller Trust Score
// =====================================================

export function calculateSellerTrustScore({
  phoneVerified,

  identityVerified,

  locationVerified,

  productRiskScores,

  activeProducts,

  totalProducts,

  completedSales = 0,

  signals = {},
}: {
  phoneVerified: boolean;

  identityVerified: boolean;

  locationVerified: boolean;

  productRiskScores: number[];

  activeProducts: number;

  totalProducts: number;

  completedSales?: number;

  signals?: Partial<SellerTrustSignals>;
}): SellerTrustResult {
  // ===================================================
  // Safe Signals
  // ===================================================

  const duplicateImagePosts =
    Number(
      signals.duplicateImagePosts ?? 0,
    );

  const repeatedListings =
    Number(
      signals.repeatedListings ?? 0,
    );

  const priceChanges =
    Number(
      signals.priceChanges ?? 0,
    );

  const abnormalPriceEvents =
    Number(
      signals.abnormalPriceEvents ?? 0,
    );

  const locationChanges =
    Number(
      signals.locationChanges ?? 0,
    );

  const suspiciousActivity =
    Number(
      signals.suspiciousActivity ?? 0,
    );

  // ===================================================
  // Base Trust Score
  // ===================================================

  let score = 0;

  // ===================================================
  // 1. Phone Verification
  // ===================================================

  if (phoneVerified) {
    score += 25;
  }

  // ===================================================
  // 2. Identity Verification
  // ===================================================

  if (identityVerified) {
    score += 25;
  }

  // ===================================================
  // 3. Location Verification
  // ===================================================

  if (locationVerified) {
    score += 20;
  }

  // ===================================================
  // 4. Product Activity
  // ===================================================

  if (totalProducts >= 1) {
    score += 5;
  }

  if (totalProducts >= 3) {
    score += 5;
  }

  if (activeProducts >= 3) {
    score += 5;
  }

  // ===================================================
  // 5. Completed Sales
  // ===================================================

  if (completedSales >= 1) {
    score += 5;
  }

  if (completedSales >= 3) {
    score += 5;
  }

  // ===================================================
  // 6. Product Risk
  //
  // Lower risk = higher trust
  // ===================================================

  if (
    productRiskScores.length > 0
  ) {
    const validScores =
      productRiskScores.filter(
        (value) =>
          Number.isFinite(value),
      );

    if (validScores.length > 0) {
      const averageRisk =
        validScores.reduce(
          (sum, value) =>
            sum + value,
          0,
        ) /
        validScores.length;

      if (averageRisk <= 10) {
        score += 15;
      } else if (
        averageRisk <= 30
      ) {
        score += 8;
      } else if (
        averageRisk <= 60
      ) {
        score += 3;
      }
    }
  }

  // ===================================================
  // 7. Behaviour Penalties
  // ===================================================

  const penalties = {
    duplicateImage:
      Math.min(
        duplicateImagePosts * 5,
        20,
      ),

    repeatedListing:
      Math.min(
        repeatedListings * 5,
        20,
      ),

    priceChange:
      Math.min(
        priceChanges * 2,
        10,
      ),

    abnormalPrice:
      Math.min(
        abnormalPriceEvents * 8,
        30,
      ),

    locationChange:
      Math.min(
        locationChanges * 3,
        15,
      ),

    suspiciousActivity:
      Math.min(
        suspiciousActivity * 10,
        40,
      ),
  };

  // ===================================================
  // Total Behaviour Penalty
  // ===================================================

  const totalPenalty =
    penalties.duplicateImage +
    penalties.repeatedListing +
    penalties.priceChange +
    penalties.abnormalPrice +
    penalties.locationChange +
    penalties.suspiciousActivity;

  score -= totalPenalty;

  // ===================================================
  // Risk Score
  //
  // 0 = lowest risk
  // 100 = highest risk
  // ===================================================

  const riskScore =
    Math.max(
      0,
      Math.min(
        100,
        totalPenalty,
      ),
    );

  // ===================================================
  // Serious Risk
  // ===================================================

  const seriousRisk =
    abnormalPriceEvents >= 3 ||
    suspiciousActivity >= 3 ||
    duplicateImagePosts >= 4 ||
    repeatedListings >= 4;

  // ===================================================
  // Keep Trust Score 0 - 100
  // ===================================================

  score = Math.max(
    0,
    Math.min(
      100,
      Math.round(score),
    ),
  );

  // ===================================================
  // Trust Level
  // ===================================================

  let level: SellerTrustLevel;

  if (score >= 85) {
    level =
      "highly_trusted";
  } else if (score >= 70) {
    level =
      "trusted";
  } else if (score >= 40) {
    level =
      "basic";
  } else {
    level =
      "low";
  }

  // ===================================================
  // Minimum Trusted Activity
  //
  // Verification alone must NOT create
  // Trusted Seller status.
  //
  // Requirement:
  //
  // 3+ listings
  // OR
  // 1+ completed sale
  // ===================================================

  const hasMinimumTrustedActivity =
    totalProducts >= 3 ||
    completedSales >= 1;

  // ===================================================
  // Trusted Seller
  //
  // AUTOMATIC
  //
  // Admin does NOT approve this badge.
  // ===================================================

  const trustedSeller =
    score >= 70 &&
    (
      level === "trusted" ||
      level === "highly_trusted"
    ) &&
    !seriousRisk &&
    duplicateImagePosts === 0 &&
    abnormalPriceEvents === 0 &&
    suspiciousActivity === 0 &&
    hasMinimumTrustedActivity;

  // ===================================================
  // Return
  // ===================================================

  return {
    score,

    level,

    riskScore,

    seriousRisk,

    trustedSeller,

    calculatedAt:
      new Date(),

    penalties,
  };
}

// =====================================================
// Seller Badge
// =====================================================

export type SellerBadge =
  | "none"
  | "verified"
  | "trusted";

// =====================================================
// Seller Badge Result
// =====================================================

export interface SellerBadgeResult {
  badge: SellerBadge;

  label: string;

  eligible: boolean;

  reasons: string[];
}

// =====================================================
// Get Seller Badge
// =====================================================
//
// IMPORTANT:
//
// Verified Seller
// → Admin approved
//
// Trusted Seller
// → Trust Engine automatic
//
// action_required
// → No badge
//
// pending
// → No badge
//
// rejected
// → No badge
//
// suspended
// → No badge
// =====================================================

export function getSellerBadge({
  verificationStatus,

  phoneVerified,

  identityVerified,

  locationVerified,

  trustScore,

  trustLevel,

  hasSeriousBadHistory,

  trustedSeller = false,
}: {
  verificationStatus:
    SellerVerificationStatus;

  phoneVerified: boolean;

  identityVerified: boolean;

  locationVerified: boolean;

  trustScore: number;

  trustLevel:
    SellerTrustLevel;

  hasSeriousBadHistory: boolean;

  trustedSeller?: boolean;
}): SellerBadgeResult {
  // ===================================================
  // Safe Score
  // ===================================================

  const score =
    Math.max(
      0,
      Math.min(
        100,
        Number.isFinite(
          trustScore,
        )
          ? Math.round(
              trustScore,
            )
          : 0,
      ),
    );

  const reasons: string[] =
    [];

  // ===================================================
  // ACTION REQUIRED
  //
  // Seller must correct verification.
  //
  // No badge is allowed.
  // ===================================================

  if (
    verificationStatus ===
    "action_required"
  ) {
    reasons.push(
      "Seller verification requires correction before approval.",
    );

    return {
      badge: "none",

      label:
        "No Seller Badge",

      eligible: false,

      reasons,
    };
  }

  // ===================================================
  // Admin Approval
  // ===================================================

  if (
    verificationStatus !==
    "verified"
  ) {
    if (
      verificationStatus ===
      "pending"
    ) {
      reasons.push(
        "Seller verification is awaiting admin approval.",
      );
    } else if (
      verificationStatus ===
      "rejected"
    ) {
      reasons.push(
        "Seller verification was rejected.",
      );
    } else if (
      verificationStatus ===
      "suspended"
    ) {
      reasons.push(
        "Seller verification is suspended.",
      );
    } else {
      reasons.push(
        "Seller verification has not been approved.",
      );
    }

    return {
      badge: "none",

      label:
        "No Seller Badge",

      eligible: false,

      reasons,
    };
  }

  // ===================================================
  // Phone
  // ===================================================

  if (!phoneVerified) {
    reasons.push(
      "Phone verification is required.",
    );
  }

  // ===================================================
  // Identity
  // ===================================================

  if (!identityVerified) {
    reasons.push(
      "Identity verification is required.",
    );
  }

  // ===================================================
  // Location
  // ===================================================

  if (!locationVerified) {
    reasons.push(
      "Location verification is required.",
    );
  }

  // ===================================================
  // Serious Bad History
  // ===================================================

  if (
    hasSeriousBadHistory
  ) {
    reasons.push(
      "Serious negative seller history was detected.",
    );
  }

  // ===================================================
  // Verified Seller
  //
  // Requirements:
  //
  // 1. Admin approved
  // 2. Phone verified
  // 3. Identity verified
  // 4. Location verified
  // 5. No serious bad history
  // ===================================================

  const verifiedEligible =
    verificationStatus ===
      "verified" &&
    phoneVerified &&
    identityVerified &&
    locationVerified &&
    !hasSeriousBadHistory;

  if (!verifiedEligible) {
    return {
      badge: "none",

      label:
        "No Seller Badge",

      eligible: false,

      reasons,
    };
  }

  // ===================================================
  // Trusted Seller
  //
  // IMPORTANT:
  //
  // This is NOT admin approved.
  //
  // Trust Engine calculates trustedSeller.
  //
  // However, the seller must also be a
  // fully Verified Seller before the
  // public Trusted Seller badge appears.
  // ===================================================

  const trustedEligible =
    trustedSeller === true &&
    score >= 70 &&
    (
      trustLevel ===
        "trusted" ||
      trustLevel ===
        "highly_trusted"
    );

  if (trustedEligible) {
    return {
      badge: "trusted",

      label:
        "Trusted Seller",

      eligible: true,

      reasons: [],
    };
  }

  // ===================================================
  // Verified Seller
  // ===================================================

  return {
    badge: "verified",

    label:
      "Verified Seller",

    eligible: true,

    reasons: [],
  };
}