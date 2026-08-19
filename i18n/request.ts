import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { hasLocale } from "next-intl";

import { defaultLocale, locales } from "@/lib/i18n";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();

  let locale = cookieStore.get("NEXT_LOCALE")?.value;

  if (!locale || !hasLocale(locales, locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});