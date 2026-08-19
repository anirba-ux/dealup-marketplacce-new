"use client";

import Image from "next/image";

import { Heart, MapPin, Star, Zap } from "lucide-react";

import { Product } from "@/lib/models/product";

interface SearchSuggestionCardProps {
  product: Product;
  selected: boolean;
  onClick: () => void;
}

export default function SearchSuggestionCard({
  product,
  selected,
  onClick,
}: SearchSuggestionCardProps) {
  const hasDistance =
    "distance" in product && typeof (product as any).distance === "number";

  return (
    <div
      onClick={onClick}
      className={`
        group
        cursor-pointer

        border-b
        border-slate-200

        p-4

        transition-all
        duration-300

        last:border-0

        ${
          selected
            ? "bg-blue-50 dark:bg-slate-800"
            : "hover:bg-slate-50 dark:hover:bg-slate-800"
        }
      `}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div
          className="
            relative
            h-24
            w-24
            shrink-0
            overflow-hidden
            rounded-2xl
          "
        >
          <Image
            src={product.images?.[0]?.url ?? "/placeholder.png"}
            alt={product.title}
            fill
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-110
            "
          />

          {/* Featured */}
          {product.isFeatured && (
            <span
              className="
                absolute
                left-2
                top-2

                rounded-full

                bg-amber-400

                px-2
                py-0.5

                text-[10px]
                font-bold

                text-white

                shadow-md
              "
            >
              ⭐ Featured
            </span>
          )}

          {/* Boosted */}
          {product.isBoosted && (
            <div
              className="
      absolute
      right-2
      top-2

      flex
      h-4
      w-5
      items-center
      justify-center

      rounded-full

      bg-yellow-400

      shadow-lg
      ring-2
      ring-white
    "
            >
              🚀
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between">
          {/* Title */}
          <h3
            className="
              line-clamp-1
              text-base
              font-bold
              transition-colors
              group-hover:text-[#1565d8]
            "
          >
            {product.title}
          </h3>

          {/* Price */}
          <p className="mt-1 text-lg font-extrabold text-[#1565d8]">
            ₹ {(product.price ?? 0).toLocaleString("en-IN")}
          </p>

          {/* Location */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <MapPin size={14} className="text-pink-500" />

            <span>{product.location?.city || "Unknown"}</span>

            {hasDistance && (
              <span
                className="
                  rounded-full
                  bg-green-100
                  px-2
                  py-0.5
                  text-[10px]
                  font-semibold
                  text-green-700
                "
              >
                {(product as any).distance.toFixed(1)} km
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className="
                rounded-full
                bg-blue-50
                px-2.5
                py-1
                text-[11px]
                font-semibold
                capitalize
                text-blue-700
              "
            >
              {product.condition
                ? product.condition.charAt(0).toUpperCase() +
                  product.condition.slice(1)
                : "Used"}
            </span>

            <span
              className="
                rounded-full
                bg-violet-50
                px-2.5
                py-1
                text-[11px]
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

            {product.isPremium && (
              <span
                className="
                  flex
                  items-center
                  gap-1
                  rounded-full
                  bg-yellow-100
                  px-2.5
                  py-1
                  text-[11px]
                  font-semibold
                  text-yellow-700
                "
              >
                <Star size={10} />
                Premium
              </span>
            )}
          </div>
          {/* Footer */}
          <div
            className="
              mt-4
              flex
              items-center
              justify-between
            "
          >
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Heart size={14} className="text-pink-500" />
                {product.favorites ?? 0}
              </span>
            </div>

            <span
              className="
                text-xs
                font-semibold
                text-[#1565d8]
                transition-colors
                group-hover:text-[#0f52ba]
              "
            >
              View →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
