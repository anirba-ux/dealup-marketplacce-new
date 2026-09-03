// =====================================================
// User Role
// =====================================================

export type UserRole = "user" | "buyer" | "seller" | "admin";

// =====================================================
// Premium Seller Plan
// =====================================================

export type PremiumSellerPlan =
  | "monthly"
  | "quarterly"
  | "yearly";

// =====================================================
// Premium Seller
// =====================================================
//
// Premium Seller is independent from:
//
// - Phone Verified
// - Verified Seller
// - Trusted Seller
//
// Premium Seller represents a paid/promotional
// membership for sellers.
//
// =====================================================

export interface PremiumSeller {
  // =====================================
  // Membership Status
  // =====================================

  active: boolean;

  // =====================================
  // Current Plan
  // =====================================

  plan?: PremiumSellerPlan | null;

  // =====================================
  // Membership Start
  // =====================================

  startedAt?: Date | null;

  // =====================================
  // Membership Expiry
  // =====================================

  expiresAt?: Date | null;

  // =====================================
  // Payment
  //
  // Reserved for future Razorpay integration.
  // =====================================

  paymentId?: string | null;

  orderId?: string | null;

  // =====================================
  // Premium Features
  // =====================================

  featuredAds?: boolean;

  productBoost?: boolean;

  sellerAnalytics?: boolean;

  premiumBadge?: boolean;

  prioritySupport?: boolean;

  // =====================================
  // Last Updated
  // =====================================

  updatedAt?: Date | null;
}

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
// Seller Verification Correction Type
// =====================================================

export type SellerVerificationCorrectionType =
  | "identity"
  | "selfie"
  | "location"
  | "multiple";

// =====================================================
// Seller Verification Correction Request
// =====================================================

export interface SellerVerificationCorrectionRequest {
  // =====================================
  // Whether correction is currently
  // required from the seller
  // =====================================

  required?: boolean;

  // =====================================
  // Verification area requiring correction
  // =====================================

  type?: SellerVerificationCorrectionType;

  // =====================================
  // Admin message / reason
  // =====================================

  message?: string;

  // =====================================
  // Admin request timestamp
  // =====================================

  requestedAt?: Date | null;

  // =====================================
  // Admin information
  // =====================================

  requestedBy?: {
    userId?: string;

    name?: string;

    email?: string | null;
  };

  // =====================================
  // Seller viewed the request
  // =====================================

  sellerViewed?: boolean;

  sellerViewedAt?: Date | null;

  // =====================================
  // Correction resolution
  // =====================================

  resolved?: boolean;

  resolvedAt?: Date | null;
}

// =====================================================
// Seller Verification
// =====================================================

export interface SellerVerification {
  status: SellerVerificationStatus;

  // =====================================
  // Phone Verification
  // =====================================

  phoneVerified: boolean;

  // =====================================
  // Identity Verification
  // =====================================

  identityVerified: boolean;

  // =====================================
  // Identity Document
  //
  // DealUp currently supports Aadhaar
  // identity verification only.
  // =====================================

  identityDocumentType?: "aadhaar" | null;

  // =====================================
  // Identity Submission
  // =====================================

  identitySubmissionId?: string | null;

  identitySubmittedAt?: Date | null;

  identityReviewedAt?: Date | null;

  identityRejectionReason?: string | null;

  // =====================================
  // Location Verification
  // =====================================

  locationVerified: boolean;

  locationVerifiedAt?: Date | null;

  // =====================================
  // Live Selfie Verification
  // =====================================

  selfieVerified: boolean;

  selfieUrl?: string | null;

  selfiePublicId?: string | null;

  selfieVerifiedAt?: Date | null;

  // =====================================
  // Verification Correction
  // =====================================
  //
  // Admin can request the seller to
  // correct identity, selfie, location,
  // or multiple verification items.
  //
  // This does NOT automatically make
  // the seller Verified.
  // =====================================

  correctionRequest?: SellerVerificationCorrectionRequest | null;

  // =====================================
  // Verification Timeline
  // =====================================

  submittedAt?: Date | null;

  verifiedAt?: Date | null;

  rejectionReason?: string | null;

  // =====================================
  // Suspension
  // =====================================

  suspendedAt?: Date | null;

  suspensionReason?: string | null;
}

// =====================================================
// User
// =====================================================

export interface User {
  _id: string;

  name: string;

  email: string;

  image?: string;

  phone?: string;

  // =====================================
  // Account Role
  //
  // "user" and "buyer" are kept for
  // backward compatibility.
  // =====================================

  role?: UserRole;

  // =====================================
  // Provider
  // =====================================

  provider?: string;

  // =====================================
  // Existing field
  //
  // Keep for backward compatibility.
  //
  // This field is NOT used for the
  // new Seller Badge system.
  // =====================================

  isVerified?: boolean;

  // =====================================
  // Existing Phone Verification
  // =====================================

  isPhoneVerified?: boolean;

  // =====================================
  // Seller Verification
  // =====================================

  sellerVerification?: SellerVerification;

  // =====================================
  // Seller Trust
  // =====================================

  trustScore?: number;

  trustLevel?: "low" | "basic" | "trusted" | "highly_trusted";

  // =====================================
  // Seller Trust Badge
  // =====================================

  trustedSeller?: boolean;

  verifiedSeller?: boolean;

  sellerBadge?: "none" | "verified" | "trusted";

  sellerBadgeLabel?: string;

  // =====================================
// Premium Seller
// =====================================
//
// Premium membership is independent from:
//
// Phone Verified
// Verified Seller
// Trusted Seller
//
// =====================================

premiumSeller?: PremiumSeller;

  // =====================================
  // Seller Risk
  // =====================================

  riskScore?: number;

  // =====================================
  // Address
  // =====================================

  address?: {
    city?: string;

    district?: string;

    state?: string;
  };

  // =====================================
  // Language
  // =====================================

  language?: string | null;

  // =====================================
  // Account Dates
  // =====================================

  createdAt: Date;

  updatedAt: Date;
}
