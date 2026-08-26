import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { auth } from "@/auth";

import { findUserById } from "@/lib/repositories/user.repository";

import { getSellerBadge } from "@/lib/risk/sellerTrust";

// =====================================================
// Page Props
// =====================================================

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

// =====================================================
// Cross Seller Match
// =====================================================

interface CrossSellerMatchedProduct {
  productId?: string;
  sellerId?: string;
  title?: string;
  image?: string;
}

interface CrossSellerDuplicateMatch {
  imageHash?: string;

  matchedProducts?: CrossSellerMatchedProduct[];
}

// =====================================================
// Page
// =====================================================

export default async function AdminUserDetailsPage({
  params,
}: PageProps) {
  // ===================================================
  // Authentication
  // ===================================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // ===================================================
  // Admin Authorization
  // ===================================================

  if (session.user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-900 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-950">
            🚫
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Access Denied
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Administrator access is required to view user details.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  // ===================================================
  // Params
  // ===================================================

  const { userId } = await params;

  // ===================================================
  // Find User
  // ===================================================

  const user = await findUserById(userId);

  if (!user) {
    notFound();
  }

  // ===================================================
  // Seller Verification
  // ===================================================

  const sellerVerification =
    user.sellerVerification;

  const verificationStatus =
    sellerVerification?.status ??
    "unverified";

  const phoneVerified =
    sellerVerification?.phoneVerified ??
    user.isPhoneVerified ??
    false;

  const identityVerified =
    sellerVerification?.identityVerified ??
    false;

  const locationVerified =
    sellerVerification?.locationVerified ??
    false;

  // ===================================================
  // Trust
  // ===================================================

  const trustScore =
    Number(user.trustScore ?? 0);

  const trustLevel =
    user.trustLevel ??
    (
      trustScore >= 85
        ? "highly_trusted"
        : trustScore >= 70
          ? "trusted"
          : trustScore >= 40
            ? "basic"
            : "low"
    );

  // ===================================================
  // Risk
  // ===================================================

  const riskScore =
    Number(user.riskScore ?? 0);

  // ===================================================
  // Serious History
  //
  // Detailed moderation history will be
  // connected later.
  // ===================================================

  const hasSeriousBadHistory =
    false;

  // ===================================================
  // Seller Badge
  // ===================================================

  const sellerBadge =
    getSellerBadge({
      verificationStatus,

      phoneVerified,

      identityVerified,

      locationVerified,

      trustScore,

      trustLevel,

      hasSeriousBadHistory,
    });

  // ===================================================
  // Risk Level
  // ===================================================

  const riskLevel =
    riskScore >= 70
      ? "High"
      : riskScore >= 40
        ? "Medium"
        : "Low";

  // ===================================================
  // Trust Signals
  //
  // Trust signals are currently stored on the
  // user document by the trust engine.
  // ===================================================

  const trustSignals =
    (user as any).trustSignals ??
    {};

  // ===================================================
  // Cross Seller Duplicate Images
  // ===================================================

  const crossSellerDuplicateImages =
    Number(
      trustSignals.crossSellerDuplicateImages ??
        0,
    );

  const crossSellerDuplicateMatches =
    Array.isArray(
      trustSignals.crossSellerDuplicateMatches,
    )
      ? (trustSignals.crossSellerDuplicateMatches as CrossSellerDuplicateMatch[])
      : [];

  // ===================================================
  // Page
  // ===================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1565d8] hover:underline"
            >
              <ArrowLeft size={16} />

              Back to Users
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              User Details
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Complete account, verification and trust information.
            </p>
          </div>

          {/* User ID */}

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-400">
              User ID
            </p>

            <p className="mt-1 max-w-[260px] truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
              {user._id}
            </p>
          </div>
        </div>

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* Avatar */}

              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md dark:border-slate-800 dark:bg-slate-800">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound
                    size={40}
                    className="text-slate-400"
                  />
                )}
              </div>

              {/* Name */}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {user.name ||
                      "Unknown User"}
                  </h2>

                  {sellerBadge.eligible && (
                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        ${
                          sellerBadge.badge ===
                          "trusted"
                            ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                            : "border-green-200 bg-green-50 text-green-700"
                        }
                      `}
                    >
                      {sellerBadge.badge ===
                      "trusted" ? (
                        <ShieldCheck
                          size={14}
                        />
                      ) : (
                        <BadgeCheck
                          size={14}
                        />
                      )}

                      {sellerBadge.label}
                    </span>
                  )}

                </div>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  <StatusBadge
                    label={
                      verificationStatus
                    }
                    type={
                      verificationStatus
                    }
                  />

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Role:{" "}
                    {user._id ===
                    String(
                      session.user.id,
                    )
                      ? "Admin"
                      : "User"}
                  </span>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =================================================
            INFORMATION GRID
        ================================================= */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <InfoSection
            title="Basic Information"
            icon={
              <UserRound size={20} />
            }
          >
            <InfoRow
              label="Name"
              value={
                user.name ||
                "Not available"
              }
            />

            <InfoRow
              label="Email"
              value={
                user.email ||
                "Not available"
              }
              icon={
                <Mail size={16} />
              }
            />

            <InfoRow
              label="Phone"
              value={
                user.phone ||
                "Not available"
              }
              icon={
                <Phone size={16} />
              }
            />
          </InfoSection>

          {/* =================================================
              ADDRESS
          ================================================= */}

          <InfoSection
            title="Address"
            icon={
              <MapPin size={20} />
            }
          >
            <InfoRow
              label="City"
              value={
                user.address?.city ||
                "Not available"
              }
            />

            <InfoRow
              label="District"
              value={
                user.address?.district ||
                "Not available"
              }
            />

            <InfoRow
              label="State"
              value={
                user.address?.state ||
                "Not available"
              }
            />
          </InfoSection>

          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

          <InfoSection
            title="Account Information"
            icon={
              <CalendarDays size={20} />
            }
          >
            <InfoRow
              label="Created"
              value={formatDate(
                user.createdAt,
              )}
            />

            <InfoRow
              label="Last Updated"
              value={formatDate(
                user.updatedAt,
              )}
            />

            <InfoRow
              label="Account Verified"
              value={
                user.isVerified
                  ? "Yes"
                  : "No"
              }
            />
          </InfoSection>

          {/* =================================================
              TRUST & RISK
          ================================================= */}

          <InfoSection
            title="Trust & Risk"
            icon={
              <ShieldCheck size={20} />
            }
          >
            <InfoRow
              label="Trust Score"
              value={`${trustScore} / 100`}
            />

            <InfoRow
              label="Trust Level"
              value={formatTrustLevel(
                trustLevel,
              )}
            />

            <InfoRow
              label="Risk Score"
              value={`${riskScore} / 100`}
            />

            <InfoRow
              label="Risk Level"
              value={riskLevel}
            />

            <InfoRow
              label="Cross-Seller Image Matches"
              value={String(
                crossSellerDuplicateImages,
              )}
            />
          </InfoSection>

        </div>

        {/* =================================================
            CROSS-SELLER IMAGE DETECTION
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          {/* Header */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Cross-Seller Image Detection
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Image matches detected across products belonging to different sellers.
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                crossSellerDuplicateImages >
                0
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                  : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
              }`}
            >
              {crossSellerDuplicateImages >
              0
                ? `${crossSellerDuplicateImages} Match${
                    crossSellerDuplicateImages >
                    1
                      ? "es"
                      : ""
                  }`
                : "No Matches"}
            </span>

          </div>

          {/* Summary */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Duplicate Image Count
              </p>

              <p
                className={`mt-2 text-3xl font-bold ${
                  crossSellerDuplicateImages >
                  0
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {crossSellerDuplicateImages}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Matches found across other sellers.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                crossSellerDuplicateImages >
                0
                  ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20"
                  : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Detection Status
              </p>

              <p
                className={`mt-2 text-lg font-bold ${
                  crossSellerDuplicateImages >
                  0
                    ? "text-orange-700 dark:text-orange-300"
                    : "text-green-700 dark:text-green-300"
                }`}
              >
                {crossSellerDuplicateImages >
                0
                  ? "Review Recommended"
                  : "No Suspicious Match"}
              </p>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {crossSellerDuplicateImages >
                0
                  ? "Admin should review the matching evidence."
                  : "No cross-seller image match was detected."
                }
              </p>
            </div>

          </div>

          {/* =================================================
              NO MATCHES
          ================================================= */}

          {crossSellerDuplicateMatches.length ===
            0 && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/20">

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  ✓
                </div>

                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    No cross-seller image matches detected
                  </p>

                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    The trust engine did not find a matching image hash belonging to another seller.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* =================================================
              MATCHING EVIDENCE
          ================================================= */}

          {crossSellerDuplicateMatches.length >
            0 && (
            <div className="mt-6">

              <div className="mb-4 flex items-center gap-2">

                <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />

                <h3 className="font-bold text-slate-900 dark:text-white">
                  Matching Evidence
                </h3>

              </div>

              <div className="space-y-4">

                {crossSellerDuplicateMatches.map(
                  (
                    match,
                    index,
                  ) => (
                    <div
                      key={`${match.imageHash ?? "unknown"}-${index}`}
                      className="rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900 dark:bg-orange-950/20"
                    >

                      {/* Image Hash */}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                          Image Hash
                        </p>

                        <p className="mt-2 break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          {match.imageHash ||
                            "Hash unavailable"}
                        </p>
                      </div>

                      {/* Matched Products */}

                      {Array.isArray(
                        match.matchedProducts,
                      ) &&
                        match.matchedProducts.length >
                          0 && (
                          <div className="mt-5 space-y-3">

                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              Matched Products
                            </p>

                            {match.matchedProducts.map(
                              (
                                matched,
                                matchedIndex,
                              ) => (
                                <div
                                  key={`${matched.productId ?? "product"}-${matchedIndex}`}
                                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                                >

                                  <div className="grid gap-4 sm:grid-cols-2">

                                    <div>
                                      <p className="text-xs text-slate-400">
                                        Seller ID
                                      </p>

                                      <p className="mt-1 break-all text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {matched.sellerId ||
                                          "Unavailable"}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-xs text-slate-400">
                                        Product ID
                                      </p>

                                      <p className="mt-1 break-all text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {matched.productId ||
                                          "Unavailable"}
                                      </p>
                                    </div>

                                  </div>

                                  {/* Product Title */}

                                  {matched.title && (
                                    <div className="mt-4">
                                      <p className="text-xs text-slate-400">
                                        Product
                                      </p>

                                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                        {matched.title}
                                      </p>
                                    </div>
                                  )}

                                  {/* Actions */}

                                  <div className="mt-4 flex flex-wrap gap-2">

                                    {matched.sellerId && (
                                      <Link
                                        href={`/admin/users/${matched.sellerId}`}
                                        className="inline-flex items-center rounded-lg bg-[#1565d8] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0f52ba]"
                                      >
                                        View Seller
                                      </Link>
                                    )}

                                    {matched.productId && (
                                      <Link
                                        href={`/products/${matched.productId}`}
                                        target="_blank"
                                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                      >
                                        View Product
                                      </Link>
                                    )}

                                  </div>

                                </div>
                              ),
                            )}

                          </div>
                        )}

                    </div>
                  ),
                )}

              </div>

            </div>
          )}

        </section>

        {/* =================================================
            SELLER VERIFICATION
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Seller Verification
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Current seller verification status.
              </p>
            </div>

            <StatusBadge
              label={
                verificationStatus
              }
              type={
                verificationStatus
              }
            />

          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <VerificationCard
              title="Phone Verification"
              verified={
                phoneVerified
              }
              icon="📞"
            />

            <VerificationCard
              title="Identity Verification"
              verified={
                identityVerified
              }
              icon="🪪"
            />

            <VerificationCard
              title="Location Verification"
              verified={
                locationVerified
              }
              icon="📍"
            />

          </div>

          {/* Timeline */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <InfoRow
              label="Submitted At"
              value={
                sellerVerification?.submittedAt
                  ? formatDate(
                      sellerVerification.submittedAt,
                    )
                  : "Not submitted"
              }
            />

            <InfoRow
              label="Verified At"
              value={
                sellerVerification?.verifiedAt
                  ? formatDate(
                      sellerVerification.verifiedAt,
                    )
                  : "Not verified"
              }
            />

            {sellerVerification?.rejectionReason && (
              <InfoRow
                label="Rejection Reason"
                value={
                  sellerVerification.rejectionReason
                }
              />
            )}

            {sellerVerification?.suspensionReason && (
              <InfoRow
                label="Suspension Reason"
                value={
                  sellerVerification.suspensionReason
                }
              />
            )}

          </div>

        </section>

        {/* =================================================
            SELLER BADGE
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Seller Badge
          </h2>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

            {sellerBadge.eligible ? (
              <div className="flex items-center gap-4">

                <div
                  className={`
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    ${
                      sellerBadge.badge ===
                      "trusted"
                        ? "bg-yellow-100"
                        : "bg-green-100"
                    }
                  `}
                >
                  {sellerBadge.badge ===
                  "trusted" ? (
                    <ShieldCheck
                      size={28}
                      className="text-yellow-700"
                    />
                  ) : (
                    <BadgeCheck
                      size={28}
                      className="text-green-700"
                    />
                  )}
                </div>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {sellerBadge.label}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    This seller currently meets the badge requirements.
                  </p>
                </div>

              </div>
            ) : (
              <div>

                <p className="font-bold text-slate-900 dark:text-white">
                  No Seller Badge
                </p>

                {sellerBadge.reasons.length >
                  0 && (
                  <ul className="mt-3 space-y-2">

                    {sellerBadge.reasons.map(
                      (
                        reason,
                        index,
                      ) => (
                        <li
                          key={index}
                          className="text-sm text-slate-500 dark:text-slate-400"
                        >
                          • {reason}
                        </li>
                      ),
                    )}

                  </ul>
                )}

              </div>
            )}

          </div>

        </section>

        {/* =================================================
            VERIFICATION REVIEW LINK
        ================================================= */}

        {(verificationStatus ===
          "pending" ||
          verificationStatus ===
            "verified" ||
          verificationStatus ===
            "rejected" ||
          verificationStatus ===
            "suspended") && (
          <div className="mt-8">

            <Link
              href={`/admin/verification/${user._id}`}
              className="
                inline-flex
                items-center
                rounded-xl
                bg-[#1565d8]
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#0f52ba]
              "
            >
              Open Seller Verification Review →
            </Link>

          </div>
        )}

      </div>
    </main>
  );
}

// =====================================================
// Info Section
// =====================================================

function InfoSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-blue-50 p-2.5 text-[#1565d8] dark:bg-blue-950/40">
          {icon}
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>

      </div>

      <div className="mt-5 space-y-4">
        {children}
      </div>

    </section>
  );
}

// =====================================================
// Info Row
// =====================================================

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800">

      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {icon}

        <span>
          {label}
        </span>
      </div>

      <span className="max-w-[60%] text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </span>

    </div>
  );
}

// =====================================================
// Verification Card
// =====================================================

function VerificationCard({
  title,
  verified,
  icon,
}: {
  title: string;
  verified: boolean;
  icon: string;
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        ${
          verified
            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
            : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
        }
      `}
    >
      <div className="text-2xl">
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </p>

      <p
        className={`mt-2 text-xs font-bold ${
          verified
            ? "text-green-700 dark:text-green-300"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {verified
          ? "✓ Verified"
          : "Not Verified"}
      </p>
    </div>
  );
}

// =====================================================
// Status Badge
// =====================================================

function StatusBadge({
  label,
  type,
}: {
  label: string;
  type: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    verified:
      "bg-green-100 text-green-700",

    pending:
      "bg-yellow-100 text-yellow-700",

    rejected:
      "bg-red-100 text-red-700",

    suspended:
      "bg-slate-200 text-slate-700",

    unverified:
      "bg-slate-100 text-slate-500",

    action_required:
      "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
        styles[type] ??
        styles.unverified
      }`}
    >
      {label.replace(
        /_/g,
        " ",
      )}
    </span>
  );
}

// =====================================================
// Format Date
// =====================================================

function formatDate(
  value: Date | string,
) {
  return new Date(
    value,
  ).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

// =====================================================
// Format Trust Level
// =====================================================

function formatTrustLevel(
  value: string,
) {
  return value
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase(),
    );
}