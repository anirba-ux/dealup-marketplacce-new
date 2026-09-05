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
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}