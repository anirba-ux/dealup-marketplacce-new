import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  Eye,
  Heart,
  MapPin,
  Star,
  Zap,
} from "lucide-react";

import { Product } from "@/lib/models/product";

interface SearchResultCardProps {
  product: Product;
}

export default function SearchResultCard({
  product,
}: SearchResultCardProps) {
  const hasDistance =
    "distance" in product &&
    typeof (product as any).distance === "number";

  const image =
    product.images?.[0]?.url || "/placeholder.png";

  const conditionLabel =
    product.condition
      ? product.condition.charAt(0).toUpperCase() +
        product.condition.slice(1)
      : "Used";

  const subcategoryLabel =
    product.subcategory
      ? product.subcategory.charAt(0).toUpperCase() +
        product.subcategory.slice(1)
      : "General";

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-[#1565d8]/40
        hover:shadow-xl

        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      <Link
        href={`/products/${product.slug}`}
        className="
          grid
          grid-cols-1

          md:grid-cols-[220px_1fr]
        "
      >
        {/* =====================================================
            IMAGE
        ===================================================== */}
        <div
          className="
            relative
            h-56
            w-full
            overflow-hidden

            md:h-full
            md:min-h-[250px]
          "
        >
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="
              (max-width: 768px) 100vw,
              220px
            "
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />

          {/* IMAGE OVERLAY */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/35
              via-transparent
              to-transparent
            "
          />

          {/* FEATURED */}
          {product.isFeatured && (
            <span
              className="
                absolute
                left-3
                top-3
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-amber-400
                px-3
                py-1.5
                text-xs
                font-bold
                text-white
                shadow-lg
              "
            >
              ⭐ Featured
            </span>
          )}

          {/* BOOSTED */}
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
                bg-[#1565d8]
                text-white
                shadow-lg
              "
              title="Boosted Ad"
            >
              <Zap className="h-4 w-4" />
            </span>
          )}
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <div
          className="
            flex
            min-w-0
            flex-col
            justify-between
            p-5
            sm:p-6
          "
        >
          <div>
            {/* CATEGORY ROW */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
                  rounded-full
                  bg-blue-50
                  px-3
                  py-1
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-blue-700

                  dark:bg-blue-950/50
                  dark:text-blue-300
                "
              >
                {subcategoryLabel}
              </span>

              {product.isPremium && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    bg-amber-50
                    px-3
                    py-1
                    text-[11px]
                    font-bold
                    text-amber-700

                    dark:bg-amber-950/40
                    dark:text-amber-300
                  "
                >
                  <Star className="h-3 w-3" />
                  Premium
                </span>
              )}
            </div>

            {/* TITLE */}
            <div
              className="
                mt-3
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <h2
                className="
                  line-clamp-2
                  text-xl
                  font-bold
                  leading-tight
                  text-slate-900
                  transition-colors
                  group-hover:text-[#1565d8]

                  dark:text-white

                  sm:text-2xl
                "
              >
                {product.title}
              </h2>

              <ArrowUpRight
                className="
                  mt-1
                  h-5
                  w-5
                  shrink-0
                  text-slate-400
                  transition-all
                  duration-300

                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                  group-hover:text-[#1565d8]
                "
              />
            </div>

            {/* PRICE */}
            <div className="mt-3">
              <span
                className="
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-[#1565d8]

                  sm:text-3xl
                "
              >
                ₹{(product.price ?? 0).toLocaleString("en-IN")}
              </span>
            </div>

            {/* LOCATION */}
            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-2
                text-sm
                text-slate-500

                dark:text-slate-400
              "
            >
              <MapPin
                className="
                  h-4
                  w-4
                  shrink-0
                  text-pink-500
                "
              />

              <span>
                {product.location?.city || "Unknown location"}
              </span>

              {hasDistance && (
                <span
                  className="
                    rounded-full
                    bg-emerald-50
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-emerald-700

                    dark:bg-emerald-950/40
                    dark:text-emerald-300
                  "
                >
                  {(product as any).distance.toFixed(1)} km
                </span>
              )}
            </div>

            {/* TAGS */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className="
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-slate-700

                  dark:bg-slate-800
                  dark:text-slate-300
                "
              >
                {conditionLabel}
              </span>

              {product.negotiable && (
                <span
                  className="
                    rounded-full
                    bg-cyan-50
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-cyan-700

                    dark:bg-cyan-950/40
                    dark:text-cyan-300
                  "
                >
                  Negotiable
                </span>
              )}
            </div>
          </div>

          {/* ===================================================
              FOOTER
          =================================================== */}
          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              justify-between
              gap-4
              border-t
              border-slate-100
              pt-4

              dark:border-slate-800
            "
          >
            {/* STATS */}
            <div
              className="
                flex
                items-center
                gap-4
                text-sm
                text-slate-500

                dark:text-slate-400
              "
            >
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {product.views ?? 0}
              </span>

              <span className="flex items-center gap-1.5">
                <Heart
                  className="
                    h-4
                    w-4
                    text-pink-500
                  "
                />
                {product.favorites ?? 0}
              </span>
            </div>

            {/* CTA */}
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-[#1565d8]
                px-4
                py-2
                text-xs
                font-bold
                text-white
                shadow-sm
                transition-all
                duration-300

                group-hover:bg-[#0f56bd]
                group-hover:shadow-md
              "
            >
              View Product
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}