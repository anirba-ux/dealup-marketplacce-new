import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Box,
  ExternalLink,
  Flag,
  Home,
  Package,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

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
    icon: Flag,
    iconClass:
      "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    accent:
      "from-red-500 to-rose-500",
  },

  {
    title: "Users",
    description:
      "Manage DealUp users and account status.",
    href: "/admin/users",
    icon: Users,
    iconClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    accent:
      "from-blue-500 to-cyan-500",
  },

  {
    title: "Products",
    description:
      "Monitor listings and marketplace activity.",
    href: "/admin/products",
    icon: Package,
    iconClass:
      "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    accent:
      "from-orange-500 to-amber-500",
  },

  {
    title: "Verification",
    description:
      "Review seller identity and verification requests.",
    href: "/admin/verification",
    icon: ShieldCheck,
    iconClass:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    accent:
      "from-emerald-500 to-green-500",
  },

  {
    title: "Help Center",
    description:
      "Manage Help Center articles and user feedback.",
    href: "/admin/help/feedback",
    icon: BookOpen,
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
    accent:
      "from-indigo-500 to-violet-500",
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
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* ================================================
          Decorative Background
      ================================================= */}

      <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-96 overflow-hidden">
        <div className="absolute left-[10%] top-[-220px] h-[450px] w-[450px] rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />

        <div className="absolute right-[5%] top-[-200px] h-[400px] w-[400px] rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* ================================================
            Top Navigation
        ================================================= */}

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* ================================================
            Header
        ================================================= */}

        <header className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 shadow-xl shadow-blue-500/10 dark:border-blue-900/50 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950">
          <div className="relative p-6 sm:p-8 lg:p-10">
            {/* Decorative circles */}

            <div className="pointer-events-none absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full bg-white/10 blur-2xl" />

            <div className="pointer-events-none absolute bottom-[-100px] right-[20%] h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur">
                  <BarChart3 className="h-7 w-7" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-blue-100">
                      DealUp Administration
                    </p>

                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/10">
                      Admin
                    </span>
                  </div>

                  <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Admin Dashboard
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                    Manage your marketplace, users,
                    products, reports, verification and
                    Help Center from one place.
                  </p>
                </div>
              </div>

              {/* Admin status */}

              <div className="flex w-fit items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/20">
                  <ShieldCheck className="h-5 w-5 text-emerald-200" />
                </div>

                <div>
                  <p className="text-[11px] text-blue-200">
                    Access level
                  </p>

                  <p className="text-sm font-bold text-white">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ================================================
            Marketplace Overview
        ================================================= */}

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Marketplace Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Live statistics from the DealUp database.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live Data
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStat
              icon={<Users className="h-6 w-6" />}
              title="Total Users"
              value={statistics.totalUsers}
              description="Registered accounts"
              iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
              accentClass="bg-blue-500"
            />

            <DashboardStat
              icon={<Package className="h-6 w-6" />}
              title="Total Products"
              value={statistics.totalProducts}
              description="Marketplace listings"
              iconClass="bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
              accentClass="bg-orange-500"
            />

            <DashboardStat
              icon={<span className="text-xl">●</span>}
              title="Active Products"
              value={statistics.activeProducts}
              description="Currently active listings"
              iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              accentClass="bg-emerald-500"
            />

            <DashboardStat
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Verified Sellers"
              value={statistics.verifiedSellers}
              description="Approved sellers"
              iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
              accentClass="bg-violet-500"
            />

            <DashboardStat
              icon={<span className="text-xl">⌛</span>}
              title="Pending Verification"
              value={statistics.pendingVerification}
              description="Awaiting admin review"
              iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
              accentClass="bg-amber-500"
            />

            <DashboardStat
              icon={<span className="text-xl">−</span>}
              title="Suspended Users"
              value={statistics.suspendedUsers}
              description="Currently suspended"
              iconClass="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              accentClass="bg-rose-500"
            />

            <DashboardStat
              icon={<Flag className="h-6 w-6" />}
              title="Total Reports"
              value={statistics.totalReports}
              description="Product reports"
              iconClass="bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
              accentClass="bg-red-500"
            />

            <DashboardStat
              icon={<Search className="h-6 w-6" />}
              title="Pending Reports"
              value={statistics.pendingReports}
              description="Reports awaiting review"
              iconClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              accentClass="bg-slate-500"
            />
          </div>
        </section>

        {/* ================================================
            Administration
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

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {adminModules.map((module) => {
              const Icon = module.icon;

              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group block"
                >
                  <div className="relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800">
                    {/* Top accent */}

                    <div
                      className={`h-1 bg-gradient-to-r ${module.accent}`}
                    />

                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex h-13 w-13 items-center justify-center rounded-2xl ${module.iconClass} transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </div>

                      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                        {module.title}
                      </h3>

                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {module.description}
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#1565d8] transition-all duration-300 group-hover:gap-3 dark:text-blue-400">
                        Open Module
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ================================================
            Footer
        ================================================= */}

        <footer className="mt-10 border-t border-slate-200 py-6 dark:border-slate-800">
          <div className="flex flex-col items-center justify-between gap-2 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
            <p>
              DealUp Administration · Admin Dashboard
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 transition hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Home className="h-3.5 w-3.5" />
              Back to DealUp
            </Link>
          </div>
        </footer>
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
  iconClass,
  accentClass,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  iconClass: string;
  accentClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      {/* Accent line */}

      <div
        className={`absolute inset-x-0 top-0 h-1 ${accentClass}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass} transition-transform duration-300 group-hover:scale-110`}
        >
          {icon}
        </div>

        <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value.toLocaleString("en-IN")}
        </p>
      </div>

      <h3 className="mt-5 text-sm font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}