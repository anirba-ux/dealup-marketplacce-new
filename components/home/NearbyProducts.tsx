"use client";

import Link from "next/link";

import { MapPin, SlidersHorizontal, ArrowRight } from "lucide-react";

import { useEffect, useState } from "react";

import ProductCard from "@/components/card/ProductCard";

import Container from "@/components/ui/Container";

import useCurrentLocation from "@/hooks/useCurrentLocation";

export default function NearbyProducts() {
  const { location, loading, error } = useCurrentLocation();

  const [products, setProducts] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [radius, setRadius] = useState(10);

  useEffect(() => {
    if (!location) return;

    async function loadNearbyProducts() {
      try {
        setIsLoading(true);

        if (!location) return;

        const { latitude, longitude } = location;

        const response = await fetch(
          `/api/products/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`,
        );

        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadNearbyProducts();
  }, [location, radius]);

  if (loading) {
    return <div className="py-12 text-center">Getting your location...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>;
  }

  return (
    <section className="bg-white py-20">
      <Container>
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-900">📍 Near You</h2>

            <p className="mt-3 text-slate-600">
              Discover products available around your current location.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[5, 10, 25, 50].map((item) => {
                const active = radius === item;

                return (
                  <button
                    key={item}
                    onClick={() => setRadius(item)}
                    className={`
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          px-5
          py-2.5
          text-sm
          font-semibold
          transition-all
          duration-300
          ${
            active
              ? "border-[#1565d8] bg-[#1565d8] text-white shadow-lg scale-105"
              : "border-slate-300 bg-white text-slate-700 hover:border-[#1565d8] hover:text-[#1565d8] hover:shadow-md hover:-translate-y-0.5"
          }
        `}
                  >
                    <MapPin size={16} />
                    {item} KM
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              <span className="font-semibold text-[#1565d8]">
                {products.length}
              </span>{" "}
              nearby products found within{" "}
              <span className="font-semibold text-slate-700">{radius} KM</span>
            </p>
          </div>
          <Link
            href={
              location
                ? `/search?nearby=true&lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`
                : "/search"
            }
            className="
    group
    inline-flex
    w-full
    md:w-auto
    items-center
    justify-center
    gap-2
    rounded-xl
    border
    border-slate-300
    bg-white
    px-5
    py-3
    text-sm
    font-semibold
    text-slate-700
    shadow-sm
    transition-all
    duration-300
    hover:border-[#1565d8]
    hover:bg-[#1565d8]
    hover:text-white
    hover:shadow-xl
    hover:scale-[1.03]
  "
          >
            <SlidersHorizontal
              size={18}
              className="transition-transform duration-300 group-hover:scale-110"
            />

            <span>Sort & Filter</span>

            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">Loading nearby products...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <h3 className="text-xl font-semibold text-slate-800">
              No nearby products found
            </h3>

            <p className="mt-2 text-slate-500">
              Try increasing the search radius.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id.toString()}
                id={product._id.toString()}
                slug={product.slug}
                title={product.title}
                price={product.price}
                image={product.thumbnail}
                seller={product.sellerName}
                sellerIsPhoneVerified={product.sellerIsPhoneVerified}
                sellerVerificationStatus={product.sellerVerificationStatus}
                sellerBadge={product.sellerBadge}
                location={product.location?.city ?? "Unknown"}
                condition={product.condition}
                createdAt={product.createdAt}
                views={product.views}
                isFeatured={product.isFeatured}
                isPremium={product.isPremium}
                isBoosted={product.isBoosted}
                distance={product.distance}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
