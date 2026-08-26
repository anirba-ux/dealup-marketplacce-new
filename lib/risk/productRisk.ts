// =====================================================
// DealUp Product Risk Engine
// =====================================================
//
// IMPORTANT
//
// This engine detects suspicious signals.
// It does NOT automatically accuse a seller of fraud.
//
// Existing detection:
// - Price changes
// - Large price drops
// - Repeated large price drops
// - Location changes
// - Seller GPS vs product location
//
// Additional evidence:
// - Cross-seller image match
// - Product similarity
// - Large price difference between sellers
// - Nearby location
// - Admin-resolved reports
//
// Same image alone is NOT fraud.
// =====================================================

// =====================================================
// Product Risk Status
// =====================================================

export type ProductRiskStatus =
  | "low"
  | "medium"
  | "high"
  | "very_high";

// =====================================================
// Cross-Seller Signal
// =====================================================

export interface CrossSellerSignal {
  sameImage?: boolean;
  sameBrand?: boolean;
  sameModel?: boolean;
  similarTitle?: boolean;
  similarPrice?: boolean;
  sameCategory?: boolean;
  sameSubcategory?: boolean;
  nearbyLocation?: boolean;
}

// =====================================================
// Cross-Seller Evidence
// =====================================================

export interface CrossSellerEvidence {
  matched: boolean;

  similarityScore?: number;

  similarityLevel?:
    | "none"
    | "low"
    | "medium"
    | "high";

  signals?: CrossSellerSignal;

  firstSeenPrice?: number;

  currentPrice?: number;

  priceDifferencePercent?: number;

  significantPriceDrop?: boolean;

  pricePatternLevel?:
    | "none"
    | "medium"
    | "high"
    | "very_high";

  resolvedReports?: {
    totalResolved?: number;
    scam?: number;
    fake?: number;
    duplicate?: number;
    spam?: number;
    sold?: number;
    wrongCategory?: number;
    other?: number;

    level?:
      | "none"
      | "medium"
      | "high"
      | "very_high";
  };
}

// =====================================================
// Product Risk Flag
// =====================================================

export interface ProductRiskFlag {
  code: string;

  message: string;

  severity:
    | "low"
    | "medium"
    | "high";

  points: number;
}

// =====================================================
// Product Risk Result
// =====================================================

export interface ProductRiskResult {
  score: number;

  status: ProductRiskStatus;

  flags: ProductRiskFlag[];

  crossSellerEvidence?: {
    matched: boolean;

    level:
      | "none"
      | "low"
      | "medium"
      | "high"
      | "very_high";

    reasons: string[];

    similarityScore?: number;

    priceDifferencePercent?: number;

    resolvedReportLevel?:
      | "none"
      | "medium"
      | "high"
      | "very_high";
  };

  lastCalculatedAt: Date;
}

// =====================================================
// Price History Type
// =====================================================

interface PriceHistoryItem {
  price?: number;

  previousPrice?: number;

  changedAt?: Date | string;
}

// =====================================================
// Location History Type
// =====================================================

interface LocationHistoryItem {
  changedAt?: Date | string;

  previousLocation?: {
    city?: string;

    district?: string;

    state?: string;

    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };

  coordinates?: {
    lat?: number;
    lng?: number;
  };

  city?: string;

  district?: string;

  state?: string;
}

// =====================================================
// Location Verification
// =====================================================

interface LocationVerification {
  distanceKm?: number;

  accuracy?: number;

  status?: string;
}

// =====================================================
// Input
// =====================================================

interface CalculateProductRiskInput {
  price?: number;

  priceHistory?: PriceHistoryItem[];

  locationHistory?: LocationHistoryItem[];

  locationVerification?: LocationVerification;

  crossSellerEvidence?: CrossSellerEvidence;
}

// =====================================================
// Safe Number
// =====================================================

function safeNumber(
  value: unknown,
): number | null {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
}

// =====================================================
// Clamp Score
// =====================================================

function clampScore(
  score: number,
): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(score),
    ),
  );
}

// =====================================================
// Risk Status
// =====================================================

function getRiskStatus(
  score: number,
): ProductRiskStatus {
  if (score >= 80) {
    return "very_high";
  }

  if (score >= 60) {
    return "high";
  }

  if (score >= 30) {
    return "medium";
  }

  return "low";
}

// =====================================================
// Cross-Seller Risk Level
// =====================================================
//
// IMPORTANT:
//
// Same image alone:
//     evidence only
//
// Same image + product similarity:
//     high signal
//
// Same image + 50%+ lower price:
//     high signal
//
// Same image + similarity + 50%+ lower price:
//     very high signal
//
// Resolved report strengthens the signal.
//
// Pending/rejected reports do NOT increase risk.
// =====================================================

function calculateCrossSellerEvidence(
  evidence?: CrossSellerEvidence,
): ProductRiskResult["crossSellerEvidence"] {
  // ---------------------------------------------------
  // No cross-seller evidence
  // ---------------------------------------------------

  if (!evidence?.matched) {
    return {
      matched: false,
      level: "none",
      reasons: [],
    };
  }

  const reasons: string[] = [];

  const signals =
    evidence.signals ?? {};

  const sameImage =
    signals.sameImage === true;

  const sameBrand =
    signals.sameBrand === true;

  const sameModel =
    signals.sameModel === true;

  const similarTitle =
    signals.similarTitle === true;

  const similarPrice =
    signals.similarPrice === true;

  const sameCategory =
    signals.sameCategory === true;

  const sameSubcategory =
    signals.sameSubcategory === true;

  const nearbyLocation =
    signals.nearbyLocation === true;

  const similarityScore =
    safeNumber(
      evidence.similarityScore,
    );

  const priceDifferencePercent =
    safeNumber(
      evidence.priceDifferencePercent,
    );

  const reportLevel =
    evidence.resolvedReports
      ?.level ?? "none";

  // ===================================================
  // Same Image
  // ===================================================

  if (sameImage) {
    reasons.push(
      "The same product image was detected across sellers.",
    );
  }

  // ===================================================
  // Product Similarity
  // ===================================================

  const similaritySignals =
    [
      sameBrand,
      sameModel,
      similarTitle,
      sameCategory,
      sameSubcategory,
    ].filter(Boolean).length;

  const strongSimilarity =
    similaritySignals >= 2 ||
    (
      similarityScore !== null &&
      similarityScore >= 60
    );

  if (strongSimilarity) {
    reasons.push(
      "The matched listings show strong product similarity.",
    );
  }

  // ===================================================
  // Nearby Location
  // ===================================================

  if (nearbyLocation) {
    reasons.push(
      "The listings are in the same or nearby location.",
    );
  }

  // ===================================================
  // Large Price Difference
  // ===================================================

  const hugePriceDifference =
    priceDifferencePercent !== null &&
    priceDifferencePercent >= 50;

  if (hugePriceDifference) {
    reasons.push(
      "The current listing price is significantly lower than the first-seen listing.",
    );
  }

  // ===================================================
  // Resolved Reports
  // ===================================================

  if (
    reportLevel === "medium" ||
    reportLevel === "high" ||
    reportLevel === "very_high"
  ) {
    reasons.push(
      "The seller has confirmed resolved reports.",
    );
  }

  // ===================================================
  // Determine Evidence Level
  // ===================================================

  let level:
    | "none"
    | "low"
    | "medium"
    | "high"
    | "very_high" =
    "low";

  // ---------------------------------------------------
  // Same image + strong similarity + huge price gap
  // ---------------------------------------------------

  if (
    sameImage &&
    strongSimilarity &&
    hugePriceDifference
  ) {
    level = "very_high";
  }

  // ---------------------------------------------------
  // Same image + huge price difference
  // ---------------------------------------------------

  else if (
    sameImage &&
    hugePriceDifference
  ) {
    level = "high";
  }

  // ---------------------------------------------------
  // Same image + strong product similarity
  // ---------------------------------------------------

  else if (
    sameImage &&
    strongSimilarity
  ) {
    level = "high";
  }

  // ---------------------------------------------------
  // Same image only
  // ---------------------------------------------------

  else if (sameImage) {
    level = "low";
  }

  // ===================================================
  // Resolved report strengthens evidence
  // ===================================================

  if (
    reportLevel === "very_high"
  ) {
    level =
      level === "very_high"
        ? "very_high"
        : "high";
  }

  else if (
    reportLevel === "high"
  ) {
    if (level === "low") {
      level = "high";
    }
  }

  else if (
    reportLevel === "medium"
  ) {
    if (level === "low") {
      level = "medium";
    }
  }

  // ===================================================
  // Return Cross-Seller Evidence
  // ===================================================

  return {
    matched: true,

    level,

    reasons,

    similarityScore:
      similarityScore ??
      undefined,

    priceDifferencePercent:
      priceDifferencePercent ??
      undefined,

    resolvedReportLevel:
      reportLevel,
  };
}

// =====================================================
// Calculate Product Risk
// =====================================================

export function calculateProductRisk({
  price,

  priceHistory = [],

  locationHistory = [],

  locationVerification,

  crossSellerEvidence,
}: CalculateProductRiskInput): ProductRiskResult {
  let score = 0;

  const flags: ProductRiskFlag[] = [];

  // ===================================================
  // Current Price
  // ===================================================

  const currentPrice =
    safeNumber(price);

  // ===================================================
  // PRICE HISTORY
  // ===================================================

  const validPriceHistory =
    Array.isArray(priceHistory)
      ? priceHistory.filter(
          (item) =>
            item &&
            safeNumber(
              item.price,
            ) !== null,
        )
      : [];

  // ===================================================
  // 1. Repeated Price Changes
  // ===================================================

  const priceChangeCount =
    validPriceHistory.length;

  if (priceChangeCount >= 5) {
    score += 25;

    flags.push({
      code:
        "FREQUENT_PRICE_CHANGES",

      message:
        "Product price has been changed frequently.",

      severity: "high",

      points: 25,
    });
  }

  else if (
    priceChangeCount >= 3
  ) {
    score += 15;

    flags.push({
      code:
        "MULTIPLE_PRICE_CHANGES",

      message:
        "Product price has been changed multiple times.",

      severity: "medium",

      points: 15,
    });
  }

  else if (
    priceChangeCount >= 2
  ) {
    score += 5;

    flags.push({
      code:
        "PRICE_CHANGED",

      message:
        "Product price has been changed more than once.",

      severity: "low",

      points: 5,
    });
  }

  // ===================================================
  // 2. Large Price Drop
  // ===================================================

  if (
    currentPrice !== null &&
    validPriceHistory.length > 0
  ) {
    const latestHistory =
      validPriceHistory[
        validPriceHistory.length - 1
      ];

    const previousPrice =
      safeNumber(
        latestHistory.previousPrice,
      );

    if (
      previousPrice !== null &&
      previousPrice > 0
    ) {
      const dropPercentage =
        (
          (previousPrice -
            currentPrice) /
          previousPrice
        ) * 100;

      if (
        dropPercentage >= 50
      ) {
        score += 30;

        flags.push({
          code:
            "VERY_LARGE_PRICE_DROP",

          message:
            `Product price dropped by approximately ${Math.round(
              dropPercentage,
            )}%.`,

          severity: "high",

          points: 30,
        });
      }

      else if (
        dropPercentage >= 30
      ) {
        score += 20;

        flags.push({
          code:
            "LARGE_PRICE_DROP",

          message:
            `Product price dropped by approximately ${Math.round(
              dropPercentage,
            )}%.`,

          severity: "medium",

          points: 20,
        });
      }

      else if (
        dropPercentage >= 20
      ) {
        score += 8;

        flags.push({
          code:
            "PRICE_DROP",

          message:
            `Product price dropped by approximately ${Math.round(
              dropPercentage,
            )}%.`,

          severity: "low",

          points: 8,
        });
      }
    }
  }

  // ===================================================
  // 3. Repeated Large Price Drops
  // ===================================================

  let largeDropCount = 0;

  for (
    const item of validPriceHistory
  ) {
    const oldPrice =
      safeNumber(
        item.previousPrice,
      );

    const newHistoryPrice =
      safeNumber(
        item.price,
      );

    if (
      oldPrice !== null &&
      newHistoryPrice !== null &&
      oldPrice > 0
    ) {
      const dropPercentage =
        (
          (oldPrice -
            newHistoryPrice) /
          oldPrice
        ) * 100;

      if (
        dropPercentage >= 30
      ) {
        largeDropCount++;
      }
    }
  }

  if (
    largeDropCount >= 3
  ) {
    score += 20;

    flags.push({
      code:
        "REPEATED_LARGE_PRICE_DROPS",

      message:
        "Product has experienced repeated large price reductions.",

      severity: "high",

      points: 20,
    });
  }

  // ===================================================
  // LOCATION HISTORY
  // ===================================================

  const validLocationHistory =
    Array.isArray(
      locationHistory,
    )
      ? locationHistory.filter(
          Boolean,
        )
      : [];

  const locationChangeCount =
    validLocationHistory.length;

  // ===================================================
  // 4. Repeated Location Changes
  // ===================================================

  if (
    locationChangeCount >= 5
  ) {
    score += 25;

    flags.push({
      code:
        "FREQUENT_LOCATION_CHANGES",

      message:
        "Product location has been changed frequently.",

      severity: "high",

      points: 25,
    });
  }

  else if (
    locationChangeCount >= 3
  ) {
    score += 15;

    flags.push({
      code:
        "MULTIPLE_LOCATION_CHANGES",

      message:
        "Product location has been changed multiple times.",

      severity: "medium",

      points: 15,
    });
  }

  else if (
    locationChangeCount >= 2
  ) {
    score += 5;

    flags.push({
      code:
        "LOCATION_CHANGED",

      message:
        "Product location has been changed more than once.",

      severity: "low",

      points: 5,
    });
  }

  // ===================================================
  // 5. Seller GPS vs Product Location
  // ===================================================

  const distanceKm =
    safeNumber(
      locationVerification
        ?.distanceKm,
    );

  if (
    distanceKm !== null
  ) {
    if (
      distanceKm >= 50
    ) {
      score += 25;

      flags.push({
        code:
          "PRODUCT_LOCATION_FAR_FROM_SELLER",

        message:
          `Product location is approximately ${distanceKm.toFixed(
            1,
          )} km from the seller's live location.`,

        severity: "high",

        points: 25,
      });
    }

    else if (
      distanceKm >= 25
    ) {
      score += 15;

      flags.push({
        code:
          "PRODUCT_LOCATION_DIFFERENT",

        message:
          `Product location is approximately ${distanceKm.toFixed(
            1,
          )} km from the seller's live location.`,

        severity: "medium",

        points: 15,
      });
    }

    else if (
      distanceKm >= 5
    ) {
      score += 5;

      flags.push({
        code:
          "PRODUCT_LOCATION_SLIGHTLY_DIFFERENT",

        message:
          `Product location is approximately ${distanceKm.toFixed(
            1,
          )} km from the seller's live location.`,

        severity: "low",

        points: 5,
      });
    }
  }

  // ===================================================
  // 6. Location Verification Status
  // ===================================================

  const verificationStatus =
    locationVerification
      ?.status;

  if (
    verificationStatus ===
    "far"
  ) {
    const alreadyFlagged =
      flags.some(
        (flag) =>
          flag.code ===
          "PRODUCT_LOCATION_FAR_FROM_SELLER",
      );

    if (!alreadyFlagged) {
      score += 20;

      flags.push({
        code:
          "LOCATION_VERIFICATION_FAR",

        message:
          "Seller GPS verification indicates a significant location difference.",

        severity: "high",

        points: 20,
      });
    }
  }

  // ===================================================
  // 7. Cross-Seller Evidence
  // ===================================================
  //
  // IMPORTANT:
  //
  // This section is contextual evidence.
  // It does NOT automatically accuse the seller.
  //
  // Same image alone:
  //     no major score penalty
  //
  // Same image + similarity:
  //     high signal
  //
  // Same image + 50%+ lower price:
  //     high signal
  //
  // Same image + similarity + 50%+ lower price:
  //     very high signal
  //
  // Resolved reports strengthen the evidence.
  // ===================================================

  const crossSellerResult =
    calculateCrossSellerEvidence(
      crossSellerEvidence,
    );

  if (
    crossSellerResult?.matched
  ) {
    // -------------------------------------------------
    // High Signal
    // -------------------------------------------------

    if (
      crossSellerResult.level ===
      "high"
    ) {
      flags.push({
        code:
          "CROSS_SELLER_HIGH_SIGNAL",

        message:
          "Cross-seller evidence indicates a high-confidence product match.",

        severity: "high",

        points: 0,
      });
    }

    // -------------------------------------------------
    // Very High Signal
    // -------------------------------------------------

    else if (
      crossSellerResult.level ===
      "very_high"
    ) {
      flags.push({
        code:
          "CROSS_SELLER_VERY_HIGH_SIGNAL",

        message:
          "Cross-seller evidence indicates a very high-confidence suspicious match.",

        severity: "high",

        points: 0,
      });
    }

    // -------------------------------------------------
    // Medium Signal
    // -------------------------------------------------

    else if (
      crossSellerResult.level ===
      "medium"
    ) {
      flags.push({
        code:
          "CROSS_SELLER_MEDIUM_SIGNAL",

        message:
          "Cross-seller evidence requires additional review.",

        severity: "medium",

        points: 0,
      });
    }

    // -------------------------------------------------
    // IMPORTANT
    //
    // Cross-seller evidence does NOT directly add
    // points to the normal product risk score.
    //
    // This prevents:
    //
    // same image
    // =
    // automatic fraud
    //
    // Final risk classification uses this evidence
    // separately.
    // -------------------------------------------------
  }

  // ===================================================
  // FINAL SCORE
  // ===================================================

  score =
    clampScore(score);

  // ===================================================
  // FINAL STATUS
  // ===================================================

  let status =
    getRiskStatus(score);

  // ===================================================
  // Cross-Seller Very High Signal
  //
  // This can raise the status to very_high,
  // but does NOT add arbitrary risk points.
  //
  // This keeps the evidence separate from
  // behavioural risk scoring.
  // ===================================================

  if (
    crossSellerResult?.level ===
    "very_high"
  ) {
    status =
      "very_high";
  }

  else if (
    crossSellerResult?.level ===
      "high" &&
    status === "low"
  ) {
    status =
      "high";
  }

  // ===================================================
  // Return
  // ===================================================

  return {
    score,

    status,

    flags,

    crossSellerEvidence:
      crossSellerResult,

    lastCalculatedAt:
      new Date(),
  };
}