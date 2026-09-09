import Topbar from "@/components/layout/Topbar";
import Navbar from "@/components/layout/Navbar";
import CategoryMenu from "@/components/layout/CategoryMenu";

import Hero from "@/components/home/Hero";
import FeaturedCategory from "@/components/home/FeaturedCategory";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NearbyProducts from "@/components/home/NearbyProducts";
import LatestProducts from "@/components/home/LatestProduct";
import PremiumBanner from "@/components/home/PremiumBanner";
import PopularCities from "@/components/home/PopularCities";
import WhyChooseDealUp from "@/components/home/WhyChooseDealup";
import InstallApp from "@/components/home/InstallApp";

import Footer from "@/components/layout/Footer";

import {
  findLatestProducts,
  findFeaturedProducts,
} from "@/lib/repositories/product.repository";

export default async function Home() {
  // =========================================================
  // PERFORMANCE TEST
  // =========================================================

  const totalStart = performance.now();

  console.log("========================================");
  console.log("[PERF] HOME PAGE START");

  // =========================================================
  // FETCH HOMEPAGE PRODUCTS IN PARALLEL
  // =========================================================

  const productsStart = performance.now();

  const [featuredProducts, latestProducts] = await Promise.all([
    findFeaturedProducts(20),
    findLatestProducts(8),
  ]);

  const productsEnd = performance.now();

  console.log(
    `[PERF] Featured + Latest queries: ${(
      productsEnd - productsStart
    ).toFixed(0)}ms`,
  );

  console.log(
    `[PERF] Featured products count: ${featuredProducts.length}`,
  );

  console.log(
    `[PERF] Latest products count: ${latestProducts.length}`,
  );

  // =========================================================
  // SERIALIZE FEATURED PRODUCTS
  // =========================================================

  const serializeStart = performance.now();

  const serializedFeaturedProducts = featuredProducts.map((product) => ({
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

    sellerIsPhoneVerified:
      product.sellerIsPhoneVerified ?? false,

    sellerVerificationStatus:
      product.sellerVerificationStatus ?? null,

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

    sellerPremiumSeller:
      product.sellerPremiumSeller === true,

    sellerPremiumBadge:
      product.sellerPremiumBadge === true,

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

    isFeatured:
      product.isFeatured ?? false,

    isPremium:
      product.isPremium ?? false,

    isBoosted:
      product.isBoosted ?? false,

    // -------------------------------------------------------
    // Views
    // -------------------------------------------------------

    views:
      product.views ?? 0,
  }));

  const serializeEnd = performance.now();

  console.log(
    `[PERF] Featured serialization: ${(
      serializeEnd - serializeStart
    ).toFixed(0)}ms`,
  );

  // =========================================================
  // PAGE
  // =========================================================

  const totalEnd = performance.now();

  console.log(
    `[PERF] HOME SERVER CODE: ${(
      totalEnd - totalStart
    ).toFixed(0)}ms`,
  );

  console.log("========================================");

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

      <FeaturedProducts
        products={serializedFeaturedProducts}
      />

      {/* =====================================================
          NEARBY PRODUCTS
      ====================================================== */}

      <NearbyProducts />

      {/* =====================================================
          LATEST PRODUCTS
      ====================================================== */}

      <LatestProducts
        products={latestProducts}
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