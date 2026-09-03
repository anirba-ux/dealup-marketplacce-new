"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";

import ProductCard from "@/components/card/ProductCard";
import Container from "@/components/ui/Container";
import useCurrentLocation from "@/hooks/useCurrentLocation";

interface NearbyProduct {
  _id: string;
  slug: string;
  title: string;
  price: number;
  thumbnail: string;
  sellerName: string;

  sellerIsPhoneVerified?: boolean;
  sellerVerificationStatus?: string;
  sellerBadge?: string | null;

  sellerPremiumSeller?: boolean;
  sellerPremiumBadge?: boolean;

  location?: {
    city?: string;
    state?: string;
  };

  condition?: string;
  createdAt?: string | Date;
  views?: number;

  isFeatured?: boolean;
  isPremium?: boolean;
  isBoosted?: boolean;

  distance?: number;
}

const RADIUS_OPTIONS = [5, 10, 25, 50];

export default function NearbyProducts() {
  const {
    location,
    loading: locationLoading,
    error: locationError,
  } = useCurrentLocation();

  const [products, setProducts] = useState<NearbyProduct[]>([]);
  const [radius, setRadius] = useState(10);

  const [isLoading, setIsLoading] = useState(false);
  const [isRadiusOpen, setIsRadiusOpen] = useState(false);

  const [sortBy, setSortBy] = useState("nearest");

  /*
   * ============================================================
   * LOAD NEARBY PRODUCTS
   * ============================================================
   */
  useEffect(() => {
    if (!location) return;

    const { latitude, longitude } = location;

    async function loadNearbyProducts() {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/products/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch nearby products");
        }

        const data = await response.json();

        if (data.success) {
          setProducts(data.products ?? []);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Nearby products error:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadNearbyProducts();
  }, [location, radius]);

  /*
   * ============================================================
   * SORT PRODUCTS
   * ============================================================
   */
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "nearest") {
      return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    }

    if (sortBy === "price-low") {
      return a.price - b.price;
    }

    if (sortBy === "price-high") {
      return b.price - a.price;
    }

    if (sortBy === "newest") {
      return (
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
      );
    }

    return 0;
  });

  /*
   * ============================================================
   * LOCATION LOADING
   * ============================================================
   */
  if (locationLoading) {
    return (
      <section className="bg-white py-10 dark:bg-slate-950 sm:py-12">
        <Container>
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div
                className="
                  h-9 w-9
                  animate-spin
                  rounded-full
                  border-4
                  border-slate-200
                  border-t-[#1565d8]
                  dark:border-slate-700
                  dark:border-t-blue-500
                "
              />

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Finding products near you...
              </p>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  /*
   * ============================================================
   * LOCATION ERROR
   * ============================================================
   */
  if (locationError || !location) {
    return (
      <section className="bg-white py-10 dark:bg-slate-950 sm:py-12">
        <Container>
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-slate-50
              px-5 py-8
              text-center
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div
              className="
                mx-auto mb-3
                flex h-11 w-11
                items-center justify-center
                rounded-full
                bg-blue-50
                text-[#1565d8]
                dark:bg-blue-950/40
                dark:text-blue-400
              "
            >
              <MapPin size={20} />
            </div>

            <h3
              className="
                text-base
                font-semibold
                text-slate-800
                dark:text-slate-100
              "
            >
              Location is required
            </h3>

            <p
              className="
                mx-auto mt-1
                max-w-md
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              Allow location access to discover products available near you.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-white py-10 dark:bg-slate-950 sm:py-12 lg:py-14">
      <Container>
        {/* =========================================================
            HEADER
        ========================================================== */}
        <div className="mb-5 flex flex-col gap-4 sm:mb-6">
          <div
            className="
              flex flex-col gap-4
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            {/* =====================================================
                TITLE
            ====================================================== */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-full
                    bg-blue-50
                    text-[#1565d8]
                    dark:bg-blue-950/40
                    dark:text-blue-400
                  "
                >
                  <MapPin size={17} />
                </div>

                <span
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#1565d8]
                    dark:text-blue-400
                  "
                >
                  Discover Nearby
                </span>
              </div>

              <h2
                className="
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                  sm:text-2xl
                  lg:text-3xl
                "
              >
                Products Near You
              </h2>

              <p
                className="
                  mt-1
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Find great deals from sellers around your location.
              </p>
            </div>

            {/* =====================================================
                RADIUS FILTER
            ====================================================== */}
            <div className="relative w-full sm:w-auto">
              {/* ===================================================
                  MOBILE DROPDOWN
              ==================================================== */}
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => setIsRadiusOpen((prev) => !prev)}
                  aria-expanded={isRadiusOpen}
                  className="
  flex w-full
  items-center
  justify-between
  gap-3
  rounded-xl
  border
  border-slate-200
  bg-white
  px-4 py-3
  text-sm
  font-semibold
  text-slate-700
  shadow-sm
  transition-all
  duration-200
  ease-out
  hover:-translate-y-0.5
  hover:border-[#1565d8]
  hover:bg-[#1565d8]
  hover:text-white
  hover:shadow-md
  active:translate-y-0
  focus:outline-none
  focus:ring-2
  focus:ring-blue-500/20
  dark:border-slate-700
  dark:bg-slate-900
  dark:text-slate-200
  dark:hover:border-blue-500
  dark:hover:bg-[#1565d8]
  dark:hover:text-white
"
                >
                  <span className="flex items-center gap-2">
                    <MapPin
                      size={16}
                      className="text-[#1565d8] dark:text-blue-400"
                    />
                    Within {radius} km
                  </span>

                  <ChevronDown
                    size={18}
                    className={`
                      transition-transform
                      duration-200
                      ${isRadiusOpen ? "rotate-180" : ""}
                    `}
                  />
                </button>

                {/* =================================================
                    DROPDOWN OPTIONS
                ================================================== */}
                {isRadiusOpen && (
                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      z-40
                      mt-2
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      p-1.5
                      shadow-xl
                      dark:border-slate-700
                      dark:bg-slate-900
                    "
                  >
                    {RADIUS_OPTIONS.map((value) => {
                      const isActive = radius === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setRadius(value);
                            setIsRadiusOpen(false);
                          }}
                          className={`
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-lg
                            px-4 py-3
                            text-left
                            text-sm
                            font-medium
                            transition-all
                            duration-150
                            ease-out
                            ${
                              isActive
                                ? "bg-[#1565d8] text-white shadow-sm hover:bg-[#0f52ba] hover:shadow-md"
                                : "text-slate-700 hover:bg-blue-50 hover:text-[#1565d8] hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                            }
                          `}
                        >
                          <span>Within {value} km</span>

                          {isActive && <Check size={16} strokeWidth={2.5} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ===================================================
                  DESKTOP RADIUS PILLS
              ==================================================== */}
              <div className="hidden items-center gap-2 sm:flex">
                {RADIUS_OPTIONS.map((value) => {
                  const isActive = radius === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRadius(value)}
                      className={`
                        rounded-full
                        border
                        px-4 py-2
                        text-sm
                        font-semibold
                        transition-all
                        duration-200
                        ease-out
                        hover:-translate-y-0.5
                        hover:shadow-md
                        active:translate-y-0
                        ${
                          isActive
                            ? "border-[#1565d8] bg-[#1565d8] text-white shadow-md shadow-blue-500/20 hover:border-[#0f52ba] hover:bg-[#0f52ba] hover:shadow-lg"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#1565d8] hover:bg-blue-50 hover:text-[#1565d8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                        }
                      `}
                    >
                      {value} km
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =========================================================
              SORT ROW
          ========================================================== */}
          <div
            className="
              flex
              flex-col
              gap-3
              border-t
              border-slate-100
              pt-4
              dark:border-slate-800
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            {/* Result count */}
            <div className="flex items-center gap-2">
              <span
                className="
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {isLoading
                  ? "Finding nearby products..."
                  : `${sortedProducts.length} ${
                      sortedProducts.length === 1 ? "product" : "products"
                    } within ${radius} km`}
              </span>
            </div>

            {/* =====================================================
                SORT
            ====================================================== */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal
                size={16}
                className="text-slate-400 dark:text-slate-500"
              />

              <label
                htmlFor="nearby-sort"
                className="
                  hidden
                  text-sm
                  font-medium
                  text-slate-600
                  dark:text-slate-300
                  sm:block
                "
              >
                Sort by
              </label>

              <select
                id="nearby-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3 py-2
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition-all
                  duration-200
                  hover:border-[#1565d8]
                  hover:bg-blue-50
                  focus:border-[#1565d8]
                  focus:ring-2
                  focus:ring-blue-500/20
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-200
                  dark:hover:border-blue-500
                  dark:hover:bg-blue-950/30
                "
              >
                <option value="nearest">Nearest</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================
            LOADING STATE
        ========================================================== */}
        {isLoading && (
          <div
            className="
              flex
              snap-x
              gap-3
              overflow-hidden
              pb-2
              sm:grid
              sm:grid-cols-2
              sm:gap-5
              lg:grid-cols-4
              lg:gap-6
            "
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  w-[78%]
                  shrink-0
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  sm:w-auto
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                <div
                  className="
                    aspect-[4/3]
                    animate-pulse
                    bg-slate-200
                    dark:bg-slate-800
                  "
                />

                <div className="space-y-3 p-4">
                  <div
                    className="
                      h-4
                      animate-pulse
                      rounded
                      bg-slate-200
                      dark:bg-slate-800
                    "
                  />

                  <div
                    className="
                      h-6
                      w-2/3
                      animate-pulse
                      rounded
                      bg-slate-200
                      dark:bg-slate-800
                    "
                  />

                  <div
                    className="
                      h-3
                      w-1/2
                      animate-pulse
                      rounded
                      bg-slate-200
                      dark:bg-slate-800
                    "
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            EMPTY STATE
        ========================================================== */}
        {!isLoading && sortedProducts.length === 0 && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-slate-50
              px-5 py-12
              text-center
              dark:border-slate-700
              dark:bg-slate-900/60
            "
          >
            <div
              className="
                mx-auto
                mb-4
                flex
                h-14 w-14
                items-center
                justify-center
                rounded-full
                bg-blue-50
                text-[#1565d8]
                dark:bg-blue-950/40
                dark:text-blue-400
              "
            >
              <MapPin size={24} />
            </div>

            <h3
              className="
                text-base
                font-semibold
                text-slate-800
                dark:text-slate-100
              "
            >
              No products found nearby
            </h3>

            <p
              className="
                mx-auto
                mt-1
                max-w-md
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              Try increasing the search radius to discover more products around
              you.
            </p>
          </div>
        )}

        {/* =========================================================
            PRODUCTS
        ========================================================== */}
        {!isLoading && sortedProducts.length > 0 && (
          <>
            <div
              className="
                flex
                snap-x
                snap-mandatory
                gap-3
                overflow-x-auto
                scroll-smooth
                pb-4
                [-ms-overflow-style:none]
                [scrollbar-width:none]
                sm:gap-5
                lg:grid
                lg:grid-cols-4
                lg:gap-6
                lg:overflow-visible
                lg:pb-0
              "
            >
              {sortedProducts.map((product) => (
                <div
                  key={product._id.toString()}
                  className="
                    w-[78%]
                    shrink-0
                    snap-start
                    sm:w-[46%]
                    md:w-[32%]
                    lg:w-auto
                  "
                >
                  <ProductCard
                    id={product._id.toString()}
                    slug={product.slug}
                    title={product.title}
                    price={product.price}
                    image={product.thumbnail}
                    seller={product.sellerName}
                    sellerIsPhoneVerified={product.sellerIsPhoneVerified}
                    sellerVerificationStatus={product.sellerVerificationStatus}
                    sellerBadge={product.sellerBadge}
                    sellerPremiumSeller={product.sellerPremiumSeller}
                    sellerPremiumBadge={product.sellerPremiumBadge ?? false}
                    location={product.location?.city ?? "Unknown"}
                    condition={product.condition ?? "Used"}
                    createdAt={product.createdAt ?? new Date()}
                    views={product.views ?? 0}
                    isFeatured={product.isFeatured}
                    isPremium={product.isPremium}
                    isBoosted={product.isBoosted}
                    distance={product.distance}
                  />
                </div>
              ))}
            </div>

            {/* =====================================================
                MOBILE SWIPE HINT
            ====================================================== */}
            {sortedProducts.length > 1 && (
              <div className="mt-1 flex items-center justify-center gap-2 lg:hidden">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1565d8]" />

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  Swipe to explore more
                </span>

                <ArrowRight
                  size={13}
                  className="text-slate-400 dark:text-slate-500"
                />
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}
