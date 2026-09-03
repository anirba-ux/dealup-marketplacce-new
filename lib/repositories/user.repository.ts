import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

import type {
  User,
  SellerVerification,
} from "@/lib/types/user";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const USERS_COLLECTION =
  "users";

// =====================================================
// Find User By ID
// =====================================================

export async function findUserById(
  id: string,
): Promise<User | null> {
  // ===================================================
  // Validate ObjectId
  // ===================================================

  if (!ObjectId.isValid(id)) {
    return null;
  }

  // ===================================================
  // Database
  // ===================================================

  const client =
    await clientPromise;

  const db =
    client.db(DATABASE_NAME);

  // ===================================================
  // Find User
  // ===================================================

  const user =
    await db
      .collection(USERS_COLLECTION)
      .findOne({
        _id: new ObjectId(id),
      });

  // ===================================================
  // User Not Found
  // ===================================================

  if (!user) {
    return null;
  }

  // ===================================================
  // Seller Verification
  //
  // Existing users may not have all of the
  // newer verification fields.
  //
  // Therefore safe defaults are provided.
  // ===================================================

  const sellerVerification: SellerVerification = {
    // ================================================
    // Status
    // ================================================

    status:
      user.sellerVerification?.status ??
      "unverified",

    // ================================================
    // Phone
    // ================================================

    phoneVerified:
      user.sellerVerification
        ?.phoneVerified ??
      user.isPhoneVerified ??
      false,

    // ================================================
    // Identity
    // ================================================

    identityVerified:
      user.sellerVerification
        ?.identityVerified ??
      false,

    // ================================================
    // Identity Document
    // ================================================

    identityDocumentType:
      user.sellerVerification
        ?.identityDocumentType ??
      null,

    // ================================================
    // Identity Submission
    // ================================================

    identitySubmissionId:
      user.sellerVerification
        ?.identitySubmissionId ??
      null,

    identitySubmittedAt:
      user.sellerVerification
        ?.identitySubmittedAt ??
      null,

    identityReviewedAt:
      user.sellerVerification
        ?.identityReviewedAt ??
      null,

    identityRejectionReason:
      user.sellerVerification
        ?.identityRejectionReason ??
      null,

    // ================================================
    // Location
    // ================================================

    locationVerified:
      user.sellerVerification
        ?.locationVerified ??
      false,

          // ================================================
    // Live Selfie Verification
    // ================================================

    selfieVerified:
      user.sellerVerification
        ?.selfieVerified ??
      false,

    selfieUrl:
      user.sellerVerification
        ?.selfieUrl ??
      null,

    selfiePublicId:
      user.sellerVerification
        ?.selfiePublicId ??
      null,

    selfieVerifiedAt:
      user.sellerVerification
        ?.selfieVerifiedAt ??
      null,

    // ================================================
    // Verification Timeline
    // ================================================

    submittedAt:
      user.sellerVerification
        ?.submittedAt ??
      null,

    verifiedAt:
      user.sellerVerification
        ?.verifiedAt ??
      null,

    rejectionReason:
      user.sellerVerification
        ?.rejectionReason ??
      null,

    // ================================================
    // Suspension
    // ================================================

    suspendedAt:
      user.sellerVerification
        ?.suspendedAt ??
      null,

    suspensionReason:
      user.sellerVerification
        ?.suspensionReason ??
      null,
  };

  // ===================================================
  // Return User
  // ===================================================

  return {
    // ================================================
    // Basic User
    // ================================================

    _id:
      user._id.toString(),

    name:
      user.name ?? "",

    email:
      user.email ?? "",

    image:
      user.image ?? "",

    phone:
      user.phone ?? "",

    // ================================================
    // Role
    // ================================================

    role:
      user.role ?? "user",

    // ================================================
    // Provider
    // ================================================

    provider:
      user.provider ?? undefined,

    // ================================================
    // Backward Compatibility
    // ================================================

    isVerified:
      user.isVerified ??
      false,

    // ================================================
    // Phone Verification
    // ================================================

    isPhoneVerified:
      user.isPhoneVerified ??
      false,

    // ================================================
    // Seller Verification
    // ================================================

    sellerVerification,

    // ================================================
// Trust
// ================================================

trustScore:
  Number(
    user.trustScore ?? 0,
  ),

trustLevel:
  user.trustLevel ??
  undefined,

trustedSeller:
  user.trustedSeller ??
  false,

verifiedSeller:
  user.verifiedSeller ??
  false,

sellerBadge:
  user.sellerBadge ??
  "none",

sellerBadgeLabel:
  user.sellerBadgeLabel ??
  "",

  // ================================================
// Premium Seller
// ================================================

premiumSeller: {
  active:
    user.premiumSeller?.active ??
    false,

  plan:
    user.premiumSeller?.plan ??
    null,

  startedAt:
    user.premiumSeller?.startedAt ??
    null,

  expiresAt:
    user.premiumSeller?.expiresAt ??
    null,

  paymentId:
    user.premiumSeller?.paymentId ??
    null,

  orderId:
    user.premiumSeller?.orderId ??
    null,

  featuredAds:
    user.premiumSeller?.featuredAds ??
    false,

  productBoost:
    user.premiumSeller?.productBoost ??
    false,

  sellerAnalytics:
    user.premiumSeller?.sellerAnalytics ??
    false,

  premiumBadge:
    user.premiumSeller?.premiumBadge ??
    false,

  prioritySupport:
    user.premiumSeller?.prioritySupport ??
    false,

  updatedAt:
    user.premiumSeller?.updatedAt ??
    null,
},
      

    // ================================================
    // Risk
    // ================================================

    riskScore:
      Number(
        user.riskScore ?? 0,
      ),

    // ================================================
    // Address
    // ================================================

    address: {
      city:
        user.address?.city ??
        "",

      district:
        user.address?.district ??
        "",

      state:
        user.address?.state ??
        "",
    },

    // ================================================
    // Language
    // ================================================

    language:
      user.language ??
      null,

    // ================================================
    // Dates
    // ================================================

    createdAt:
      user.createdAt ??
      new Date(),

    updatedAt:
      user.updatedAt ??
      new Date(),
  };
}