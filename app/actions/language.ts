"use server";

import { cookies } from "next/headers";
import { Locale, locales } from "@/lib/i18n";

const COOKIE_NAME = "dealup-language";

export async function setUserLocale(locale: Locale) {
  if (!locales.includes(locale)) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}