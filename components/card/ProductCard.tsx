import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

import {
  MapPin,
  ShieldCheck,
  BadgeCheck,
  Star,
  Gem,
  Rocket,
} from "lucide-react";

import WishlistButton from "@/components/wishlist/WishlistButton";

// =========================================================
// SELLER BADGE
// =========================================================

interface SellerBadge {
  label?: string;
  name?: string;
  type?: string;
  badge?: string;
}

// =========================================================
// PRODUCT CARD PROPS
// =========================================================

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  location: string;
  image: string;
  seller: string;

  // Phone verification
  sellerIsPhoneVerified?: boolean;

  // Seller verification
  sellerVerificationStatus?: string;

  // Premium seller
  sellerPremiumSeller?: boolean;
  sellerPremiumBadge?: boolean;

  // Backend seller badge
  sellerBadge?: SellerBadge | string | null;

  // Product
  condition: string;
  isFeatured?: boolean;
  isPremium?: boolean;
  isBoosted?: boolean;

  createdAt: Date | string;

  views: number;

  distance?: number;

  onWishlistRemoved?: () => void;
}

// =========================================================
// PRODUCT CARD
// =========================================================

export default function ProductCard({
  id,
  slug,
  title,
  price,
  location,
  image,
  seller,

  sellerIsPhoneVerified,
  sellerVerificationStatus,

  sellerPremiumSeller,
  sellerPremiumBadge,

  sellerBadge,

  condition,

  isFeatured,
  isPremium,
  isBoosted,

  createdAt,
  views,

  distance,

  onWishlistRemoved,
}: ProductCardProps) {
  // =======================================================
  // NORMALIZE SELLER BADGE
  // =======================================================

  const sellerBadgeType =
    typeof sellerBadge === "string"
      ? sellerBadge
      : sellerBadge?.type ??
        sellerBadge?.badge ??
        "none";

  // =======================================================
  // SELLER BADGE STATES
  // =======================================================

  const isTrustedSeller =
    sellerBadgeType === "trusted";

  const isVerifiedSeller =
    sellerBadgeType === "verified" ||
    sellerBadgeType === "trusted";

  // =======================================================
  // PHONE VERIFIED
  // =======================================================

  const hasPhoneBadge =
    sellerIsPhoneVerified === true;

  // =======================================================
  // PREMIUM SELLER
  // =======================================================

  const hasPremiumBadge =
    sellerPremiumSeller === true &&
    sellerPremiumBadge === true;

  // =======================================================
  // BADGE SECTION
  // =======================================================

  const showBadgeSection =
    isVerifiedSeller ||
    hasPhoneBadge;

  // =======================================================
  // RETURN
  // =======================================================

  return (
    <Link
      href={`/products/${slug}`}
      className="
        group
        block
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        dark:border-slate-700
        dark:bg-slate-900
        sm:rounded-3xl
        sm:hover:-translate-y-2
      "
    >
      {/* ===================================================
          IMAGE
      =================================================== */}

      <div
        className="
          relative
          aspect-[4/3]
          overflow-hidden
          bg-slate-100
          dark:bg-slate-800
          sm:aspect-[16/11]
        "
      >
        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        <Image
          src={
            image ||
            "/placeholder-product.jpg"
          }
          alt={title}
          fill
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            25vw
          "
          className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-[1.04]
          "
        />

        {/* Subtle image overlay */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/25
            via-transparent
            to-black/5
          "
        />

        {/* =================================================
            TRUSTED SELLER
        ================================================= */}

        {isTrustedSeller && (
          <div
            className="
              absolute
              left-3
              top-3
              z-30
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-amber-500
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-white
              shadow-lg
              sm:left-4
              sm:top-4
              sm:gap-1.5
              sm:px-3
              sm:py-1.5
              sm:text-xs
            "
          >
            <Star
              size={12}
              strokeWidth={2.8}
              fill="white"
            />

            <span>Trusted</span>
          </div>
        )}

        {/* =================================================
            BOOSTED
        ================================================= */}

        {isBoosted && (
          <div
            className={`
              absolute
              left-3
              z-30
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-amber-500
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-white
              shadow-lg
              sm:left-4
              sm:gap-1.5
              sm:px-3
              sm:py-1.5
              sm:text-xs
              ${
                isTrustedSeller
                  ? "top-10 sm:top-12"
                  : "top-3 sm:top-4"
              }
            `}
          >
            <Rocket
              size={12}
              strokeWidth={2.5}
            />

            <span>Boosted</span>
          </div>
        )}

        {/* =================================================
            WISHLIST
        ================================================= */}

        <WishlistButton
          productId={id}
          onRemoved={onWishlistRemoved}
        />

        {/* =================================================
            PREMIUM SELLER
        ================================================= */}

        {hasPremiumBadge && (
          <div
            className="
              absolute
              bottom-3
              left-3
              z-30
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-gradient-to-r
              from-blue-500
              to-[#1565d8]
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-white
              shadow-lg
              ring-1
              ring-white/30
              sm:bottom-4
              sm:left-4
              sm:gap-1.5
              sm:px-3
              sm:py-1.5
              sm:text-xs
            "
          >
            <Gem
              size={13}
              strokeWidth={2.8}
            />

            <span>Premium</span>
          </div>
        )}

        {/* =================================================
            FEATURED
        ================================================= */}

        {isFeatured && (
          <div
            className={`
              absolute
              left-3
              z-30
              inline-flex
              items-center
              gap-1
              rounded-full
              border
              border-blue-100
              bg-white/95
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-[#1565d8]
              shadow-md
              backdrop-blur-sm
              sm:left-4
              sm:gap-1.5
              sm:px-3
              sm:py-1.5
              sm:text-xs
              ${
                hasPremiumBadge
                  ? "bottom-10 sm:bottom-12"
                  : "bottom-3 sm:bottom-4"
              }
            `}
          >
            <Star
              size={12}
              strokeWidth={2.5}
              fill="#1565d8"
            />

            <span>Featured</span>
          </div>
        )}

        {/* =================================================
            PRODUCT PREMIUM
        ================================================= */}

        {isPremium && (
          <div
            className={`
              absolute
              left-3
              z-20
              rounded-full
              bg-[#1565d8]
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-white
              shadow-md
              sm:left-4
              sm:px-3
              sm:py-1.5
              sm:text-xs
              ${
                hasPremiumBadge && isFeatured
                  ? "bottom-[76px] sm:bottom-[88px]"
                  : hasPremiumBadge || isFeatured
                    ? "bottom-10 sm:bottom-12"
                    : "bottom-3 sm:bottom-4"
              }
            `}
          >
            Premium
          </div>
        )}
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          p-4
          sm:p-5
        "
      >
        {/* =================================================
            TITLE
        ================================================= */}

        <h3
          className="
            line-clamp-2
            min-h-[40px]
            text-base
            font-bold
            leading-5
            text-slate-900
            transition-colors
            group-hover:text-[#1565d8]
            dark:text-white
            sm:min-h-[48px]
            sm:text-lg
            sm:leading-6
          "
        >
          {title}
        </h3>

        {/* =================================================
            PRICE
        ================================================= */}

        <p
          className="
            mt-2
            text-2xl
            font-extrabold
            tracking-tight
            text-[#1565d8]
            sm:mt-3
            sm:text-3xl
          "
        >
          ₹ {price.toLocaleString("en-IN")}
        </p>

        {/* =================================================
            SELLER + CONDITION
        ================================================= */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            gap-2
            sm:mt-5
            sm:gap-3
          "
        >
          {/* Seller */}

          <div className="min-w-0 flex-1">
            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-wider
                text-slate-400
                sm:text-[10px]
              "
            >
              Seller
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-sm
                font-semibold
                text-slate-700
                dark:text-slate-200
                sm:text-base
              "
            >
              {seller}
            </p>
          </div>

          {/* Condition */}

          <div
            className="
              shrink-0
              rounded-full
              border
              border-slate-200
              bg-slate-50
              px-2.5
              py-1
              text-[10px]
              font-medium
              capitalize
              text-slate-600
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-300
              sm:px-3
              sm:py-1.5
              sm:text-xs
            "
          >
            {condition}
          </div>
        </div>

        {/* =================================================
            SELLER VERIFICATION BADGES
        ================================================= */}

        {showBadgeSection && (
          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-1.5
              sm:mt-4
              sm:gap-2
            "
          >
            {/* =================================================
                VERIFIED SELLER
            ================================================= */}

            {isVerifiedSeller && (
              <div
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-2.5
                  py-1
                  dark:border-emerald-800
                  dark:bg-emerald-950/40
                "
              >
                <span
                  className="
                    flex
                    h-4
                    w-4
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-500
                    text-white
                    sm:h-5
                    sm:w-5
                  "
                >
                  <ShieldCheck
                    size={11}
                    strokeWidth={2.7}
                  />
                </span>

                <span
                  className="
                    text-[10px]
                    font-bold
                    text-emerald-700
                    dark:text-emerald-300
                    sm:text-xs
                  "
                >
                  Verified Seller
                </span>
              </div>
            )}

            {/* =================================================
                TRUSTED SELLER
            ================================================= */}

            {isTrustedSeller && (
              <div
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-amber-200
                  bg-amber-50
                  px-2.5
                  py-1
                  dark:border-amber-800
                  dark:bg-amber-950/40
                "
              >
                <span
                  className="
                    flex
                    h-4
                    w-4
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-amber-500
                    text-white
                    sm:h-5
                    sm:w-5
                  "
                >
                  <BadgeCheck
                    size={11}
                    strokeWidth={2.7}
                  />
                </span>

                <span
                  className="
                    text-[10px]
                    font-bold
                    text-amber-700
                    dark:text-amber-300
                    sm:text-xs
                  "
                >
                  Trusted Seller
                </span>
              </div>
            )}

            {/* =================================================
                PHONE VERIFIED
            ================================================= */}

            {hasPhoneBadge && (
              <div
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-full
                  border
                  border-blue-200
                  bg-blue-50
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  text-blue-700
                  dark:border-blue-800
                  dark:bg-blue-950/40
                  dark:text-blue-400
                  sm:gap-1.5
                  sm:py-1.5
                  sm:text-xs
                "
              >
                <span>📞</span>

                <span>Phone Verified</span>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            LOCATION
        ================================================= */}

        <div
          className="
            mt-4
            flex
            min-w-0
            items-center
            gap-1.5
            text-xs
            text-slate-500
            dark:text-slate-400
            sm:mt-5
            sm:gap-2
            sm:text-sm
          "
        >
          <MapPin
            size={15}
            className="
              shrink-0
              text-[#1565d8]
              sm:h-[18px]
              sm:w-[18px]
            "
          />

          <span className="truncate">
            {location}
          </span>
        </div>

        {/* =================================================
            POSTED
        ================================================= */}

        <p
          className="
            mt-1
            text-[10px]
            text-slate-500
            dark:text-slate-400
            sm:text-xs
          "
        >
          🕒 Posted{" "}
          {formatDistanceToNow(
            new Date(createdAt),
            {
              addSuffix: true,
            },
          )}
        </p>

        {/* =================================================
            VIEWS
        ================================================= */}

        <div
          className="
            mt-2
            flex
            items-center
            text-[11px]
            text-slate-500
            dark:text-slate-400
            sm:mt-3
            sm:text-sm
          "
        >
          <span>
            👁{" "}
            {(views ?? 0).toLocaleString(
              "en-IN",
            )}{" "}
            Views
          </span>
        </div>

        {/* =================================================
            DISTANCE
        ================================================= */}

        {distance !== undefined && (
          <div className="mt-2 sm:mt-3">
            <span
              className="
                inline-flex
                max-w-full
                items-center
                gap-1.5
                rounded-full
                bg-blue-50
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-[#1565d8]
                dark:bg-blue-950/40
                sm:gap-2
                sm:px-3
                sm:py-1.5
                sm:text-xs
              "
            >
              📍 {distance.toFixed(2)} KM Away
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}