import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

import IdentityVerificationActions from "@/components/admin/IdentityVerificationActions";
import SellerVerificationActions from "@/components/admin/SellerVerificationActions";

// =====================================================
// Types
// =====================================================

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

// =====================================================
// Page
// =====================================================

export default async function AdminSellerVerificationPage({
  params,
}: PageProps) {
  // ===================================================
  // Params
  // ===================================================

  const { userId } = await params;

  // ===================================================
  // Admin Authentication
  // ===================================================

  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 shadow-sm dark:border-red-900 dark:bg-slate-900">
          <h1 className="text-xl font-bold text-red-600">
            Unauthorized
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please log in as an administrator.
          </p>
        </div>
      </main>
    );
  }

  // ===================================================
  // Database
  // ===================================================

  const client = await clientPromise;

  const db = client.db("dealup");

  // ===================================================
  // Find User
  // ===================================================

  let user;

  try {
    const { ObjectId } = await import("mongodb");

    if (!ObjectId.isValid(userId)) {
      return (
        <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 dark:border-red-900 dark:bg-slate-900">
            <h1 className="text-xl font-bold text-red-600">
              Invalid Seller ID
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              The requested seller ID is not valid.
            </p>
          </div>
        </main>
      );
    }

    user = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });
  } catch (error) {
    console.error(
      "ADMIN SELLER VERIFICATION USER LOOKUP ERROR:",
      error,
    );

    return (
      <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 dark:border-red-900 dark:bg-slate-900">
          <h1 className="text-xl font-bold text-red-600">
            Unable to load seller
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please try again.
          </p>
        </div>
      </main>
    );
  }

  // ===================================================
  // User Not Found
  // ===================================================

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Seller Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No user was found for this verification request.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Admin
          </Link>
        </div>
      </main>
    );
  }

  // ===================================================
  // Seller Verification
  // ===================================================

  const sellerVerification =
    user.sellerVerification ?? {};

  const verificationStatus =
    sellerVerification.status ??
    "unverified";

  // ===================================================
  // Verification Fields
  // ===================================================

  const phoneVerified =
    sellerVerification.phoneVerified ===
    true ||
    user.isPhoneVerified === true;

  const identityVerified =
    sellerVerification.identityVerified ===
    true;

  const selfieVerified =
    sellerVerification.selfieVerified ===
    true;

  const locationVerified =
    sellerVerification.locationVerified ===
    true;

  // ===================================================
  // Identity Submission
  // ===================================================

  const identitySubmissionId =
    sellerVerification.identitySubmissionId ??
    null;

  // ===================================================
  // Identity Review Status
  // ===================================================

  const identityReviewStatus =
    sellerVerification.identityVerified
      ? "approved"
      : sellerVerification.identityRejectionReason
        ? "rejected"
        : identitySubmissionId
          ? "pending"
          : "not_submitted";

  // ===================================================
  // Basic User Information
  // ===================================================

  const name =
    user.name ??
    "Unknown User";

  const email =
    user.email ??
    "";

  const phone =
    user.phone ??
    "";

  const image =
    user.image ??
    "";

  // ===================================================
  // Verification Progress
  // ===================================================

  const completedChecks = [
    phoneVerified,
    identityVerified,
    selfieVerified,
    locationVerified,
  ].filter(Boolean).length;

  const totalChecks = 4;

  const fullyVerified =
    completedChecks === totalChecks;

  // ===================================================
  // Page
  // ===================================================

  return (
    <main className="min-h-screen bg-slate-50 py-8 dark:bg-slate-950">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* =================================================
            Header
        ================================================= */}

        <div className="mb-8">

          <Link
            href="/admin"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-slate-500
              transition
              hover:text-[#1565d8]
              dark:text-slate-400
            "
          >
            <ArrowLeft size={17} />

            Back to Admin Dashboard
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-blue-100 p-3 text-[#1565d8] dark:bg-blue-950/40">
                  <ShieldCheck size={25} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Seller Verification
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Review and manage this seller's verification.
                  </p>
                </div>

              </div>
            </div>

            {/* Status */}

            <div
              className={`
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                px-4
                py-2
                text-sm
                font-bold
                ${
                  verificationStatus ===
                  "verified"
                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : verificationStatus ===
                        "rejected"
                      ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                      : verificationStatus ===
                          "suspended"
                        ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                }
              `}
            >
              {verificationStatus ===
              "verified" ? (
                <CheckCircle2 size={17} />
              ) : verificationStatus ===
                "rejected" ? (
                <XCircle size={17} />
              ) : (
                <Clock3 size={17} />
              )}

              {verificationStatus
                .charAt(0)
                .toUpperCase() +
                verificationStatus.slice(
                  1,
                )}
            </div>

          </div>
        </div>

        {/* =================================================
            Seller Profile
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="h-20 w-20 rounded-2xl border border-slate-200 object-cover dark:border-slate-700"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <User size={32} />
                </div>
              )}

              <div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {name}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {email}
                </p>

                {phone && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {phone}
                  </p>
                )}

              </div>

            </div>

            <div className="rounded-2xl bg-slate-50 px-5 py-4 dark:bg-slate-800">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Verification Progress
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {completedChecks}/{totalChecks}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {fullyVerified
                  ? "All checks completed"
                  : "Checks completed"}
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            Verification Checklist
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Verification Checklist
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                All required checks must be completed before seller approval.
              </p>
            </div>

            <span
              className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-bold
                ${
                  fullyVerified
                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                }
              `}
            >
              {completedChecks}/4
            </span>

          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <VerificationCheck
              icon={<Phone size={18} />}
              label="Phone"
              verified={phoneVerified}
            />

            <VerificationCheck
              icon={<FileText size={18} />}
              label="Identity"
              verified={identityVerified}
            />

            <VerificationCheck
              icon={<User size={18} />}
              label="Live Selfie"
              verified={selfieVerified}
            />

            <VerificationCheck
              icon={<MapPin size={18} />}
              label="Location"
              verified={locationVerified}
            />

          </div>

        </section>

        {/* =================================================
            Identity Verification
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Identity Verification
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Aadhaar identity verification and admin review.
              </p>
            </div>

          </div>

          {/* Identity Status */}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <InfoItem
                label="Document Type"
                value={
                  sellerVerification
                    .identityDocumentType ??
                  "Not submitted"
                }
              />

              <InfoItem
                label="Submission ID"
                value={
                  identitySubmissionId ??
                  "Not submitted"
                }
              />

              <InfoItem
                label="Review Status"
                value={
                  identityReviewStatus
                }
              />

              <InfoItem
                label="Identity Verified"
                value={
                  identityVerified
                    ? "Yes"
                    : "No"
                }
              />

            </div>

          </div>

          {/* Identity Admin Actions */}

          {identitySubmissionId && (
            <div className="mt-6">

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

          {!identitySubmissionId && (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">

              <FileText
                size={30}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                No identity document submitted.
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                The seller has not submitted an Aadhaar document yet.
              </p>

            </div>
          )}

        </section>

        {/* =================================================
            Seller Verification Actions
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Admin Seller Approval
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              The seller can only receive the Verified Seller status after all required verification checks are completed and the administrator approves the seller.
            </p>

          </div>

          <SellerVerificationActions
            userId={userId}
            currentStatus={
              verificationStatus as
                | "unverified"
                | "pending"
                | "verified"
                | "rejected"
                | "suspended"
            }
            phoneVerified={
              phoneVerified
            }
            identityVerified={
              identityVerified
            }
            selfieVerified={
              selfieVerified
            }
            locationVerified={
              locationVerified
            }
          />

        </section>

        {/* =================================================
            Verification Timeline
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Verification Timeline
          </h2>

          <div className="mt-5 space-y-4">

            <TimelineItem
              label="Identity Submitted"
              date={
                sellerVerification
                  .identitySubmittedAt
              }
            />

            <TimelineItem
              label="Identity Reviewed"
              date={
                sellerVerification
                  .identityReviewedAt
              }
            />

            <TimelineItem
              label="Selfie Verified"
              date={
                sellerVerification
                  .selfieVerifiedAt
              }
            />

            <TimelineItem
              label="Location Verified"
              date={
                sellerVerification
                  .locationVerifiedAt
              }
            />

            <TimelineItem
              label="Seller Approved"
              date={
                sellerVerification
                  .verifiedAt
              }
            />

          </div>

        </section>

      </div>

    </main>
  );
}

// =====================================================
// Verification Check
// =====================================================

function VerificationCheck({
  icon,
  label,
  verified,
}: {
  icon: React.ReactNode;
  label: string;
  verified: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl
        border
        p-4
        ${
          verified
            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
            : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
        }
      `}
    >

      <div className="flex items-center justify-between">

        <div
          className={
            verified
              ? "text-green-600 dark:text-green-400"
              : "text-slate-400"
          }
        >
          {icon}
        </div>

        {verified ? (
          <CheckCircle2
            size={18}
            className="text-green-600 dark:text-green-400"
          />
        ) : (
          <Clock3
            size={18}
            className="text-slate-400"
          />
        )}

      </div>

      <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-xs
          font-medium
          ${
            verified
              ? "text-green-600 dark:text-green-400"
              : "text-slate-500 dark:text-slate-400"
          }
        `}
      >
        {verified
          ? "Verified"
          : "Not verified"}
      </p>

    </div>
  );
}

// =====================================================
// Info Item
// =====================================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

// =====================================================
// Timeline Item
// =====================================================

function TimelineItem({
  label,
  date,
}: {
  label: string;
  date?: Date | string | null;
}) {
  const formattedDate = date
    ? new Date(date).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        },
      )
    : "Not completed";

  const completed =
    Boolean(date);

  return (
    <div className="flex items-center gap-4">

      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          ${
            completed
              ? "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }
        `}
      >
        {completed ? (
          <CheckCircle2 size={18} />
        ) : (
          <Clock3 size={18} />
        )}
      </div>

      <div className="min-w-0">

        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {formattedDate}
        </p>

      </div>

    </div>
  );
}