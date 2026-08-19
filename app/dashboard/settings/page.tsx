import { Settings } from "lucide-react";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">

      <div className="mb-8 flex items-center gap-4">
        <div className="rounded-2xl bg-blue-100 p-4">
          <Settings className="h-7 w-7 text-blue-600" />
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            Account Settings
          </h1>

          <p className="text-slate-500 dark:text-slate-400">
            Manage your profile and account preferences.
          </p>
        </div>
      </div>

      <ProfileSettingsForm />

    </main>
  );
}