import Link from "next/link";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardHero from "@/components/dashboard/DashboardHero";
import QuickActions from "@/components/dashboard/QuickActions";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1565d8] via-[#1d4ed8] to-[#0f52ba] py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Welcome Section */}
        <DashboardHero user={session.user as any} />

        <div className="mt-12 rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl">
          {/* User Info Card */}

          <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">
              My Account
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Manage your DealUp profile and marketplace activities.
            </p>
          </div>

          {/* Profile Grid */}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Full Name
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white dark:text-white">
                {session.user.name}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Email Address
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white dark:text-white">
                {session.user.email}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Account Type
              </p>

              <h3 className="mt-2 text-xl font-bold capitalize text-slate-900 dark:text-white dark:text-white">
                {(session.user as any).role}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Verification Status
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white dark:text-white">
                {(session.user as any).isVerified
                  ? "✅ Verified"
                  : "❌ Not Verified"}
              </h3>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
    </main>
  );
}
