"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "@teispace/next-themes";

export default function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}