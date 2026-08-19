import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { getAdminDashboardStatistics } from "@/lib/repositories/admin-dashboard.repository";

// =====================================================
// Admin Modules
// =====================================================

const adminModules = [
  {
    title: "Reports",
    description:
      "Review product reports and moderation requests.",
    href: "/admin/reports",
    icon: "🚩",
    className:
      "bg-red-100 dark:bg-red-950",
  },

  {
    title: "Users",
    description:
      "Manage DealUp users and account status.",
    href: "/admin/users",
    icon: "👥",
    className:
      "bg-blue-100 dark:bg-blue-950",
  },

  {
    title: "Products",
    description:
      "Monitor listings and marketplace activity.",
    href: "/admin/products",
    icon: "📦",
    className:
      "bg-orange-100 dark:bg-orange-950",
  },

  {
    title: "Verification",
    description:
      "Review seller identity and verification requests.",
    href: "/admin/verification",
    icon: "🛡️",
    className:
      "bg-green-100 dark:bg-green-950",
  },
];

// =====================================================
// Admin Dashboard
// =====================================================

export default async function AdminPage() {
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
            You do not have permission to access the
            DealUp Admin Dashboard.
          </p>

          <p className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Admin access is required.
          </p>
        </div>
      </main>
    );
  }

  // ===================================================
  // Dashboard Statistics
  // ===================================================

  const statistics =
    await getAdminDashboardStatistics();

  // ===================================================
  // Dashboard
  // ===================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            Header
        ================================================= */}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">

          <p className="text-sm font-semibold text-[#1565d8]">
            DealUp Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Manage reports, users, products and seller
            verification from one place.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
            🛡️ Administrator
          </div>
        </div>

        {/* =================================================
            Live Statistics
        ================================================= */}

        <section className="mt-8">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Marketplace Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Live statistics from the DealUp database.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* Total Users */}

            <DashboardStat
              icon="👥"
              title="Total Users"
              value={
                statistics.totalUsers
              }
              description="Registered accounts"
              className="bg-blue-50 dark:bg-blue-950/30"
            />

            {/* Total Products */}

            <DashboardStat
              icon="📦"
              title="Total Products"
              value={
                statistics.totalProducts
              }
              description="Marketplace listings"
              className="bg-orange-50 dark:bg-orange-950/30"
            />

            {/* Active Products */}

            <DashboardStat
              icon="🟢"
              title="Active Products"
              value={
                statistics.activeProducts
              }
              description="Currently active listings"
              className="bg-green-50 dark:bg-green-950/30"
            />

            {/* Verified Sellers */}

            <DashboardStat
              icon="🛡️"
              title="Verified Sellers"
              value={
                statistics.verifiedSellers
              }
              description="Approved sellers"
              className="bg-purple-50 dark:bg-purple-950/30"
            />

            {/* Pending Verification */}

            <DashboardStat
              icon="⏳"
              title="Pending Verification"
              value={
                statistics.pendingVerification
              }
              description="Awaiting admin review"
              className="bg-yellow-50 dark:bg-yellow-950/30"
            />

            {/* Suspended Users */}

            <DashboardStat
              icon="⛔"
              title="Suspended Users"
              value={
                statistics.suspendedUsers
              }
              description="Currently suspended"
              className="bg-red-50 dark:bg-red-950/30"
            />

            {/* Total Reports */}

            <DashboardStat
              icon="🚩"
              title="Total Reports"
              value={
                statistics.totalReports
              }
              description="Product reports"
              className="bg-red-50 dark:bg-red-950/30"
            />

            {/* Pending Reports */}

            <DashboardStat
              icon="🔎"
              title="Pending Reports"
              value={
                statistics.pendingReports
              }
              description="Reports awaiting review"
              className="bg-slate-100 dark:bg-slate-800"
            />
          </div>
        </section>

        {/* =================================================
            Admin Modules
        ================================================= */}

        <section className="mt-10">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Administration
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage the main DealUp administration areas.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {adminModules.map(
              (module) => (
                <Link
                  key={
                    module.title
                  }
                  href={
                    module.href
                  }
                  className="group block"
                >
                  <div
                    className="
                      h-full
                      rounded-3xl
                      border
                      border-slate-200
                      bg-white
                      p-6
                      shadow-sm

                      transition-all
                      duration-300

                      hover:-translate-y-1
                      hover:border-[#1565d8]
                      hover:shadow-xl

                      dark:border-slate-700
                      dark:bg-slate-900
                    "
                  >

                    {/* Icon */}

                    <div
                      className={`
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        text-2xl
                        transition-transform
                        duration-300
                        group-hover:scale-110
                        ${module.className}
                      `}
                    >
                      {
                        module.icon
                      }
                    </div>

                    {/* Title */}

                    <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                      {
                        module.title
                      }
                    </h2>

                    {/* Description */}

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {
                        module.description
                      }
                    </p>

                    {/* Open */}

                    <div className="mt-5 text-sm font-semibold text-[#1565d8]">
                      Open →
                    </div>
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>

      </div>
    </main>
  );
}

// =====================================================
// Dashboard Statistic Card
// =====================================================

function DashboardStat({
  icon,
  title,
  value,
  description,
  className,
}: {
  icon: string;
  title: string;
  value: number;
  description: string;
  className: string;
}) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        transition
        hover:-translate-y-1
        hover:shadow-md
        dark:border-slate-700
        dark:bg-slate-900
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-4">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-slate-900">
          {icon}
        </div>

        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {value.toLocaleString(
            "en-IN",
          )}
        </p>
      </div>

      <h3 className="mt-5 text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}