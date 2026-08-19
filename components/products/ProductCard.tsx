"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, IndianRupee } from "lucide-react";

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    price: number;
    location?: {
      city?: string;
    };
    category?: string;
    createdAt?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">

        {/* Image */}

        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={product.thumbnail || "/placeholder-product.jpg"}
            alt={product.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          
        </div>

        {/* Content */}

        <div className="space-y-3 p-4">

          <h3 className="line-clamp-2 min-h-[52px] text-lg font-semibold text-slate-900 dark:text-white">
            {product.title}
          </h3>

          <div className="flex items-center text-primary">
            <IndianRupee className="mr-1 h-5 w-5" />

            <span className="text-2xl font-bold">
              {product.price.toLocaleString("en-IN")}
            </span>
          </div>

          {product.location?.city && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4" />

              <span>{product.location.city}</span>
            </div>
          )}

          {product.createdAt && (
            <p className="text-xs text-slate-400">
              {new Date(product.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}

          <button
            className="mt-2 w-full rounded-xl bg-primary py-3 font-semibold text-white transition hover:opacity-90"
            type="button"
          >
            View Product
          </button>
        </div>
      </article>
    </Link>
  );
}