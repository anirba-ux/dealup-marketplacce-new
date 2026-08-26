// =====================================================
// DealUp Product Similarity Engine
// =====================================================
//
// Purpose:
//
// Compare two marketplace products and calculate
// how strongly they appear to represent the same
// or highly similar product.
//
// IMPORTANT:
//
// This engine does NOT accuse a seller of fraud.
//
// It only produces:
// - similarity score
// - similarity level
// - matching signals
// - human-readable reasons
//
// Current signals:
//
// 1. Same image hash
// 2. Same brand
// 3. Same model
// 4. Similar title
// 5. Similar price
// 6. Same category
// 7. Same subcategory
// 8. Same / nearby location
//
// =====================================================


// =====================================================
// Types
// =====================================================

export type ProductSimilarityLevel =
  | "low"
  | "medium"
  | "high"
  | "very_high";


export interface ProductSimilaritySignals {
  sameImage: boolean;

  sameBrand: boolean;

  sameModel: boolean;

  similarTitle: boolean;

  similarPrice: boolean;

  sameCategory: boolean;

  sameSubcategory: boolean;

  nearbyLocation: boolean;
}


export interface ProductSimilarityResult {
  score: number;

  level: ProductSimilarityLevel;

  signals: ProductSimilaritySignals;

  reasons: string[];
}


// =====================================================
// Product Input
// =====================================================

export interface ProductSimilarityInput {
  imageHash?: string | null;

  title?: string | null;

  brand?: string | null;

  model?: string | null;

  category?: string | null;

  subcategory?: string | null;

  price?: number | null;

  location?: {
    city?: string | null;

    district?: string | null;

    state?: string | null;

    coordinates?: {
      lat?: number | null;

      lng?: number | null;
    } | null;
  } | null;
}


// =====================================================
// Constants
// =====================================================
//
// The maximum theoretical score is:
//
// Same Image        = 40
// Same Brand        = 10
// Same Model        = 15
// Similar Title     = 10
// Similar Price     = 10
// Same Category     = 5
// Same Subcategory  = 5
// Nearby Location   = 5
//
// Maximum = 100
//
// =====================================================

const SCORE_SAME_IMAGE = 40;

const SCORE_SAME_BRAND = 10;

const SCORE_SAME_MODEL = 15;

const SCORE_SIMILAR_TITLE = 10;

const SCORE_SIMILAR_PRICE = 10;

const SCORE_SAME_CATEGORY = 5;

const SCORE_SAME_SUBCATEGORY = 5;

const SCORE_NEARBY_LOCATION = 5;


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
// Normalize Text
// =====================================================
//
// Converts:
//
// "Pulsar 150"
// "PULSAR-150"
// "Pulsar   150"
//
// into a comparable representation.
//
// =====================================================

function normalizeText(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9\s]/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}


// =====================================================
// Normalize Image Hash
// =====================================================

function normalizeHash(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase();
}


// =====================================================
// Tokenize Text
// =====================================================

function tokenize(
  value: string,
): Set<string> {
  if (!value) {
    return new Set();
  }

  return new Set(
    value
      .split(" ")
      .map(
        (token) =>
          token.trim(),
      )
      .filter(
        (token) =>
          token.length > 1,
      ),
  );
}


// =====================================================
// Calculate Jaccard Similarity
// =====================================================
//
// Example:
//
// "pulsar 150 sell"
// "pulsar 150 for sale"
//
// Common tokens:
//
// pulsar
// 150
//
// Similarity is based on token overlap.
//
// =====================================================

function calculateTextSimilarity(
  first: string,
  second: string,
): number {
  const firstTokens =
    tokenize(first);

  const secondTokens =
    tokenize(second);

  if (
    firstTokens.size === 0 ||
    secondTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (
    const token of firstTokens
  ) {
    if (
      secondTokens.has(token)
    ) {
      intersection++;
    }
  }

  const union =
    new Set([
      ...firstTokens,
      ...secondTokens,
    ]).size;

  if (union === 0) {
    return 0;
  }

  return (
    intersection / union
  );
}


// =====================================================
// Similar Title
// =====================================================
//
// Threshold:
//
// >= 0.50
//
// We intentionally keep this conservative.
// =====================================================

function isSimilarTitle(
  firstTitle: string,
  secondTitle: string,
): boolean {
  const similarity =
    calculateTextSimilarity(
      firstTitle,
      secondTitle,
    );

  return similarity >= 0.5;
}


// =====================================================
// Similar Price
// =====================================================
//
// Price similarity:
//
// <= 10% difference.
//
// Example:
//
// 65000 vs 60000
//
// Difference ≈ 7.69%
//
// Therefore similar.
//
// =====================================================

function isSimilarPrice(
  firstPrice: number | null,
  secondPrice: number | null,
): boolean {
  if (
    firstPrice === null ||
    secondPrice === null
  ) {
    return false;
  }

  if (
    firstPrice <= 0 ||
    secondPrice <= 0
  ) {
    return false;
  }

  const difference =
    Math.abs(
      firstPrice -
        secondPrice,
    );

  const average =
    (
      firstPrice +
      secondPrice
    ) / 2;

  if (average <= 0) {
    return false;
  }

  const percentage =
    difference / average;

  return percentage <= 0.10;
}


// =====================================================
// Haversine Distance
// =====================================================
//
// Returns distance in kilometres.
//
// =====================================================

function calculateDistanceKm(
  firstLat: number,
  firstLng: number,
  secondLat: number,
  secondLng: number,
): number {
  const earthRadiusKm =
    6371;

  const toRadians =
    (value: number) =>
      (value * Math.PI) / 180;

  const latitudeDifference =
    toRadians(
      secondLat -
        firstLat,
    );

  const longitudeDifference =
    toRadians(
      secondLng -
        firstLng,
    );

  const a =
    Math.sin(
      latitudeDifference / 2,
    ) ** 2 +
    Math.cos(
      toRadians(firstLat),
    ) *
      Math.cos(
        toRadians(secondLat),
      ) *
      Math.sin(
        longitudeDifference / 2,
      ) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return (
    earthRadiusKm * c
  );
}


// =====================================================
// Nearby Location
// =====================================================
//
// Priority:
//
// 1. Coordinates <= 10 km
// 2. Same city
// 3. Same district
// 4. Otherwise false
//
// =====================================================

function isNearbyLocation(
  firstLocation:
    ProductSimilarityInput["location"],
  secondLocation:
    ProductSimilarityInput["location"],
): boolean {
  if (
    !firstLocation ||
    !secondLocation
  ) {
    return false;
  }

  const firstLat =
    safeNumber(
      firstLocation
        .coordinates?.lat,
    );

  const firstLng =
    safeNumber(
      firstLocation
        .coordinates?.lng,
    );

  const secondLat =
    safeNumber(
      secondLocation
        .coordinates?.lat,
    );

  const secondLng =
    safeNumber(
      secondLocation
        .coordinates?.lng,
    );

  // ---------------------------------------------------
  // Coordinates available
  // ---------------------------------------------------

  if (
    firstLat !== null &&
    firstLng !== null &&
    secondLat !== null &&
    secondLng !== null
  ) {
    const distance =
      calculateDistanceKm(
        firstLat,
        firstLng,
        secondLat,
        secondLng,
      );

    return distance <= 10;
  }

  // ---------------------------------------------------
  // City fallback
  // ---------------------------------------------------

  const firstCity =
    normalizeText(
      firstLocation.city,
    );

  const secondCity =
    normalizeText(
      secondLocation.city,
    );

  if (
    firstCity &&
    secondCity &&
    firstCity === secondCity
  ) {
    return true;
  }

  // ---------------------------------------------------
  // District fallback
  // ---------------------------------------------------

  const firstDistrict =
    normalizeText(
      firstLocation.district,
    );

  const secondDistrict =
    normalizeText(
      secondLocation.district,
    );

  if (
    firstDistrict &&
    secondDistrict &&
    firstDistrict ===
      secondDistrict
  ) {
    return true;
  }

  return false;
}


// =====================================================
// Calculate Product Similarity
// =====================================================

export function calculateProductSimilarity(
  firstProduct: ProductSimilarityInput,
  secondProduct: ProductSimilarityInput,
): ProductSimilarityResult {
  // ===================================================
  // Normalize Values
  // ===================================================

  const firstHash =
    normalizeHash(
      firstProduct.imageHash,
    );

  const secondHash =
    normalizeHash(
      secondProduct.imageHash,
    );

  const firstTitle =
    normalizeText(
      firstProduct.title,
    );

  const secondTitle =
    normalizeText(
      secondProduct.title,
    );

  const firstBrand =
    normalizeText(
      firstProduct.brand,
    );

  const secondBrand =
    normalizeText(
      secondProduct.brand,
    );

  const firstModel =
    normalizeText(
      firstProduct.model,
    );

  const secondModel =
    normalizeText(
      secondProduct.model,
    );

  const firstCategory =
    normalizeText(
      firstProduct.category,
    );

  const secondCategory =
    normalizeText(
      secondProduct.category,
    );

  const firstSubcategory =
    normalizeText(
      firstProduct.subcategory,
    );

  const secondSubcategory =
    normalizeText(
      secondProduct.subcategory,
    );

  const firstPrice =
    safeNumber(
      firstProduct.price,
    );

  const secondPrice =
    safeNumber(
      secondProduct.price,
    );


  // ===================================================
  // Signals
  // ===================================================

  const sameImage =
    Boolean(
      firstHash &&
        secondHash &&
        firstHash ===
          secondHash,
    );

  const sameBrand =
    Boolean(
      firstBrand &&
        secondBrand &&
        firstBrand ===
          secondBrand,
    );

  const sameModel =
    Boolean(
      firstModel &&
        secondModel &&
        firstModel ===
          secondModel,
    );

  const similarTitle =
    isSimilarTitle(
      firstTitle,
      secondTitle,
    );

  const similarPrice =
    isSimilarPrice(
      firstPrice,
      secondPrice,
    );

  const sameCategory =
    Boolean(
      firstCategory &&
        secondCategory &&
        firstCategory ===
          secondCategory,
    );

  const sameSubcategory =
    Boolean(
      firstSubcategory &&
        secondSubcategory &&
        firstSubcategory ===
          secondSubcategory,
    );

  const nearbyLocation =
    isNearbyLocation(
      firstProduct.location,
      secondProduct.location,
    );


  // ===================================================
  // Score
  // ===================================================

  let score = 0;

  if (sameImage) {
    score +=
      SCORE_SAME_IMAGE;
  }

  if (sameBrand) {
    score +=
      SCORE_SAME_BRAND;
  }

  if (sameModel) {
    score +=
      SCORE_SAME_MODEL;
  }

  if (similarTitle) {
    score +=
      SCORE_SIMILAR_TITLE;
  }

  if (similarPrice) {
    score +=
      SCORE_SIMILAR_PRICE;
  }

  if (sameCategory) {
    score +=
      SCORE_SAME_CATEGORY;
  }

  if (sameSubcategory) {
    score +=
      SCORE_SAME_SUBCATEGORY;
  }

  if (nearbyLocation) {
    score +=
      SCORE_NEARBY_LOCATION;
  }


  // ===================================================
  // Clamp Score
  // ===================================================

  score =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score),
      ),
    );


  // ===================================================
  // Similarity Level
  // ===================================================

  let level:
    ProductSimilarityLevel;

  if (score >= 80) {
    level =
      "very_high";
  } else if (score >= 60) {
    level =
      "high";
  } else if (score >= 40) {
    level =
      "medium";
  } else {
    level =
      "low";
  }


  // ===================================================
  // Reasons
  // ===================================================

  const reasons: string[] =
    [];

  if (sameImage) {
    reasons.push(
      "The same product image hash was detected.",
    );
  }

  if (sameBrand) {
    reasons.push(
      "The products have the same brand.",
    );
  }

  if (sameModel) {
    reasons.push(
      "The products have the same model.",
    );
  }

  if (similarTitle) {
    reasons.push(
      "The product titles are similar.",
    );
  }

  if (similarPrice) {
    reasons.push(
      "The product prices are within the similarity threshold.",
    );
  }

  if (sameCategory) {
    reasons.push(
      "The products belong to the same category.",
    );
  }

  if (sameSubcategory) {
    reasons.push(
      "The products belong to the same subcategory.",
    );
  }

  if (nearbyLocation) {
    reasons.push(
      "The products are listed in the same or nearby location.",
    );
  }


  // ===================================================
  // Result
  // ===================================================

  return {
    score,

    level,

    signals: {
      sameImage,

      sameBrand,

      sameModel,

      similarTitle,

      similarPrice,

      sameCategory,

      sameSubcategory,

      nearbyLocation,
    },

    reasons,
  };
}