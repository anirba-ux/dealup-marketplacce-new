import Image from "next/image";
import Link from "next/link";

import { Eye, Heart, MapPin, Star, Zap } from "lucide-react";

import { Product } from "@/lib/models/product";

interface SearchResultCardProps {
  product: Product;
}

export default function SearchResultCard({ product }: SearchResultCardProps) {
  const hasDistance =
    "distance" in product && typeof (product as any).distance === "number";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="
        group
        flex
        flex-col
        gap-5

        rounded-3xl

        border
        border-slate-200

        bg-white

        p-4

        shadow-sm

        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-[#1565d8]
        hover:shadow-2xl

        dark:border-slate-700
        dark:bg-slate-900

        sm:flex-row
      "
    >
      {/* IMAGE */}
      <div
        className="
          relative
          h-56
          w-full
          overflow-hidden
          rounded-2xl

          sm:h-40
          sm:w-40
          sm:shrink-0
        "
      >
        <Image
          src={product.images?.[0]?.url || "/placeholder.png"}
          alt={product.title}
          fill
          className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />

        {/* Featured Badge */}
        {product.isFeatured && (
          <span
            className="
              absolute
              left-3
              top-3

              rounded-full

              bg-amber-400

              px-3
              py-1

              text-xs
              font-bold
              text-white

              shadow-lg
            "
          >
            ⭐ Featured
          </span>
        )}

        {/* Boosted Badge */}
        {product.isBoosted && (
          <span
            className="
              absolute
              right-3
              top-3

              flex
              h-9
              w-9
              items-center
              justify-center

              rounded-full

              bg-blue-600

              text-white

              shadow-lg
            "
          >
            <Zap size={16} />
          </span>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {/* Title */}
          <h2
            className="
              line-clamp-2
              text-xl
              font-bold
              transition-colors
              group-hover:text-[#1565d8]
              sm:text-2xl
            "
          >
            {product.title}
          </h2>

          {/* Price */}
          <p
            className="
              mt-2
              text-2xl
              font-extrabold
              text-[#1565d8]
              sm:text-3xl
            "
          >
            ₹ {(product.price ?? 0).toLocaleString("en-IN")}
          </p>

          {/* Location */}
          <div
            className="
              mt-3
              flex
              flex-wrap
              items-center
              gap-2
              text-sm
              text-slate-500
            "
          >
            <MapPin size={16} className="text-pink-500" />

            <span>{product.location?.city || "Unknown"}</span>

            {hasDistance && (
              <span
                className="
                  rounded-full
                  bg-green-100
                  px-2
                  py-0.5
                  text-xs
                  font-semibold
                  text-green-700
                "
              >
                {(product as any).distance.toFixed(1)} km
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {/* Condition */}
            <span
              className="
                rounded-full
                bg-blue-50
                px-3
                py-1
                text-xs
                font-semibold
                capitalize
                text-blue-700
              "
            >
              {product.condition.charAt(0).toUpperCase() +
                product.condition.slice(1)}
            </span>

            {/* Subcategory */}
            <span
              className="
                rounded-full
                bg-violet-50
                px-3
                py-1
                text-xs
                font-semibold
                capitalize
                text-violet-700
              "
            >
              {product.subcategory
                ? product.subcategory.charAt(0).toUpperCase() +
                  product.subcategory.slice(1)
                : "General"}
            </span>

            {/* Premium */}
            {product.isPremium && (
              <span
                className="
                  flex
                  items-center
                  gap-1
                  rounded-full
                  bg-yellow-100
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-yellow-700
                "
              >
                <Star size={12} />
                Premium
              </span>
            )}

            {/* Negotiable */}
            {product.negotiable && (
              <span
                className="
                  rounded-full
                  bg-cyan-100
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-cyan-700
                "
              >
                Negotiable
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="
            mt-6
            flex
            flex-wrap
            items-center
            gap-6
            text-sm
            text-slate-500
          "
      >
        <span className="flex items-center gap-1">
          <Eye size={16} />
          {product.views ?? 0}
        </span>

        <span className="flex items-center gap-1">
          <Heart size={16} className="text-pink-500" />
          {product.favorites ?? 0}
        </span>
      </div>
    </Link>
  );
}
