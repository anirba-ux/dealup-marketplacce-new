// import { auth } from "@/auth";
// import Link from "next/link";
// import {
//   ChevronRight,
//   Home,
//   Tag,
//   Bike,
//   Eye,
//   CalendarDays,
//   MapPin,
//   Star,
// } from "lucide-react";
// import { notFound } from "next/navigation";

// import ProductImageGallery from "@/components/products/ProductImageGallery";
// import ProductCard from "@/components/card/ProductCard";
// import ProductActions from "@/components/products/ProductActions";
// import ProductLocationMap from "@/components/maps/ProductLocationMap";
// import ProductLocationActions from "@/components/maps/ProductLocationActions";
// import SellerCard from "@/components/products/SellerCard";
// import SellerMoreAds from "@/components/products/SellerMoreAds";

// import { findUserById } from "@/lib/repositories/user.repository";

// import {
//   findProductBySlug,
//   findRelatedProducts,
//   increaseProductViews,
//   findSellerStats,
// } from "@/lib/repositories/product.repository";

// import {
//   getSellerBadge,
//   type SellerVerificationStatus,
// } from "@/lib/risk/sellerTrust";

// interface Props {
//   params: Promise<{
//     slug: string;
//   }>;
// }

// export default async function ProductDetailsPage({ params }: Props) {
//   // =====================================================
//   // GET SLUG
//   // =====================================================

//   const { slug } = await params;

//   // =====================================================
//   // FIND PRODUCT
//   // =====================================================

//   let product = await findProductBySlug(slug);

//   if (!product) {
//     notFound();
//   }

//   // =====================================================
//   // INCREASE PRODUCT VIEWS
//   // =====================================================

//   await increaseProductViews(product._id.toString());

//   // =====================================================
//   // FETCH PRODUCT AGAIN
//   // =====================================================

//   product = await findProductBySlug(slug);

//   if (!product) {
//     notFound();
//   }

//   // =====================================================
//   // FIND SELLER
//   // =====================================================

//   const rawSeller = await findUserById(product.sellerId);

//   if (!rawSeller) {
//     notFound();
//   }

//   // =====================================================
//   // SELLER STATISTICS
//   // =====================================================

//   const sellerStats = await findSellerStats(product.sellerId);

//   // =====================================================
//   // SELLER VERIFICATION STATUS
//   // =====================================================

//   const sellerVerificationStatus: SellerVerificationStatus =
//     rawSeller.sellerVerification?.status ?? "unverified";

//   // =====================================================
//   // PHONE VERIFICATION
//   // =====================================================

//   const sellerPhoneVerified = Boolean(
//     rawSeller.sellerVerification?.phoneVerified ??
//     rawSeller.isPhoneVerified ??
//     false,
//   );

//   // =====================================================
//   // IDENTITY VERIFICATION
//   // =====================================================

//   const sellerIdentityVerified = Boolean(
//     rawSeller.sellerVerification?.identityVerified ?? false,
//   );

//   // =====================================================
//   // LOCATION VERIFICATION
//   // =====================================================

//   const sellerLocationVerified = Boolean(
//     rawSeller.sellerVerification?.locationVerified ?? false,
//   );

//   // =====================================================
//   // SELLER TRUST SCORE
//   // =====================================================

//   const sellerTrustScore = Number(rawSeller.trustScore ?? 0);

//   // =====================================================
//   // SELLER TRUST LEVEL
//   //
//   // Prefer stored trustLevel.
//   // Fallback to calculated level.
//   // =====================================================

//   const sellerTrustLevel =
//     rawSeller.trustLevel ??
//     (sellerTrustScore >= 85
//       ? "highly_trusted"
//       : sellerTrustScore >= 70
//         ? "trusted"
//         : sellerTrustScore >= 40
//           ? "basic"
//           : "low");

//   // =====================================================
//   // TRUSTED SELLER
//   //
//   // IMPORTANT:
//   //
//   // refreshSellerTrustScore() calculates this value.
//   //
//   // We must pass it to getSellerBadge().
//   //
//   // Safe cast is used because older User type may not
//   // yet contain trustedSeller.
//   // =====================================================

//   const sellerTrustedSeller = Boolean(
//     (
//       rawSeller as typeof rawSeller & {
//         trustedSeller?: boolean;
//       }
//     ).trustedSeller,
//   );

//   // =====================================================
//   // PREMIUM SELLER
//   //
//   // Premium badge is shown only when:
//   // 1. Premium Seller is active
//   // 2. Premium has not expired
//   // 3. Premium badge feature is enabled
//   // =====================================================

//   const premiumSeller = rawSeller.premiumSeller;

//   const premiumExpiresAt = premiumSeller?.expiresAt
//     ? new Date(premiumSeller.expiresAt)
//     : null;

//   const premiumNotExpired =
//     !premiumExpiresAt || premiumExpiresAt.getTime() > Date.now();

//   const sellerPremiumSeller =
//     premiumSeller?.active === true && premiumNotExpired;

//   const sellerPremiumBadge =
//     sellerPremiumSeller && premiumSeller?.premiumBadge === true;

//   // =====================================================
//   // SERIOUS BAD HISTORY
//   //
//   // Temporary:
//   // Reports / moderation history will be connected here.
//   // =====================================================

//   const sellerHasSeriousBadHistory = false;

//   // =====================================================
//   // CALCULATE FINAL SELLER BADGE
//   //
//   // Badge rules:
//   //
//   // 1. Seller verification must be admin approved.
//   // 2. Phone must be verified.
//   // 3. Identity must be verified.
//   // 4. Location must be verified.
//   // 5. Serious bad history must be absent.
//   //
//   // Then:
//   //
//   // Trusted Seller
//   //     ↓
//   // trustedSeller === true
//   // score >= 70
//   // trustLevel = trusted / highly_trusted
//   //
//   // Otherwise:
//   //
//   // Verified Seller
//   // =====================================================

//   const sellerBadge = getSellerBadge({
//     verificationStatus: sellerVerificationStatus,

//     phoneVerified: sellerPhoneVerified,

//     identityVerified: sellerIdentityVerified,

//     locationVerified: sellerLocationVerified,

//     trustScore: sellerTrustScore,

//     trustLevel: sellerTrustLevel,

//     // =================================================
//     // IMPORTANT FIX
//     //
//     // This value was previously missing.
//     // =================================================

//     trustedSeller: sellerTrustedSeller,

//     hasSeriousBadHistory: sellerHasSeriousBadHistory,
//   });

//   // =====================================================
//   // PREPARE SELLER OBJECT
//   // =====================================================

//   const seller = {
//     ...rawSeller,

//     // ===================================================
//     // Verification Status
//     // ===================================================

//     verificationStatus: sellerVerificationStatus,

//     // ===================================================
//     // Verification
//     // ===================================================

//     phoneVerified: sellerPhoneVerified,

//     identityVerified: sellerIdentityVerified,

//     locationVerified: sellerLocationVerified,

//     // ===================================================
//     // Trust
//     // ===================================================

//     trustScore: sellerTrustScore,

//     trustLevel: sellerTrustLevel,

//     trustedSeller: sellerTrustedSeller,

//     // ===================================================
//     // FINAL SELLER BADGE
//     //
//     // IMPORTANT:
//     // Override any old sellerBadge stored in rawSeller.
//     // The badge calculated above is the source of truth.
//     // ===================================================

//     sellerBadge: sellerBadge,

//     badge: sellerBadge,
//   };

//   // =====================================================
//   // DEBUG
//   //
//   // Check browser/server terminal:
//   //
//   // trustedSeller = true
//   // badge = trusted
//   // =====================================================

//   console.log("PRODUCT PAGE SELLER TRUST:", {
//     sellerId: product.sellerId,

//     verificationStatus: sellerVerificationStatus,

//     trustScore: sellerTrustScore,

//     trustLevel: sellerTrustLevel,

//     trustedSeller: sellerTrustedSeller,

//     badge: sellerBadge.badge,

//     badgeLabel: sellerBadge.label,

//     badgeEligible: sellerBadge.eligible,
//   });

//   // =====================================================
//   // CURRENT SESSION
//   // =====================================================

//   const session = await auth();

//   const currentUserId = (session?.user as any)?.id ?? "";

//   // =====================================================
//   // RELATED PRODUCTS
//   // =====================================================

//   const relatedProducts = await findRelatedProducts(
//     product.category.toString(),
//     product._id.toString(),
//   );

//   // =====================================================
//   // PAGE
//   // =====================================================

//   return (
//     <main
//       className="
//         min-h-screen
//         bg-slate-50
//         py-12
//         dark:bg-slate-950
//       "
//     >
//       <div
//         className="
//           mx-auto
//           max-w-7xl
//           px-6
//         "
//       >
//         {/* =================================================
//             BREADCRUMB
//         ================================================= */}

//         <div
//           className="
//             mb-8
//             flex
//             flex-wrap
//             items-center
//             gap-2
//             text-sm
//           "
//         >
//           <Link
//             href="/"
//             className="
//               flex
//               items-center
//               gap-1
//               text-slate-500
//               transition
//               hover:text-[#1565d8]
//             "
//           >
//             <Home size={16} />
//             Home
//           </Link>

//           <ChevronRight size={15} className="text-slate-400" />

//           <Link
//             href={`/search?category=${product.subcategory}`}
//             className="
//               text-slate-500
//               transition
//               hover:text-[#1565d8]
//             "
//           >
//             {product.subcategory}
//           </Link>

//           <ChevronRight size={15} className="text-slate-400" />

//           <span
//             className="
//               font-semibold
//               text-slate-900
//               dark:text-white
//             "
//           >
//             {product.title}
//           </span>
//         </div>

//         {/* =================================================
//             MAIN GRID
//         ================================================= */}

//         <div
//           className="
//             grid
//             gap-12
//             lg:grid-cols-[1.2fr_0.8fr]
//           "
//         >
//           {/* =================================================
//               LEFT SIDE
//           ================================================= */}

//           <div>
//             {/* =================================================
//     PRODUCT IMAGE GALLERY
// ================================================= */}

//             <div className="relative">
//               {/* =================================================
//       TRUSTED SELLER IMAGE BADGE

//       Only Trusted Seller products get this badge.
//   ================================================= */}

//               {sellerBadge.badge === "trusted" && (
//                 <div
//                   className="
//         absolute
//         left-4
//         top-4
//         z-50
//         inline-flex
//         items-center
//         gap-1.5
//         rounded-full
//         border
//         border-yellow-400
//         bg-yellow-500
//         px-3.5
//         py-2
//         text-sm
//         font-bold
//         text-white
//         shadow-lg
//         shadow-yellow-500/30
//       "
//                 >
//                   <Star
//                     size={16}
//                     strokeWidth={2.8}
//                     fill="white"
//                     className="text-white"
//                   />

//                   <span className="text-white">Trusted</span>
//                 </div>
//               )}

//               {/* =================================================
//       PRODUCT IMAGE GALLERY
//   ================================================= */}

//               <ProductImageGallery
//                 images={product.images}
//                 sellerPremiumSeller={sellerPremiumSeller}
//                 sellerPremiumBadge={sellerPremiumBadge}
//               />
//             </div>

//             {/* =================================================
//                 DESCRIPTION
//             ================================================= */}

//             <div
//               className="
//                 mt-8
//                 rounded-3xl
//                 border
//                 border-slate-200
//                 bg-white
//                 p-6
//                 shadow-sm
//                 dark:border-slate-700
//                 dark:bg-slate-900
//               "
//             >
//               <h2
//                 className="
//                   mb-4
//                   text-2xl
//                   font-bold
//                   text-slate-900
//                   dark:text-white
//                 "
//               >
//                 Description
//               </h2>

//               <p
//                 className="
//                   whitespace-pre-line
//                   text-[15px]
//                   leading-8
//                   text-slate-600
//                   dark:text-slate-300
//                 "
//               >
//                 {product.description}
//               </p>
//             </div>

//             {/* =================================================
//                 PRODUCT LOCATION
//             ================================================= */}

//             <div
//               className="
//                 mt-8
//                 rounded-3xl
//                 border
//                 border-slate-200
//                 bg-white
//                 p-6
//                 shadow-sm
//                 dark:border-slate-700
//                 dark:bg-slate-900
//               "
//             >
//               <h2
//                 className="
//                   mb-4
//                   text-2xl
//                   font-bold
//                   text-slate-900
//                   dark:text-white
//                 "
//               >
//                 Product Location
//               </h2>

//               <ProductLocationMap
//                 latitude={product.location.coordinates.lat}
//                 longitude={product.location.coordinates.lng}
//               />

//               <p
//                 className="
//                   leading-8
//                   text-slate-600
//                   dark:text-slate-300
//                 "
//               >
//                 {product.location.address}
//               </p>

//               <p
//                 className="
//                   mt-2
//                   text-slate-500
//                   dark:text-slate-400
//                 "
//               >
//                 {product.location.city}, {product.location.district},{" "}
//                 {product.location.state} - {product.location.pincode}
//               </p>

//               <ProductLocationActions
//                 latitude={product.location.coordinates.lat}
//                 longitude={product.location.coordinates.lng}
//                 address={product.location.address ?? ""}
//               />
//             </div>
//           </div>

//           {/* =================================================
//               RIGHT SIDE
//           ================================================= */}

//           <div className="relative">
//             {/* =================================================
//                 PRODUCT TITLE
//             ================================================= */}

//             <h1
//               className="
//                 text-4xl
//                 font-extrabold
//                 text-slate-900
//                 dark:text-white
//               "
//             >
//               {product.title}
//             </h1>

//             {/* =================================================
//                 PRICE
//             ================================================= */}

//             <p
//               className="
//                 mt-5
//                 text-5xl
//                 font-extrabold
//                 text-[#1565d8]
//               "
//             >
//               ₹ {product.price.toLocaleString("en-IN")}
//             </p>

//             {/* =================================================
//                 PRODUCT BADGES
//             ================================================= */}

//             <div
//               className="
//                 mt-6
//                 flex
//                 flex-wrap
//                 gap-3
//               "
//             >
//               <span
//                 className="
//                   rounded-full
//                   bg-blue-100
//                   px-4
//                   py-2
//                   text-sm
//                   font-semibold
//                   capitalize
//                   text-[#1565d8]
//                 "
//               >
//                 {product.condition}
//               </span>

//               {product.negotiable && (
//                 <span
//                   className="
//                     rounded-full
//                     bg-green-100
//                     px-4
//                     py-2
//                     text-sm
//                     font-semibold
//                     text-green-700
//                   "
//                 >
//                   Negotiable
//                 </span>
//               )}

//               {product.isFeatured && (
//                 <span
//                   className="
//                     rounded-full
//                     bg-yellow-100
//                     px-4
//                     py-2
//                     text-sm
//                     font-semibold
//                     text-yellow-700
//                   "
//                 >
//                   ⭐ Featured
//                 </span>
//               )}

//               {product.isPremium && (
//                 <span
//                   className="
//                     rounded-full
//                     bg-purple-100
//                     px-4
//                     py-2
//                     text-sm
//                     font-semibold
//                     text-purple-700
//                   "
//                 >
//                   Premium Seller
//                 </span>
//               )}
//             </div>

//             {/* =================================================
//                 PRODUCT DETAILS
//             ================================================= */}

//             <div
//               className="
//                 mt-8
//                 rounded-3xl
//                 border
//                 border-slate-200
//                 bg-white
//                 p-6
//                 shadow-sm
//                 dark:border-slate-700
//                 dark:bg-slate-900
//               "
//             >
//               <h2
//                 className="
//                   mb-5
//                   text-xl
//                   font-bold
//                   text-slate-900
//                   dark:text-white
//                 "
//               >
//                 Product Details
//               </h2>

//               <div className="space-y-4">
//                 {/* Category */}

//                 <div
//                   className="
//                     flex
//                     items-center
//                     justify-between
//                   "
//                 >
//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-2
//                       text-slate-500
//                     "
//                   >
//                     <Tag size={18} />

//                     <span>Category</span>
//                   </div>

//                   <span
//                     className="
//                       font-semibold
//                       capitalize
//                     "
//                   >
//                     {product.categoryName}
//                   </span>
//                 </div>

//                 {/* Condition */}

//                 <div
//                   className="
//                     flex
//                     items-center
//                     justify-between
//                   "
//                 >
//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-2
//                       text-slate-500
//                     "
//                   >
//                     <Bike size={18} />

//                     <span>Condition</span>
//                   </div>

//                   <span
//                     className="
//                       font-semibold
//                       capitalize
//                     "
//                   >
//                     {product.condition}
//                   </span>
//                 </div>

//                 {/* Brand */}

//                 {product.brand && (
//                   <div
//                     className="
//                       flex
//                       items-center
//                       justify-between
//                     "
//                   >
//                     <span className="text-slate-500">Brand</span>

//                     <span className="font-semibold">{product.brand}</span>
//                   </div>
//                 )}

//                 {/* Model */}

//                 {product.model && (
//                   <div
//                     className="
//                       flex
//                       items-center
//                       justify-between
//                     "
//                   >
//                     <span className="text-slate-500">Model</span>

//                     <span className="font-semibold">{product.model}</span>
//                   </div>
//                 )}

//                 {/* Views */}

//                 <div
//                   className="
//                     flex
//                     items-center
//                     justify-between
//                   "
//                 >
//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-2
//                       text-slate-500
//                     "
//                   >
//                     <Eye size={18} />

//                     <span>Views</span>
//                   </div>

//                   <span className="font-semibold">{product.views}</span>
//                 </div>

//                 {/* Posted */}

//                 <div
//                   className="
//                     flex
//                     items-center
//                     justify-between
//                   "
//                 >
//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-2
//                       text-slate-500
//                     "
//                   >
//                     <CalendarDays size={18} />

//                     <span>Posted</span>
//                   </div>

//                   <span className="font-semibold">
//                     {new Date(product.createdAt).toLocaleDateString("en-IN")}
//                   </span>
//                 </div>

//                 {/* Location */}

//                 <div
//                   className="
//                     flex
//                     items-center
//                     justify-between
//                   "
//                 >
//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-2
//                       text-slate-500
//                     "
//                   >
//                     <MapPin size={18} />

//                     <span>Location</span>
//                   </div>

//                   <span className="font-semibold">{product.location.city}</span>
//                 </div>
//               </div>
//             </div>

//             {/* =================================================
//                 SELLER CARD
//             ================================================= */}

//             <SellerCard
//               seller={seller}
//               productId={product._id.toString()}
//               productTitle={product.title}
//               sellerStats={sellerStats}
//             />

//             {/* =================================================
//                 SELLER MORE ADS
//             ================================================= */}

//             <SellerMoreAds
//               sellerId={product.sellerId}
//               currentProductId={product._id.toString()}
//             />

//             {/* =================================================
//                 PRODUCT ACTIONS
//             ================================================= */}

//             <div className="mt-10">
//               <ProductActions
//                 product={{
//                   _id: product._id.toString(),

//                   sellerId: product.sellerId,

//                   title: product.title,

//                   slug: product.slug,
//                 }}
//                 currentUserId={currentUserId}
//               />
//             </div>
//           </div>
//         </div>

//         {/* =================================================
//             RELATED PRODUCTS
//         ================================================= */}

//         <div className="mt-20">
//           <h2
//             className="
//               mb-8
//               text-3xl
//               font-bold
//               text-slate-900
//               dark:text-white
//             "
//           >
//             Related Products
//           </h2>

//           {relatedProducts.length === 0 ? (
//             <p
//               className="
//                 text-slate-500
//                 dark:text-slate-400
//               "
//             >
//               No related products found.
//             </p>
//           ) : (
//             <div
//               className="
//                 grid
//                 gap-6
//                 sm:grid-cols-2
//                 lg:grid-cols-4
//               "
//             >
//               {relatedProducts.map((item: any) => (
//                 <ProductCard
//                   key={item._id.toString()}
//                   id={item._id.toString()}
//                   slug={item.slug}
//                   title={item.title}
//                   price={item.price}
//                   location={item.location.city}
//                   image={item.thumbnail}
//                   seller={item.sellerName}
//                   condition={item.condition}
//                   isFeatured={item.isFeatured}
//                   isPremium={item.isPremium}
//                   createdAt={item.createdAt}
//                   views={item.views}
//                   sellerIsPhoneVerified={item.sellerIsPhoneVerified}
//                   sellerBadge={item.sellerBadge}
//                   sellerPremiumSeller={item.sellerPremiumSeller}
//                   sellerPremiumBadge={item.sellerPremiumBadge}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }


import { auth } from "@/auth";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  Tag,
  Bike,
  Eye,
  CalendarDays,
  MapPin,
  Star,
} from "lucide-react";
import { notFound } from "next/navigation";

import BackButton from "@/components/ui/BackButton";

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

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;

  let product = await findProductBySlug(slug);

  if (!product) notFound();

  await increaseProductViews(product._id.toString());

  product = await findProductBySlug(slug);

  if (!product) notFound();

  const rawSeller = await findUserById(product.sellerId);

  if (!rawSeller) notFound();

  const sellerStats = await findSellerStats(product.sellerId);

  const sellerVerificationStatus: SellerVerificationStatus =
    rawSeller.sellerVerification?.status ?? "unverified";

  const sellerPhoneVerified = Boolean(
    rawSeller.sellerVerification?.phoneVerified ??
      rawSeller.isPhoneVerified ??
      false,
  );

  const sellerIdentityVerified = Boolean(
    rawSeller.sellerVerification?.identityVerified ?? false,
  );

  const sellerLocationVerified = Boolean(
    rawSeller.sellerVerification?.locationVerified ?? false,
  );

  const sellerTrustScore = Number(rawSeller.trustScore ?? 0);

  const sellerTrustLevel =
    rawSeller.trustLevel ??
    (sellerTrustScore >= 85
      ? "highly_trusted"
      : sellerTrustScore >= 70
        ? "trusted"
        : sellerTrustScore >= 40
          ? "basic"
          : "low");

  const sellerTrustedSeller = Boolean(
    (
      rawSeller as typeof rawSeller & {
        trustedSeller?: boolean;
      }
    ).trustedSeller,
  );

  const premiumSeller = rawSeller.premiumSeller;

  const premiumExpiresAt = premiumSeller?.expiresAt
    ? new Date(premiumSeller.expiresAt)
    : null;

  const premiumNotExpired =
    !premiumExpiresAt || premiumExpiresAt.getTime() > Date.now();

  const sellerPremiumSeller =
    premiumSeller?.active === true && premiumNotExpired;

  const sellerPremiumBadge =
    sellerPremiumSeller && premiumSeller?.premiumBadge === true;

  const sellerBadge = getSellerBadge({
    verificationStatus: sellerVerificationStatus,
    phoneVerified: sellerPhoneVerified,
    identityVerified: sellerIdentityVerified,
    locationVerified: sellerLocationVerified,
    trustScore: sellerTrustScore,
    trustLevel: sellerTrustLevel,
    trustedSeller: sellerTrustedSeller,
    hasSeriousBadHistory: false,
  });

  const seller = {
    ...rawSeller,
    verificationStatus: sellerVerificationStatus,
    phoneVerified: sellerPhoneVerified,
    identityVerified: sellerIdentityVerified,
    locationVerified: sellerLocationVerified,
    trustScore: sellerTrustScore,
    trustLevel: sellerTrustLevel,
    trustedSeller: sellerTrustedSeller,
    sellerBadge,
    badge: sellerBadge,
  };

  const session = await auth();
  const currentUserId = (session?.user as any)?.id ?? "";

  const relatedProducts = await findRelatedProducts(
    product.category.toString(),
    product._id.toString(),
  );

  return (
    <main className="min-h-screen bg-slate-50 py-4 text-slate-900 sm:py-8 lg:py-10 dark:bg-[#07111f] dark:text-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
          <BackButton />

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1565d8]/30 hover:bg-blue-50 hover:text-[#1565d8] hover:shadow-md active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>

        <div className="mb-5 flex items-center gap-1.5 overflow-hidden text-[11px] text-slate-500 sm:mb-7 sm:gap-2 sm:text-sm dark:text-slate-400">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
          <Link
            href={`/search?category=${product.subcategory}`}
            className="shrink-0 transition-colors hover:text-[#1565d8]"
          >
            {product.subcategory}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
          <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
            {product.title}
          </span>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:gap-10">
          <div className="min-w-0 space-y-5 sm:space-y-7">
            <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:rounded-3xl sm:p-3 dark:border-white/10 dark:bg-[#091526]">
              {sellerBadge.badge === "trusted" && (
                <div className="absolute left-4 top-4 z-50 inline-flex items-center gap-1.5 rounded-full border border-yellow-300/80 bg-yellow-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg shadow-yellow-500/25 sm:left-6 sm:top-6 sm:px-3.5 sm:py-2 sm:text-sm">
                  <Star className="h-3.5 w-3.5 fill-white sm:h-4 sm:w-4" />
                  Trusted Seller
                </div>
              )}
              <ProductImageGallery
                images={product.images}
                sellerPremiumSeller={sellerPremiumSeller}
                sellerPremiumBadge={sellerPremiumBadge}
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 dark:border-white/10 dark:bg-[#091526]">
              <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                <h2 className="text-lg font-extrabold tracking-tight sm:text-2xl">
                  Description
                </h2>
                <span className="h-1 w-10 rounded-full bg-[#1565d8] sm:w-14" />
              </div>
              <p className="whitespace-pre-line text-sm leading-6 text-slate-600 sm:text-[15px] sm:leading-7 dark:text-slate-300">
                {product.description}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 dark:border-white/10 dark:bg-[#091526]">
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1565d8]">
                    Where to find it
                  </p>
                  <h2 className="text-lg font-extrabold tracking-tight sm:text-2xl">
                    Product Location
                  </h2>
                </div>
                <MapPin className="h-5 w-5 text-[#1565d8] sm:h-6 sm:w-6" />
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                <ProductLocationMap
                  latitude={product.location.coordinates.lat}
                  longitude={product.location.coordinates.lng}
                />
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3.5 dark:bg-[#07111f]">
                <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                  {product.location.address}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {product.location.city}, {product.location.district},{" "}
                  {product.location.state} - {product.location.pincode}
                </p>
              </div>

              <ProductLocationActions
                latitude={product.location.coordinates.lat}
                longitude={product.location.coordinates.lng}
                address={product.location.address ?? ""}
              />
            </section>
          </div>

          <div className="min-w-0 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 lg:p-7 dark:border-white/10 dark:bg-[#091526]">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold capitalize text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-300">
                  {product.condition}
                </span>
                {product.negotiable && (
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                    Negotiable
                  </span>
                )}
                {product.isFeatured && (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    ⭐ Featured
                  </span>
                )}
                {product.isPremium && (
                  <span className="rounded-full bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                    Premium Seller
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:mt-5 sm:text-4xl lg:text-[2.7rem] dark:text-white">
                {product.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-3 sm:mt-5">
                <p className="text-3xl font-black tracking-tight text-[#1565d8] sm:text-5xl">
                  ₹ {product.price.toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Eye className="h-4 w-4" />
                  {product.views} views
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#1565d8]" />
                  {product.location.city}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-[#1565d8]" />
                  Posted {new Date(product.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:rounded-3xl sm:p-6 dark:border-white/10 dark:bg-[#091526]">
              <h2 className="mb-4 text-lg font-extrabold sm:mb-5 sm:text-xl">
                Product Details
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-white/10">
                <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <Tag className="h-4 w-4 text-[#1565d8]" />
                    Category
                  </span>
                  <span className="text-right text-xs font-bold capitalize sm:text-sm">
                    {product.categoryName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <Bike className="h-4 w-4 text-[#1565d8]" />
                    Condition
                  </span>
                  <span className="text-right text-xs font-bold capitalize sm:text-sm">
                    {product.condition}
                  </span>
                </div>
                {product.brand && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                      Brand
                    </span>
                    <span className="max-w-[55%] text-right text-xs font-bold sm:text-sm">
                      {product.brand}
                    </span>
                  </div>
                )}
                {product.model && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                      Model
                    </span>
                    <span className="max-w-[55%] text-right text-xs font-bold sm:text-sm">
                      {product.model}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <Eye className="h-4 w-4 text-[#1565d8]" />
                    Views
                  </span>
                  <span className="text-xs font-bold sm:text-sm">{product.views}</span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <CalendarDays className="h-4 w-4 text-[#1565d8]" />
                    Posted
                  </span>
                  <span className="text-xs font-bold sm:text-sm">
                    {new Date(product.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <MapPin className="h-4 w-4 text-[#1565d8]" />
                    Location
                  </span>
                  <span className="text-xs font-bold sm:text-sm">
                    {product.location.city}
                  </span>
                </div>
              </div>
            </section>

            <div className="mt-5 sm:mt-6">
              <SellerCard
                seller={seller}
                productId={product._id.toString()}
                productTitle={product.title}
                sellerStats={sellerStats}
              />
            </div>

            <div className="mt-5 sm:mt-6">
              <SellerMoreAds
                sellerId={product.sellerId}
                currentProductId={product._id.toString()}
              />
            </div>

            <div className="mt-5 sm:mt-6">
              <ProductActions
                product={{
                  _id: product._id.toString(),
                  sellerId: product.sellerId,
                  title: product.title,
                  slug: product.slug,
                }}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </div>

        <section className="mt-10 pb-4 sm:mt-14 lg:mt-20">
          <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1565d8]">
                You may also like
              </p>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Related Products
              </h2>
            </div>
            {relatedProducts.length > 0 && (
              <span className="shrink-0 text-xs font-medium text-slate-500 sm:hidden dark:text-slate-400">
                Swipe →
              </span>
            )}
          </div>

          {relatedProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-[#091526] dark:text-slate-400">
              No related products found.
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto overscroll-x-contain pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 lg:grid-cols-4 lg:gap-6">
              {relatedProducts.map((item: any) => (
                <div
                  key={item._id.toString()}
                  className="w-[78vw] min-w-[78vw] max-w-[340px] shrink-0 sm:w-auto sm:min-w-0 sm:max-w-none sm:shrink"
                >
                  <ProductCard
                    id={item._id.toString()}
                    slug={item.slug}
                    title={item.title}
                    price={item.price ?? 0}
                    location={item.location?.city ?? ""}
                    image={item.thumbnail ?? ""}
                    seller={item.sellerName ?? ""}
                    condition={item.condition ?? ""}
                    isFeatured={item.isFeatured ?? false}
                    isPremium={item.isPremium ?? false}
                    createdAt={item.createdAt}
                    views={item.views ?? 0}
                    sellerIsPhoneVerified={item.sellerIsPhoneVerified ?? false}
                    sellerBadge={item.sellerBadge ?? null}
                    sellerPremiumSeller={item.sellerPremiumSeller ?? false}
                    sellerPremiumBadge={item.sellerPremiumBadge ?? false}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
