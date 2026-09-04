"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import ProductCard from "@/components/card/ProductCard";
import Container from "@/components/ui/Container";

interface FeaturedProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  location?: string;
  image: string;

  seller?: string;

  sellerIsPhoneVerified?: boolean;
  sellerVerificationStatus?: string;
  sellerBadge?: string | null;

  condition?: string;
  sellerPremiumSeller?: boolean;
  sellerPremiumBadge?: boolean;

  createdAt?: string | Date;

  isFeatured?: boolean;
  isPremium?: boolean;
  isBoosted?: boolean;

  views?: number;
}

interface FeaturedProductsProps {
  products?: FeaturedProduct[];
}

/*
 * ============================================================
 * FEATURED PRODUCTS
 * ============================================================
 *
 * Mobile:
 * - Native horizontal swipe
 * - No touch-pan-x
 * - No snap-mandatory
 * - No scroll-smooth
 * - Vertical page scrolling remains natural
 *
 * Desktop:
 * - Horizontal carousel
 * - Previous / Next buttons
 * - Mouse drag support
 *
 * ============================================================
 */

export default function FeaturedProducts({
  products = [],
}: FeaturedProductsProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const dragStartX = useRef(0);
  const scrollStartLeft = useRef(0);

  /*
   * ============================================================
   * DESKTOP CAROUSEL BUTTONS
   * ============================================================
   */

  const scrollCarousel = (direction: "left" | "right") => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const scrollAmount = 330;

    carousel.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  /*
   * ============================================================
   * DESKTOP MOUSE DRAG
   * ============================================================
   */

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    /*
     * Only enable custom dragging for mouse.
     *
     * Mobile / touch devices should use the browser's
     * native scrolling behavior.
     */
    if (event.pointerType !== "mouse") {
      return;
    }

    const carousel = carouselRef.current;

    if (!carousel) return;

    setIsDragging(true);
    setHasDragged(false);

    dragStartX.current = event.clientX;
    scrollStartLeft.current = carousel.scrollLeft;
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    /*
     * Touch devices must be left completely native.
     */
    if (event.pointerType !== "mouse") {
      return;
    }

    if (!isDragging) return;

    const carousel = carouselRef.current;

    if (!carousel) return;

    const distance = event.clientX - dragStartX.current;

    if (Math.abs(distance) > 5) {
      setHasDragged(true);
    }

    carousel.scrollLeft = scrollStartLeft.current - distance;
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    setIsDragging(false);
  };

  const handlePointerCancel = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    setIsDragging(false);
  };

  /*
   * ============================================================
   * PREVENT CARD CLICK AFTER MOUSE DRAG
   * ============================================================
   */

  const handleClickCapture = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (hasDragged) {
      event.preventDefault();
      event.stopPropagation();

      setHasDragged(false);
    }
  };

  /*
   * ============================================================
   * EMPTY STATE
   * ============================================================
   */

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      className="
        bg-slate-50
        py-10
        dark:bg-slate-950
        sm:py-12
        lg:py-14
      "
    >
      <Container>
        {/* ======================================================
            HEADER
        ======================================================= */}

        <div
          className="
            mb-5
            flex
            items-end
            justify-between
            gap-4
            sm:mb-6
          "
        >
          {/* ====================================================
              TITLE
          ===================================================== */}

          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-amber-50
                  text-[#f5a623]
                  dark:bg-amber-950/40
                  dark:text-amber-400
                "
              >
                <Star
                  size={17}
                  fill="currentColor"
                  strokeWidth={2}
                />
              </div>

              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#f5a623]
                  dark:text-amber-400
                "
              >
                Featured
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
              Featured Products
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
              Discover handpicked products and special deals from
              trusted sellers.
            </p>
          </div>

          {/* ====================================================
              DESKTOP CONTROLS
          ===================================================== */}

          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            {/* Previous */}

            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              aria-label="Previous featured products"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
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
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:border-blue-500
                dark:hover:bg-[#1565d8]
                dark:hover:text-white
              "
            >
              <ChevronLeft size={19} />
            </button>

            {/* Next */}

            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              aria-label="Next featured products"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white
                text-slate-600
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
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:border-blue-500
                dark:hover:bg-[#1565d8]
                dark:hover:text-white
              "
            >
              <ChevronRight size={19} />
            </button>

            {/* View all */}

            <Link
              href="/search"
              className="
                ml-1
                text-sm
                font-semibold
                text-[#1565d8]
                transition-colors
                duration-200
                hover:text-[#0f52ba]
                dark:text-blue-400
                dark:hover:text-blue-300
              "
            >
              View All
            </Link>
          </div>
        </div>

        {/* ======================================================
            PRODUCT CAROUSEL
        ======================================================= */}

        <div
          ref={carouselRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClickCapture={handleClickCapture}
          className={`
            -mx-4
            flex
            gap-4
            overflow-x-auto
            overscroll-x-contain
            px-4
            pb-4
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden

            sm:-mx-6
            sm:gap-5
            sm:px-6

            lg:-mx-8
            lg:gap-6
            lg:px-8

            ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          `}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="
                w-[78vw]
                min-w-[78vw]
                max-w-[340px]
                shrink-0

                sm:w-[290px]
                sm:min-w-[290px]

                lg:w-[300px]
                lg:min-w-[300px]
              "
            >
              <ProductCard
                id={product.id}
                slug={product.slug}
                title={product.title}
                price={product.price}
                image={product.image}
                seller={product.seller ?? "Seller"}
                sellerIsPhoneVerified={
                  product.sellerIsPhoneVerified ?? false
                }
                sellerVerificationStatus={
                  product.sellerVerificationStatus
                }
                sellerBadge={product.sellerBadge}
                sellerPremiumSeller={
                  product.sellerPremiumSeller ?? false
                }
                sellerPremiumBadge={
                  product.sellerPremiumBadge ?? false
                }
                location={product.location ?? "Unknown"}
                condition={product.condition ?? "Used"}
                createdAt={
                  product.createdAt ?? new Date()
                }
                views={product.views ?? 0}
                isFeatured={product.isFeatured ?? true}
                isPremium={product.isPremium ?? false}
                isBoosted={product.isBoosted ?? false}
              />
            </div>
          ))}
        </div>

        {/* ======================================================
            MOBILE SWIPE HINT
        ======================================================= */}

        {products.length > 1 && (
          <div
            className="
              mt-1
              flex
              items-center
              justify-center
              gap-2
              sm:hidden
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#1565d8]
              "
            />

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

            <ChevronRight
              size={13}
              className="
                text-slate-400
                dark:text-slate-500
              "
            />
          </div>
        )}

        {/* ======================================================
            MOBILE VIEW ALL
        ======================================================= */}

        <div className="mt-5 flex justify-center sm:hidden">
          <Link
            href="/search"
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-slate-200
              bg-white
              px-4
              py-2
              text-sm
              font-semibold
              text-[#1565d8]
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-[#1565d8]
              hover:bg-[#1565d8]
              hover:text-white
              hover:shadow-md
              active:translate-y-0
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-blue-400
              dark:hover:border-blue-500
              dark:hover:bg-[#1565d8]
              dark:hover:text-white
            "
          >
            View All
            <ChevronRight size={15} />
          </Link>
        </div>
      </Container>
    </section>
  );
}