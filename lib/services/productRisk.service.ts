import {
  Product,
  ProductPriceHistory,
  ProductLocationHistory,
  ProductRiskFlag,
  ProductRiskStatus,
} from "@/lib/models/product";

// =====================================
// Risk Calculation Result
// =====================================

export interface ProductRiskCalculation {
  score: number;

  status: ProductRiskStatus;

  flags: ProductRiskFlag[];
}

// =====================================
// Calculate Product Risk
// =====================================

export function calculateProductRisk(
  product: Product,
): ProductRiskCalculation {
  let score = 0;

  const flags: ProductRiskFlag[] = [];

  // =====================================
  // PRICE CHANGE ANALYSIS
  // =====================================

  const priceHistory =
    product.priceHistory ?? [];

  if (priceHistory.length >= 3) {
    const recentPrices =
      priceHistory.slice(-3);

    const firstPrice =
      recentPrices[0].price;

    const lastPrice =
      recentPrices[recentPrices.length - 1]
        .price;

    if (firstPrice > 0) {
      const percentageChange =
        Math.abs(
          ((lastPrice - firstPrice) /
            firstPrice) *
            100,
        );

      // Large price movement
      if (percentageChange >= 30) {
        score += 15;

        if (
          !flags.includes(
            "frequent_price_change",
          )
        ) {
          flags.push(
            "frequent_price_change",
          );
        }
      }
    }
  }

  // =====================================
  // LOCATION CHANGE ANALYSIS
  // =====================================

  const locationHistory =
    product.locationHistory ?? [];

  if (locationHistory.length >= 3) {
    const recentLocations =
      locationHistory.slice(-3);

    const uniqueLocations =
      new Set(
        recentLocations.map(
          (location) =>
            `${location.city}-${location.district}-${location.state}`,
        ),
      );

    if (uniqueLocations.size >= 3) {
      score += 15;

      flags.push(
        "frequent_location_change",
      );
    }
  }

  // =====================================
  // IMAGE REUSE
  // =====================================

  // Image reuse will be implemented
  // after the product update system.
  //
  // For now this signal is intentionally
  // not calculated here.

  // =====================================
  // BUYER REPORTS
  // =====================================

  // Buyer report system will be connected
  // later.

  // =====================================
  // MARKET PRICE
  // =====================================

  // Market price analysis will be added
  // later after category-based pricing
  // data is available.

  // =====================================
  // LIMIT SCORE
  // =====================================

  score = Math.min(score, 100);

  // =====================================
  // Risk Status
  // =====================================

  let status: ProductRiskStatus = "low";

  if (score >= 76) {
    status = "high";
  } else if (score >= 51) {
    status = "review";
  } else if (score >= 26) {
    status = "watch";
  }

  // =====================================
  // Result
  // =====================================

  return {
    score,

    status,

    flags,
  };
}