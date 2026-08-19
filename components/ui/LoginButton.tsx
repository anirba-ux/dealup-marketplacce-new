"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function LoginButton() {
  const { data: session, status } = useSession();

  const t = useTranslations("common");

  if (status === "loading") {
    return (
      <button
        disabled
        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-400"
      >
        {t("loading")}
      </button>
    );
  }

  // User Logged In
  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-medium text-slate-700">
          {t("hi")}, {session.user.name}
        </span>

        <button
          onClick={() =>
            signOut({
              callbackUrl: "/login",
            })
          }
          className="rounded-lg border border-red-500 px-4 py-2 font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
        >
          {t("logout")}
        </button>
      </div>
    );
  }

  // User Not Logged In
  return (
    <Link
      href="/login"
      className="rounded-lg border border-[#1565d8] px-4 py-2 font-medium text-[#1565d8] transition-colors hover:bg-[#1565d8] hover:text-white"
    >
      {t("login")}
    </Link>
  );
}