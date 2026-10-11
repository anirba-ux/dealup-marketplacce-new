
"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCallback, useEffect, useState } from "react";

const SAVED_LISTINGS_EVENT = "dealup:saved-listings-updated";

const LISTING_TYPES = ["job", "service", "business"] as const;

export default function WishlistNavButton() {
  const { data } = useWishlist();
  const [savedListingCount, setSavedListingCount] = useState(0);

  const refreshSavedListingCount = useCallback(async () => {
    try {
      const results = await Promise.all(
        LISTING_TYPES.map(async (type) => {
          const response = await fetch(
            `/api/saved-listings?type=${type}`,
            { cache: "no-store" },
          );

          if (!response.ok) {
            throw new Error(`Unable to load saved ${type} listings`);
          }

          const result = await response.json();

          return Array.isArray(result.listingIds)
            ? result.listingIds.length
            : 0;
        }),
      );

      setSavedListingCount(
        results.reduce((total, count) => total + count, 0),
      );
    } catch (error) {
      console.error("Unable to refresh saved listings count:", error);
    }
  }, []);

  useEffect(() => {
    void refreshSavedListingCount();

    window.addEventListener(
      SAVED_LISTINGS_EVENT,
      refreshSavedListingCount,
    );

    return () => {
      window.removeEventListener(
        SAVED_LISTINGS_EVENT,
        refreshSavedListingCount,
      );
    };
  }, [refreshSavedListingCount]);

  const productCount = data?.productIds.length ?? 0;
  const count = productCount + savedListingCount;

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist${count > 0 ? `, ${count} saved items` : ""}`}
      title="Wishlist"
      className="relative -translate-y-1 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
    >
      <Heart
        className={`h-5 w-5 ${
          count > 0
            ? "fill-[#1565d8] text-[#1565d8]"
            : "text-[#1565d8]"
        }`}
      />

      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
