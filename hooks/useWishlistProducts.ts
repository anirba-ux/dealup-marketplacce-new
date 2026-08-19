"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";


async function fetchWishlistProducts() {
  const response = await fetch("/api/wishlist/products", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch wishlist products");
  }

  return response.json();
}

export function useWishlistProducts() {
  return useQuery({
    queryKey: queryKeys.wishlistProducts,
    queryFn: fetchWishlistProducts,
    staleTime: 0,
    refetchOnMount: "always",
  });
}