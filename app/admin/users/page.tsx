import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import {
  findAllUsers,
  getUserStatistics,
} from "@/lib/repositories/admin-user.repository";

type SearchParams = Promise<{
  search?: string;
}>;

interface PageProps {
  searchParams: SearchParams;
}

export default async function AdminUsersPage({
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
            Administrator access is required to manage users.
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

  // =====================================================
  // Search
  // =====================================================

  const params = await searchParams;

  const search =
    typeof params.search === "string"
      ? params.search.trim()
      : "";

  // =====================================================
  // Database
  // =====================================================

  const [users, statistics] =
    await Promise.all([
      findAllUsers({
        search,
        limit: 50,
      }),

      getUserStatistics(),
    ]);

  // =====================================================
  // Page
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            Header
        ================================================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-[#1565d8] hover:underline"
            >
              ← Back to Admin Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              Users Management
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage DealUp users, seller verification,
              trust and risk information.
            </p>
          </div>
        </div>

        {/* =================================================
            Statistics
        ================================================= */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Users */}

          <StatCard
            icon="👥"
            title="Total Users"
            value={statistics.totalUsers}
          />

          {/* Verified Sellers */}

          <StatCard
            icon="🛡️"
            title="Verified Sellers"
            value={statistics.verifiedSellers}
          />

          {/* Pending Sellers */}

          <StatCard
            icon="⏳"
            title="Pending Verification"
            value={statistics.pendingSellers}
          />

          {/* Suspended */}

          <StatCard
            icon="⛔"
            title="Suspended Users"
            value={statistics.suspendedUsers}
          />
        </div>

        {/* =================================================
            Search
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <form
            method="GET"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search by name, email or phone..."
              className="
                h-12
                flex-1
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                text-sm
                outline-none
                transition
                focus:border-[#1565d8]
                focus:ring-2
                focus:ring-blue-100
                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white
                dark:focus:ring-blue-950
              "
            />

            <button
              type="submit"
              className="
                h-12
                rounded-xl
                bg-[#1565d8]
                px-6
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#0f52ba]
              "
            >
              🔍 Search
            </button>

            {search && (
              <Link
                href="/admin/users"
                className="
                  flex
                  h-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-300
                  px-5
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  dark:border-slate-700
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                Clear
              </Link>
            )}
          </form>
        </section>

        {/* =================================================
            Results Header
        ================================================= */}

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {search
                ? `Search Results`
                : "All Users"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {users.length} user
              {users.length === 1
                ? ""
                : "s"} displayed
            </p>
          </div>
        </div>

        {/* =================================================
            Users
        ================================================= */}

        <section className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

          {users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl">
                👤
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                No users found
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try a different name, email or phone number.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">

                {/* =================================================
                    Table Header
                ================================================= */}

                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Seller Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Trust
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Risk
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* =================================================
                    Table Body
                ================================================= */}

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((user: any) => {
                    const sellerStatus =
                      user
                        .sellerVerification
                        ?.status ??
                      "unverified";

                    return (
                      <tr
                        key={user._id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >

                        {/* User */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              {user.image ? (
                                <img
                                  src={user.image}
                                  alt={
                                    user.name ??
                                    "User"
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xl">
                                  👤
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">
                                {user.name ??
                                  "Unknown User"}
                              </p>

                              <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                                ID: {user._id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}

                        <td className="px-6 py-5">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {user.email ??
                              "No email"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {user.phone ||
                              "No phone"}
                          </p>
                        </td>

                        {/* Seller Status */}

                        <td className="px-6 py-5">
                          <SellerStatusBadge
                            status={
                              sellerStatus
                            }
                          />

                          {user
                            .sellerVerification
                            ?.phoneVerified && (
                            <p className="mt-2 text-xs text-green-600">
                              ✓ Phone verified
                            </p>
                          )}
                        </td>

                        {/* Trust */}

                        <td className="px-6 py-5">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {Number(
                                user.trustScore ??
                                  0,
                              )}
                            </span>

                            <span className="ml-2 text-xs text-slate-400">
                              / 100
                            </span>
                          </div>

                          <p className="mt-1 text-xs capitalize text-slate-400">
                            {String(
                              user.trustLevel ??
                                "low",
                            ).replace(
                              "_",
                              " ",
                            )}
                          </p>
                        </td>

                        {/* Risk */}

                        <td className="px-6 py-5">
                          <RiskScore
                            score={
                              Number(
                                user.riskScore ??
                                  0,
                              )
                            }
                          />
                        </td>

                        {/* Action */}

                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/verification/${user._id}`}
                            className="
                              inline-flex
                              items-center
                              rounded-xl
                              bg-blue-50
                              px-4
                              py-2.5
                              text-sm
                              font-semibold
                              text-[#1565d8]
                              transition
                              hover:bg-blue-100
                              dark:bg-blue-950/40
                              dark:text-blue-300
                              dark:hover:bg-blue-950
                            "
                          >
                            Review →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// =====================================================
// Statistics Card
// =====================================================

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="text-3xl">
          {icon}
        </div>

        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </p>
    </div>
  );
}

// =====================================================
// Seller Status Badge
// =====================================================

function SellerStatusBadge({
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
    verified: {
      label: "Verified",
      className:
        "bg-green-100 text-green-700",
    },

    pending: {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-700",
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-100 text-red-700",
    },

    suspended: {
      label: "Suspended",
      className:
        "bg-slate-200 text-slate-700",
    },

    unverified: {
      label: "Unverified",
      className:
        "bg-slate-100 text-slate-500",
    },
  };

  const current =
    config[status] ??
    config.unverified;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

// =====================================================
// Risk Score
// =====================================================

function RiskScore({
  score,
}: {
  score: number;
}) {
  let className =
    "bg-green-100 text-green-700";

  let label = "Low";

  if (score >= 70) {
    className =
      "bg-red-100 text-red-700";

    label = "High";
  } else if (score >= 40) {
    className =
      "bg-yellow-100 text-yellow-700";

    label = "Medium";
  }

  return (
    <div>
      <span
        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${className}`}
      >
        {score} · {label}
      </span>
    </div>
  );
}
