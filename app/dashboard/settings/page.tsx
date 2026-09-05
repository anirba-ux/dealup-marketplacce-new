import Link from "next/link";
import { Home, Settings } from "lucide-react";

import BackButton from "@/components/ui/BackButton";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <BackButton />

        <Link
          href="/"
          className="
            inline-flex items-center gap-2 rounded-xl border border-slate-200
            bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm
            transition hover:border-blue-500 hover:text-blue-600
            dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200
            dark:hover:border-blue-400 dark:hover:text-blue-400
            sm:px-4
          "
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8 flex items-center gap-4">
        <div
          className="
            rounded-2xl bg-blue-100 p-4
            dark:bg-blue-950/40
          "
        >
          <Settings className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>

        <div>
          <h1
            className="
              text-2xl font-bold text-slate-900
              dark:text-white
              sm:text-3xl
            "
          >
            Account Settings
          </h1>

          <p
            className="
              text-sm text-slate-500
              dark:text-slate-400
              sm:text-base
            "
          >
            Manage your profile and account preferences.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <ProfileSettingsForm />
    </main>
  );
}