"use server";

import { cookies } from "next/headers";
import { hasLocale } from "next-intl";

import { defaultLocale, locales, type Locale } from "./i18n";

export async function setLocale(locale: string) {
  if (!hasLocale(locales, locale)) {
    locale = defaultLocale;
  }

  const cookieStore = await cookies();

  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();

  const locale = cookieStore.get("NEXT_LOCALE")?.value;

  if (locale && hasLocale(locales, locale)) {
    return locale;
  }

  return defaultLocale;
}