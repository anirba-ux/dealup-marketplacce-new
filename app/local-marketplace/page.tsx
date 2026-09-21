import type { Metadata } from "next";

import LocalMarketplaceClient from "@/components/local-marketplace/LocalMarketplaceClient";

const pageUrl =
  "https://www.dealupmarketplace.com/local-marketplace";

export const metadata: Metadata = {
  title: "Local Marketplace | Buy & Sell Locally",
  description:
    "Discover local products and connect with nearby buyers and sellers across Bansberia, Hooghly, Chinsurah, Tribeni, Kalyani and nearby areas.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    type: "website",
    url: pageUrl,
    siteName: "DealUp Marketplace",
    locale: "en_IN",
    title: "Local Marketplace | Buy & Sell Locally",
    description:
      "Discover local products and connect with nearby buyers and sellers across Bansberia, Hooghly, Chinsurah, Tribeni, Kalyani and nearby areas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Local Marketplace | Buy & Sell Locally",
    description:
      "Discover local products and connect with nearby buyers and sellers across Bansberia, Hooghly, Chinsurah, Tribeni, Kalyani and nearby areas.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${pageUrl}#webpage`,
  url: pageUrl,
  name: "Local Marketplace | Buy & Sell Locally",
  description:
    "Discover local products and connect with nearby buyers and sellers across Bansberia, Hooghly, Chinsurah, Tribeni, Kalyani and nearby areas.",
  isPartOf: {
    "@id": "https://www.dealupmarketplace.com/#website",
  },
  about: {
    "@id": "https://www.dealupmarketplace.com/#organization",
  },
};

export default function LocalMarketplacePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd),
        }}
      />

      <LocalMarketplaceClient />
    </>
  );
}