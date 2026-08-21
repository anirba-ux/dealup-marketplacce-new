import Link from "next/link";
import { redirect } from "next/navigation";

import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

import LocationVerificationCard from "@/components/verification/LocationVerificationCard";

import { auth } from "@/auth";
import { findUserById } from "@/lib/repositories/user.repository";

export default async function SellerVerificationPage() {
  // =====================================================
  // Authentication
  // =====================================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // =====================================================
  // Current User
  // =====================================================

  const user = await findUserById(session.user.id);

  if (!user) {
    redirect("/login");
  }

  // =====================================================
  // Verification Data
  // =====================================================

  const verification = user.sellerVerification;

  const phoneVerified =
  user.isPhoneVerified === true;

  const identityVerified =
    verification?.identityVerified === true;

  const locationVerified =
    verification?.locationVerified === true;

    const selfieVerified =
  verification?.selfieVerified === true;

  const verificationStatus =
    verification?.status ?? "unverified";

  // =====================================================
  // Status States
  // =====================================================

  const identityPending =
    verificationStatus === "pending";

  const identityRejected =
    verificationStatus === "rejected";

  const identitySuspended =
    verificationStatus === "suspended";

  // =====================================================
  // Verification Progress
  //
  // Phone
  // Identity
  // Location
  // Live Selfie
  // =====================================================

  const completedSteps = [
  phoneVerified,
  identityVerified,
  selfieVerified,
  locationVerified,
].filter(Boolean).length;

const totalSteps = 4;

  const progress = Math.round(
    (completedSteps / totalSteps) * 100,
  );

  // =====================================================
  // Page
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* =================================================
            BACK TO DASHBOARD
        ================================================= */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1565d8] hover:underline"
        >
          ← Back to Dashboard
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1565d8] to-blue-700 p-6 text-white shadow-lg sm:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <ShieldCheck size={30} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Seller Verification
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                  Complete your verification to build trust
                  with buyers and become eligible for the
                  Verified Seller badge.
                </p>
              </div>

            </div>

            <VerificationStatusBadge
              status={verificationStatus}
              light
            />

          </div>

          {/* =================================================
              PROGRESS
          ================================================= */}

          <div className="mt-8">

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-blue-100">
                Verification Progress
              </span>

              <span className="font-bold">
                {completedSteps} / {totalSteps}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">

              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

            <p className="mt-2 text-xs text-blue-100">
              Complete all required verification steps.
            </p>

          </div>

        </section>

        {/* =================================================
            VERIFICATION STEPS
        ================================================= */}

        <section className="mt-8">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Verification Steps
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Complete each step to strengthen your seller
              account.
            </p>

          </div>

          <div className="space-y-4">

            {/* =================================================
                PHONE VERIFICATION
            ================================================= */}

            <VerificationStepCard
              icon={<Smartphone size={22} />}
              title="Phone Verification"
              description="Verify your phone number to secure your account."
              completed={phoneVerified}
              completedText="Phone Verified"
              action={
                phoneVerified ? undefined : (
                  <Link
                    href="/dashboard/profile/verification"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
                  >
                    Verify Phone
                    <ChevronRight size={17} />
                  </Link>
                )
              }
            />

            {/* =================================================
                IDENTITY VERIFICATION
            ================================================= */}

            <VerificationStepCard
              icon={
                identityVerified ? (
                  <BadgeCheck size={22} />
                ) : (
                  <UserRound size={22} />
                )
              }
              title="Identity Verification"
              description="Submit your identity document for verification."
              completed={identityVerified}
              completedText="Identity Verified"
              pending={identityPending}
              suspended={identitySuspended}
              rejected={identityRejected}
              rejectionReason={
                identityRejected
                  ? verification?.rejectionReason ?? undefined
                  : undefined
              }
              action={
                identityVerified ||
                identityPending ||
                identitySuspended
                  ? undefined
                  : (
                    <Link
                      href="/dashboard/verification/identity"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
                    >
                      {identityRejected
                        ? "Try Again"
                        : "Verify Identity"}

                      <ChevronRight size={17} />
                    </Link>
                  )
              }
            />

            {/* =================================================
                LOCATION VERIFICATION
            ================================================= */}

            <LocationVerificationCard
              verified={locationVerified}
            />

            {/* =================================================
                LIVE SELFIE VERIFICATION
            ================================================= */}

            <VerificationStepCard
              icon={<Camera size={22} />}
              title="Live Selfie Verification"
              description="Complete a live selfie check to confirm that you are the person completing the seller verification."
              completed={false}
              completedText="Selfie Verified"
              locked={
                !phoneVerified ||
                !identityVerified ||
                !locationVerified
              }
              lockedMessage={
                "Complete Phone, Identity and Location verification first."
              }
              action={
                phoneVerified &&
                identityVerified &&
                locationVerified ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-5 py-3 text-sm font-bold text-[#1565d8] dark:bg-blue-950 dark:text-blue-300">
                    Next Step
                    <ChevronRight size={17} />
                  </span>
                ) : undefined
              }
            />

          </div>

        </section>

        {/* =================================================
            ADMIN REVIEW
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
              <Clock3 size={22} />
            </div>

            <div>

              <h2 className="font-bold text-slate-900 dark:text-white">
                Admin Review
              </h2>

              {verificationStatus === "pending" && (
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Your seller verification is currently
                  under review by the DealUp admin team.
                </p>
              )}

              {verificationStatus === "verified" && (
                <p className="mt-1 text-sm leading-6 text-green-600 dark:text-green-400">
                  Your seller verification has been approved.
                  You are now a Verified Seller.
                </p>
              )}

              {verificationStatus === "rejected" && (
                <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-400">
                  Your verification was rejected. Please
                  review the rejection reason and submit
                  the required information again.
                </p>
              )}

              {verificationStatus === "suspended" && (
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Your seller verification is currently
                  suspended.
                </p>
              )}

              {verificationStatus === "unverified" && (
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Complete the required verification steps
                  before your seller application can be
                  reviewed.
                </p>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            WHY VERIFY
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">

          <div className="flex items-start gap-4">

            <div className="text-2xl">
              🛡️
            </div>

            <div>

              <h2 className="font-bold text-blue-900 dark:text-blue-200">
                Why become a Verified Seller?
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-700 dark:text-blue-300">
                Seller verification helps protect the
                DealUp marketplace and gives buyers greater
                confidence when dealing with sellers.
              </p>

              <div className="mt-4 grid gap-3 text-sm font-medium text-blue-700 dark:text-blue-300 sm:grid-cols-3">

                <div>
                  ✓ Build buyer confidence
                </div>

                <div>
                  ✓ Increase seller trust
                </div>

                <div>
                  ✓ Become eligible for seller badges
                </div>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

// =====================================================
// Verification Step Card
// =====================================================

function VerificationStepCard({
  icon,
  title,
  description,
  completed,
  completedText,
  pending = false,
  suspended = false,
  rejected = false,
  rejectionReason,
  locked = false,
  lockedMessage,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
  completedText: string;
  pending?: boolean;
  suspended?: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  locked?: boolean;
  lockedMessage?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border bg-white p-6 shadow-sm transition dark:bg-slate-900 ${
        completed
          ? "border-green-200 dark:border-green-900"
          : locked
            ? "border-slate-200 opacity-80 dark:border-slate-700"
            : "border-slate-200 dark:border-slate-700"
      }`}
    >

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        {/* =================================================
            LEFT
        ================================================= */}

        <div className="flex min-w-0 items-start gap-4">

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              completed
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : locked
                  ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  : "bg-blue-100 text-[#1565d8] dark:bg-blue-950 dark:text-blue-300"
            }`}
          >
            {completed ? (
              <CheckCircle2 size={24} />
            ) : (
              icon
            )}
          </div>

          <div className="min-w-0">

            <h3 className="font-bold text-slate-900 dark:text-white">
              {title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>

            {/* =================================================
                LOCKED MESSAGE
            ================================================= */}

            {locked && lockedMessage && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {lockedMessage}
              </div>
            )}

            {/* =================================================
                REJECTION
            ================================================= */}

            {rejected && rejectionReason && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                <span className="font-semibold">
                  Rejection reason:
                </span>{" "}
                {rejectionReason}
              </div>
            )}

          </div>

        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="shrink-0">

          {completed && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-green-100 px-5 py-3 text-sm font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
              <CheckCircle2 size={18} />
              {completedText}
            </span>
          )}

          {!completed && pending && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-yellow-100 px-5 py-3 text-sm font-bold text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
              <Clock3 size={18} />
              Under Review
            </span>
          )}

          {!completed && !pending && suspended && (
            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Suspended
            </span>
          )}

          {!completed &&
            !pending &&
            !suspended &&
            action}

        </div>

      </div>

    </section>
  );
}

// =====================================================
// Verification Status Badge
// =====================================================

function VerificationStatusBadge({
  status,
  light = false,
}: {
  status: string;
  light?: boolean;
}) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    unverified: {
      label: "Not Verified",
      className: light
        ? "bg-white/15 text-white"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },

    pending: {
      label: "Under Review",
      className:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
    },

    verified: {
      label: "Verified",
      className:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    },

    approved: {
      label: "Verified",
      className:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    },

    suspended: {
      label: "Suspended",
      className:
        "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
  };

  const current =
    config[status] ?? config.unverified;

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-4 py-2 text-xs font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}