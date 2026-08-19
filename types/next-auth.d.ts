import "next-auth";
import "next-auth/jwt";

// =====================================
// User Role
// =====================================

type UserRole =
  | "user"
  | "buyer"
  | "seller"
  | "admin";

// =====================================
// Seller Verification Types
// =====================================

type SellerVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

interface SellerVerification {
  status: SellerVerificationStatus;

  phoneVerified: boolean;

  identityVerified: boolean;

  locationVerified: boolean;

  submittedAt?: string | null;

  verifiedAt?: string | null;

  rejectionReason?: string | null;

  suspendedAt?: string | null;

  suspensionReason?: string | null;
}

// =====================================
// NextAuth
// =====================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string;

      role: UserRole;

      provider: string;

      isVerified: boolean;

      isPhoneVerified: boolean;

      sellerVerification: SellerVerification;

      trustScore: number;

      riskScore: number;

      name?: string | null;

      email?: string | null;

      image?: string | null;

      phone?: string | null;
    };
  }

  interface User {
    id: string;

    role: UserRole;

    provider: string;

    isVerified: boolean;

    isPhoneVerified: boolean;

    sellerVerification: SellerVerification;

    trustScore: number;

    riskScore: number;
  }
}

// =====================================
// JWT
// =====================================

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;

    role?: UserRole;

    provider?: string;

    isVerified?: boolean;

    isPhoneVerified?: boolean;

    sellerVerification?: SellerVerification;

    trustScore?: number;

    riskScore?: number;
  }
}