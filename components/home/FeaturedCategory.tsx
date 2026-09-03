"use client";

import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Link from "next/link";

import {
  Smartphone,
  Car,
  Bike,
  Laptop,
  Home,
  Shirt,
  Briefcase,
  Wrench,
  ChevronRight,
} from "lucide-react";

const categories = [
  {
    title: "Mobiles",
    slug: "mobiles",
    icon: Smartphone,
    color: "#1565D8",
    soft: "rgba(21,101,216,0.16)",
  },
  {
    title: "Cars",
    slug: "cars",
    icon: Car,
    color: "#F97316",
    soft: "rgba(249,115,22,0.16)",
  },
  {
    title: "Bikes",
    slug: "bikes",
    icon: Bike,
    color: "#10B981",
    soft: "rgba(16,185,129,0.16)",
  },
  {
    title: "Electronics",
    slug: "electronics",
    icon: Laptop,
    color: "#8B5CF6",
    soft: "rgba(139,92,246,0.16)",
  },
  {
    title: "Property",
    slug: "property",
    icon: Home,
    color: "#F43F5E",
    soft: "rgba(244,63,94,0.16)",
  },
  {
    title: "Fashion",
    slug: "fashion",
    icon: Shirt,
    color: "#06B6D4",
    soft: "rgba(6,182,212,0.16)",
  },
  {
    title: "Jobs",
    slug: "jobs",
    icon: Briefcase,
    color: "#F59E0B",
    soft: "rgba(245,158,11,0.16)",
  },
  {
    title: "Services",
    slug: "services",
    icon: Wrench,
    color: "#2563EB",
    soft: "rgba(37,99,235,0.16)",
  },
];

export default function FeaturedCategories() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  // =========================================================
  // AUTO CAROUSEL
  // =========================================================

  useEffect(() => {
    if (isInteracting) return;

    const interval = window.setInterval(() => {
      const carousel = carouselRef.current;

      if (!carousel) return;

      const cards =
        carousel.querySelectorAll<HTMLElement>("[data-category-card]");

      if (!cards.length) return;

      const nextIndex =
        activeIndex >= cards.length - 1 ? 0 : activeIndex + 1;

      const nextCard = cards[nextIndex];

      carousel.scrollTo({
        left: nextCard.offsetLeft - carousel.offsetLeft,
        behavior: "smooth",
      });

      setActiveIndex(nextIndex);
    }, 2800);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeIndex, isInteracting]);

  // =========================================================
  // DETECT SCROLL / SWIPE
  // =========================================================

  const handleScroll = () => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const cards =
      carousel.querySelectorAll<HTMLElement>("[data-category-card]");

    if (!cards.length) return;

    const scrollPosition = carousel.scrollLeft;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - scrollPosition);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  };

  return (
    <section
      className="
        bg-white
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

        <div className="mb-7 sm:mb-10 lg:mb-12">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-lg sm:text-2xl">✨</span>

              <h2
                className="
                  whitespace-nowrap
                  text-[22px]
                  font-bold
                  leading-tight
                  text-slate-900
                  dark:text-white
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                Browse Categories
              </h2>
            </div>

            <Link
              href="/search"
              className="
                group
                flex
                shrink-0
                items-center
                gap-0.5
                rounded-lg
                px-1
                py-1
                text-sm
                font-semibold
                text-[#1565D8]
                transition-all
                duration-200
                hover:bg-blue-50
                hover:text-[#0f52ba]
                active:scale-95
                dark:text-blue-400
                dark:hover:bg-blue-950/40
                dark:hover:text-blue-300
              "
            >
              <span>See all</span>

              <ChevronRight
                size={17}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />
            </Link>
          </div>

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
            Find everything you need from trusted local sellers.
          </p>
        </div>

        {/* =================================================
            DESKTOP GRID
        ================================================== */}

        <div
          className="
            hidden
            grid-cols-2
            gap-5
            sm:grid
            lg:grid-cols-4
            lg:gap-6
          "
        >
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}`}
                className="
                  group
                  relative
                  flex
                  min-h-[155px]
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                  transition-all
                  duration-500
                  ease-out
                  hover:z-10
                  hover:scale-[1.035]
                  hover:shadow-2xl
                  dark:border-slate-800
                  dark:bg-slate-900
                "
                style={{
                  ["--category-color" as string]: category.color,
                  ["--category-soft" as string]: category.soft,
                }}
              >
                {/* =================================================
                    3D GLASS CURVE
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -left-20
                    -top-24
                    h-[230px]
                    w-[230px]
                    rounded-full
                    opacity-0
                    blur-[1px]
                    transition-all
                    duration-500
                    ease-out
                    group-hover:left-[-20px]
                    group-hover:top-[-35px]
                    group-hover:h-[430px]
                    group-hover:w-[430px]
                    group-hover:opacity-100
                  "
                  style={{
                    background: `radial-gradient(
                      circle at 30% 30%,
                      ${category.soft} 0%,
                      rgba(255,255,255,0.10) 38%,
                      transparent 72%
                    )`,
                  }}
                />

                {/* Glass highlight */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -left-10
                    -top-10
                    h-40
                    w-40
                    rounded-full
                    border
                    border-white/50
                    opacity-0
                    transition-all
                    duration-500
                    group-hover:left-[-20px]
                    group-hover:top-[-20px]
                    group-hover:h-[300px]
                    group-hover:w-[300px]
                    group-hover:opacity-100
                    dark:border-white/10
                  "
                />

                {/* Content */}

                <div className="relative z-10 flex w-full items-center gap-5">
                  {/* Icon */}

                  <div
                    className="
                      flex
                      h-14
                      w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      transition-all
                      duration-500
                      group-hover:scale-110
                      group-hover:rotate-1
                    "
                    style={{
                      backgroundColor: category.soft,
                      color: category.color,
                    }}
                  >
                    <Icon size={28} strokeWidth={1.9} />
                  </div>

                  {/* Text */}

                  <div className="min-w-0">
                    <h3
                      className="
                        truncate
                        text-base
                        font-bold
                        text-slate-900
                        transition-all
                        duration-300
                        dark:text-white
                      "
                    >
                      {category.title}
                    </h3>

                    <p
                      className="
                        mt-1
                        text-xs
                        font-semibold
                        transition-colors
                        duration-300
                      "
                      style={{ color: category.color }}
                    >
                      Explore listings
                    </p>
                  </div>

                  {/* Arrow */}

                  <div
                    className="
                      ml-auto
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      opacity-70
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                      group-hover:scale-110
                    "
                    style={{
                      borderColor: category.soft,
                      color: category.color,
                    }}
                  >
                    <ChevronRight size={17} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* =================================================
            MOBILE AUTO CAROUSEL
        ================================================== */}

        <div
          ref={carouselRef}
          onScroll={handleScroll}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => {
            window.setTimeout(() => {
              setIsInteracting(false);
            }, 1800);
          }}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          className="
            -mx-4
            flex
            snap-x
            snap-mandatory
            gap-3
            overflow-x-auto
            scroll-smooth
            px-4
            pb-4
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
            sm:hidden
          "
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isActive = activeIndex === index;

            return (
              <Link
                key={category.slug}
                data-category-card
                href={`/search?category=${category.slug}`}
                className={`
                  group
                  relative
                  flex
                  w-[42vw]
                  min-w-[42vw]
                  max-w-[175px]
                  shrink-0
                  snap-start
                  flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-2xl
                  border
                  bg-white
                  px-3
                  py-5
                  shadow-sm
                  transition-all
                  duration-500
                  ease-out
                  active:scale-[0.94]
                  dark:bg-slate-900

                  ${
                    isActive
                      ? `
                        scale-[1.015]
                        border-slate-300
                        shadow-lg
                        dark:border-slate-700
                      `
                      : `
                        border-slate-200
                        dark:border-slate-800
                      `
                  }
                `}
              >
                {/* =================================================
                    GLASS COLOR LAYER
                ================================================== */}

                <div
                  className={`
                    pointer-events-none
                    absolute
                    -left-14
                    -top-14
                    h-[150px]
                    w-[150px]
                    rounded-full
                    transition-all
                    duration-500
                    ease-out

                    ${
                      isActive
                        ? `
                          left-[-5px]
                          top-[-5px]
                          h-[330px]
                          w-[330px]
                          opacity-100
                        `
                        : `
                          opacity-0
                        `
                    }
                  `}
                  style={{
                    background: `radial-gradient(
                      circle at 30% 30%,
                      ${category.soft} 0%,
                      rgba(255,255,255,0.12) 42%,
                      transparent 72%
                    )`,
                  }}
                />

                {/* Curved glass edge */}

                <div
                  className={`
                    pointer-events-none
                    absolute
                    -left-8
                    -top-8
                    h-28
                    w-28
                    rounded-full
                    border
                    border-white/70
                    transition-all
                    duration-500
                    dark:border-white/10

                    ${
                      isActive
                        ? `
                          left-[-8px]
                          top-[-8px]
                          h-[250px]
                          w-[250px]
                          opacity-100
                        `
                        : `
                          opacity-0
                        `
                    }
                  `}
                />

                {/* =================================================
                    CONTENT
                ================================================== */}

                <div className="relative z-10 flex flex-col items-center">
                  {/* ICON */}

                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      transition-all
                      duration-500
                      group-hover:scale-110
                      group-active:scale-90
                    "
                    style={{
                      backgroundColor: category.soft,
                      color: category.color,
                    }}
                  >
                    <Icon size={27} strokeWidth={1.9} />
                  </div>

                  {/* TITLE */}

                  <h3
                    className="
                      mt-3
                      max-w-full
                      truncate
                      text-center
                      text-sm
                      font-bold
                      text-slate-900
                      transition-all
                      duration-300
                      dark:text-white
                    "
                  >
                    {category.title}
                  </h3>

                  {/* EXPLORE */}

                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      gap-0.5
                      text-[11px]
                      font-semibold
                      transition-all
                      duration-300
                      group-hover:translate-x-0.5
                    "
                    style={{
                      color: category.color,
                    }}
                  >
                    <span>Explore</span>

                    <ChevronRight
                      size={13}
                      className="
                        transition-transform
                        duration-300
                        group-hover:translate-x-0.5
                      "
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* =================================================
            PAGINATION
        ================================================== */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-center
            gap-1.5
            sm:hidden
          "
        >
          {categories.map((category, index) => (
            <button
              key={category.slug}
              type="button"
              aria-label={`Go to ${category.title}`}
              onClick={() => {
                const carousel = carouselRef.current;

                if (!carousel) return;

                const cards =
                  carousel.querySelectorAll<HTMLElement>(
                    "[data-category-card]",
                  );

                const card = cards[index];

                if (!card) return;

                setIsInteracting(true);
                setActiveIndex(index);

                carousel.scrollTo({
                  left: card.offsetLeft - carousel.offsetLeft,
                  behavior: "smooth",
                });

                window.setTimeout(() => {
                  setIsInteracting(false);
                }, 1800);
              }}
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-300

                ${
                  activeIndex === index
                    ? "w-5 bg-[#1565D8] dark:bg-[#1976F3]"
                    : "w-1.5 bg-slate-300 dark:bg-slate-700"
                }
              `}
            />
          ))}
        </div>

        {/* Swipe Hint */}

        <p
          className="
            mt-3
            text-center
            text-[11px]
            font-medium
            text-slate-400
            dark:text-slate-500
            sm:hidden
          "
        >
          ← Swipe to explore categories →
        </p>
      </Container>
    </section>
  );
}