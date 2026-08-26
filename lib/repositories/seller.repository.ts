import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

import {
  calculateSellerTrustScore,
  getSellerBadge,
} from "@/lib/risk/sellerTrust";

import { findCrossSellerDuplicateImages } from "@/lib/risk/crossSellerImageDetection";

import {
  getResolvedReportSummaryBySeller,
} from "@/lib/repositories/report.repository";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const USERS_COLLECTION = "users";

const PRODUCTS_COLLECTION = "products";

// =====================================================
// Helpers
// =====================================================

function safeNumber(value: unknown): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// =====================================================
// Product Identity
// =====================================================

function getProductIdentityKey(product: any): string {
  const title =
    normalizeText(product.title);

  const brand =
    normalizeText(product.brand);

  const model =
    normalizeText(product.model);

  const category =
    normalizeText(product.category);

  const subcategory =
    normalizeText(product.subcategory);

  return [
    title,
    brand,
    model,
    category,
    subcategory,
  ].join("|");
}

// =====================================================
// Image Keys
//
// Priority:
//
// 1. imageHash
// 2. publicId
// 3. url
// 4. thumbnail
//
// Existing products may not have imageHash,
// therefore legacy fallbacks remain.
// =====================================================

function getImageKeys(
  product: any,
): string[] {
  const keys: string[] = [];

  // ===================================================
  // Thumbnail
  // ===================================================

  if (
    typeof product.thumbnail === "string" &&
    product.thumbnail.trim()
  ) {
    keys.push(
      `thumbnail:${normalizeText(
        product.thumbnail,
      )}`,
    );
  }

  // ===================================================
  // Product Images
  // ===================================================

  if (
    Array.isArray(product.images)
  ) {
    for (
      const image of product.images
    ) {
      // ===============================================
      // Legacy string image
      // ===============================================

      if (
        typeof image === "string"
      ) {
        const value =
          image.trim();

        if (value) {
          keys.push(
            `legacy:${normalizeText(
              value,
            )}`,
          );
        }

        continue;
      }

      // ===============================================
      // Invalid image
      // ===============================================

      if (
        !image ||
        typeof image !== "object"
      ) {
        continue;
      }

      // ===============================================
      // SHA-256 Image Hash
      // ===============================================

      if (
        typeof image.imageHash ===
          "string" &&
        image.imageHash.trim()
      ) {
        keys.push(
          `hash:${normalizeText(
            image.imageHash,
          )}`,
        );
      }

      // ===============================================
      // Cloudinary Public ID
      // ===============================================

      if (
        typeof image.publicId ===
          "string" &&
        image.publicId.trim()
      ) {
        keys.push(
          `publicId:${normalizeText(
            image.publicId,
          )}`,
        );
      }

      // ===============================================
      // Image URL
      // ===============================================

      if (
        typeof image.url ===
          "string" &&
        image.url.trim()
      ) {
        keys.push(
          `url:${normalizeText(
            image.url,
          )}`,
        );
      }

      // ===============================================
      // Thumbnail URL
      // ===============================================

      if (
        typeof image.thumbnail ===
          "string" &&
        image.thumbnail.trim()
      ) {
        keys.push(
          `thumbnail:${normalizeText(
            image.thumbnail,
          )}`,
        );
      }
    }
  }

  // ===================================================
  // Remove duplicate keys
  // ===================================================

  return [
    ...new Set(keys),
  ];
}

// =====================================================
// Behaviour Signals
// =====================================================

function calculateBehaviourSignals(
  products: any[],
) {
  // ===================================================
  // Duplicate Images
  //
  // This detects repeated images by THE SAME seller.
  // Cross-seller detection is handled separately.
  // ===================================================

  const imageUsage =
    new Map<string, number>();

  for (
    const product of products
  ) {
    const imageKeys =
      getImageKeys(product);

    for (
      const imageKey of imageKeys
    ) {
      imageUsage.set(
        imageKey,
        (imageUsage.get(imageKey) ?? 0) +
          1,
      );
    }
  }

  let duplicateImagePosts = 0;

  for (
    const count of imageUsage.values()
  ) {
    if (count > 1) {
      duplicateImagePosts +=
        count - 1;
    }
  }

  // ===================================================
  // Repeated Listings
  // ===================================================

  const listingUsage =
    new Map<string, number>();

  for (
    const product of products
  ) {
    const key =
      getProductIdentityKey(
        product,
      );

    if (
      key.replace(/\|/g, "")
        .length === 0
    ) {
      continue;
    }

    listingUsage.set(
      key,
      (listingUsage.get(key) ?? 0) +
        1,
    );
  }

  let repeatedListings = 0;

  for (
    const count of listingUsage.values()
  ) {
    if (count > 1) {
      repeatedListings +=
        count - 1;
    }
  }

  // ===================================================
  // Price Changes
  // ===================================================

  let priceChanges = 0;

  // ===================================================
  // Abnormal Price Events
  // ===================================================

  let abnormalPriceEvents = 0;

  for (
    const product of products
  ) {
    const history =
      Array.isArray(
        product.priceHistory,
      )
        ? product.priceHistory
        : [];

    priceChanges +=
      history.length;

    for (
      const change of history
    ) {
      const previousPrice =
        safeNumber(
          change?.previousPrice,
        );

      const newPrice =
        safeNumber(
          change?.price ??
            change?.newPrice,
        );

      if (
        previousPrice <= 0 ||
        newPrice <= 0
      ) {
        continue;
      }

      const percentageChange =
        Math.abs(
          ((newPrice -
            previousPrice) /
            previousPrice) *
            100,
        );

      // 50%+ single price change
      if (
        percentageChange >= 50
      ) {
        abnormalPriceEvents++;
      }
    }
  }

  // ===================================================
  // Location Changes
  // ===================================================

  let locationChanges = 0;

  for (
    const product of products
  ) {
    const history =
      Array.isArray(
        product.locationHistory,
      )
        ? product.locationHistory
        : [];

    locationChanges +=
      history.length;
  }

  // ===================================================
  // Suspicious Activity
  // ===================================================

  let suspiciousActivity = 0;

  if (
    duplicateImagePosts >= 3
  ) {
    suspiciousActivity++;
  }

  if (
    repeatedListings >= 3
  ) {
    suspiciousActivity++;
  }

  if (
    priceChanges >= 8
  ) {
    suspiciousActivity++;
  }

  if (
    locationChanges >= 4
  ) {
    suspiciousActivity++;
  }

  if (
    abnormalPriceEvents >= 2
  ) {
    suspiciousActivity++;
  }

  // ===================================================
  // Return Behaviour Signals
  //
  // IMPORTANT:
  //
  // Cross-seller image detection is intentionally
  // separate because it requires other sellers'
  // products.
  // ===================================================

  return {
    duplicateImagePosts,

    repeatedListings,

    priceChanges,

    abnormalPriceEvents,

    locationChanges,

    suspiciousActivity,
  };
}

// =====================================================
// Refresh Seller Trust Score
// =====================================================

export async function refreshSellerTrustScore(
  sellerId: string,
) {
  // ===================================================
  // Validate Seller ID
  // ===================================================

  if (!sellerId) {
    throw new Error(
      "Seller ID is required.",
    );
  }

  if (
    !ObjectId.isValid(sellerId)
  ) {
    throw new Error(
      "Invalid seller ID.",
    );
  }

  // ===================================================
  // Database
  // ===================================================

  const client =
    await clientPromise;

  const db =
    client.db(DATABASE_NAME);

  const users =
    db.collection(
      USERS_COLLECTION,
    );

  const products =
    db.collection(
      PRODUCTS_COLLECTION,
    );

  // ===================================================
  // Seller
  // ===================================================

  const seller =
    await users.findOne({
      _id: new ObjectId(
        sellerId,
      ),
    });

  if (!seller) {
    throw new Error(
      "Seller not found.",
    );
  }

  // ===================================================
  // Seller Products
  // ===================================================

  const sellerProducts =
    await products
      .find({
        sellerId,
      })
      .toArray();

  // ===================================================
  // Cross-Seller Duplicate Image Detection
  //
  // Finds the same image used by another seller.
  //
  // IMPORTANT:
  //
  // Same image alone is NOT considered fraud.
  // It is evidence only.
  // ===================================================

  const crossSellerImageResult =
    await findCrossSellerDuplicateImages(
      sellerId,
      sellerProducts,
    );

  const crossSellerDuplicateImages =
    crossSellerImageResult.count;

  const crossSellerDuplicateMatches =
    crossSellerImageResult.matches;

  // ===================================================
  // Resolved Report Evidence
  //
  // Only ADMIN-RESOLVED reports are confirmed
  // moderation evidence.
  //
  // pending:
  //   not confirmed
  //
  // reviewing:
  //   not confirmed
  //
  // rejected:
  //   ignored
  //
  // resolved:
  //   confirmed
  // ===================================================

  const reportSummary =
    await getResolvedReportSummaryBySeller(
      sellerId,
    );

  // ===================================================
  // Product Count
  // ===================================================

  const totalProducts =
    sellerProducts.length;

  const activeProducts =
    sellerProducts.filter(
      (product) =>
        product.status ===
        "active",
    ).length;

  // ===================================================
  // Completed Sales
  // ===================================================

  const completedSales =
    sellerProducts.filter(
      (product) =>
        product.status ===
          "sold" ||
        product.saleStatus ===
          "completed" ||
        product.orderStatus ===
          "completed",
    ).length;

  // ===================================================
  // Successful Listings
  // ===================================================

  const successfulListings =
    sellerProducts.filter(
      (product) =>
        product.status ===
          "active" ||
        product.status ===
          "sold",
    ).length;

  // ===================================================
  // Product Risk Scores
  // ===================================================

  const productRiskScores =
    sellerProducts
      .map((product) =>
        safeNumber(
          product.risk?.score,
        ),
      )
      .filter((score) =>
        Number.isFinite(score),
      );

  // ===================================================
  // Seller Verification
  // ===================================================

  const sellerVerification =
    seller.sellerVerification ??
    {};

  // ===================================================
  // Phone
  // ===================================================

  const phoneVerified =
    seller.isPhoneVerified ===
      true ||
    sellerVerification.phoneVerified ===
      true;

  // ===================================================
  // Selfie
  // ===================================================

  const selfieVerified =
    sellerVerification.selfieVerified ===
    true;

  // ===================================================
  // Identity
  // ===================================================

  const identityVerified =
    sellerVerification.identityVerified ===
    true;

  // ===================================================
  // Location
  // ===================================================

  const locationVerified =
    sellerVerification.locationVerified ===
      true ||
    seller.locationVerification
      ?.status ===
      "verified";

  // ===================================================
  // Admin Verification Status
  // ===================================================

  const verificationStatus =
    sellerVerification.status ??
    "unverified";

  // ===================================================
  // Account Age
  // ===================================================

  const createdAt =
    seller.createdAt
      ? new Date(
          seller.createdAt,
        )
      : new Date();

  const accountAgeDays =
    Math.max(
      0,
      Math.floor(
        (Date.now() -
          createdAt.getTime()) /
          (1000 *
            60 *
            60 *
            24),
      ),
    );

  // ===================================================
  // Behaviour Engine
  // ===================================================

  const behaviourBase =
    calculateBehaviourSignals(
      sellerProducts,
    );

  // ===================================================
  // Merge Cross-Seller Signal
  //
  // IMPORTANT:
  //
  // Cross-seller duplicate images do NOT automatically
  // become suspicious activity.
  //
  // Legitimate dealers, agents and stock photos can
  // create the same image across multiple sellers.
  // ===================================================

  const behaviour = {
    ...behaviourBase,

    crossSellerDuplicateImages,
  };

  // ===================================================
  // Moderation / Bad History
  // ===================================================

  const confirmedBadHistory =
    safeNumber(
      seller.trustHistory
        ?.confirmedBadHistory ??
        seller.confirmedBadHistory,
    );

  const confirmedFraudReports =
    safeNumber(
      seller.trustHistory
        ?.confirmedFraudReports ??
        seller.confirmedFraudReports,
    );

  const confirmedSpamReports =
    safeNumber(
      seller.trustHistory
        ?.confirmedSpamReports ??
        seller.confirmedSpamReports,
    );

  const rejectedListings =
    safeNumber(
      seller.trustHistory
        ?.rejectedListings ??
        seller.rejectedListings,
    );

  const removedListings =
    safeNumber(
      seller.trustHistory
        ?.removedListings ??
        seller.removedListings,
    );

  // ===================================================
  // TRUST ENGINE
  //
  // IMPORTANT:
  //
  // Existing trust calculation remains unchanged.
  // Resolved reports are exposed as evidence first.
  // We do not automatically punish the seller here.
  // ===================================================

  const trust =
    calculateSellerTrustScore({
      phoneVerified,

      identityVerified,

      locationVerified,

      productRiskScores,

      activeProducts,

      totalProducts,

      completedSales,

      signals: {
        duplicateImagePosts:
          behaviour.duplicateImagePosts,

        repeatedListings:
          behaviour.repeatedListings,

        priceChanges:
          behaviour.priceChanges,

        abnormalPriceEvents:
          behaviour.abnormalPriceEvents,

        locationChanges:
          behaviour.locationChanges,

        suspiciousActivity:
          behaviour.suspiciousActivity,
      },
    });

  // ===================================================
  // ADMIN APPROVAL
  // ===================================================

  const adminApproved =
    verificationStatus ===
    "verified";

  // ===================================================
  // SELLER BADGE
  // ===================================================

  const sellerBadge =
    getSellerBadge({
      verificationStatus,

      phoneVerified,

      identityVerified,

      locationVerified,

      trustScore:
        trust.score,

      trustLevel:
        trust.level,

      trustedSeller:
        trust.trustedSeller,

      hasSeriousBadHistory:
        trust.seriousRisk,
    });

  // ===================================================
  // Verified Seller
  // ===================================================

  const verifiedSeller =
    adminApproved &&
    sellerBadge.badge ===
      "verified";

  // ===================================================
  // Trusted Seller
  // ===================================================

  const trustedSeller =
    adminApproved &&
    sellerBadge.badge ===
      "trusted";

  // ===================================================
  // Final Trust Signals
  // =====================================================

  const trustSignals = {
    // -----------------------------------------------
    // Behaviour
    // -----------------------------------------------

    duplicateImagePosts:
      behaviour.duplicateImagePosts,

    repeatedListings:
      behaviour.repeatedListings,

    priceChanges:
      behaviour.priceChanges,

    abnormalPriceEvents:
      behaviour.abnormalPriceEvents,

    locationChanges:
      behaviour.locationChanges,

    suspiciousActivity:
      behaviour.suspiciousActivity,

    // -----------------------------------------------
    // Cross Seller
    // -----------------------------------------------

    crossSellerDuplicateImages:
      behaviour.crossSellerDuplicateImages,

    crossSellerDuplicateMatches:
      crossSellerDuplicateMatches,

    // -----------------------------------------------
    // Resolved User Reports
    //
    // These are HIGH-VALUE evidence signals because
    // they come from admin-resolved reports.
    // -----------------------------------------------

    reports: {
      totalResolved:
        safeNumber(
          reportSummary.totalResolved,
        ),

      scam:
        safeNumber(
          reportSummary.scam,
        ),

      fake:
        safeNumber(
          reportSummary.fake,
        ),

      duplicate:
        safeNumber(
          reportSummary.duplicate,
        ),

      spam:
        safeNumber(
          reportSummary.spam,
        ),

      sold:
        safeNumber(
          reportSummary.sold,
        ),

      wrongCategory:
        safeNumber(
          reportSummary.wrongCategory,
        ),

      other:
        safeNumber(
          reportSummary.other,
        ),

      level:
        reportSummary.level ??
        "none",
    },
  };

  // ===================================================
  // Save Trust Engine Result
  // ===================================================

  await users.updateOne(
    {
      _id: new ObjectId(
        sellerId,
      ),
    },
    {
      $set: {
        trustScore:
          trust.score,

        trustLevel:
          trust.level,

        trustRiskScore:
          trust.riskScore,

        trustSeriousRisk:
          trust.seriousRisk,

        trustedSeller,

        verifiedSeller,

        completedSales,

        trustSignals,

        trustPenalties:
          trust.penalties,

        sellerBadge:
          sellerBadge.badge,

        sellerBadgeLabel:
          sellerBadge.label,

        trustScoreUpdatedAt:
          trust.calculatedAt,
      },
    },
  );

  // ===================================================
  // Return
  // ===================================================

  return {
    sellerId,

    trustScore:
      trust.score,

    trustLevel:
      trust.level,

    riskScore:
      trust.riskScore,

    seriousRisk:
      trust.seriousRisk,

    trustedSeller,

    verifiedSeller,

    sellerBadge:
      sellerBadge.badge,

    sellerBadgeLabel:
      sellerBadge.label,

    badgeEligible:
      sellerBadge.eligible,

    badgeReasons:
      sellerBadge.reasons,

    verificationStatus,

    phoneVerified,

    selfieVerified,

    identityVerified,

    locationVerified,

    accountAgeDays,

    successfulListings,

    completedSales,

    activeProducts,

    totalProducts,

    productRiskScores,

    trustSignals,

    penalties:
      trust.penalties,

    calculatedAt:
      trust.calculatedAt,
  };
}