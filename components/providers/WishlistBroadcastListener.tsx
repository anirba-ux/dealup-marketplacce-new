"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { wishlistChannel } from "@/lib/broadcast";
import { queryKeys } from "@/lib/react-query/queryKeys";

export default function WishlistBroadcastListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type !== "wishlist-updated") return;

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.wishlist,
        }),

        queryClient.invalidateQueries({
          queryKey: queryKeys.wishlistProducts,
        }),
      ]);
    };

    wishlistChannel.addEventListener("message", handleMessage);

    return () => {
      wishlistChannel.removeEventListener("message", handleMessage);
    };
  }, [queryClient]);

  return null;
}