import { cookies } from "next/headers";
import { defaultLocale, Locale, locales } from "./i18n";

const COOKIE_NAME = "dealup-language";

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();

  const locale = cookieStore.get(COOKIE_NAME)?.value;

  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale;
  }

  return defaultLocale;
}