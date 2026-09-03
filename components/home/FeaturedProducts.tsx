"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ProductCard from "@/components/card/ProductCard";
import Container from "@/components/ui/Container";

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
   FEATURED PRODUCT
========================================================= */

interface FeaturedProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  location: string;
  image: string;
  seller: string;

  sellerIsPhoneVerified?: boolean;

  sellerVerificationStatus?: string | null;

  sellerBadge?: SellerBadge | string | null;

  condition: string;

  sellerPremiumSeller?: boolean;

  sellerPremiumBadge?: boolean;

  createdAt: string;

  isFeatured?: boolean;
  isPremium?: boolean;
  isBoosted?: boolean;

  views: number;
}

/* =========================================================
   PROPS
========================================================= */

interface FeaturedProductsProps {
  products: FeaturedProduct[];
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FeaturedProducts({
  products,
}: FeaturedProductsProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  /* =======================================================
     MOUSE DRAG STATE
  ======================================================= */

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const [dragging, setDragging] = useState(false);

  /* =======================================================
     MAXIMUM 20 PRODUCTS
  ======================================================= */

  const featuredProducts = products.slice(0, 20);

  /* =======================================================
     ARROW NAVIGATION
  ======================================================= */

  const scrollCarousel = (direction: "left" | "right") => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const scrollAmount =
      window.innerWidth < 640 ? 290 : 350;

    carousel.scrollBy({
      left:
        direction === "right"
          ? scrollAmount
          : -scrollAmount,
      behavior: "smooth",
    });
  };

  /* =======================================================
     MOUSE DRAG START
  ======================================================= */

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    // Only mouse drag
    if (event.pointerType !== "mouse") return;

    isDragging.current = true;
    hasDragged.current = false;

    startX.current = event.clientX;
    startScrollLeft.current = carousel.scrollLeft;

    setDragging(true);

    carousel.setPointerCapture(event.pointerId);
  };

  /* =======================================================
     MOUSE DRAG MOVE
  ======================================================= */

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    const carousel = carouselRef.current;

    if (!carousel || !isDragging.current) return;

    // Only mouse drag
    if (event.pointerType !== "mouse") return;

    const distance =
      event.clientX - startX.current;

    // Prevent tiny accidental movement
    if (Math.abs(distance) > 5) {
      hasDragged.current = true;
    }

    carousel.scrollLeft =
      startScrollLeft.current - distance;
  };

  /* =======================================================
     MOUSE DRAG END
  ======================================================= */

  const handlePointerUp = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    if (event.pointerType !== "mouse") return;

    isDragging.current = false;

    setDragging(false);

    if (carousel.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(
        event.pointerId
      );
    }
  };

  /* =======================================================
     POINTER CANCEL
  ======================================================= */

  const handlePointerCancel = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    isDragging.current = false;

    setDragging(false);

    if (carousel.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(
        event.pointerId
      );
    }
  };

  /* =======================================================
     PREVENT CLICK AFTER DRAG
  ======================================================= */

  const handleClickCapture = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (hasDragged.current) {
      event.preventDefault();
      event.stopPropagation();

      hasDragged.current = false;
    }
  };

  /* =======================================================
     DON'T SHOW EMPTY SECTION
  ======================================================= */

  if (!featuredProducts.length) {
    return null;
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <section
      className="
        bg-slate-50
        py-12
        transition-colors
        duration-300
        dark:bg-slate-950
        sm:py-16
        lg:py-20
      "
    >
      <Container>

        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            mb-7
            flex
            items-center
            justify-between
            gap-2
            sm:mb-9
            sm:items-end
            sm:gap-4
            lg:mb-10
          "
        >

          {/* =================================================
              TITLE
          ================================================= */}

          <div className="min-w-0">

            <h2
              className="
                whitespace-nowrap
                text-[21px]
                font-bold
                leading-tight
                text-slate-700
                dark:text-white
                sm:text-3xl
                lg:text-4xl
              "
            >
              Featured Products
            </h2>

            <p
              className="
                mt-2
                max-w-xl
                text-sm
                leading-5
                text-slate-500
                dark:text-slate-400
                sm:mt-3
                sm:text-base
                sm:leading-6
                lg:text-lg
              "
            >
              Discover trending products from trusted sellers.
            </p>

          </div>

          {/* =================================================
              RIGHT CONTROLS
          ================================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >

            {/* =================================================
                PREVIOUS
            ================================================== */}

            <button
              type="button"
              aria-label="Previous products"
              onClick={() =>
                scrollCarousel("left")
              }
              className="
                hidden
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
                hover:border-[#1565D8]
                hover:bg-blue-50
                hover:text-[#1565D8]
                active:scale-95
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:border-[#1976F3]
                dark:hover:bg-blue-950/40
                dark:hover:text-[#4d9aff]
                sm:flex
              "
            >
              <ChevronLeft size={20} />
            </button>

            {/* =================================================
                NEXT
            ================================================== */}

            <button
              type="button"
              aria-label="Next products"
              onClick={() =>
                scrollCarousel("right")
              }
              className="
                hidden
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
                hover:border-[#1565D8]
                hover:bg-blue-50
                hover:text-[#1565D8]
                active:scale-95
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-300
                dark:hover:border-[#1976F3]
                dark:hover:bg-blue-950/40
                dark:hover:text-[#4d9aff]
                sm:flex
              "
            >
              <ChevronRight size={20} />
            </button>

            {/* =================================================
                VIEW ALL
            ================================================== */}

            <Link
              href="/search"
              className="
                flex
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[#1565D8]
                px-3
                py-2.5
                text-sm
                font-semibold
                text-[#1565D8]
                transition-all
                duration-200
                hover:bg-[#1565D8]
                hover:text-white
                active:scale-95
                dark:border-[#1976F3]
                dark:text-[#4d9aff]
                dark:hover:bg-[#1976F3]
                dark:hover:text-white
                sm:px-5
              "
            >
              <span className="sm:hidden">
                View All
              </span>

              <span className="hidden sm:inline">
                View All Products
              </span>
            </Link>

          </div>
        </div>

        {/* =================================================
            PRODUCT CAROUSEL
        ================================================== */}

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
            snap-x
            snap-mandatory
            gap-4
            overflow-x-auto
            overscroll-x-contain
            touch-pan-x
            scroll-smooth
            px-4
            pb-4
            select-none
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden

            sm:-mx-6
            sm:gap-5
            sm:px-6

            lg:-mx-8
            lg:gap-6
            lg:px-8

            ${
              dragging
                ? "cursor-grabbing"
                : "cursor-grab"
            }
          `}
        >

          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="
                w-[78vw]
                min-w-[78vw]
                max-w-[340px]
                shrink-0
                snap-start
                touch-pan-x

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

                location={product.location}

                image={product.image}

                seller={product.seller}

                sellerIsPhoneVerified={
                  product.sellerIsPhoneVerified
                }

                sellerVerificationStatus={
                  product.sellerVerificationStatus ??
                  undefined
                }

                sellerBadge={
                  product.sellerBadge
                }

                condition={
                  product.condition
                }

                sellerPremiumSeller={
                  product.sellerPremiumSeller
                }

                sellerPremiumBadge={
                  product.sellerPremiumBadge
                }

                createdAt={
                  product.createdAt
                }

                isFeatured={
                  product.isFeatured
                }

                isPremium={
                  product.isPremium
                }

                isBoosted={
                  product.isBoosted
                }

                views={
                  product.views
                }

              />

            </div>
          ))}

        </div>

        {/* =================================================
            MOBILE SWIPE INDICATOR
        ================================================== */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-center
            gap-1.5
            sm:hidden
          "
        >

          <span
            className="
              h-1.5
              w-5
              rounded-full
              bg-[#1565D8]
              dark:bg-[#1976F3]
            "
          />

          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-slate-300
              dark:bg-slate-700
            "
          />

          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-slate-300
              dark:bg-slate-700
            "
          />

          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-slate-300
              dark:bg-slate-700
            "
          />

          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-slate-300
              dark:bg-slate-700
            "
          />

        </div>

        {/* =================================================
            SWIPE HINT
        ================================================== */}

        <p
          className="
            mt-2
            text-center
            text-[11px]
            font-medium
            text-slate-400
            dark:text-slate-500
            sm:hidden
          "
        >
          ← Swipe to explore products →
        </p>

      </Container>
    </section>
  );
}