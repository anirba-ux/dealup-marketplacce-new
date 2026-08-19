"use client";

import { useSession } from "next-auth/react";
import { useWishlist } from "@/hooks/useWishlist";
import { useWishlistProducts } from "@/hooks/useWishlistProducts";

export default function DebugPage() {
  const { data: session, status } = useSession();

  const wishlist = useWishlist();

  const wishlistProducts = useWishlistProducts();

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">
        DealUp Wishlist Debug
      </h1>

      {/* Session */}

      <div className="border rounded-xl p-4">
        <h2 className="font-bold mb-2">Session</h2>

        <pre className="text-sm overflow-auto">
          {JSON.stringify(
            {
              status,
              session,
            },
            null,
            2
          )}
        </pre>
      </div>

      {/* Wishlist IDs */}

      <div className="border rounded-xl p-4">
        <h2 className="font-bold mb-2">
          Wishlist IDs
        </h2>

        <pre className="text-sm overflow-auto">
          {JSON.stringify(wishlist.data, null, 2)}
        </pre>
      </div>

      {/* Wishlist Products */}

      <div className="border rounded-xl p-4">
        <h2 className="font-bold mb-2">
          Wishlist Products
        </h2>

        <pre className="text-sm overflow-auto">
          {JSON.stringify(
            wishlistProducts.data,
            null,
            2
          )}
        </pre>
      </div>

      {/* Query Status */}

      <div className="border rounded-xl p-4">
        <h2 className="font-bold mb-2">
          Query Status
        </h2>

        <pre className="text-sm overflow-auto">
          {JSON.stringify(
            {
              wishlistStatus: wishlist.status,
              wishlistProductsStatus:
                wishlistProducts.status,
              wishlistFetching:
                wishlist.isFetching,
              wishlistProductsFetching:
                wishlistProducts.isFetching,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}