"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";

async function fetchWishlist() {
  const response = await fetch("/api/wishlist/list", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch wishlist");
  }

  return response.json();
}

export function useWishlist() {
  return useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: fetchWishlist,
    staleTime: 0,
    refetchOnMount: "always",
  });
}