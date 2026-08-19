import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

import {
  calculateSellerTrustScore,
} from "@/lib/risk/sellerTrust";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const USERS_COLLECTION = "users";

const PRODUCTS_COLLECTION = "products";

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

  if (!ObjectId.isValid(sellerId)) {
    throw new Error(
      "Invalid seller ID.",
    );
  }

  // ===================================================
  // MongoDB
  // ===================================================

  const client =
    await clientPromise;

  const db =
    client.db(
      DATABASE_NAME,
    );

  const users =
    db.collection(
      USERS_COLLECTION,
    );

  const products =
    db.collection(
      PRODUCTS_COLLECTION,
    );

  // ===================================================
  // Find Seller
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
  // Find Seller Products
  // ===================================================

  const sellerProducts =
    await products
      .find({
        sellerId,
      })
      .toArray();

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
  // Product Risk Scores
  // ===================================================

  const productRiskScores =
    sellerProducts
      .map(
        (product) =>
          Number(
            product.risk?.score ??
              0,
          ),
      )
      .filter(
        (score) =>
          Number.isFinite(
            score,
          ),
      );

  // ===================================================
  // Phone Verification
  // ===================================================

  const phoneVerified =
    seller.isPhoneVerified ===
      true ||
    seller.sellerVerification
      ?.phoneVerified === true;

  // ===================================================
  // Identity Verification
  // ===================================================

  const identityVerified =
    seller.sellerVerification
      ?.identityVerified === true;

      // ===================================================
// Seller Verification Status
//
// Admin approval status is stored here.
// Badge eligibility depends on this status.
// ===================================================

const verificationStatus =
  seller.sellerVerification
    ?.status ?? "unverified";

  // ===================================================
  // Location Verification
  //
  // For now we check whether
  // seller has location verification
  // data stored.
  //
  // Later we will make this stricter.
  // ===================================================

  const locationVerified =
    seller.locationVerification
      ?.status === "verified" ||
    seller.sellerVerification
      ?.locationVerified === true;

  // ===================================================
  // Calculate Trust Score
  // ===================================================

  const trust =
    calculateSellerTrustScore({
      phoneVerified,

      identityVerified,

      locationVerified,

      productRiskScores,

      activeProducts,

      totalProducts,
    });

  // ===================================================
  // Save Trust Score
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

        trustScoreUpdatedAt:
          trust.calculatedAt,
      },
    },
  );

  // ===================================================
  // Return Result
  // ===================================================

  return {
    sellerId,

    trustScore:
      trust.score,

    trustLevel:
      trust.level,

    phoneVerified,

    identityVerified,

    verificationStatus,

    locationVerified,

    activeProducts,

    totalProducts,

    productRiskScores,

    calculatedAt:
      trust.calculatedAt,
  };
}