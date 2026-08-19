"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistNavButton() {
  const { data } = useWishlist();

  const count = data?.productIds.length ?? 0;

  return (
    <Link
      href="/wishlist"
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition hover:bg-slate-100"
    >
      <Heart
        className={`h-5 w-5 ${
          count > 0 ? "fill-[#1565d8] text-[#1565d8]" : "text-[#1565d8]"
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
