import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DealUp Marketplace",
    short_name: "DealUp",
    description:
      "Buy and sell products on DealUp Marketplace.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1565d8",
    orientation: "portrait",

    icons: [
      {
        src: "/icons/dealup-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/dealup-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}