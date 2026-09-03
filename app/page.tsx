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
  // FETCH PRODUCTS
  // =========================================================

  const featuredProducts = await findFeaturedProducts(20);

  const latestProducts = await findLatestProducts(8);

  // =========================================================
  // SERIALIZE FEATURED PRODUCTS
  // Server Component → Client Component
  // =========================================================

  const serializedFeaturedProducts = featuredProducts.map((product) => ({
    id: product._id?.toString() ?? "",

    slug: product.slug ?? "",

    title: product.title ?? "",

    price: product.price ?? 0,

    location: product.location?.city ?? "",

    image: product.thumbnail ?? "",

    seller: product.sellerName ?? "",

    condition: product.condition ?? "",

    sellerIsPhoneVerified: product.sellerIsPhoneVerified ?? false,

    sellerVerificationStatus: product.sellerVerificationStatus ?? null,

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

    sellerPremiumSeller: product.sellerPremiumSeller === true,

    sellerPremiumBadge: product.sellerPremiumBadge === true,

    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product.createdAt
          ? String(product.createdAt)
          : null,

    isFeatured: product.isFeatured ?? false,

    isPremium: product.isPremium ?? false,

    isBoosted: product.isBoosted ?? false,

    views: product.views ?? 0,
  }));

  return (
    <>
      <Topbar />

      <Navbar />

      <CategoryMenu />

      <Hero />

      <FeaturedCategory />

      {/* =================================================
          FEATURED PRODUCTS
      ================================================== */}

      <FeaturedProducts products={serializedFeaturedProducts} />

      <NearbyProducts />

      <LatestProducts products={latestProducts} />

      <PremiumBanner />

      <PopularCities />

      <WhyChooseDealUp />

      <InstallApp />

      <Footer />
    </>
  );
}
