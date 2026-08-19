import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  LockKeyhole,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

import IdentityVerificationActions from "@/components/admin/IdentityVerificationActions";

// =====================================================
// Types
// =====================================================

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

// =====================================================
// Helpers
// =====================================================

function formatDate(
  value: unknown,
): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(
    String(value),
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Not available";
  }

  return date.toLocaleString(
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
// Verification Card
// =====================================================

function VerificationCard({
  title,
  description,
  verified,
  icon,
}: {
  title: string;
  description: string;
  verified: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      <div className="flex items-start justify-between gap-4">

        <div className="flex items-center gap-3">

          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${
                verified
                  ? "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }
            `}
          >
            {icon}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              {title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>

        </div>

        <span
          className={`
            shrink-0
            rounded-full
            px-3
            py-1
            text-[11px]
            font-semibold
            ${
              verified
                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }
          `}
        >
          {verified
            ? "Verified"
            : "Not Verified"}
        </span>

      </div>
    </div>
  );
}

// =====================================================
// Info Row
// =====================================================

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        bg-slate-50
        p-4
        dark:bg-slate-800
      "
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

// =====================================================
// Status Badge
// =====================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "verified") {
    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
        Verified
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
        Pending Review
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
        Rejected
      </span>
    );
  }

  if (status === "suspended") {
    return (
      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
        Suspended
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      Unverified
    </span>
  );
}

// =====================================================
// Admin Verification Page
// =====================================================

export default async function AdminSellerVerificationPage({
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
            Administrator access is required to review seller verification.
          </p>

          <Link
            href="/"
            className="
              mt-6
              inline-flex
              rounded-xl
              bg-[#1565d8]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              hover:bg-blue-700
            "
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
  // Validate ObjectId
  // ===================================================

  const { ObjectId } =
    await import("mongodb");

  if (!ObjectId.isValid(userId)) {
    notFound();
  }

  // ===================================================
  // Database
  // ===================================================

  const client =
    await clientPromise;

  const db =
    client.db("dealup");

  const usersCollection =
    db.collection("users");

  const submissionsCollection =
    db.collection(
      "identityVerificationSubmissions",
    );

  // ===================================================
  // Find Seller
  // ===================================================

  const seller =
    await usersCollection.findOne({
      _id: new ObjectId(userId),
    });

  if (!seller) {
    notFound();
  }

  // ===================================================
  // Seller Verification
  // ===================================================

  const sellerVerification =
    seller.sellerVerification ?? {
      status: "unverified",
      phoneVerified:
        seller.isPhoneVerified ??
        false,
      identityVerified: false,
      locationVerified: false,
    };

  // ===================================================
  // Verification Values
  // ===================================================

  const phoneVerified =
    Boolean(
      sellerVerification.phoneVerified ??
        seller.isPhoneVerified ??
        false,
    );

  const identityVerified =
    Boolean(
      sellerVerification.identityVerified,
    );

  const locationVerified =
    Boolean(
      sellerVerification.locationVerified,
    );

  const verificationStatus =
    String(
      sellerVerification.status ??
        "unverified",
    );

  // ===================================================
  // Verification Progress
  // ===================================================

  const completedChecks = [
    phoneVerified,
    identityVerified,
    locationVerified,
  ].filter(Boolean).length;

  const totalChecks = 3;

  const progress =
    Math.round(
      (completedChecks /
        totalChecks) *
        100,
    );

  // ===================================================
  // Trust / Risk
  // ===================================================

  const trustScore =
    Number(
      seller.trustScore ?? 0,
    );

  const riskScore =
    Number(
      seller.riskScore ?? 0,
    );

  const trustLevel =
    seller.trustLevel ??
    "Not assigned";

  // ===================================================
  // Latest Aadhaar Submission
  // ===================================================

  const submission =
    await submissionsCollection.findOne(
      {
        userId,
        documentType: "aadhaar",
      },
      {
        sort: {
          submittedAt: -1,
        },
      },
    );

  // ===================================================
  // Identity Review Data
  // ===================================================

  const identityReviewStatus =
    String(
      submission?.reviewStatus ??
        "none",
    );

  const identitySubmissionId =
    submission?.submissionId
      ? String(
          submission.submissionId,
        )
      : "";

  // ===================================================
  // Secure Document URL
  //
  // Supports the common fields used by
  // the storage implementation.
  // ===================================================

  const secureDocumentUrl =
  submission?.documentUrl ??
  null;

  // ===================================================
  // Display Status
  // ===================================================

  const statusLabel =
    verificationStatus ===
    "pending"
      ? "Pending Review"
      : verificationStatus ===
          "verified"
        ? "Verified"
        : verificationStatus ===
            "rejected"
          ? "Rejected"
          : verificationStatus ===
              "suspended"
            ? "Suspended"
            : "Not Verified";

  // ===================================================
  // Render
  // ===================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            Back
        ================================================= */}

        <Link
          href="/admin/verification"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-[#1565d8]
            hover:underline
          "
        >
          <ArrowLeft size={16} />

          Back to Seller Verification
        </Link>

        {/* =================================================
            Seller Header
        ================================================= */}

        <section
          className="
            mt-5
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              {seller.image ? (
                <img
                  src={seller.image}
                  alt={
                    seller.name ??
                    "Seller"
                  }
                  className="
                    h-16
                    w-16
                    rounded-full
                    object-cover
                    ring-4
                    ring-slate-100
                    dark:ring-slate-800
                  "
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                  <User size={28} />
                </div>
              )}

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {seller.name ??
                      "Unknown Seller"}
                  </h1>

                  <StatusBadge
                    status={
                      verificationStatus
                    }
                  />

                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {seller.email ??
                    "No email"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Member since{" "}
                  {formatDate(
                    seller.createdAt,
                  )}
                </p>

              </div>

            </div>

            {/* Trust Score */}

            <div className="rounded-2xl bg-slate-50 px-7 py-5 text-center dark:bg-slate-800">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Trust Score
              </p>

              <p className="mt-1 text-3xl font-bold text-[#1565d8]">
                {trustScore}
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            Verification Progress
        ================================================= */}

        <section
          className="
            mt-5
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Verification Progress
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {completedChecks} of{" "}
                {totalChecks} verification
                checks completed.
              </p>

            </div>

            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {progress}%
            </p>

          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

            <div
              className="h-full rounded-full bg-[#1565d8] transition-all"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </section>

        {/* =================================================
            Verification Checks
        ================================================= */}

        <section className="mt-6">

          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            Verification Checks
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            <VerificationCard
              title="Phone Verification"
              description={
                phoneVerified
                  ? "Seller phone number has been verified."
                  : "Seller phone number has not been verified."
              }
              verified={
                phoneVerified
              }
              icon={
                <Phone
                  size={21}
                />
              }
            />

            <VerificationCard
              title="Identity Verification"
              description={
                identityVerified
                  ? "Seller identity has been verified."
                  : "Seller identity has not been verified."
              }
              verified={
                identityVerified
              }
              icon={
                <FileText
                  size={21}
                />
              }
            />

            <VerificationCard
              title="Location Verification"
              description={
                locationVerified
                  ? "Seller location has been verified."
                  : "Seller location has not been verified."
              }
              verified={
                locationVerified
              }
              icon={
                <MapPin
                  size={21}
                />
              }
            />

          </div>

        </section>

        {/* =================================================
            Aadhaar Identity Review
        ================================================= */}

        {submission && (
          <section
            className="
              mt-6
              rounded-3xl
              border
              border-blue-200
              bg-white
              p-6
              shadow-sm
              dark:border-blue-900
              dark:bg-slate-900
            "
          >

            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <FileCheck2
                    size={22}
                  />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Aadhaar Identity Review
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Review the seller&apos;s
                    submitted Aadhaar
                    document.
                  </p>

                </div>

              </div>

              <StatusBadge
                status={
                  identityReviewStatus
                }
              />

            </div>

            {/* Submission Details */}

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <InfoRow
                label="Document Type"
                value="Aadhaar"
              />

              <InfoRow
                label="Storage Status"
                value={
                  String(
                    submission.storageStatus ??
                      "unknown",
                  )
                }
              />

              <InfoRow
                label="Submitted At"
                value={formatDate(
                  submission.submittedAt,
                )}
              />

            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">

              <InfoRow
                label="Review Status"
                value={
                  String(
                    submission.reviewStatus ??
                      "pending",
                  )
                }
              />

              <InfoRow
                label="Reviewed At"
                value={
                  submission.reviewedAt
                    ? formatDate(
                        submission.reviewedAt,
                      )
                    : "Not reviewed"
                }
              />

            </div>

            {/* Document */}

            <div
              className="
                mt-4
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-4
                dark:border-slate-700
                dark:bg-slate-800
              "
            >

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                    <FileText
                      size={20}
                    />
                  </div>

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Identity Document
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {submission.fileName ??
                        "Aadhaar document"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {submission.mimeType ??
                        "Document"}
                    </p>

                  </div>

                </div>

                {/* Secure Document */}

                {secureDocumentUrl ? (
                  <a
                    href={
                      String(
                        secureDocumentUrl,
                      )
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-indigo-600
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-indigo-700
                    "
                  >
                    <LockKeyhole
                      size={16}
                    />

                    View Secure Document
                  </a>
                ) : (
                  <div className="rounded-xl bg-yellow-50 px-4 py-3 text-xs font-semibold text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400">
                    Secure document URL
                    is not available.
                  </div>
                )}

              </div>

            </div>

            {/* Sensitive Document Warning */}

            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/20">

              <div className="flex gap-3">

                <AlertTriangle
                  size={19}
                  className="mt-0.5 shrink-0 text-yellow-600"
                />

                <div>

                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
                    Sensitive Identity
                    Document
                  </p>

                  <p className="mt-1 text-xs leading-5 text-yellow-700 dark:text-yellow-500">
                    This Aadhaar document
                    contains sensitive
                    identity information.
                    Access should be
                    restricted to authorized
                    administrators only.
                  </p>

                </div>

              </div>

            </div>

            {/* Identity Actions */}

            {identitySubmissionId && (
              <div className="mt-5">

                <IdentityVerificationActions
                  submissionId={
                    identitySubmissionId
                  }
                  status={
                    identityReviewStatus
                  }
                />

              </div>
            )}

          </section>
        )}

        {/* =================================================
            No Aadhaar Submission
        ================================================= */}

        {!submission && (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">

            <FileText
              size={36}
              className="mx-auto text-slate-400"
            />

            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              No Aadhaar Submission
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This seller has not submitted
              an Aadhaar identity
              verification yet.
            </p>

          </section>
        )}

        {/* =================================================
            Seller Information
        ================================================= */}

        <section
          className="
            mt-6
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Seller Information
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <InfoRow
              label="Full Name"
              value={
                seller.name ??
                "Not available"
              }
            />

            <InfoRow
              label="Email"
              value={
                seller.email ??
                "Not available"
              }
            />

            <InfoRow
              label="Phone"
              value={
                seller.phone ??
                "Not available"
              }
            />

            <InfoRow
              label="Seller ID"
              value={userId}
            />

            <InfoRow
              label="City"
              value={
                seller.address?.city ??
                "Not available"
              }
            />

            <InfoRow
              label="District"
              value={
                seller.address?.district ??
                "Not available"
              }
            />

            <InfoRow
              label="State"
              value={
                seller.address?.state ??
                "Not available"
              }
            />

            <InfoRow
              label="Trust Level"
              value={String(
                trustLevel,
              )}
            />

          </div>

        </section>

        {/* =================================================
            Trust / Risk
        ================================================= */}

        <section className="mt-6 grid gap-5 md:grid-cols-2">

          {/* Trust */}

          <div className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm dark:border-green-900 dark:bg-slate-900">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                <ShieldCheck
                  size={22}
                />
              </div>

              <div>

                <h2 className="font-bold text-slate-900 dark:text-white">
                  Trust Score
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current seller trust
                  score.
                </p>

              </div>

            </div>

            <p className="mt-5 text-4xl font-bold text-green-600">
              {trustScore}
            </p>

          </div>

          {/* Risk */}

          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-slate-900">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                <AlertTriangle
                  size={22}
                />
              </div>

              <div>

                <h2 className="font-bold text-slate-900 dark:text-white">
                  Risk Score
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current seller risk
                  score.
                </p>

              </div>

            </div>

            <p className="mt-5 text-4xl font-bold text-red-600">
              {riskScore}
            </p>

          </div>

        </section>

        {/* =================================================
            Verification Timeline
        ================================================= */}

        <section
          className="
            mt-6
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Verification Timeline
          </h2>

          <div className="mt-6 space-y-5">

            {/* Seller Joined */}

            <div className="flex gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                <User
                  size={17}
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Seller Joined DealUp
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(
                    seller.createdAt,
                  )}
                </p>

              </div>

            </div>

            {/* Verification Submitted */}

            <div className="flex gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                <Clock3
                  size={17}
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Verification Submitted
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {sellerVerification.submittedAt
                    ? formatDate(
                        sellerVerification.submittedAt,
                      )
                    : "Not submitted"}
                </p>

              </div>

            </div>

            {/* Verification Completed */}

            <div className="flex gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                <CheckCircle2
                  size={17}
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Verification Completed
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {sellerVerification.verifiedAt
                    ? formatDate(
                        sellerVerification.verifiedAt,
                      )
                    : "Not verified"}
                </p>

              </div>

            </div>

            {/* Aadhaar Submitted */}

            <div className="flex gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                <FileText
                  size={17}
                />
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Aadhaar Submitted
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {submission?.submittedAt
                    ? formatDate(
                        submission.submittedAt,
                      )
                    : "Not submitted"}
                </p>

              </div>

            </div>

            {/* Aadhaar Reviewed */}

            <div className="flex gap-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400">
                {identityReviewStatus ===
                "approved" ? (
                  <CheckCircle2
                    size={17}
                  />
                ) : identityReviewStatus ===
                  "rejected" ? (
                  <XCircle
                    size={17}
                  />
                ) : (
                  <LockKeyhole
                    size={17}
                  />
                )}
              </div>

              <div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Aadhaar Reviewed
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {submission?.reviewedAt
                    ? formatDate(
                        submission.reviewedAt,
                      )
                    : "Not reviewed"}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            Admin Actions
        ================================================= */}

        <section
          className="
            mt-6
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Admin Actions
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            These actions control the seller&apos;s
            overall verification status.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">

            {/* Approve Seller */}

            <form
              action={`/api/admin/verification/${userId}`}
              method="POST"
            >
              <button
                type="button"
                className="
                  rounded-xl
                  bg-green-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-green-700
                "
              >
                ✓ Approve Seller
              </button>
            </form>

            {/* Reject Verification */}

            <button
              type="button"
              className="
                rounded-xl
                bg-red-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                hover:bg-red-700
              "
            >
              ✕ Reject Verification
            </button>

            {/* Suspend */}

            <button
              type="button"
              className="
                rounded-xl
                bg-slate-700
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                hover:bg-slate-800
              "
            >
              ⛔ Suspend Seller
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}