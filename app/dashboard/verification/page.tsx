

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

import LocationVerificationCard from "@/components/verification/LocationVerificationCard";
import { auth } from "@/auth";
import { findUserById } from "@/lib/repositories/user.repository";

// =====================================================
// Types
// =====================================================

type CorrectionType =
  | "identity"
  | "selfie"
  | "location"
  | "multiple";

type CorrectionRequest = {
  required?: boolean;
  type?: CorrectionType;
  message?: string;
  requestedAt?: string | Date;
  requestedBy?: {
    userId?: string;
    name?: string;
    email?: string | null;
  };
  sellerViewed?: boolean;
  sellerViewedAt?: string | Date | null;
  resolved?: boolean;
  resolvedAt?: string | Date | null;
};

// =====================================================
// Seller Verification Page
// Simple 3-stage UI — no artificial locked cards
// =====================================================

export default async function SellerVerificationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await findUserById(session.user.id);

  if (!user) {
    redirect("/login");
  }

  const verification = user.sellerVerification;

  // -----------------------------------------------------
  // Verification states
  // -----------------------------------------------------

  const phoneVerified =
    user.isPhoneVerified === true ||
    verification?.phoneVerified === true;

  const identityVerified =
    verification?.identityVerified === true;

  const selfieVerified =
    verification?.selfieVerified === true;

  const locationVerified =
    verification?.locationVerified === true;

  const verificationStatus =
    verification?.status ?? "unverified";

  // -----------------------------------------------------
  // 3 simple stages
  //
  // 1. Phone
  // 2. Identity
  // 3. Location + Live Selfie
  // -----------------------------------------------------

  const stageOneComplete = phoneVerified;
  const stageTwoComplete = identityVerified;
  const stageThreeComplete =
    locationVerified && selfieVerified;

  const completedStages = [
    stageOneComplete,
    stageTwoComplete,
    stageThreeComplete,
  ].filter(Boolean).length;

  const totalStages = 3;

  const progress = Math.round(
    (completedStages / totalStages) * 100,
  );

  // -----------------------------------------------------
  // Correction request
  // -----------------------------------------------------

  const correctionRequest =
    (verification?.correctionRequest ?? null) as
      | CorrectionRequest
      | null;

  const correctionRequired =
    verificationStatus === "action_required" &&
    correctionRequest?.required === true &&
    correctionRequest?.resolved !== true;

  const correctionTypeLabel = getCorrectionTypeLabel(
    correctionRequest?.type,
  );

  // -----------------------------------------------------
  // Render
  // -----------------------------------------------------

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-6 text-slate-900 dark:from-[#050b18] dark:via-[#07111f] dark:to-[#050b18] dark:text-white sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* TOP NAV */}
        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-7">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1565d8]/30 hover:bg-blue-50 hover:text-[#1565d8] dark:border-white/10 dark:bg-[#0d1628] dark:text-slate-200 dark:hover:border-[#1565d8]/50 dark:hover:bg-[#111d34] dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Back</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1565d8]/30 hover:bg-blue-50 hover:text-[#1565d8] dark:border-white/10 dark:bg-[#0d1628] dark:text-slate-200 dark:hover:border-[#1565d8]/50 dark:hover:bg-[#111d34] dark:hover:text-white"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Home</span>
          </Link>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1565d8] via-[#1976f3] to-[#0f52ba] p-5 text-white shadow-xl shadow-blue-900/15 sm:rounded-[32px] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/15 backdrop-blur sm:h-16 sm:w-16">
                  <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                    Seller Trust Program
                  </p>

                  <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">
                    Seller Verification
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                    Complete the steps below to build buyer trust
                    and become eligible for the Verified Seller badge.
                  </p>
                </div>
              </div>

              <VerificationStatusBadge
                status={verificationStatus}
                light
              />
            </div>

            {/* Progress */}
            <div className="mt-7 rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur-sm sm:mt-8 sm:p-5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-bold text-blue-100">
                  Verification Progress
                </span>

                <span className="font-black">
                  {completedStages} / {totalStages}
                </span>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-blue-100">
                <span>
                  Phone → Identity → Location + Selfie
                </span>

                <span className="shrink-0 font-bold text-white">
                  {progress}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ADMIN CORRECTION */}
        {correctionRequired && correctionRequest && (
          <section className="mt-6 overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm dark:border-orange-900/60 dark:bg-[#0d1628] sm:mt-7">
            <div className="border-b border-orange-200 bg-orange-50 px-5 py-5 dark:border-orange-900/50 dark:bg-orange-950/25 sm:px-6">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-orange-900 dark:text-orange-200">
                    Verification Correction Required
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-orange-700 dark:text-orange-300">
                    DealUp admin has requested a correction to your
                    seller verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Verification Step
              </p>

              <div className="mt-2 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                {correctionTypeLabel}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#111b2e] sm:p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Message from DealUp Admin
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                  {correctionRequest.message ||
                    "Please review and correct your verification information."}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {correctionRequest.type === "identity" && (
                  <Link
                    href="/dashboard/verification/identity"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f52ba]"
                  >
                    Fix Identity Verification
                    <ChevronRight size={17} />
                  </Link>
                )}

                {(correctionRequest.type === "selfie" ||
                  correctionRequest.type === "location" ||
                  correctionRequest.type === "multiple") && (
                  <Link
                    href="/dashboard/verification"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f52ba]"
                  >
                    Review Verification
                    <ChevronRight size={17} />
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* VERIFICATION JOURNEY */}
        <section className="mt-8 sm:mt-10">
          <div className="mb-5 sm:mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1565d8] dark:text-blue-400">
              Your verification journey
            </p>

            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Complete in 3 simple stages
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Follow the steps below. There are no unnecessary locked
              stages.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {/* STAGE 01 — PHONE */}
            <VerificationStepCard
              number="01"
              icon={<Smartphone size={22} />}
              title="Phone Verification"
              description="Verify your phone number to secure your DealUp account."
              completed={phoneVerified}
              completedText="Phone Verified"
              action={
                phoneVerified ? undefined : (
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f52ba] sm:w-auto"
                  >
                    Verify Phone in Profile
                    <ChevronRight size={17} />
                  </Link>
                )
              }
            />

            {/* STAGE 02 — IDENTITY */}
            <VerificationStepCard
              number="02"
              icon={
                identityVerified ? (
                  <BadgeCheck size={22} />
                ) : (
                  <UserRound size={22} />
                )
              }
              title="Identity Verification"
              description="Submit your identity document securely for DealUp admin review."
              completed={identityVerified}
              completedText="Identity Verified"
              pending={verificationStatus === "pending"}
              suspended={verificationStatus === "suspended"}
              rejected={verificationStatus === "rejected"}
              rejectionReason={
                verificationStatus === "rejected"
                  ? verification?.rejectionReason ?? undefined
                  : undefined
              }
              action={
                identityVerified ||
                verificationStatus === "pending" ||
                verificationStatus === "suspended" ? undefined : (
                  <Link
                    href="/dashboard/verification/identity"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f52ba] sm:w-auto"
                  >
                    {verificationStatus === "rejected"
                      ? "Try Again"
                      : "Verify Identity"}
                    <ChevronRight size={17} />
                  </Link>
                )
              }
            />

            {/* STAGE 03 — LOCATION + SELFIE */}
            <section
              className={`rounded-3xl border bg-white p-5 shadow-sm transition dark:bg-slate-900 sm:p-6 ${
                stageThreeComplete
                  ? "border-green-200 dark:border-green-900"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    stageThreeComplete
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-blue-100 text-[#1565d8] dark:bg-blue-950 dark:text-blue-300"
                  }`}
                >
                  {stageThreeComplete ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <ShieldCheck size={22} />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500">
                      03
                    </span>

                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Location + Live Selfie
                    </h3>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Verify your current mobile location and complete
                    the live selfie verification.
                  </p>

                  {stageThreeComplete && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
                      <CheckCircle2 size={17} />
                      Location &amp; Selfie Verified
                    </div>
                  )}
                </div>
              </div>

              {/* Existing location flow remains unchanged */}
              <div className="mt-5">
                <LocationVerificationCard
                  verified={locationVerified}
                />
              </div>

              {!selfieVerified && locationVerified && (
                <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1565d8] dark:bg-blue-950 dark:text-blue-300">
                      <UserRound size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-blue-950 dark:text-blue-200">
                        Live Selfie
                      </p>

                      <p className="mt-1 text-xs leading-5 text-blue-800 dark:text-blue-300 sm:text-sm sm:leading-6">
                        Complete the live selfie from the mobile
                        verification screen opened during the location
                        verification process.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </section>

        {/* ADMIN REVIEW */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0d1628] sm:mt-10 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Clock3 size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-slate-950 dark:text-white">
                Admin Review
              </h2>

              {verificationStatus === "pending" && (
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Your seller verification is currently under review
                  by the DealUp admin team.
                </p>
              )}

              {verificationStatus === "verified" && (
                <p className="mt-1 text-sm leading-6 text-green-600 dark:text-green-400">
                  Your seller verification has been approved. You are
                  now a Verified Seller.
                </p>
              )}

              {verificationStatus === "action_required" && (
                <p className="mt-1 text-sm leading-6 text-orange-600 dark:text-orange-400">
                  DealUp admin has requested you to correct your
                  verification information.
                </p>
              )}

              {verificationStatus === "rejected" && (
                <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-400">
                  Your verification was rejected. Please review the
                  rejection reason and submit the required information
                  again.
                </p>
              )}

              {verificationStatus === "suspended" && (
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Your seller verification is currently suspended.
                </p>
              )}

              {verificationStatus === "unverified" && (
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Complete the required verification steps before your
                  seller application can be reviewed.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* WHY VERIFY */}
        <section className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/60 dark:bg-blue-950/20 sm:mt-8 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1565d8] dark:bg-blue-950 dark:text-blue-300">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="font-bold text-blue-950 dark:text-blue-200">
                Why become a Verified Seller?
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-800 dark:text-blue-300">
                Seller verification helps protect the DealUp
                marketplace and gives buyers greater confidence when
                dealing with sellers.
              </p>

              <div className="mt-4 grid gap-2.5 text-sm font-semibold text-blue-800 dark:text-blue-300 sm:grid-cols-3">
                <div>✓ Build buyer confidence</div>
                <div>✓ Increase seller trust</div>
                <div>✓ Become eligible for seller badges</div>
              </div>
            </div>
          </div>
        </section>

        <p className="mt-6 pb-3 text-center text-xs text-slate-400 dark:text-slate-600">
          DealUp Seller Verification • Secure marketplace trust
        </p>
      </div>
    </main>
  );
}

// =====================================================
// Correction Type Label
// =====================================================

function getCorrectionTypeLabel(type?: CorrectionType) {
  switch (type) {
    case "identity":
      return "Identity Verification";
    case "selfie":
      return "Live Selfie Verification";
    case "location":
      return "Location Verification";
    case "multiple":
      return "Multiple Verification Steps";
    default:
      return "Seller Verification";
  }
}

// =====================================================
// Simple Verification Step Card
// No lock state
// =====================================================

function VerificationStepCard({
  number,
  icon,
  title,
  description,
  completed,
  completedText,
  pending = false,
  suspended = false,
  rejected = false,
  rejectionReason,
  action,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
  completedText: string;
  pending?: boolean;
  suspended?: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-3xl border bg-white p-5 shadow-sm transition dark:bg-slate-900 sm:p-6 ${
        completed
          ? "border-green-200 dark:border-green-900"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              completed
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-blue-100 text-[#1565d8] dark:bg-blue-950 dark:text-blue-300"
            }`}
          >
            {completed ? <CheckCircle2 size={24} /> : icon}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500">
                {number}
              </span>

              <h3 className="font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
            </div>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {description}
            </p>

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

        <div className="shrink-0 sm:pl-4">
          {completed && (
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-100 px-5 py-3 text-sm font-bold text-green-700 dark:bg-green-950 dark:text-green-300 sm:w-auto">
              <CheckCircle2 size={18} />
              {completedText}
            </span>
          )}

          {!completed && pending && (
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-100 px-5 py-3 text-sm font-bold text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 sm:w-auto">
              <Clock3 size={18} />
              Under Review
            </span>
          )}

          {!completed && !pending && suspended && (
            <span className="inline-flex w-full items-center justify-center rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:w-auto">
              Suspended
            </span>
          )}

          {!completed && !pending && !suspended && action}
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
    action_required: {
      label: "Action Required",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
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

  const current = config[status] ?? config.unverified;

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-4 py-2 text-xs font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}
