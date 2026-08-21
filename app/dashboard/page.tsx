import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import DashboardHero from "@/components/dashboard/DashboardHero";
import QuickActions from "@/components/dashboard/QuickActions";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // =====================================================
  // Seller Verification Status
  // =====================================================

  const user = session.user as any;

  const sellerVerification =
    user.sellerVerification ?? {};

  const verificationStatus =
    sellerVerification.status ?? "unverified";

  const phoneVerified =
    user.isPhoneVerified === true ||
    sellerVerification.phoneVerified === true;

  const identityVerified =
    sellerVerification.identityVerified === true;

  const locationVerified =
    user.locationVerification?.status ===
      "verified" ||
    sellerVerification.locationVerified === true;

  // =====================================================
  // Verification State
  // =====================================================

  const isApproved =
    verificationStatus === "verified" ||
    verificationStatus === "approved";

  const isPending =
    verificationStatus === "pending";

  const isRejected =
    verificationStatus === "rejected";

  // =====================================================
  // Progress
  // =====================================================

  const completedSteps = [
    phoneVerified,
    identityVerified,
    locationVerified,
  ].filter(Boolean).length;

  const totalSteps = 3;

  const progress = Math.round(
    (completedSteps / totalSteps) * 100,
  );

  // =====================================================
  // Status Text
  // =====================================================

  let statusLabel = "Not Started";

  let statusDescription =
    "Complete your verification to become a Verified Seller.";

  if (isApproved) {
    statusLabel = "Verified Seller";

    statusDescription =
      "Your seller verification has been approved.";
  } else if (isPending) {
    statusLabel = "Under Review";

    statusDescription =
      "Your seller verification request is being reviewed by DealUp.";
  } else if (isRejected) {
    statusLabel = "Verification Rejected";

    statusDescription =
      sellerVerification.rejectionReason ||
      "Your previous verification request was rejected. You can review and resubmit.";
  } else if (completedSteps > 0) {
    statusLabel = "Verification In Progress";

    statusDescription =
      "Continue the remaining verification steps.";
  }

  // =====================================================
  // Dashboard
  // =====================================================

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1565d8] via-[#1d4ed8] to-[#0f52ba] py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* =================================================
            Welcome Section
        ================================================= */}

        <DashboardHero user={user} />

        <div className="mt-12 rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
          {/* =================================================
              User Info
          ================================================= */}

          <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-700">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              My Account
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Manage your DealUp profile and marketplace activities.
            </p>
          </div>

          {/* =================================================
              Profile Grid
          ================================================= */}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Full Name
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {user.name || "Not provided"}
              </h3>
            </div>

            {/* Email */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Email Address
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {user.email || "Not provided"}
              </h3>
            </div>

            {/* Account Type */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Account Type
              </p>

              <h3 className="mt-2 text-xl font-bold capitalize text-slate-900 dark:text-white">
                {user.role || "User"}
              </h3>
            </div>

            {/* Account Verification */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Account Verification
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {user.isVerified
                  ? "✓ Verified"
                  : "✕ Not Verified"}
              </h3>
            </div>
          </div>

          {/* =================================================
              Quick Actions
          ================================================= */}

          <QuickActions />

          {/* =================================================
              Seller Verification
          ================================================= */}

          <section className="mt-10">
            <div className="overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-lg dark:border-blue-900 dark:from-slate-800 dark:via-slate-900 dark:to-blue-950">
              {/* Header */}

              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    {/* Icon */}

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-900/60">
                      🛡️
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                          Seller Verification
                        </h2>

                        {/* Status Badge */}

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            isApproved
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : isPending
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                : isRejected
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {statusDescription}
                      </p>
                    </div>
                  </div>

                  {/* Action */}

                  <Link
                    href="/dashboard/profile/verification"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#1565d8] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0f52ba] hover:shadow-lg"
                  >
                    {isApproved
                      ? "View Verification"
                      : isPending
                        ? "View Status"
                        : "Continue Verification"}

                    <span className="ml-2">→</span>
                  </Link>
                </div>

                {/* =================================================
                    Progress
                ================================================= */}

                {!isApproved && (
                  <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Verification Progress
                      </span>

                      <span className="text-sm font-bold text-[#1565d8]">
                        {progress}%
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-[#1565d8] transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* =================================================
                    Verification Steps
                ================================================= */}

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {/* Phone */}

                  <VerificationStep
                    completed={phoneVerified}
                    title="Phone Verification"
                    description={
                      phoneVerified
                        ? "Phone number verified"
                        : "Verify your phone number"
                    }
                  />

                  {/* Identity */}

                  <VerificationStep
                    completed={identityVerified}
                    title="Identity & Selfie"
                    description={
                      identityVerified
                        ? "Identity verified"
                        : "Complete identity verification"
                    }
                  />

                  {/* Location */}

                  <VerificationStep
                    completed={locationVerified}
                    title="Location Verification"
                    description={
                      locationVerified
                        ? "Location verified"
                        : "Verify your mobile location"
                    }
                  />
                </div>

                {/* =================================================
                    Trust Message
                ================================================= */}

                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
                  <p className="text-sm leading-6 text-blue-800 dark:text-blue-300">
                    <strong>Why verify?</strong>{" "}
                    Verified sellers build more trust with buyers and
                    can receive a Verified Seller badge after DealUp
                    admin approval.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// =====================================================
// Verification Step Component
// =====================================================

function VerificationStep({
  completed,
  title,
  description,
}: {
  completed: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
          completed
            ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
        }`}
      >
        {completed ? "✓" : "○"}
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}