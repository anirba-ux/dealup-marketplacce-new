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

/* =========================================================
   SELLER BADGE
========================================================= */

interface SellerBadge {
  label?: string;
  name?: string;
  type?: string;
  badge?: string;
}

/* =========================================================
   PRODUCT CARD PROPS
========================================================= */

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  location: string;
  image: string;
  seller: string;

  /* -------------------------------------------------------
     PHONE VERIFICATION
  ------------------------------------------------------- */

  sellerIsPhoneVerified?: boolean;

  /* -------------------------------------------------------
     SELLER VERIFICATION
  ------------------------------------------------------- */

  sellerVerificationStatus?: string;

  /* -------------------------------------------------------
     PREMIUM SELLER
  ------------------------------------------------------- */

  sellerPremiumSeller?: boolean;

  sellerPremiumBadge?: boolean;

  /* -------------------------------------------------------
     BACKEND SELLER BADGE

     Can be:
     "verified"
     "trusted"
     {
       type: "verified"
     }
     {
       badge: "trusted"
     }
  ------------------------------------------------------- */

  sellerBadge?: SellerBadge | string | null;

  /* -------------------------------------------------------
     PRODUCT
  ------------------------------------------------------- */

  condition: string;

  isFeatured?: boolean;
  isPremium?: boolean;
  isBoosted?: boolean;

  createdAt: Date | string;

  views: number;

  distance?: number;

  onWishlistRemoved?: () => void;
}

/* =========================================================
   PRODUCT CARD
========================================================= */

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
  /* =======================================================
     NORMALIZE SELLER BADGE
  ======================================================= */

  const sellerBadgeType =
    typeof sellerBadge === "string"
      ? sellerBadge
      : sellerBadge?.type ??
        sellerBadge?.badge ??
        "none";

  /* =======================================================
     SELLER BADGE STATES
  ======================================================= */

  const isTrustedSeller =
    sellerBadgeType === "trusted";

  const isVerifiedSeller =
    sellerBadgeType === "verified" ||
    sellerBadgeType === "trusted";

  /* =======================================================
     PHONE VERIFIED
  ======================================================= */

  const hasPhoneBadge =
    sellerIsPhoneVerified === true;

  /* =======================================================
     PREMIUM SELLER
  ======================================================= */

  const hasPremiumBadge =
    sellerPremiumSeller === true &&
    sellerPremiumBadge === true;

  /* =======================================================
     SELLER BADGE SECTION
  ======================================================= */

  const showBadgeSection =
    isVerifiedSeller ||
    hasPhoneBadge;

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <Link
      href={`/products/${slug}`}
      className="
        group
        block
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-2xl
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className="
          relative
          h-64
          overflow-hidden
          bg-slate-100
          dark:bg-slate-800
        "
      >
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
              gap-1.5
              rounded-full
              bg-yellow-500
              px-3
              py-1.5
              text-xs
              font-bold
              text-white
              shadow-lg
              shadow-yellow-500/30
            "
          >
            <Star
              size={14}
              strokeWidth={2.8}
              fill="white"
              className="text-white"
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
              gap-1.5
              rounded-full
              bg-amber-500
              px-3
              py-1.5
              text-xs
              font-bold
              text-white
              shadow-md

              ${
                isTrustedSeller
                  ? "top-[52px]"
                  : "top-3"
              }
            `}
          >
            <Rocket
              size={14}
              strokeWidth={2.5}
              className="text-white"
            />

            <span>Boosted</span>
          </div>
        )}

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
            (max-width:768px) 100vw,
            (max-width:1200px) 50vw,
            25vw
          "
          className="
            object-cover
            transition
            duration-500
            group-hover:scale-110
          "
        />

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
              gap-1.5
              rounded-full
              bg-gradient-to-r
              from-blue-500
              to-[#1565d8]
              px-3
              py-1.5
              text-xs
              font-bold
              text-white
              shadow-lg
              shadow-blue-500/30
              ring-1
              ring-white/30
            "
          >
            <Gem
              size={15}
              strokeWidth={2.8}
              className="text-white"
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
              gap-1.5
              rounded-full
              border
              border-[#1565d8]/20
              bg-white/95
              px-3
              py-1.5
              text-xs
              font-bold
              shadow-md
              shadow-blue-500/10
              backdrop-blur-sm

              ${
                hasPremiumBadge
                  ? "bottom-[52px]"
                  : "bottom-3"
              }
            `}
          >
            <Star
              size={14}
              strokeWidth={2.5}
              fill="#1565d8"
              className="text-[#1565d8]"
            />

            <span className="text-[#1565d8]">
              Featured
            </span>
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
              px-3
              py-1
              text-xs
              font-bold
              text-white
              shadow-md

              ${
                hasPremiumBadge && isFeatured
                  ? "bottom-[101px]"
                  : hasPremiumBadge || isFeatured
                    ? "bottom-[52px]"
                    : "bottom-3"
              }
            `}
          >
            Premium
          </div>
        )}
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-5">

        {/* =================================================
            TITLE
        ================================================= */}

        <h3
          className="
            line-clamp-2
            text-lg
            font-bold
            text-slate-900
            transition-colors
            group-hover:text-[#1565d8]
            dark:text-white
          "
        >
          {title}
        </h3>

        {/* =================================================
            PRICE
        ================================================= */}

        <p
          className="
            mt-3
            text-3xl
            font-extrabold
            text-[#1565d8]
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
            gap-3
          "
        >
          <div className="min-w-0">

            <p
              className="
                text-xs
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Seller
            </p>

            <p
              className="
                truncate
                font-semibold
                text-slate-700
                dark:text-slate-200
              "
            >
              {seller}
            </p>

          </div>

          {/* CONDITION */}

          <div
            className="
              shrink-0
              rounded-full
              border
              border-slate-200
              bg-slate-50
              px-3
              py-1
              text-sm
              font-medium
              capitalize
              text-slate-600
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-300
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
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >

            {/* =================================================
                VERIFIED SELLER

                Trusted seller is also verified.
            ================================================= */}

            {isVerifiedSeller && (
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-emerald-200
                  bg-gradient-to-r
                  from-emerald-50
                  via-teal-50
                  to-cyan-50
                  px-3.5
                  py-1.5
                  shadow-sm
                  shadow-emerald-100
                  transition-all
                  duration-200
                  hover:shadow-md
                  dark:border-emerald-800
                  dark:from-emerald-950/50
                  dark:via-teal-950/50
                  dark:to-cyan-950/50
                  dark:shadow-none
                "
              >
                <span
                  className="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-emerald-500
                    to-teal-600
                    text-white
                    shadow-sm
                  "
                >
                  <ShieldCheck
                    size={13}
                    strokeWidth={2.7}
                  />
                </span>

                <span
                  className="
                    text-xs
                    font-bold
                    tracking-wide
                    text-emerald-700
                    dark:text-emerald-300
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
                  gap-2
                  rounded-full
                  border
                  border-amber-200
                  bg-gradient-to-r
                  from-amber-50
                  via-yellow-50
                  to-orange-50
                  px-3.5
                  py-1.5
                  shadow-sm
                  shadow-amber-100
                  transition-all
                  duration-200
                  hover:shadow-md
                  dark:border-amber-800
                  dark:from-amber-950/50
                  dark:via-yellow-950/50
                  dark:to-orange-950/50
                  dark:shadow-none
                "
              >
                <span
                  className="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-amber-500
                    to-orange-600
                    text-white
                    shadow-sm
                  "
                >
                  <BadgeCheck
                    size={13}
                    strokeWidth={2.7}
                  />
                </span>

                <span
                  className="
                    text-xs
                    font-bold
                    tracking-wide
                    text-amber-700
                    dark:text-amber-300
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
                  gap-1.5
                  rounded-full
                  border
                  border-blue-200
                  bg-blue-50
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-blue-700
                  dark:border-blue-800
                  dark:bg-blue-950/40
                  dark:text-blue-400
                "
              >
                <span>📞</span>

                <span>
                  Phone Verified
                </span>
              </div>
            )}

          </div>
        )}

        {/* =================================================
            LOCATION
        ================================================= */}

        <div
          className="
            mt-5
            flex
            items-center
            gap-2
            text-slate-500
            dark:text-slate-400
          "
        >
          <MapPin
            size={18}
            className="
              shrink-0
              text-[#1565d8]
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
            text-xs
            text-slate-500
            dark:text-slate-400
          "
        >
          🕒 Posted{" "}
          {formatDistanceToNow(
            new Date(createdAt),
            {
              addSuffix: true,
            }
          )}
        </p>

        {/* =================================================
            VIEWS
        ================================================= */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            text-sm
            text-slate-500
            dark:text-slate-400
          "
        >
          <span>
            👁{" "}
            {(views ?? 0).toLocaleString("en-IN")}{" "}
            Views
          </span>
        </div>

        {/* =================================================
            DISTANCE
        ================================================= */}

        {distance !== undefined && (
          <div className="mt-3">
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-blue-50
                px-3
                py-1
                text-sm
                font-semibold
                text-[#1565d8]
                dark:bg-blue-950/40
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