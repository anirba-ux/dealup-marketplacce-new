import Link from "next/link";
import { ObjectId } from "mongodb";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  MapPin,
  ShieldCheck,
  Smartphone,
  UserRound,
  XCircle,
} from "lucide-react";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";
import { findUserById } from "@/lib/repositories/user.repository";
import BackButton from "@/components/ui/BackButton";
import LocationVerificationCard from "@/components/verification/LocationVerificationCard";

type CorrectionType = "identity" | "selfie" | "location" | "multiple";

type CorrectionRequest = {
  required?: boolean;
  type?: CorrectionType;
  message?: string;
  requestedAt?: string | Date;
  requestedBy?: { userId?: string; name?: string; email?: string | null };
  sellerViewed?: boolean;
  sellerViewedAt?: string | Date | null;
  resolved?: boolean;
  resolvedAt?: string | Date | null;
};

type VerificationState =
  | "verified"
  | "approved"
  | "pending"
  | "rejected"
  | "suspended"
  | "action_required"
  | "unverified";

export default async function SellerVerificationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await findUserById(session.user.id);

  if (!user) {
    redirect("/login");
  }

  // ---------------------------------------------------------
  // Read the actual identity submission review status.
  // sellerVerification.status is the OVERALL seller status and
  // must not be used as the identity review status.
  // ---------------------------------------------------------
  type IdentitySubmission = {
    reviewStatus?: "pending" | "approved" | "rejected";
    rejectionReason?: string | null;
    submittedAt?: Date | string | null;
  };

  let identitySubmission: IdentitySubmission | null = null;

  try {
    const client = await clientPromise;
    const db = client.db("dealup");

    identitySubmission = (await db
      .collection("identityVerificationSubmissions")
      .findOne(
        {
          userId: String(session.user.id),
          documentType: "aadhaar",
        },
        {
          sort: { submittedAt: -1 },
          projection: {
            reviewStatus: 1,
            rejectionReason: 1,
            submittedAt: 1,
          },
        },
      )) as IdentitySubmission | null;
  } catch (error) {
    console.error("SELLER VERIFICATION IDENTITY STATUS ERROR:", error);
  }

  type SellerVerificationData = {
    status?: VerificationState;
    phoneVerified?: boolean;
    identityVerified?: boolean;
    identitySubmissionId?: string | null;
    identitySubmittedAt?: Date | string | null;
    identityRejectionReason?: string;
    rejectionReason?: string;
    selfieVerified?: boolean;
    locationVerified?: boolean;
    correctionRequest?: CorrectionRequest | null;
  };

  const verification =
    (user.sellerVerification as SellerVerificationData | undefined) ?? {};

  // ---------------------------------------------------------
  // Individual verification states
  // ---------------------------------------------------------
  const phoneVerified =
    user.isPhoneVerified === true ||
    verification.phoneVerified === true;

  const identityVerified = verification.identityVerified === true;
  const selfieVerified = verification.selfieVerified === true;
  const locationVerified = verification.locationVerified === true;

  // ---------------------------------------------------------
  // Identity status comes from the identity submission itself.
  // ---------------------------------------------------------
  const identityReviewStatus = identityVerified
    ? "approved"
    : identitySubmission?.reviewStatus ??
      (verification.identitySubmissionId ? "pending" : "none");

  const identityPending =
    !identityVerified && identityReviewStatus === "pending";

  const identityRejected =
    !identityVerified && identityReviewStatus === "rejected";

  const identitySuspended =
    !identityVerified &&
    (verification.status ?? "unverified") === "suspended";

  // ---------------------------------------------------------
  // Overall seller verification state
  // ---------------------------------------------------------
  const verificationStatus =
    (verification.status ?? "unverified") as VerificationState;

  const correctionRequest =
    (verification.correctionRequest ?? null) as CorrectionRequest | null;

  const correctionRequired =
    verificationStatus === "action_required" &&
    correctionRequest?.required === true &&
    correctionRequest.resolved !== true;

  // ---------------------------------------------------------
  // Progress: only actually completed steps count
  // ---------------------------------------------------------
  const completedSteps = [
    phoneVerified,
    identityVerified,
    selfieVerified,
    locationVerified,
  ].filter(Boolean).length;

  const totalSteps = 4;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  const isApproved =
    verificationStatus === "verified" ||
    verificationStatus === "approved";

  let overallLabel = "Not Started";
  let overallDescription =
    "Complete the verification steps below to become a Verified Seller.";

  if (isApproved) {
    overallLabel = "Verified Seller";
    overallDescription =
      "Your seller verification has been approved. You are a Verified Seller.";
  } else if (verificationStatus === "pending") {
    overallLabel = "Under Review";
    overallDescription =
      "Your seller verification request is currently under review by the DealUp admin team.";
  } else if (verificationStatus === "rejected") {
    overallLabel = "Verification Rejected";
    overallDescription =
      verification.rejectionReason ||
      "Your verification was rejected. Review the reason below and submit again.";
  } else if (verificationStatus === "action_required") {
    overallLabel = "Action Required";
    overallDescription =
      "DealUp needs you to correct part of your verification.";
  } else if (completedSteps > 0) {
    overallLabel = "Verification In Progress";
    overallDescription =
      "Some verification steps are complete. Finish the remaining steps.";
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-6 text-slate-900 dark:bg-[#07111f] dark:text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-5xl min-w-0">
        {/* Back + Home */}
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <BackButton />

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-[#1565d8]/30 hover:bg-slate-50 hover:text-[#1565d8] hover:shadow-md active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/15"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Home</span>
          </Link>
        </div>

        {/* Hero */}
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1565d8] via-[#1976f3] to-[#0f52ba] p-5 text-white shadow-xl shadow-blue-500/10 sm:rounded-[32px] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur sm:h-14 sm:w-14">
                <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                  Seller Trust
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                  Seller Verification
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  Complete your verification to build buyer trust and become
                  eligible for the Verified Seller badge.
                </p>
              </div>
            </div>

            <StatusPill status={verificationStatus} />
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-blue-100">
                Verification Progress
              </span>
              <span className="font-black">
                {completedSteps} / {totalSteps}
              </span>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-blue-100">
              <span>{progress}% complete</span>
              <span>{overallLabel}</span>
            </div>
          </div>
        </section>

        {/* Current overall status */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#091526] sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {isApproved ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : verificationStatus === "pending" ? (
                <Clock3 className="h-5 w-5 text-amber-500" />
              ) : verificationStatus === "rejected" ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-[#1565d8]" />
              )}
            </div>

            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white">
                {overallLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {overallDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Admin correction */}
        {correctionRequired && correctionRequest && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm dark:border-orange-900/60 dark:bg-[#091526]">
            <div className="border-b border-orange-200 bg-orange-50 px-5 py-4 dark:border-orange-900/60 dark:bg-orange-950/25">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-600 dark:text-orange-400" />
                <div>
                  <h2 className="font-bold text-orange-900 dark:text-orange-200">
                    Verification Correction Required
                  </h2>
                  <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                    DealUp admin has requested a correction to your
                    verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Admin Message
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                {correctionRequest.message ||
                  "Please review and correct your verification information."}
              </p>

              <div className="mt-4">
                {correctionRequest.type === "identity" ? (
                  <Link
                    href="/dashboard/verification/identity"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
                  >
                    Fix Identity
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
                  >
                    Fix Verification
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Verification steps */}
        <section className="mt-7">
          <div className="mb-4">
            <h2 className="text-xl font-black tracking-tight sm:text-2xl">
              Verification Steps
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Each step shows its current status so you always know what is
              completed, under review, or still required.
            </p>
          </div>

          <div className="space-y-3">
            {/* Phone */}
            <VerificationCard
              icon={<Smartphone className="h-5 w-5" />}
              title="Phone Verification"
              description={
                phoneVerified
                  ? "Your phone number has been successfully verified."
                  : "Verify your phone number to secure your seller account."
              }
              status={phoneVerified ? "verified" : "unverified"}
              statusText={phoneVerified ? "Phone Verified" : "Not Verified"}
              action={
                phoneVerified ? undefined : (
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
                  >
                    Verify Phone
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )
              }
            />

            {/* Identity */}
            <VerificationCard
              icon={<UserRound className="h-5 w-5" />}
              title="Identity Verification"
              description={
                identityVerified
                  ? "Your identity document has been approved by DealUp."
                  : identityPending
                    ? "Your identity document has been submitted and is being reviewed by the DealUp admin team."
                    : identityRejected
                      ? "Your identity verification was rejected. Review the reason and submit again."
                      : identitySuspended
                        ? "Identity verification is currently suspended."
                        : "Submit your identity document for manual verification."
              }
              status={
                identityVerified
                  ? "verified"
                  : identityPending
                    ? "pending"
                    : identityRejected
                      ? "rejected"
                      : identitySuspended
                        ? "suspended"
                        : "unverified"
              }
              statusText={
                identityVerified
                  ? "Identity Verified"
                  : identityPending
                    ? "Under Review"
                    : identityRejected
                      ? "Rejected"
                      : identitySuspended
                        ? "Suspended"
                        : "Not Submitted"
              }
              rejectionReason={
                identityRejected
                  ? identitySubmission?.rejectionReason ??
                    verification.identityRejectionReason ??
                    verification.rejectionReason
                  : undefined
              }
              action={
                identityVerified ||
                identityPending ||
                identitySuspended ? undefined : (
                  <Link
                    href="/dashboard/verification/identity"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
                  >
                    {identityRejected ? "Try Again" : "Verify Identity"}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )
              }
            />

            {/* Live selfie */}
            <VerificationCard
              icon={<Camera className="h-5 w-5" />}
              title="Live Selfie Verification"
              description={
                selfieVerified
                  ? "Your live selfie verification has been completed successfully."
                  : "Use your webcam or mobile camera to complete the live selfie check."
              }
              status={selfieVerified ? "verified" : "unverified"}
              statusText={
                selfieVerified ? "Live Selfie Verified" : "Not Completed"
              }
              action={
                selfieVerified ? undefined : (
                  <Link
                    href="#location-selfie"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1565d8] bg-blue-50 px-4 py-2.5 text-sm font-bold text-[#1565d8] transition hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
                  >
                    Start Selfie + Location
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )
              }
            />

            {/* Location */}
            <VerificationCard
              icon={<MapPin className="h-5 w-5" />}
              title="Location Verification"
              description={
                locationVerified
                  ? "Your location has been successfully verified."
                  : "Verify your current location using desktop browser location or mobile GPS."
              }
              status={locationVerified ? "verified" : "unverified"}
              statusText={
                locationVerified ? "Location Verified" : "Not Completed"
              }
              action={
                locationVerified ? undefined : (
                  <Link
                    href="#location-selfie"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
                  >
                    Verify Location
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )
              }
            />
          </div>
        </section>

        {/* Location + Live Selfie */}
        <section
          id="location-selfie"
          className="mt-6 scroll-mt-6"
        >
          <LocationVerificationCard
            verified={locationVerified}
            selfieVerified={selfieVerified}
          />
        </section>

        {/* Admin review */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#091526] sm:p-6">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="min-w-0">
              <h2 className="font-black">Admin Review</h2>

              {verificationStatus === "pending" && (
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Your identity submission is under review. DealUp admin will
                  update the status after review.
                </p>
              )}

              {isApproved && (
                <p className="mt-1 text-sm leading-6 text-green-600 dark:text-green-400">
                  Your seller verification has been approved. You are now a
                  Verified Seller.
                </p>
              )}

              {verificationStatus === "rejected" && (
                <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-400">
                  Your verification was rejected. Please review the rejection
                  reason and submit the required information again.
                </p>
              )}

              {verificationStatus === "action_required" && (
                <p className="mt-1 text-sm leading-6 text-orange-600 dark:text-orange-400">
                  DealUp admin has requested a correction.
                </p>
              )}

              {verificationStatus === "unverified" && (
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Complete the required steps before your seller application
                  can be reviewed.
                </p>
              )}

              {verificationStatus === "suspended" && (
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Your seller verification is currently suspended.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Why verify */}
        <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/60 dark:bg-blue-950/20 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#1565d8] dark:text-blue-300" />
            <div>
              <h2 className="font-black text-blue-950 dark:text-blue-200">
                Why become a Verified Seller?
              </h2>
              <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-300">
                Seller verification helps protect the DealUp marketplace and
                gives buyers greater confidence when dealing with sellers.
              </p>

              <div className="mt-4 grid gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300 sm:grid-cols-3">
                <span>✓ Build buyer confidence</span>
                <span>✓ Increase seller trust</span>
                <span>✓ Become eligible for seller badges</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function VerificationCard({
  icon,
  title,
  description,
  status,
  statusText,
  rejectionReason,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  status: "verified" | "pending" | "rejected" | "suspended" | "unverified";
  statusText: string;
  rejectionReason?: string;
  action?: React.ReactNode;
}) {
  const styles = {
    verified: {
      border: "border-green-200 dark:border-green-900/60",
      icon: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300",
      pill: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
      iconNode: <CheckCircle2 className="h-5 w-5" />,
    },
    pending: {
      border: "border-amber-200 dark:border-amber-900/60",
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
      pill: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      iconNode: <Clock3 className="h-5 w-5" />,
    },
    rejected: {
      border: "border-red-200 dark:border-red-900/60",
      icon: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
      pill: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
      iconNode: <XCircle className="h-5 w-5" />,
    },
    suspended: {
      border: "border-slate-300 dark:border-slate-700",
      icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      pill: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      iconNode: <ShieldCheck className="h-5 w-5" />,
    },
    unverified: {
      border: "border-slate-200 dark:border-white/10",
      icon: "bg-blue-50 text-[#1565d8] dark:bg-blue-950/40 dark:text-blue-300",
      pill: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      iconNode: icon,
    },
  }[status];

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-[#091526] sm:p-5 ${styles.border}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
          >
            {styles.iconNode}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {description}
            </p>

            {rejectionReason && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
                <span className="font-bold">Reason:</span>{" "}
                {rejectionReason}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center sm:justify-end">
          {status !== "unverified" ? (
            <span
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black ${styles.pill}`}
            >
              {styles.iconNode}
              {statusText}
            </span>
          ) : (
            action
          )}
        </div>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  const config: Record<string, string> = {
    unverified: "bg-white/15 text-white",
    pending: "bg-amber-100 text-amber-800",
    action_required: "bg-orange-100 text-orange-800",
    verified: "bg-green-100 text-green-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    suspended: "bg-slate-200 text-slate-700",
  };

  const label: Record<string, string> = {
    unverified: "Not Verified",
    pending: "Under Review",
    action_required: "Action Required",
    verified: "Verified",
    approved: "Verified",
    rejected: "Rejected",
    suspended: "Suspended",
  };

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-3.5 py-2 text-xs font-black ${config[status] ?? config.unverified}`}
    >
      {label[status] ?? "Not Verified"}
    </span>
  );
}
