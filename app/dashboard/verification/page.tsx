import Link from "next/link";
import { redirect } from "next/navigation";

import {
  BadgeCheck,
  ChevronRight,
  ShieldCheck,
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
  // Find Current User
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
    verification?.phoneVerified ??
    user.isPhoneVerified ??
    false;

  const identityVerified =
    verification?.identityVerified ?? false;

  const locationVerified =
    verification?.locationVerified ?? false;

  const verificationStatus =
    verification?.status ?? "unverified";

  // =====================================================
  // Identity State
  // =====================================================

  const identityPending =
    verificationStatus === "pending";

  const identityRejected =
    verificationStatus === "rejected";

  const identitySuspended =
    verificationStatus === "suspended";

  // =====================================================
  // Page
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1565d8] hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-[#1565d8] dark:bg-blue-950">
              <ShieldCheck size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Seller Verification
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Build trust with buyers by verifying your seller account.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            OVERALL STATUS
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Verification Status
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Complete the verification steps to become a verified seller.
              </p>
            </div>

            <VerificationStatusBadge
              status={verificationStatus}
            />

          </div>
        </section>

        {/* =================================================
            VERIFICATION STEPS
        ================================================= */}

        <div className="mt-6 space-y-4">

          {/* =================================================
              LOCATION VERIFICATION
          ================================================= */}

          <LocationVerificationCard
            verified={locationVerified}
          />

          {/* =================================================
              IDENTITY VERIFICATION
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              {/* LEFT */}

              <div className="flex items-start gap-4">

                <div
                  className={`
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    ${
                      identityVerified
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-blue-100 text-[#1565d8] dark:bg-blue-950 dark:text-blue-300"
                    }
                  `}
                >
                  {identityVerified ? (
                    <BadgeCheck size={24} />
                  ) : (
                    <UserRound size={24} />
                  )}
                </div>

                <div>

                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Identity Verification
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Verify your identity to become eligible for the Verified
                    Seller badge.
                  </p>

                  {/* REJECTION REASON */}

                  {identityRejected &&
                    verification?.rejectionReason && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">

                        <span className="font-semibold">
                          Rejection reason:
                        </span>{" "}

                        {verification.rejectionReason}

                      </div>
                    )}

                </div>
              </div>

              {/* RIGHT ACTION */}

              <div className="shrink-0">

                {identityVerified ? (

                  <span className="inline-flex items-center gap-2 rounded-xl bg-green-100 px-5 py-3 text-sm font-bold text-green-700 dark:bg-green-950 dark:text-green-300">
                    <BadgeCheck size={18} />
                    Verified
                  </span>

                ) : identityPending ? (

                  <span className="inline-flex items-center gap-2 rounded-xl bg-yellow-100 px-5 py-3 text-sm font-bold text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                    ⏳ Under Review
                  </span>

                ) : identitySuspended ? (

                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Suspended
                  </span>

                ) : (

                  <Link
                    href="/dashboard/verification/identity"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-[#1565d8]
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-white
                      transition
                      hover:bg-[#0f52ba]
                    "
                  >
                    {identityRejected
                      ? "Try Again"
                      : "Verify Identity"}

                    <ChevronRight size={18} />
                  </Link>

                )}

              </div>
            </div>
          </section>

        </div>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">

          <div className="flex gap-4">

            <div className="text-2xl">
              🛡️
            </div>

            <div>

              <h3 className="font-bold text-blue-900 dark:text-blue-200">
                Why verify your identity?
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-700 dark:text-blue-300">
                Identity verification helps protect the DealUp marketplace
                and gives buyers greater confidence when dealing with sellers.
              </p>

            </div>

          </div>
        </div>

      </div>
    </main>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function VerificationStatusBadge({
  status,
}: {
  status: string;
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
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
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
    config[status] ??
    config.unverified;

  return (
    <span
      className={`rounded-full px-4 py-2 text-xs font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}