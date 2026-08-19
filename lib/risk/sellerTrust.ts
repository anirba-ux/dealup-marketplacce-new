// =====================================================
// Seller Verification Status
// =====================================================

export type SellerVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

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
}: {
  phoneVerified: boolean;
  identityVerified: boolean;
  locationVerified: boolean;
  productRiskScores: number[];
  activeProducts: number;
  totalProducts: number;
}) {
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
  // 5. Product Risk
  // Lower risk = higher trust
  // ===================================================

  if (productRiskScores.length > 0) {
    const averageRisk =
      productRiskScores.reduce(
        (sum, value) => sum + value,
        0,
      ) / productRiskScores.length;

    if (averageRisk <= 10) {
      score += 15;
    } else if (averageRisk <= 30) {
      score += 8;
    } else if (averageRisk <= 60) {
      score += 3;
    }
  }

  // ===================================================
  // Keep Score Between 0 - 100
  // ===================================================

  score = Math.max(
    0,
    Math.min(100, Math.round(score)),
  );

  // ===================================================
  // Trust Level
  // ===================================================

  let level:
    | "low"
    | "basic"
    | "trusted"
    | "highly_trusted";

  if (score >= 85) {
    level = "highly_trusted";
  } else if (score >= 70) {
    level = "trusted";
  } else if (score >= 40) {
    level = "basic";
  } else {
    level = "low";
  }

  return {
    score,
    level,
    calculatedAt: new Date(),
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

export function getSellerBadge({
  verificationStatus,

  phoneVerified,

  identityVerified,

  locationVerified,

  trustScore,

  trustLevel,

  hasSeriousBadHistory,
}: {
  // ===================================================
  // IMPORTANT
  //
  // Badge can ONLY be awarded after Admin approval.
  // ===================================================

  verificationStatus: SellerVerificationStatus;

  phoneVerified: boolean;

  identityVerified: boolean;

  locationVerified: boolean;

  trustScore: number;

  trustLevel:
    | "low"
    | "basic"
    | "trusted"
    | "highly_trusted";

  hasSeriousBadHistory: boolean;
}): SellerBadgeResult {
  // ===================================================
  // Safe Score
  // ===================================================

  const score = Math.max(
    0,
    Math.min(
      100,
      Number.isFinite(trustScore)
        ? Math.round(trustScore)
        : 0,
    ),
  );

  const reasons: string[] = [];

  // ===================================================
  // ADMIN APPROVAL CHECK
  //
  // This is the most important condition.
  //
  // Verification completed alone is NOT enough.
  //
  // Admin must approve the seller.
  // ===================================================

  if (verificationStatus !== "verified") {
    if (verificationStatus === "pending") {
      reasons.push(
        "Seller verification is awaiting admin approval.",
      );
    } else if (
      verificationStatus === "rejected"
    ) {
      reasons.push(
        "Seller verification was rejected.",
      );
    } else if (
      verificationStatus === "suspended"
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

      label: "No Seller Badge",

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
      "Identity/image verification is required.",
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

  if (hasSeriousBadHistory) {
    reasons.push(
      "Serious negative seller history was detected.",
    );
  }

  // ===================================================
  // VERIFIED SELLER
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
    verificationStatus === "verified" &&
    phoneVerified &&
    identityVerified &&
    locationVerified &&
    !hasSeriousBadHistory;

  if (!verifiedEligible) {
    return {
      badge: "none",

      label: "No Seller Badge",

      eligible: false,

      reasons,
    };
  }

  // ===================================================
  // TRUSTED SELLER
  //
  // Verified Seller +
  // Trust Score >= 70 +
  // Trusted / Highly Trusted
  // ===================================================

  const trustedEligible =
    score >= 70 &&
    (
      trustLevel === "trusted" ||
      trustLevel === "highly_trusted"
    );

  if (trustedEligible) {
    return {
      badge: "trusted",

      label: "Trusted Seller",

      eligible: true,

      reasons: [],
    };
  }

  // ===================================================
  // VERIFIED SELLER
  // ===================================================

  return {
    badge: "verified",

    label: "Verified Seller",

    eligible: true,

    reasons: [],
  };
}