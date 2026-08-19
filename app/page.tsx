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
  const featuredProducts = await findFeaturedProducts(8);

  const latestProducts = await findLatestProducts(8);

  return (
    <>
      <Topbar />
      <Navbar />
      <CategoryMenu />

      <Hero />

      <FeaturedCategory />

      <FeaturedProducts
        products={featuredProducts}
      />

      <NearbyProducts />

      <LatestProducts
        products={latestProducts}
      />

      <PremiumBanner />

      <PopularCities />

      <WhyChooseDealUp />

      <InstallApp />

      <Footer />
    </>
  );
}