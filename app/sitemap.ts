import type { MetadataRoute } from "next";

import { findActiveProductsForSitemap } from "@/lib/repositories/product.repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.dealupmarketplace.com";

  // Static SEO pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/local-marketplace`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // City landing pages
    ...[
      "bansberia",
      "hooghly",
      "chinsurah",
      "tribeni",
      "kalyani",
      "kolkata",
      "serampore",
      "chandannagar",
    ].map((city) => ({
      url: `${baseUrl}/local-marketplace/${city}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  // Active product pages
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const products = await findActiveProductsForSitemap();

    productPages = products
      .filter((product) => product.slug)
      .map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified:
          product.updatedAt ?? product.createdAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.error("[SITEMAP] Failed to load product URLs:", error);

    // Keep static sitemap available even if MongoDB is temporarily unavailable.
    productPages = [];
  }

  return [...staticPages, ...productPages];
}