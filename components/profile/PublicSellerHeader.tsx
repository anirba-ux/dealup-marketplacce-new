import Image from "next/image";

import type {
  SellerVerificationStatus,
} from "@/lib/types/user";

import type {
  SellerTrustLevel,
  SellerBadgeResult,
} from "@/lib/risk/sellerTrust";

// =====================================================
// Props
// =====================================================

interface PublicSellerHeaderProps {
  seller: {
    _id: string;

    name: string;

    image?: string;

    createdAt: string;

    address?: {
      city?: string;

      district?: string;

      state?: string;
    };

    // =========================================
    // Final Seller Verification Status
    // =========================================

    verificationStatus?:
      SellerVerificationStatus;

    // =========================================
    // Individual Verification
    // =========================================

    phoneVerified?: boolean;

    identityVerified?: boolean;

    locationVerified?: boolean;

    // =========================================
    // Trust Score
    // =========================================

    trustScore?: number;

    trustLevel?: SellerTrustLevel;

    // =========================================
    // Seller Badge
    // =========================================

    badge?: SellerBadgeResult;
  };

  totalProducts: number;
}

// =====================================================
// Component
// =====================================================

export default function PublicSellerHeader({
  seller,

  totalProducts,
}: PublicSellerHeaderProps) {
  // ===================================================
  // Badge
  // ===================================================

  const badge =
    seller.badge;

  // ===================================================
  // Trust Score
  // ===================================================

  const trustScore =
    Number.isFinite(
      seller.trustScore,
    )
      ? seller.trustScore ?? 0
      : 0;

  // ===================================================
  // Trust Level Label
  // ===================================================

  const trustLevelLabel =
    seller.trustLevel ===
    "highly_trusted"
      ? "Highly Trusted"
      : seller.trustLevel ===
          "trusted"
        ? "Trusted"
        : seller.trustLevel ===
            "basic"
          ? "Basic"
          : "Low";

  // ===================================================
  // Verification Status
  // ===================================================

  const verificationStatus =
    seller.verificationStatus ??
    "unverified";

  // ===================================================
  // Verification Status Label
  // ===================================================

  const verificationStatusLabel =
    verificationStatus ===
    "verified"
      ? "Seller Verified"
      : verificationStatus ===
          "pending"
        ? "Verification Pending"
        : verificationStatus ===
            "action_required"
          ? "Verification Correction Required"
          : verificationStatus ===
              "rejected"
            ? "Verification Rejected"
            : verificationStatus ===
                "suspended"
              ? "Verification Suspended"
              : "Not Verified";

  // ===================================================
  // Verification Status Style
  // ===================================================

  const verificationStatusClass =
    verificationStatus ===
    "verified"
      ? "border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
      : verificationStatus ===
          "pending"
        ? "border border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
        : verificationStatus ===
            "action_required"
          ? "border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
          : verificationStatus ===
              "rejected"
            ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
            : verificationStatus ===
                "suspended"
              ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400";

  // ===================================================
  // Verification Status Icon
  // ===================================================

  const verificationStatusIcon =
    verificationStatus ===
    "verified"
      ? "✓"
      : verificationStatus ===
          "pending"
        ? "◷"
        : verificationStatus ===
            "action_required"
          ? "⚠"
          : verificationStatus ===
              "rejected"
            ? "✕"
            : verificationStatus ===
                "suspended"
              ? "⚠"
              : "○";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col items-center text-center">

        {/* =================================================
            PROFILE IMAGE
        ================================================= */}

        <Image
          src={
            seller.image ||
            "/avatar/male avatar.avif"
          }
          alt={seller.name}
          width={120}
          height={120}
          className="h-30 w-30 rounded-full border-4 border-white object-cover shadow-lg"
        />

        {/* =================================================
            SELLER NAME
        ================================================= */}

        <h1 className="mt-5 text-3xl font-bold text-slate-900 dark:text-white">
          {seller.name}
        </h1>

        {/* =================================================
            SELLER BADGE
        ================================================= */}

        {badge?.eligible &&
          badge.badge ===
            "verified" && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
              🛡️ Verified Seller
            </span>
          )}

        {badge?.eligible &&
          badge.badge ===
            "trusted" && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-100 px-4 py-1.5 text-sm font-semibold text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              ⭐ Trusted Seller
            </span>
          )}

        {/* =================================================
            VERIFICATION STATUS
        ================================================= */}

        <span
          className={`mt-3 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${verificationStatusClass}`}
        >
          {verificationStatusIcon}{" "}
          {verificationStatusLabel}
        </span>

        {/* =================================================
            PHONE VERIFIED
        ================================================= */}

        {seller.phoneVerified && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            📱 Phone Verified
          </span>
        )}

        {/* =================================================
            LOCATION
        ================================================= */}

        <p className="mt-4 text-slate-500 dark:text-slate-400">
          📍{" "}
          {seller.address?.city ||
            "Unknown City"}
          ,{" "}
          {seller.address?.district ||
            ""}
          ,{" "}
          {seller.address?.state ||
            ""}
        </p>

        {/* =================================================
            MEMBER SINCE
        ================================================= */}

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Member Since{" "}
          {new Date(
            seller.createdAt,
          ).toLocaleDateString(
            "en-IN",
            {
              month: "long",
              year: "numeric",
            },
          )}
        </p>

        {/* =================================================
            TRUST SCORE
        ================================================= */}

        <div className="mt-6 w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">

          <div className="flex items-center justify-between">

            <div className="text-left">

              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Seller Trust Score
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {trustScore}

                <span className="text-sm font-medium text-slate-400">
                  {" "}
                  / 100
                </span>
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Trust Level
              </p>

              <p className="mt-1 font-bold text-[#1565d8]">
                {trustLevelLabel}
              </p>

            </div>

          </div>

          {/* =================================================
              SCORE BAR
          ================================================= */}

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">

            <div
              className="h-full rounded-full bg-[#1565d8] transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    trustScore,
                  ),
                )}%`,
              }}
            />

          </div>

        </div>

        {/* =================================================
            VERIFICATION DETAILS
        ================================================= */}

        <div className="mt-5 flex flex-wrap justify-center gap-2">

          {/* Phone */}

          {seller.phoneVerified && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              ✓ Phone
            </span>
          )}

          {/* Aadhaar / Identity */}

          {seller.identityVerified && (
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              ✓ Aadhaar
            </span>
          )}

          {/* Location */}

          {seller.locationVerified && (
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              ✓ Location
            </span>
          )}

        </div>

        {/* =================================================
            ACTIVE LISTINGS
        ================================================= */}

        <div className="mt-6 flex items-center gap-8">

          <div>

            <h2 className="text-2xl font-bold text-primary">
              {totalProducts}
            </h2>

            <p className="text-sm text-slate-500">
              Active Listings
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}