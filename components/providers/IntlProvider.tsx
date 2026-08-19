import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";

type Props = {
  children: React.ReactNode;
};

export default async function IntlProvider({
  children,
}: Props) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}