import IntlProvider from "@/components/providers/IntlProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

import { Toaster } from "sonner";

import { auth } from "@/auth";

import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DealUp Marketplace",
    template: "%s | DealUp",
  },

  description:
    "Buy and Sell Products Safely with DealUp Marketplace.",

  keywords: [
    "DealUp",
    "Marketplace",
    "Buy",
    "Sell",
    "Next.js",
    "React",
    "Local Marketplace",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // =====================================
  // Get Server Session
  // =====================================

  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider session={session}>
            <ThemeProvider>
              <IntlProvider>
                {children}

                <Toaster
                  position="top-right"
                  richColors
                  closeButton
                />
              </IntlProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}