
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/lib/react-query/queryKeys";

async function fetchWishlist() {
  const response = await fetch("/api/wishlist/list", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch wishlist");
  }

  return response.json() as Promise<{
    productIds: string[];
  }>;
}

export function useWishlist() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: queryKeys.wishlist(userId ?? "guest"),
    queryFn: fetchWishlist,
    enabled: status === "authenticated" && Boolean(userId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
