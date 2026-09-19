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
  metadataBase: new URL("https://www.dealupmarketplace.com"),

  title: {
    default: "DealUp Marketplace | Buy & Sell Locally in India",
    template: "%s | DealUp Marketplace",
  },

  description:
    "DealUp Marketplace is a local online marketplace to buy and sell new and used products safely. Discover products from sellers near you across Bansberia, Hooghly and nearby areas.",

  applicationName: "DealUp Marketplace",

  authors: [
    {
      name: "DealUp Marketplace",
      url: "https://www.dealupmarketplace.com",
    },
  ],

  creator: "DealUp Marketplace",
  publisher: "DealUp Marketplace",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.dealupmarketplace.com",
    siteName: "DealUp Marketplace",
    title: "DealUp Marketplace | Buy & Sell Locally in India",
    description:
      "Buy and sell new and used products locally with DealUp Marketplace. Discover products from sellers near you.",
  },

  twitter: {
    card: "summary_large_image",
    title: "DealUp Marketplace | Buy & Sell Locally in India",
    description:
      "Buy and sell new and used products locally with DealUp Marketplace.",
  },

  category: "shopping",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          antialiased
          bg-background
          text-foreground
        `}
      >
        <QueryProvider>
          <AuthProvider session={session}>
            <ThemeProvider>
              <IntlProvider>
                {children}

                <Toaster position="top-right" richColors closeButton />
              </IntlProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
