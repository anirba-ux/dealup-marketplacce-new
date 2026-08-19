"use client";

import ProductCard from "@/components/card/ProductCard";
import { useWishlistProducts } from "@/hooks/useWishlistProducts";

export default function WishlistGrid() {
  const { data: products, isLoading, error } = useWishlistProducts();

 

  if (isLoading) {
    return <div className="py-10 text-center">Loading wishlist...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        Failed to load wishlist.
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center">
        <h2 className="text-xl font-semibold">❤️ Your wishlist is empty</h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">Save products to see them here.</p>
      </div>
    );
  }

  

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product: any) => {
        
        return (
          <ProductCard
            key={product._id}
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
        );
      })}
    </div>
  );
}
