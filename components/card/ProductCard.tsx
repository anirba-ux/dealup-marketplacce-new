import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

import { Heart, MapPin, ShieldCheck } from "lucide-react";
import WishlistButton from "@/components/wishlist/WishlistButton";

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  location: string;
  image: string;
  seller: string;
  sellerIsPhoneVerified?: boolean;
  condition: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  isBoosted?: boolean;
  createdAt: Date | string;
  views: number;

  distance?: number;

  onWishlistRemoved?: () => void;
}

export default function ProductCard({
  id,
  slug,
  title,
  price,
  location,
  image,
  seller,
  sellerIsPhoneVerified,
  condition,
  isFeatured,
  isPremium,
  isBoosted,
  createdAt,
  views,
  distance,
  onWishlistRemoved,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Image */}

      <div className="relative h-64 overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-110"
        />

        {/* Wishlist */}

        <WishlistButton productId={id} onRemoved={onWishlistRemoved} />

        {/* Featured */}

        {isFeatured && (
          <div className="absolute left-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-white">
            ⭐ Featured
          </div>
        )}

        {/* Boosted */}

        {isBoosted && (
          <div className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            🚀 Boosted
          </div>
        )}

        {/* Premium */}

        {isPremium && (
          <div className="absolute bottom-4 left-4 rounded-full bg-[#1565d8] px-3 py-1 text-xs font-bold text-white">
            Premium
          </div>
        )}
      </div>

      {/* Content */}

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-white  dark:text-white transition-colors group-hover:text-[#1565d8]">
          {title}
        </h3>

        <p className="mt-3 text-3xl font-extrabold text-[#1565d8]">
          ₹ {price.toLocaleString("en-IN")}
        </p>

        {/* Seller */}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Seller
            </p>

            <p className="font-semibold text-slate-700">{seller}</p>
          </div>

          <div className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 px-3 py-1 text-sm font-medium capitalize text-slate-600">
            {condition}
          </div>
        </div>

        {/* Location */}

        <div className="mt-5 flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <MapPin size={18} className="text-[#1565d8]" />

          <span>{location}</span>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          🕒 Posted{" "}
          {formatDistanceToNow(new Date(createdAt), {
            addSuffix: true,
          })}
        </p>

        <div className="mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>👁 {(views ?? 0).toLocaleString("en-IN")} Views</span>
        </div>

        {distance !== undefined && (
          <div className="mt-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#1565d8]">
              📍 {distance.toFixed(2)} KM Away
            </span>
          </div>
        )}

        {/* Verified */}

        {/* Phone Verified */}

        {sellerIsPhoneVerified === true && (
          <div className="mt-4 flex items-center">
            <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5">
              <span className="text-sm">📞</span>

              <span className="text-xs font-semibold text-blue-700">
                Phone Verified
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
