import Link from "next/link";
import { redirect } from "next/navigation";
import { Home } from "lucide-react";

import { auth } from "@/auth";

import DashboardHero from "@/components/dashboard/DashboardHero";
import QuickActions from "@/components/dashboard/QuickActions";
import BackButton from "@/components/ui/BackButton";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // =====================================================
  // Current User
  // =====================================================

  const user = session.user as any;

  // =====================================================
  // Seller Verification
  // =====================================================

  const sellerVerification = user.sellerVerification ?? {};

  // =====================================================
  // Individual Verification States
  // =====================================================

  const phoneVerified =
    user.isPhoneVerified === true ||
    sellerVerification.phoneVerified === true;

  const identityVerified =
    sellerVerification.identityVerified === true;

  const selfieVerified =
    sellerVerification.selfieVerified === true;

  const locationVerified =
    user.locationVerification?.status === "verified" ||
    sellerVerification.locationVerified === true;

  // =====================================================
  // Overall Seller Verification Status
  // =====================================================

  const verificationStatus =
    sellerVerification.status ?? "unverified";

  const isApproved = verificationStatus === "verified";
  const isPending = verificationStatus === "pending";
  const isRejected = verificationStatus === "rejected";
  const isSuspended = verificationStatus === "suspended";

  // =====================================================
  // Verification Progress
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
  // Verification Status Text
  // =====================================================

  let statusLabel = "Not Started";

  let statusDescription =
    "Complete your verification to become a Verified Seller.";

  if (isApproved) {
    statusLabel = "Verified Seller";

    statusDescription =
      "Your seller verification has been approved by DealUp.";
  } else if (isPending) {
    statusLabel = "Under Review";

    statusDescription =
      "Your seller verification request is being reviewed by DealUp.";
  } else if (isRejected) {
    statusLabel = "Verification Rejected";

    statusDescription =
      sellerVerification.rejectionReason ||
      "Your previous verification request was rejected. You can review and resubmit.";
  } else if (isSuspended) {
    statusLabel = "Verification Suspended";

    statusDescription =
      sellerVerification.suspensionReason ||
      "Your seller verification has been suspended by DealUp.";
  } else if (completedSteps === totalSteps) {
    statusLabel = "Under Review";

    statusDescription =
      "All verification steps are complete and your request is awaiting DealUp admin approval.";
  } else if (completedSteps > 0) {
    statusLabel = "Verification In Progress";

    statusDescription =
      "Continue the remaining verification steps.";
  }

  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#1565d8]
        via-[#1d4ed8]
        to-[#0f52ba]
        py-4
        sm:py-7
        lg:py-10
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-3
          sm:px-5
          lg:px-8
        "
      >
        {/* =================================================
            Back + Home Navigation
        ================================================= */}

        <div
          className="
            mb-3
            flex
            items-center
            justify-between
            gap-3
            sm:mb-4
          "
        >
          <BackButton />

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/20
              bg-white/10
              px-3
              py-2
              text-sm
              font-semibold
              text-white
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-white/20
              active:scale-95
              sm:px-4
            "
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* =================================================
            Dashboard Hero
        ================================================= */}

        <DashboardHero user={user} />

        {/* =================================================
            Main Dashboard Card
        ================================================= */}

        <div
          className="
            mt-5
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-xl
            sm:mt-7
            sm:rounded-3xl
            dark:bg-slate-900
          "
        >
          <div
            className="
              p-4
              sm:p-6
              lg:p-8
            "
          >
            {/* =================================================
                My Account
            ================================================= */}

            <section>
              <div
                className="
                  mb-5
                  border-b
                  border-slate-200
                  pb-5
                  dark:border-slate-700
                  sm:mb-7
                  sm:pb-6
                "
              >
                <h2
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-slate-900
                    sm:text-2xl
                    lg:text-3xl
                    dark:text-white
                  "
                >
                  My Account
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-slate-500
                    sm:text-sm
                    dark:text-slate-400
                  "
                >
                  Manage your DealUp profile and marketplace activities.
                </p>
              </div>

              {/* Account Information */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                  sm:gap-4
                  lg:gap-5
                "
              >
                <AccountInfoCard
                  label="Full Name"
                  value={user.name || "Not provided"}
                />

                <AccountInfoCard
                  label="Email Address"
                  value={user.email || "Not provided"}
                />

                <AccountInfoCard
                  label="Account Type"
                  value={user.role || "User"}
                  capitalize
                />

                {/* Account Verification */}

                <div
                  className="
                    min-w-0
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                    sm:rounded-2xl
                    sm:p-5
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >
                  <p
                    className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                      sm:text-xs
                      dark:text-slate-400
                    "
                  >
                    Account Verification
                  </p>

                  <h3
                    className={`mt-2 break-words text-sm font-bold sm:text-base ${
                      isApproved
                        ? "text-green-600 dark:text-green-400"
                        : isRejected || isSuspended
                          ? "text-red-600 dark:text-red-400"
                          : isPending
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {isApproved
                      ? "✓ Verified Seller"
                      : isPending
                        ? "⏳ Under Review"
                        : isRejected
                          ? "✕ Verification Rejected"
                          : isSuspended
                            ? "⚠ Verification Suspended"
                            : completedSteps > 0
                              ? "◷ Verification In Progress"
                              : "✕ Not Verified"}
                  </h3>
                </div>
              </div>
            </section>

            {/* =================================================
                Quick Actions
            ================================================= */}

            <div className="mt-7 sm:mt-9">
              <QuickActions />
            </div>

            {/* =================================================
                Seller Verification
            ================================================= */}

            <section className="mt-7 sm:mt-10">
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-blue-200
                  bg-gradient-to-br
                  from-blue-50
                  via-white
                  to-indigo-50
                  shadow-md
                  sm:rounded-3xl
                  sm:shadow-lg
                  dark:border-blue-900
                  dark:from-slate-800
                  dark:via-slate-900
                  dark:to-blue-950
                "
              >
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Verification Header */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      md:flex-row
                      md:items-start
                      md:justify-between
                    "
                  >
                    <div className="flex min-w-0 gap-3 sm:gap-4">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-100
                          text-xl
                          sm:h-14
                          sm:w-14
                          sm:rounded-2xl
                          sm:text-2xl
                          dark:bg-blue-900/60
                        "
                      >
                        🛡️
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                            sm:gap-3
                          "
                        >
                          <h2
                            className="
                              text-lg
                              font-bold
                              text-slate-900
                              sm:text-2xl
                              dark:text-white
                            "
                          >
                            Seller Verification
                          </h2>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold sm:px-3 sm:text-xs ${
                              isApproved
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : isPending
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                  : isRejected || isSuspended
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <p
                          className="
                            mt-1.5
                            text-xs
                            leading-5
                            text-slate-600
                            sm:text-sm
                            sm:leading-6
                            dark:text-slate-400
                          "
                        >
                          {statusDescription}
                        </p>
                      </div>
                    </div>

                    {/* Verification Action */}

                    <Link
                      href="/dashboard/verification"
                      className="
                        inline-flex
                        w-full
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#1565d8]
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-white
                        shadow-md
                        transition-all
                        duration-200
                        hover:bg-[#0f52ba]
                        hover:shadow-lg
                        active:scale-[0.98]
                        sm:w-auto
                        sm:px-6
                      "
                    >
                      {isApproved
                        ? "View Verification"
                        : isPending
                          ? "View Status"
                          : isRejected
                            ? "Review Verification"
                            : isSuspended
                              ? "View Status"
                              : "Continue Verification"}

                      <span className="ml-2">→</span>
                    </Link>
                  </div>

                  {/* Progress */}

                  {!isApproved && (
                    <div className="mt-6 sm:mt-8">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span
                          className="
                            text-xs
                            font-semibold
                            text-slate-700
                            sm:text-sm
                            dark:text-slate-300
                          "
                        >
                          Verification Progress
                        </span>

                        <span
                          className="
                            text-xs
                            font-bold
                            text-[#1565d8]
                            sm:text-sm
                          "
                        >
                          {progress}%
                        </span>
                      </div>

                      <div
                        className="
                          h-2
                          overflow-hidden
                          rounded-full
                          bg-slate-200
                          sm:h-3
                          dark:bg-slate-700
                        "
                      >
                        <div
                          className="
                            h-full
                            rounded-full
                            bg-[#1565d8]
                            transition-all
                            duration-500
                          "
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <p
                        className="
                          mt-1.5
                          text-[10px]
                          text-slate-500
                          sm:text-xs
                          dark:text-slate-400
                        "
                      >
                        {completedSteps} of {totalSteps} verification steps
                        completed
                      </p>
                    </div>
                  )}

                  {/* Verification Steps */}

                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-1
                      gap-3
                      sm:mt-8
                      sm:grid-cols-2
                      sm:gap-4
                      lg:grid-cols-4
                    "
                  >
                    <VerificationStep
                      completed={phoneVerified}
                      title="Phone Verification"
                      description={
                        phoneVerified
                          ? "Phone number verified"
                          : "Verify your phone number"
                      }
                    />

                    <VerificationStep
                      completed={identityVerified}
                      title="Identity Verification"
                      description={
                        identityVerified
                          ? "Identity verified"
                          : "Complete identity verification"
                      }
                    />

                    <VerificationStep
                      completed={selfieVerified}
                      title="Live Selfie"
                      description={
                        selfieVerified
                          ? "Live selfie verified"
                          : "Complete live selfie verification"
                      }
                    />

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

                  {/* Mobile Verification Summary */}

                  {selfieVerified && locationVerified && (
                    <div
                      className="
                        mt-4
                        rounded-xl
                        border
                        border-green-200
                        bg-green-50
                        p-3
                        sm:mt-6
                        sm:rounded-2xl
                        sm:p-4
                        dark:border-green-900
                        dark:bg-green-950/30
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-semibold
                          leading-5
                          text-green-800
                          sm:text-sm
                          sm:leading-6
                          dark:text-green-300
                        "
                      >
                        ✓ Live selfie and mobile location verification
                        completed successfully.
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          leading-4
                          text-green-700
                          sm:text-xs
                          dark:text-green-400
                        "
                      >
                        You do not need to repeat the mobile verification.
                      </p>
                    </div>
                  )}

                  {/* Trust Message */}

                  <div
                    className="
                      mt-4
                      rounded-xl
                      border
                      border-blue-100
                      bg-blue-50
                      p-3
                      sm:mt-6
                      sm:rounded-2xl
                      sm:p-4
                      dark:border-blue-900
                      dark:bg-blue-950/40
                    "
                  >
                    <p
                      className="
                        text-xs
                        leading-5
                        text-blue-800
                        sm:text-sm
                        sm:leading-6
                        dark:text-blue-300
                      "
                    >
                      <strong>Why verify?</strong>{" "}
                      Verified sellers build more trust with buyers and can
                      receive a Verified Seller badge after DealUp admin
                      approval.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

// =====================================================
// Account Info Card
// =====================================================

function AccountInfoCard({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div
      className="
        min-w-0
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-4
        sm:rounded-2xl
        sm:p-5
        dark:border-slate-700
        dark:bg-slate-800
      "
    >
      <p
        className="
          text-[11px]
          font-semibold
          uppercase
          tracking-wide
          text-slate-500
          sm:text-xs
          dark:text-slate-400
        "
      >
        {label}
      </p>

      <h3
        className={`
          mt-2
          break-words
          text-sm
          font-bold
          text-slate-900
          sm:text-base
          dark:text-white
          ${capitalize ? "capitalize" : ""}
        `}
      >
        {value}
      </h3>
    </div>
  );
}

// =====================================================
// Verification Step
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
    <div
      className="
        flex
        min-w-0
        items-center
        gap-3
        rounded-xl
        border
        border-slate-200
        bg-white
        p-3
        sm:gap-4
        sm:rounded-2xl
        sm:p-4
        dark:border-slate-700
        dark:bg-slate-800
      "
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold sm:h-11 sm:w-11 sm:text-lg ${
          completed
            ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300"
            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
        }`}
      >
        {completed ? "✓" : "○"}
      </div>

      <div className="min-w-0">
        <h3
          className="
            break-words
            text-xs
            font-bold
            text-slate-900
            sm:text-sm
            dark:text-white
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-1
            break-words
            text-[10px]
            leading-4
            text-slate-500
            sm:text-xs
            dark:text-slate-400
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}