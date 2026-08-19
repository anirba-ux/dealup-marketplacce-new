import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

interface VerificationSeller {
  _id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  isPhoneVerified?: boolean;

  sellerVerification?: {
    status?:
      | "unverified"
      | "pending"
      | "verified"
      | "rejected"
      | "suspended";

    phoneVerified?: boolean;
    identityVerified?: boolean;
    locationVerified?: boolean;

    submittedAt?: Date | null;
    verifiedAt?: Date | null;

    rejectionReason?: string | null;
  };

  trustScore?: number;

  createdAt?: Date;
}

type VerificationStatus =
  | "all"
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

interface PageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

const statusConfig = {
  pending: {
    label: "Pending",
    className:
      "border-yellow-200 bg-yellow-100 text-yellow-700",
  },

  verified: {
    label: "Verified",
    className:
      "border-green-200 bg-green-100 text-green-700",
  },

  rejected: {
    label: "Rejected",
    className:
      "border-red-200 bg-red-100 text-red-700",
  },

  suspended: {
    label: "Suspended",
    className:
      "border-slate-300 bg-slate-200 text-slate-700",
  },

  unverified: {
    label: "Unverified",
    className:
      "border-slate-200 bg-slate-100 text-slate-600",
  },
};

export default async function AdminVerificationPage({
  searchParams,
}: PageProps) {
  // =====================================================
  // Authentication
  // =====================================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // =====================================================
  // Admin Authorization
  // =====================================================

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
            Administrator access is required to
            manage seller verification.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // Search Params
  // =====================================================

  const params = await searchParams;

  const requestedStatus =
    params?.status ?? "all";

  const allowedStatuses: VerificationStatus[] =
    [
      "all",
      "pending",
      "verified",
      "rejected",
      "suspended",
    ];

  const selectedStatus: VerificationStatus =
    allowedStatuses.includes(
      requestedStatus as VerificationStatus,
    )
      ? (requestedStatus as VerificationStatus)
      : "all";

  // =====================================================
  // Database
  // =====================================================

  const client = await clientPromise;

  const db = client.db("dealup");

  // =====================================================
  // Build Query
  // =====================================================

  const query: Record<string, unknown> = {
    sellerVerification: {
      $exists: true,
    },
  };

  if (selectedStatus !== "all") {
    query[
      "sellerVerification.status"
    ] = selectedStatus;
  }

  // =====================================================
  // Fetch Sellers
  // =====================================================

  const rawUsers = await db
    .collection("users")
    .find(query)
    .sort({
      "sellerVerification.submittedAt": -1,
      createdAt: -1,
    })
    .toArray();

  const sellers: VerificationSeller[] =
    rawUsers.map((user) => ({
      _id: user._id.toString(),

      name: user.name ?? "Unknown Seller",

      email: user.email ?? "",

      image: user.image ?? "",

      phone: user.phone ?? "",

      isPhoneVerified:
        user.isPhoneVerified ?? false,

      sellerVerification:
        user.sellerVerification ?? {
          status: "unverified",

          phoneVerified: false,

          identityVerified: false,

          locationVerified: false,
        },

      trustScore:
        Number(user.trustScore ?? 0),

      createdAt: user.createdAt,
    }));

  // =====================================================
  // Counts
  // =====================================================

  const allVerificationUsers =
    await db
      .collection("users")
      .find({
        sellerVerification: {
          $exists: true,
        },
      })
      .project({
        "sellerVerification.status": 1,
      })
      .toArray();

  const counts = {
    all: allVerificationUsers.length,

    pending:
      allVerificationUsers.filter(
        (user) =>
          user.sellerVerification
            ?.status === "pending",
      ).length,

    verified:
      allVerificationUsers.filter(
        (user) =>
          user.sellerVerification
            ?.status === "verified",
      ).length,

    rejected:
      allVerificationUsers.filter(
        (user) =>
          user.sellerVerification
            ?.status === "rejected",
      ).length,

    suspended:
      allVerificationUsers.filter(
        (user) =>
          user.sellerVerification
            ?.status === "suspended",
      ).length,
  };

  // =====================================================
  // Page
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            Back
        ================================================= */}

        <Link
          href="/admin"
          className="text-sm font-semibold text-[#1565d8] hover:underline"
        >
          ← Back to Admin Dashboard
        </Link>

        {/* =================================================
            Header
        ================================================= */}

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                🛡️ Seller Verification
              </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
                Seller Verification
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Review seller verification requests
                and manage their verification status.
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-4 dark:bg-blue-950/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                Pending Reviews
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-700 dark:text-blue-300">
                {counts.pending}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            Status Filters
        ================================================= */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatusFilter
            label="All"
            status="all"
            count={counts.all}
            active={selectedStatus === "all"}
          />

          <StatusFilter
            label="Pending"
            status="pending"
            count={counts.pending}
            active={selectedStatus === "pending"}
          />

          <StatusFilter
            label="Verified"
            status="verified"
            count={counts.verified}
            active={selectedStatus === "verified"}
          />

          <StatusFilter
            label="Rejected"
            status="rejected"
            count={counts.rejected}
            active={selectedStatus === "rejected"}
          />

          <StatusFilter
            label="Suspended"
            status="suspended"
            count={counts.suspended}
            active={selectedStatus === "suspended"}
          />
        </div>

        {/* =================================================
            Seller List
        ================================================= */}

        <section className="mt-6">
          {sellers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="text-5xl">
                🛡️
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                No Sellers Found
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                There are no seller verification
                requests in this category.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellers.map((seller) => {
                const sellerStatus =
                  seller.sellerVerification
                    ?.status ??
                  "unverified";

                const config =
                  statusConfig[
                    sellerStatus
                  ] ??
                  statusConfig.unverified;

                const phoneVerified =
                  seller
                    .sellerVerification
                    ?.phoneVerified ??
                  seller.isPhoneVerified ??
                  false;

                const identityVerified =
                  seller
                    .sellerVerification
                    ?.identityVerified ??
                  false;

                const locationVerified =
                  seller
                    .sellerVerification
                    ?.locationVerified ??
                  false;

                return (
                  <div
                    key={seller._id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      {/* Seller */}

                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          {seller.image ? (
                            <img
                              src={seller.image}
                              alt={seller.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">
                              👤
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                              {seller.name}
                            </h2>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${config.className}`}
                            >
                              {config.label}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {seller.email}
                          </p>

                          {seller.phone && (
                            <p className="mt-1 text-xs text-slate-400">
                              📞 {seller.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Verification Checks */}

                      <div className="grid grid-cols-3 gap-3">
                        <VerificationCheck
                          label="Phone"
                          verified={
                            phoneVerified
                          }
                        />

                        <VerificationCheck
                          label="Identity"
                          verified={
                            identityVerified
                          }
                        />

                        <VerificationCheck
                          label="Location"
                          verified={
                            locationVerified
                          }
                        />
                      </div>

                      {/* Trust */}

                      <div className="rounded-2xl bg-slate-50 px-5 py-4 dark:bg-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Trust Score
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                          {seller.trustScore}
                        </p>
                      </div>

                      {/* Action */}

                      <Link
                        href={`/admin/verification/${seller._id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f52ba] hover:scale-[1.02] active:scale-95"
                      >
                        Review Seller →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// =======================================================
// Status Filter
// =======================================================

function StatusFilter({
  label,
  status,
  count,
  active,
}: {
  label: string;
  status: VerificationStatus;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={
        status === "all"
          ? "/admin/verification"
          : `/admin/verification?status=${status}`
      }
      className={`rounded-2xl border p-4 transition ${
        active
          ? "border-[#1565d8] bg-blue-50 shadow-sm dark:border-blue-500 dark:bg-blue-950/30"
          : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <p
        className={`text-sm font-semibold ${
          active
            ? "text-[#1565d8]"
            : "text-slate-600 dark:text-slate-300"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
        {count}
      </p>
    </Link>
  );
}

// =======================================================
// Verification Check
// =======================================================

function VerificationCheck({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 text-center ${
        verified
          ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <div className="text-sm">
        {verified ? "✓" : "—"}
      </div>

      <p
        className={`mt-1 text-[11px] font-semibold ${
          verified
            ? "text-green-700 dark:text-green-400"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>
    </div>
  );
}