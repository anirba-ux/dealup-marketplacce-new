// =====================================================
// DealUp Product Risk Engine
// =====================================================
//
// This is the first server-side risk engine.
//
// It does NOT automatically accuse a seller of fraud.
// It only detects suspicious signals.
//
// Later we can add:
// - AI price analysis
// - Duplicate image detection
// - Seller report history
// - Market price comparison
// - Behaviour analysis
// =====================================================

export type ProductRiskStatus =
  | "low"
  | "medium"
  | "high";

export interface ProductRiskFlag {
  code: string;
  message: string;
  severity: "low" | "medium" | "high";
  points: number;
}

export interface ProductRiskResult {
  score: number;
  status: ProductRiskStatus;
  flags: ProductRiskFlag[];
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
// Location Verification Type
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
    Math.min(100, Math.round(score)),
  );
}

// =====================================================
// Risk Status
// =====================================================

function getRiskStatus(
  score: number,
): ProductRiskStatus {
  if (score >= 60) {
    return "high";
  }

  if (score >= 30) {
    return "medium";
  }

  return "low";
}

// =====================================================
// Calculate Product Risk
// =====================================================

export function calculateProductRisk({
  price,
  priceHistory = [],
  locationHistory = [],
  locationVerification,
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
      code: "FREQUENT_PRICE_CHANGES",

      message:
        "Product price has been changed frequently.",

      severity: "high",

      points: 25,
    });
  } else if (priceChangeCount >= 3) {
    score += 15;

    flags.push({
      code: "MULTIPLE_PRICE_CHANGES",

      message:
        "Product price has been changed multiple times.",

      severity: "medium",

      points: 15,
    });
  } else if (priceChangeCount >= 2) {
    score += 5;

    flags.push({
      code: "PRICE_CHANGED",

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
        ((previousPrice -
          currentPrice) /
          previousPrice) *
        100;

      // -----------------------------------------------
      // Very large price reduction
      // -----------------------------------------------

      if (dropPercentage >= 50) {
        score += 30;

        flags.push({
          code: "VERY_LARGE_PRICE_DROP",

          message:
            `Product price dropped by approximately ${Math.round(
              dropPercentage,
            )}%.`,

          severity: "high",

          points: 30,
        });
      } else if (
        dropPercentage >= 30
      ) {
        score += 20;

        flags.push({
          code: "LARGE_PRICE_DROP",

          message:
            `Product price dropped by approximately ${Math.round(
              dropPercentage,
            )}%.`,

          severity: "medium",

          points: 20,
        });
      } else if (
        dropPercentage >= 20
      ) {
        score += 8;

        flags.push({
          code: "PRICE_DROP",

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
        ((oldPrice -
          newHistoryPrice) /
          oldPrice) *
        100;

      if (
        dropPercentage >= 30
      ) {
        largeDropCount++;
      }
    }
  }

  if (largeDropCount >= 3) {
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
  } else if (
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
  } else if (
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

  if (distanceKm !== null) {
    // -----------------------------------------------
    // More than 50 km
    // -----------------------------------------------

    if (distanceKm >= 50) {
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

    // -----------------------------------------------
    // 25 - 50 km
    // -----------------------------------------------

    else if (distanceKm >= 25) {
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

    // -----------------------------------------------
    // 5 - 25 km
    // -----------------------------------------------

    else if (distanceKm >= 5) {
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
    // Only add if distance
    // did not already add a high
    // score.

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
  // FINAL SCORE
  // ===================================================

  score =
    clampScore(score);

  // ===================================================
  // FINAL STATUS
  // ===================================================

  const status =
    getRiskStatus(score);

  // ===================================================
  // Return
  // ===================================================

  return {
    score,

    status,

    flags,

    lastCalculatedAt:
      new Date(),
  };
}