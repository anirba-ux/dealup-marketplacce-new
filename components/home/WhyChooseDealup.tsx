"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";

const features = [
  {
    title: "Safe & Secure",
    description: "Trade confidently with secure listings and trusted users.",
    icon: ShieldCheck,
    accent: "blue",
    href: "/safety",
  },
  {
    title: "Verified Sellers",
    description: "Connect only with verified and genuine local sellers.",
    icon: BadgeCheck,
    accent: "orange",
    href: "/verified-sellers",
  },
  {
    title: "Local Marketplace",
    description: "Buy and sell products easily within your nearby cities.",
    icon: MapPin,
    accent: "blue",
    href: "/local-marketplace",
  },
  {
    title: "Sell Faster",
    description: "Reach more buyers and sell your products quickly.",
    icon: Zap,
    accent: "orange",
    href: "/sell-faster",
  },
];

export default function WhyChooseDealup() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /*
   * Auto carousel
   */
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 1800);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goPrevious = () => {
    setActiveIndex(
      (current) => (current - 1 + features.length) % features.length,
    );
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % features.length);
  };

  /*
   * Mobile card positioning
   */
  const getCardPosition = (index: number) => {
    const total = features.length;

    let difference = index - activeIndex;

    if (difference > total / 2) {
      difference -= total;
    }

    if (difference < -total / 2) {
      difference += total;
    }

    return difference;
  };

  return (
    <section className="overflow-hidden bg-slate-50 py-16 transition-colors duration-300 dark:bg-[#0D162A] sm:py-20 lg:py-24">
      <Container>
        {/* =========================================================
            SECTION HEADING
        ========================================================== */}

        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <span className="inline-flex items-center rounded-full bg-[#1565d8]/10 px-4 py-2 text-xs font-bold text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-400">
            WHY CHOOSE DEALUP
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Everything You Need for
            <span className="block bg-gradient-to-r from-[#1565d8] to-[#f5a623] bg-clip-text text-transparent">
              Better Local Deals
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 dark:text-slate-400">
            DealUp makes local buying and selling safer, simpler and faster with
            trusted sellers and powerful marketplace features.
          </p>
        </div>

        {/* =========================================================
            MOBILE CENTER-FOCUSED CAROUSEL
        ========================================================== */}

        <div
          className="relative mx-auto block h-[385px] w-full max-w-md md:max-w-xl lg:hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards */}
          <div className="absolute inset-0">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const position = getCardPosition(index);

              /*
               * Only nearby cards are visible.
               */
              if (Math.abs(position) > 1) {
                return null;
              }

              const isCenter = position === 0;

              const translateX =
                position === 0 ? "0%" : position === -1 ? "-66%" : "66%";

              const scale = isCenter ? 1 : 0.82;
              const opacity = isCenter ? 1 : 0.45;
              const zIndex = isCenter ? 30 : 10;

              return (
                <div
                  key={feature.title}
                  className="absolute left-1/2 top-1/2 w-[76%] max-w-[300px] transition-all duration-500 ease-out"
                  style={{
                    transform: `translate(-50%, -50%) translateX(${translateX}) scale(${scale})`,
                    opacity,
                    zIndex,
                  }}
                >
                  <Link
                    href={feature.href}
                    className={`group relative flex h-[280px] flex-col overflow-hidden rounded-3xl border bg-white p-6 shadow-xl transition-all duration-500 dark:bg-slate-900 ${
                      isCenter
                        ? "border-[#1565d8]/30 shadow-[0_25px_60px_rgba(21,101,216,0.18)] dark:border-blue-500/30 dark:shadow-[0_25px_60px_rgba(21,101,216,0.22)]"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {/* Glow */}
                    <div
                      className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl ${
                        feature.accent === "orange"
                          ? "bg-[#f5a623]/15"
                          : "bg-[#1565d8]/15"
                      }`}
                    />

                    {/* Icon */}
                    <div
                      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 ${
                        feature.accent === "orange"
                          ? "bg-[#f5a623]/10 text-[#f5a623] group-hover:scale-110 group-hover:bg-[#f5a623] group-hover:text-white"
                          : "bg-[#1565d8]/10 text-[#1565d8] group-hover:scale-110 group-hover:bg-[#1565d8] group-hover:text-white dark:bg-[#1565d8]/15 dark:text-blue-400"
                      }`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    {/* Content */}
                    <div className="relative">
                      <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {feature.description}
                      </p>
                    </div>

                    {/* Explore */}
                    <div className="relative mt-auto flex min-h-[45px] items-end justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-sm font-bold text-[#1565d8] dark:text-blue-400">
                        Explore
                      </span>

                      <ArrowRight className="h-5 w-5 text-[#1565d8] transition-transform duration-300 group-hover:translate-x-2 dark:text-blue-400" />
                    </div>

                    {/* Bottom accent */}
                    <div
                      className={`absolute bottom-0 left-0 h-1 rounded-full transition-all duration-500 ${
                        isCenter ? "w-full" : "w-1/3"
                      } ${
                        feature.accent === "orange"
                          ? "bg-[#f5a623]"
                          : "bg-[#1565d8]"
                      }`}
                    />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Previous */}
          <button
            type="button"
            aria-label="Previous feature"
            onClick={goPrevious}
            className="absolute left-1 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-[#1565d8] hover:text-[#1565d8] dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400 sm:left-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Next */}
          <button
            type="button"
            aria-label="Next feature"
            onClick={goNext}
            className="absolute right-1 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition-all hover:scale-110 hover:border-[#1565d8] hover:text-[#1565d8] dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400 sm:right-3"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots + pause */}
          <div className="absolute bottom-1 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3">
            <div className="flex items-center gap-2">
              {features.map((feature, index) => (
                <button
                  key={feature.title}
                  type="button"
                  aria-label={`Go to ${feature.title}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-7 bg-[#1565d8]"
                      : "w-2 bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label={isPaused ? "Resume carousel" : "Pause carousel"}
              onClick={() => setIsPaused((value) => !value)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {isPaused ? "▶" : "Ⅱ"}
            </button>
          </div>

          {/* Swipe hint */}
          <p className="absolute bottom-[-25px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Auto rotating • Tap a card to explore
          </p>
        </div>

        {/* =========================================================
            DESKTOP GRID
        ========================================================== */}

        <div className="hidden grid-cols-4 gap-6 lg:grid">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative flex min-h-[315px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-[#1565d8]/40 hover:shadow-[0_25px_60px_rgba(21,101,216,0.15)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/40"
              >
                {/* Glow */}
                <div
                  className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-100 ${
                    feature.accent === "orange"
                      ? "bg-[#f5a623]/20"
                      : "bg-[#1565d8]/20"
                  }`}
                />

                {/* Icon */}
                <div
                  className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 ${
                    feature.accent === "orange"
                      ? "bg-[#f5a623]/10 text-[#f5a623] group-hover:bg-[#f5a623] group-hover:text-white"
                      : "bg-[#1565d8]/10 text-[#1565d8] group-hover:bg-[#1565d8] group-hover:text-white dark:bg-[#1565d8]/15 dark:text-blue-400"
                  }`}
                >
                  <Icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <h3 className="relative mt-6 text-xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-[#1565d8] dark:text-white dark:group-hover:text-blue-400">
                  {feature.title}
                </h3>

                <p className="relative mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>

                {/* Explore always bottom */}
                <div className="relative mt-auto flex min-h-[45px] items-end justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <span className="text-sm font-bold text-[#1565d8] dark:text-blue-400">
                    Explore
                  </span>

                  <ArrowRight className="h-5 w-5 text-[#1565d8] transition-transform duration-300 group-hover:translate-x-2 dark:text-blue-400" />
                </div>

                {/* Accent */}
                <div
                  className={`absolute bottom-0 left-0 h-1 w-12 rounded-full transition-all duration-500 group-hover:w-full ${
                    feature.accent === "orange"
                      ? "bg-[#f5a623]"
                      : "bg-[#1565d8]"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
