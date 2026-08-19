"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useWishlist } from "@/hooks/useWishlist";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { wishlistChannel } from "@/lib/broadcast";

interface WishlistButtonProps {
  productId: string;
  onRemoved?: () => void;
}

export default function WishlistButton({
  productId,
  onRemoved,
}: WishlistButtonProps) {
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const { data } = useWishlist();

  const wishlisted = data?.productIds?.includes(productId) ?? false;

  async function handleWishlist(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    try {
      setLoading(true);

      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update wishlist");
      }

      const result = await response.json();

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.wishlist,
        }),

        queryClient.invalidateQueries({
          queryKey: queryKeys.wishlistProducts,
        }),
      ]);

      wishlistChannel.postMessage({
        type: "wishlist-updated",
      });

      if (!result.wishlisted) {
        onRemoved?.();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={loading}
      className="absolute right-4 top-4 rounded-full bg-white dark:bg-slate-900/90 p-2 shadow-lg backdrop-blur transition hover:scale-110 disabled:opacity-50"
    >
      <Heart
        size={18}
        className={wishlisted ? "fill-red-500 text-red-500" : "text-slate-500 dark:text-slate-400"}
      />
    </button>
  );
}
