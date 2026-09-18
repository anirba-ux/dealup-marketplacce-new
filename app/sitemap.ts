import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.dealupmarketplace.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://www.dealupmarketplace.com/search",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}