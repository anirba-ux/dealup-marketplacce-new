
"use client";

import ProductCard from "@/components/card/ProductCard";
import { useWishlistProducts } from "@/hooks/useWishlistProducts";

export default function WishlistGrid() {
  const {
    data: products,
    isLoading,
    error,
  } = useWishlistProducts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[380px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center dark:border-red-900 dark:bg-red-950/30">
        <p className="font-semibold text-red-600 dark:text-red-400">
          Failed to load wishlist.
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Please refresh the page and try again.
        </p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-900 sm:py-12">
        <div className="text-4xl" aria-hidden="true">
          ❤️
        </div>

        <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
          Your product wishlist is empty
        </h3>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Save your favourite products to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product: any) => (
        <div
          key={product._id}
          className="min-w-0 w-full"
        >
          <ProductCard
            id={product._id}
            slug={product.slug}
            title={product.title}
            price={product.price}
            image={product.thumbnail}
            seller={product.sellerName}
            condition={product.condition}
            location={`${product.location.city}, ${product.location.district}`}
            isFeatured={product.isFeatured}
            isPremium={product.isPremium}
            createdAt={product.createdAt}
            views={product.views}
          />
        </div>
      ))}
    </div>
  );
}
