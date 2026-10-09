import Topbar from "@/components/layout/Topbar";
import Navbar from "@/components/layout/Navbar";
import CategoryMenu from "@/components/layout/CategoryMenu";

import Hero from "@/components/home/Hero";
import FeaturedCategory from "@/components/home/FeaturedCategory";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NearbyProducts from "@/components/home/NearbyProducts";
import LatestProducts from "@/components/home/LatestProduct";
import LatestJobs from "@/components/home/LatestJobs";
import PremiumBanner from "@/components/home/PremiumBanner";
import PopularCities from "@/components/home/PopularCities";
import WhyChooseDealUp from "@/components/home/WhyChooseDealup";
import InstallApp from "@/components/home/InstallApp";

import Footer from "@/components/layout/Footer";

import {
  findLatestProducts,
  findFeaturedProducts,
} from "@/lib/repositories/product.repository";

import { findActiveJobs } from "@/lib/repositories/job.repository";

import LocalServicesAndBusinesses from "@/components/home/LocalServicesAndBusinesses";

import { findHomepageServicesAndBusinesses } from "@/lib/repositories/service.repository";

export default async function Home() {
  // =========================================================
  // PERFORMANCE TEST
  // =========================================================

  const totalStart = performance.now();

  console.log("========================================");
  console.log("[PERF] HOME PAGE START");

  // =========================================================
  // FETCH HOMEPAGE DATA IN PARALLEL
  // =========================================================

  const productsStart = performance.now();

  const [featuredProducts, latestProducts, latestJobs, localListings] =
    await Promise.all([
      findFeaturedProducts(20),
      findLatestProducts(8),
      findActiveJobs(8),
      findHomepageServicesAndBusinesses(4),
    ]);

  const productsEnd = performance.now();

  console.log(
    `[PERF] Homepage queries: ${(productsEnd - productsStart).toFixed(0)}ms`,
  );

  console.log(`[PERF] Featured products count: ${featuredProducts.length}`);

  console.log(`[PERF] Latest products count: ${latestProducts.length}`);

  console.log(`[PERF] Active jobs count: ${latestJobs.length}`);

  // =========================================================
  // SERIALIZE LATEST JOBS
  //
  // MongoDB returns:
  // _id → ObjectId
  //
  // LatestJobs expects:
  // _id → string
  //
  // So we convert ObjectId to string before passing
  // the data to the client component.
  // =========================================================

  const serializedLatestJobs = latestJobs.map((job) => ({
    ...job,

    _id: job._id.toString(),
  }));

  // =========================================================
  // SERIALIZE FEATURED PRODUCTS
  // =========================================================

  const serializeStart = performance.now();

  const serializedFeaturedProducts = featuredProducts.map((product) => ({
    // -------------------------------------------------------
    // Basic Product Information
    // -------------------------------------------------------

    id: product._id?.toString() ?? "",

    slug: product.slug ?? "",

    title: product.title ?? "",

    price: product.price ?? 0,

    location: product.location?.city ?? "",

    image: product.thumbnail ?? "",

    seller: product.sellerName ?? "",

    condition: product.condition ?? "",

    // -------------------------------------------------------
    // Seller Verification
    // -------------------------------------------------------

    sellerIsPhoneVerified: product.sellerIsPhoneVerified ?? false,

    sellerVerificationStatus: product.sellerVerificationStatus ?? null,

    // -------------------------------------------------------
    // Seller Badge
    // -------------------------------------------------------

    sellerBadge: product.sellerBadge
      ? typeof product.sellerBadge === "string"
        ? product.sellerBadge
        : {
            label: product.sellerBadge.label ?? undefined,

            name: product.sellerBadge.name ?? undefined,

            type: product.sellerBadge.type ?? undefined,

            badge: product.sellerBadge.badge ?? undefined,
          }
      : null,

    // -------------------------------------------------------
    // Premium Seller
    // -------------------------------------------------------

    sellerPremiumSeller: product.sellerPremiumSeller === true,

    sellerPremiumBadge: product.sellerPremiumBadge === true,

    // -------------------------------------------------------
    // Date
    // -------------------------------------------------------

    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product.createdAt
          ? String(product.createdAt)
          : null,

    // -------------------------------------------------------
    // Product Status
    // -------------------------------------------------------

    isFeatured: product.isFeatured ?? false,

    isPremium: product.isPremium ?? false,

    isBoosted: product.isBoosted ?? false,

    // -------------------------------------------------------
    // Views
    // -------------------------------------------------------

    views: product.views ?? 0,
  }));

  const serializeEnd = performance.now();

  console.log(
    `[PERF] Featured serialization: ${(serializeEnd - serializeStart).toFixed(
      0,
    )}ms`,
  );

  // =========================================================
  // TOTAL SERVER EXECUTION TIME
  // =========================================================

  const totalEnd = performance.now();

  console.log(
    `[PERF] HOME SERVER CODE: ${(totalEnd - totalStart).toFixed(0)}ms`,
  );

  console.log("========================================");

  // =========================================================
  // HOME PAGE
  // =========================================================

  return (
    <>
      {/* =====================================================
          GLOBAL HEADER
      ====================================================== */}

      <Topbar />

      <Navbar />

      <CategoryMenu />

      {/* =====================================================
          HERO
      ====================================================== */}

      <Hero />

      {/* =====================================================
          FEATURED CATEGORIES
      ====================================================== */}

      <FeaturedCategory />

      {/* =====================================================
          FEATURED PRODUCTS
      ====================================================== */}

      <FeaturedProducts products={serializedFeaturedProducts} />

      {/* =====================================================
          NEARBY PRODUCTS
      ====================================================== */}

      <NearbyProducts />

      {/* =====================================================
          JOBS NEAR YOU
      ====================================================== */}

      <LatestJobs jobs={serializedLatestJobs} />

      {/* =====================================================
          LATEST PRODUCTS
      ====================================================== */}

      <LatestProducts products={latestProducts} />

      <LocalServicesAndBusinesses
        services={localListings.services}
        businesses={localListings.businesses}
      />

      {/* =====================================================
          PREMIUM
      ====================================================== */}

      <PremiumBanner />

      {/* =====================================================
          POPULAR CITIES
      ====================================================== */}

      <PopularCities />

      {/* =====================================================
          WHY DEALUP
      ====================================================== */}

      <WhyChooseDealUp />

      {/* =====================================================
          INSTALL APP
      ====================================================== */}

      <InstallApp />

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <Footer />
    </>
  );
}
