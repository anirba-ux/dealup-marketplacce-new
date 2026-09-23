import IntlProvider from "@/components/providers/IntlProvider";
import Script from "next/script";
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

const SITE_URL = "https://www.dealupmarketplace.com";

// =====================================================
// SEO METADATA
// =====================================================

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

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
      url: SITE_URL,
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
    url: SITE_URL,
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

// =====================================================
// ORGANIZATION JSON-LD
// =====================================================

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineMarketplace",

  "@id": `${SITE_URL}/#organization`,

  name: "DealUp Marketplace",

  url: SITE_URL,

  logo: `${SITE_URL}/dealup-logo.png`,

  description:
    "DealUp Marketplace is a local online marketplace to buy and sell new and used products safely across India.",
};

// =====================================================
// WEBSITE JSON-LD
// =====================================================

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",

  "@id": `${SITE_URL}/#website`,

  name: "DealUp Marketplace",

  url: SITE_URL,

  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
};

// =====================================================
// ROOT LAYOUT
// =====================================================

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ===================================================
  // Get Server Session
  // ===================================================

  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* =================================================
            GOOGLE ANALYTICS 4
            Measurement ID: G-P8WH1B832S
        ================================================= */}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P8WH1B832S"
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            gtag('js', new Date());

            gtag('config', 'G-P8WH1B832S');
          `}
        </Script>

        {/* =================================================
            ORGANIZATION JSON-LD
        ================================================= */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        {/* =================================================
            WEBSITE JSON-LD
        ================================================= */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>

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

                {/* =================================================
                    TOAST NOTIFICATIONS
                ================================================= */}

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