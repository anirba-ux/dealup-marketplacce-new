import { auth } from "@/auth";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { notFound } from "next/navigation";

import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductCard from "@/components/card/ProductCard";
import ProductActions from "@/components/products/ProductActions";
import ProductLocationMap from "@/components/maps/ProductLocationMap";
import ProductLocationActions from "@/components/maps/ProductLocationActions";
import SellerCard from "@/components/products/SellerCard";
import SellerMoreAds from "@/components/products/SellerMoreAds";

import { findUserById } from "@/lib/repositories/user.repository";

import {
  findProductBySlug,
  findRelatedProducts,
  increaseProductViews,
  findSellerStats,
} from "@/lib/repositories/product.repository";

import {
  getSellerBadge,
  type SellerVerificationStatus,
} from "@/lib/risk/sellerTrust";

import {
  Tag,
  Bike,
  Eye,
  CalendarDays,
  MapPin,
} from "lucide-react";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailsPage({
  params,
}: Props) {
  // =====================================================
  // GET SLUG
  // =====================================================

  const { slug } = await params;

  // =====================================================
  // FIND PRODUCT
  // =====================================================

  let product =
    await findProductBySlug(slug);
    

  if (!product) {
    notFound();
  }

  // =====================================================
  // INCREASE PRODUCT VIEWS
  // =====================================================

  await increaseProductViews(
    product._id.toString(),
  );

  // =====================================================
  // FETCH PRODUCT AGAIN
  // =====================================================

  product =
    await findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // =====================================================
  // FIND SELLER
  // =====================================================

  const rawSeller =
    await findUserById(
      product.sellerId,
    );

  if (!rawSeller) {
    notFound();
  }

  // =====================================================
  // SELLER STATISTICS
  // =====================================================

  const sellerStats =
    await findSellerStats(
      product.sellerId,
    );

  // =====================================================
  // SELLER VERIFICATION STATUS
  // =====================================================

  const sellerVerificationStatus: SellerVerificationStatus =
    rawSeller.sellerVerification
      ?.status ??
    "unverified";

  // =====================================================
  // PHONE VERIFICATION
  // =====================================================

  const sellerPhoneVerified =
    Boolean(
      rawSeller.sellerVerification
        ?.phoneVerified ??
        rawSeller.isPhoneVerified ??
        false,
    );

  // =====================================================
  // IDENTITY VERIFICATION
  // =====================================================

  const sellerIdentityVerified =
    Boolean(
      rawSeller.sellerVerification
        ?.identityVerified ??
        false,
    );

  // =====================================================
  // LOCATION VERIFICATION
  // =====================================================

  const sellerLocationVerified =
    Boolean(
      rawSeller.sellerVerification
        ?.locationVerified ??
        false,
    );

  // =====================================================
  // SELLER TRUST SCORE
  // =====================================================

  const sellerTrustScore =
    Number(
      rawSeller.trustScore ?? 0,
    );

  // =====================================================
  // SELLER TRUST LEVEL
  //
  // Prefer stored trustLevel.
  // Fallback to calculated level.
  // =====================================================

  const sellerTrustLevel =
    rawSeller.trustLevel ??
    (
      sellerTrustScore >= 85
        ? "highly_trusted"
        : sellerTrustScore >= 70
          ? "trusted"
          : sellerTrustScore >= 40
            ? "basic"
            : "low"
    );

  // =====================================================
  // SERIOUS BAD HISTORY
  //
  // Report / moderation history will be connected
  // here later.
  // =====================================================

  const sellerHasSeriousBadHistory =
    false;

  // =====================================================
  // CALCULATE SELLER BADGE
  //
  // IMPORTANT:
  //
  // Admin must approve seller verification.
  //
  // sellerVerification.status === "verified"
  //
  // is required by getSellerBadge().
  // =====================================================

  const sellerBadge =
    getSellerBadge({
      verificationStatus:
        sellerVerificationStatus,

      phoneVerified:
        sellerPhoneVerified,

      identityVerified:
        sellerIdentityVerified,

      locationVerified:
        sellerLocationVerified,

      trustScore:
        sellerTrustScore,

      trustLevel:
        sellerTrustLevel,

      hasSeriousBadHistory:
        sellerHasSeriousBadHistory,
    });

  // =====================================================
  // PREPARE SELLER OBJECT
  // =====================================================

  const seller = {
    ...rawSeller,

    // ===================================================
    // Verification Status
    // ===================================================

    verificationStatus:
      sellerVerificationStatus,

    // ===================================================
    // Verification
    // ===================================================

    phoneVerified:
      sellerPhoneVerified,

    identityVerified:
      sellerIdentityVerified,

    locationVerified:
      sellerLocationVerified,

    // ===================================================
    // Trust
    // ===================================================

    trustScore:
      sellerTrustScore,

    trustLevel:
      sellerTrustLevel,

    // ===================================================
    // Seller Badge
    // ===================================================

    badge:
      sellerBadge,
  };

  // =====================================================
  // CURRENT SESSION
  // =====================================================

  const session =
    await auth();

  const currentUserId =
    (session?.user as any)?.id ??
    "";

  // =====================================================
  // RELATED PRODUCTS
  // =====================================================

  const relatedProducts =
    await findRelatedProducts(
      product.category.toString(),
      product._id.toString(),
    );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">

          <Link
            href="/"
            className="
              flex
              items-center
              gap-1
              text-slate-500
              transition
              hover:text-[#1565d8]
            "
          >
            <Home size={16} />
            Home
          </Link>

          <ChevronRight
            size={15}
            className="text-slate-400"
          />

          <Link
            href={`/search?category=${product.subcategory}`}
            className="
              text-slate-500
              transition
              hover:text-[#1565d8]
            "
          >
            {product.subcategory}
          </Link>

          <ChevronRight
            size={15}
            className="text-slate-400"
          />

          <span className="font-semibold text-slate-900 dark:text-white">
            {product.title}
          </span>
        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div>

            {/* Product Images */}

            <ProductImageGallery
              images={product.images}
            />

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div
              className="
                mt-8
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Description
              </h2>

              <p className="whitespace-pre-line text-[15px] leading-8 text-slate-600 dark:text-slate-300">
                {product.description}
              </p>
            </div>

            {/* =================================================
                PRODUCT LOCATION
            ================================================= */}

            <div
              className="
                mt-8
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Product Location
              </h2>

              <ProductLocationMap
                latitude={
                  product.location
                    .coordinates.lat
                }
                longitude={
                  product.location
                    .coordinates.lng
                }
              />

              <p className="leading-8 text-slate-600 dark:text-slate-300">
                {product.location.address}
              </p>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                {product.location.city},{" "}
                {product.location.district},{" "}
                {product.location.state} -{" "}
                {product.location.pincode}
              </p>

              <ProductLocationActions
                latitude={
                  product.location
                    .coordinates.lat
                }
                longitude={
                  product.location
                    .coordinates.lng
                }
                address={
                  product.location.address ??
                  ""
                }
              />
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="relative">

            {/* =================================================
                PRODUCT TITLE
            ================================================= */}

            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
              {product.title}
            </h1>

            {/* =================================================
                PRICE
            ================================================= */}

            <p className="mt-5 text-5xl font-extrabold text-[#1565d8]">
              ₹{" "}
              {product.price.toLocaleString(
                "en-IN",
              )}
            </p>

            {/* =================================================
                PRODUCT BADGES
            ================================================= */}

            <div className="mt-6 flex flex-wrap gap-3">

              <span
                className="
                  rounded-full
                  bg-blue-100
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  capitalize
                  text-[#1565d8]
                "
              >
                {product.condition}
              </span>

              {product.negotiable && (
                <span
                  className="
                    rounded-full
                    bg-green-100
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-green-700
                  "
                >
                  Negotiable
                </span>
              )}

              {product.isFeatured && (
                <span
                  className="
                    rounded-full
                    bg-yellow-100
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-yellow-700
                  "
                >
                  ⭐ Featured
                </span>
              )}

              {product.isPremium && (
                <span
                  className="
                    rounded-full
                    bg-purple-100
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-purple-700
                  "
                >
                  Premium Seller
                </span>
              )}
            </div>

            {/* =================================================
                PRODUCT DETAILS
            ================================================= */}

            <div
              className="
                mt-8
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">
                Product Details
              </h2>

              <div className="space-y-4">

                {/* Category */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Tag size={18} />
                    <span>
                      Category
                    </span>
                  </div>

                  <span className="font-semibold capitalize">
                    {product.categoryName}
                  </span>
                </div>

                {/* Condition */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Bike size={18} />
                    <span>
                      Condition
                    </span>
                  </div>

                  <span className="font-semibold capitalize">
                    {product.condition}
                  </span>
                </div>

                {/* Brand */}

                {product.brand && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Brand
                    </span>

                    <span className="font-semibold">
                      {product.brand}
                    </span>
                  </div>
                )}

                {/* Model */}

                {product.model && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Model
                    </span>

                    <span className="font-semibold">
                      {product.model}
                    </span>
                  </div>
                )}

                {/* Views */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Eye size={18} />
                    <span>
                      Views
                    </span>
                  </div>

                  <span className="font-semibold">
                    {product.views}
                  </span>
                </div>

                {/* Posted */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarDays size={18} />
                    <span>
                      Posted
                    </span>
                  </div>

                  <span className="font-semibold">
                    {new Date(
                      product.createdAt,
                    ).toLocaleDateString(
                      "en-IN",
                    )}
                  </span>
                </div>

                {/* Location */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={18} />
                    <span>
                      Location
                    </span>
                  </div>

                  <span className="font-semibold">
                    {product.location.city}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                SELLER CARD
            ================================================= */}

            <SellerCard
              seller={seller}
              productId={product._id.toString()}
              productTitle={product.title}
              sellerStats={sellerStats}
            />

            {/* =================================================
                SELLER MORE ADS
            ================================================= */}

            <SellerMoreAds
              sellerId={
                product.sellerId
              }
              currentProductId={
                product._id.toString()
              }
            />

            {/* =================================================
                PRODUCT ACTIONS
            ================================================= */}

            <div className="mt-10">

              <ProductActions
                product={{
                  _id:
                    product._id.toString(),

                  sellerId:
                    product.sellerId,

                  title:
                    product.title,

                  slug:
                    product.slug,
                }}
                currentUserId={
                  currentUserId
                }
              />

            </div>
          </div>
        </div>

        {/* =================================================
            RELATED PRODUCTS
        ================================================= */}

        <div className="mt-20">

          <h2 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
            Related Products
          </h2>

          {relatedProducts.length ===
          0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              No related products found.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {relatedProducts.map(
                (item: any) => (
                  <ProductCard
                    key={
                      item._id.toString()
                    }
                    id={
                      item._id.toString()
                    }
                    slug={
                      item.slug
                    }
                    title={
                      item.title
                    }
                    price={
                      item.price
                    }
                    location={
                      item.location.city
                    }
                    image={
                      item.thumbnail
                    }
                    seller={
                      item.sellerName
                    }
                    condition={
                      item.condition
                    }
                    isFeatured={
                      item.isFeatured
                    }
                    isPremium={
                      item.isPremium
                    }
                    createdAt={
                      item.createdAt
                    }
                    views={
                      item.views
                    }
                  />
                ),
              )}

            </div>
          )}
        </div>
      </div>
    </main>
  );
}