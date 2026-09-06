"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Home,
  Image as ImageIcon,
  Megaphone,
  PackageCheck,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const sellingSteps = [
  {
    number: "01",
    title: "Create",
    subtitle: "Your Listing",
    description:
      "Add a clear title, accurate details, quality images and the right category for your product.",
    icon: PackageCheck,
  },
  {
    number: "02",
    title: "Stand",
    subtitle: "Out",
    description:
      "Use strong product information and attractive presentation to make your listing easier to notice.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Reach",
    subtitle: "More Buyers",
    description:
      "Your listing can reach buyers searching for products in your local marketplace.",
    icon: Megaphone,
  },
  {
    number: "04",
    title: "Sell",
    subtitle: "Faster",
    description:
      "Better presentation and useful information can help buyers understand your product quickly.",
    icon: Rocket,
  },
];

const sellingPoints = [
  {
    icon: ImageIcon,
    title: "Better Product Images",
    description:
      "Clear and attractive images help buyers understand what you are selling.",
  },
  {
    icon: Search,
    title: "Clear Information",
    description:
      "Accurate titles, descriptions and product details make your listing easier to evaluate.",
  },
  {
    icon: TrendingUp,
    title: "Better Visibility",
    description:
      "A well-presented listing has a better chance of getting attention from relevant buyers.",
  },
  {
    icon: Zap,
    title: "Faster Decisions",
    description:
      "Useful information helps interested buyers decide whether your product is right for them.",
  },
];

function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -70px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-16 scale-[0.94] opacity-0"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FloatingShape({
  className,
  delay = "0s",
}: {
  className: string;
  delay?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full border border-white/10 ${className}`}
      style={{
        animation: "floatShape 7s ease-in-out infinite",
        animationDelay: delay,
      }}
    />
  );
}

export default function SellFasterPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(21,101,216,0.20),transparent_38%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(245,166,35,0.08),transparent_30%)]" />

        {/* Floating shapes */}
        <FloatingShape
          className="left-[8%] top-[28%] h-28 w-28"
          delay="0s"
        />

        <FloatingShape
          className="right-[9%] top-[20%] h-20 w-20"
          delay="1.5s"
        />

        <FloatingShape
          className="bottom-[18%] left-[18%] h-12 w-12"
          delay="2s"
        />

        {/* Moving line */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 rotate-[-18deg] bg-gradient-to-r from-transparent via-[#1565d8]/40 to-transparent animate-[lineMove_6s_ease-in-out_infinite]" />

        <div className="relative mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {/* =================================================
              TOP BAR
          ================================================== */}
          <div className="flex items-center justify-between">
            {/* Back */}
            <button
              type="button"
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-300 hover:-translate-x-1 hover:border-white/20 hover:bg-white/10 hover:text-white sm:px-4"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back
            </button>

            {/* Home */}
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white sm:px-4"
            >
              <Home className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              Home
            </Link>
          </div>

          {/* =================================================
              HERO CONTENT
          ================================================== */}
          <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center text-center">
            {/* Animated Rocket */}
            <div className="relative mb-10 flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
              {/* Rings */}
              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-[#1565d8]/25" />

              <div className="absolute inset-4 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-dashed border-[#f5a623]/25" />

              {/* Orbit dots */}
              <span className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#1565d8]" />

              <span className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#f5a623]" />

              {/* Main icon */}
              <div className="relative flex h-20 w-20 animate-[heroFloat_4s_ease-in-out_infinite] items-center justify-center rounded-[26px] border border-[#1565d8]/25 bg-[#0d1a2d] shadow-[0_0_60px_rgba(21,101,216,0.20)] sm:h-24 sm:w-24">
                <Rocket className="h-10 w-10 -rotate-45 text-[#3b82f6] sm:h-12 sm:w-12" />

                {/* Speed lines */}
                <span className="absolute -bottom-3 left-3 h-1 w-8 rounded-full bg-[#f5a623]/70" />

                <span className="absolute -bottom-6 left-1 h-1 w-5 rounded-full bg-[#1565d8]/70" />
              </div>
            </div>

            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1565d8]/20 bg-[#1565d8]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400 sm:text-xs">
                <Zap className="h-3.5 w-3.5" />
                Sell Faster
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                Sell
                <span className="block bg-gradient-to-r from-white via-blue-400 to-[#f5a623] bg-clip-text text-transparent">
                  Faster.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <p className="mt-7 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Create better listings, present your products clearly and help
                buyers make faster decisions on DealUp.
              </p>
            </ScrollReveal>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
              <span>Scroll</span>

              <div className="h-10 w-px overflow-hidden bg-white/10">
                <div className="h-1/2 w-full animate-[scrollLine_2s_ease-in-out_infinite] bg-[#1565d8]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#091526] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#1565d8]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5a623]">
                The Better Listing
              </p>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Get noticed.
                <span className="block text-[#3b82f6]">
                  Get contacted.
                </span>
                Sell faster.
              </h2>

              <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                A well-presented product gives buyers the information they need
                to understand your offer quickly.
              </p>
            </div>
          </ScrollReveal>

          {/* Animated line */}
          <div className="mt-16 h-px w-full overflow-hidden bg-white/10">
            <div className="h-full w-1/3 animate-[horizontalMove_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#1565d8] to-transparent" />
          </div>
        </div>
      </section>

      {/* =====================================================
          SELLING JOURNEY
      ====================================================== */}
      <section className="relative bg-[#07111f] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1565d8]">
              The Selling Journey
            </p>

            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
              Four steps.
              <span className="block text-slate-500">
                One better listing.
              </span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sellingSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <ScrollReveal key={step.number} delay={index * 140}>
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-[#0b192b] p-6 transition-all duration-500 hover:-translate-y-3 hover:border-[#1565d8]/50 hover:bg-[#0d1d32]">
                    {/* Number */}
                    <div className="absolute right-5 top-3 text-6xl font-black text-white/[0.025] transition-all duration-500 group-hover:text-[#1565d8]/10">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-[#3b82f6] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#1565d8] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>

                    <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                      {step.number}
                    </p>

                    <h3 className="mt-2 text-2xl font-black">
                      {step.title}
                    </h3>

                    <p className="text-xl font-bold text-[#3b82f6]">
                      {step.subtitle}
                    </p>

                    <p className="mt-5 text-sm leading-6 text-slate-400">
                      {step.description}
                    </p>

                    <div className="mt-7 h-px w-8 bg-[#1565d8] transition-all duration-500 group-hover:w-full" />
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT LISTING PREVIEW
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#091526] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute right-[-100px] top-1/4 h-80 w-80 rounded-full bg-[#1565d8]/10 blur-[110px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {/* Listing Card */}
          <ScrollReveal>
            <div className="relative mx-auto w-full max-w-md">
              {/* Outer animation */}
              <div className="absolute -inset-4 rounded-[40px] border border-[#1565d8]/10 animate-pulse" />

              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0b192b] p-5 shadow-2xl sm:p-7">
                {/* Product image */}
                <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#10294a] to-[#07111f]">
                  <PackageCheck className="h-20 w-20 animate-[heroFloat_4s_ease-in-out_infinite] text-[#3b82f6]" />

                  <div className="absolute left-4 top-4 rounded-full bg-[#1565d8]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Featured Listing
                  </div>

                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#07111f]/80 px-3 py-1.5 text-[10px] font-semibold text-slate-300 backdrop-blur">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#22c55e]" />
                    Seller
                  </div>
                </div>

                {/* Product details */}
                <div className="mt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold">
                        Your Product Listing
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Clear title • Good presentation
                      </p>
                    </div>

                    <span className="text-lg font-black text-[#3b82f6]">
                      ₹••••
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    {[
                      ["Views", "128"],
                      ["Interested", "24"],
                      ["Messages", "8"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/5 bg-[#07111f] px-3 py-3 text-center"
                      >
                        <p className="text-base font-bold text-white">
                          {value}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Listing quality
                      </span>

                      <span className="text-xs font-bold text-[#22c55e]">
                        Good
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full w-[82%] animate-pulse rounded-full bg-gradient-to-r from-[#1565d8] to-[#f5a623]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={180}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5a623]">
                Make Your Listing Better
              </p>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] sm:text-6xl">
                Give buyers
                <span className="block text-[#3b82f6]">
                  a reason
                </span>
                to stop scrolling.
              </h2>

              <p className="mt-7 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Your product listing is the first thing a buyer sees. Clear
                information and strong presentation can make your product
                easier to understand.
              </p>

              <div className="mt-9 space-y-5">
                {sellingPoints.map((point, index) => {
                  const Icon = point.icon;

                  return (
                    <ScrollReveal key={point.title} delay={300 + index * 100}>
                      <div className="group flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#3b82f6] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1565d8] group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="font-bold text-white">
                            {point.title}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {point.description}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =====================================================
          FINAL SCENE
      ====================================================== */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#07111f] px-4 py-24 sm:px-6 lg:px-8">
        {/* Animated rings */}
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1565d8]/10 animate-[spin_20s_linear_infinite]" />

        <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f5a623]/10 animate-[spin_14s_linear_infinite_reverse]" />

        <ScrollReveal className="relative max-w-4xl text-center">
          <Rocket className="mx-auto h-14 w-14 animate-[heroFloat_4s_ease-in-out_infinite] -rotate-45 text-[#3b82f6]" />

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#f5a623]">
            The Goal
          </p>

          <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            List better.
            <span className="block bg-gradient-to-r from-[#3b82f6] to-[#f5a623] bg-clip-text text-transparent">
              Sell faster.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Create clear listings, show your products properly and give buyers
            the information they need to make confident decisions.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
            <Zap className="h-5 w-5 text-[#f5a623]" />
            Make every listing count.
          </div>
        </ScrollReveal>
      </section>

      {/* =====================================================
          ANIMATIONS
      ====================================================== */}
      <style jsx>{`
        @keyframes heroFloat {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-8px) scale(1.03);
          }
        }

        @keyframes floatShape {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }

          50% {
            transform: translate(25px, -20px) rotate(12deg);
          }
        }

        @keyframes scrollLine {
          0% {
            transform: translateY(-100%);
          }

          50% {
            transform: translateY(100%);
          }

          100% {
            transform: translateY(220%);
          }
        }

        @keyframes horizontalMove {
          0% {
            transform: translateX(-120%);
          }

          50% {
            transform: translateX(180%);
          }

          100% {
            transform: translateX(-120%);
          }
        }

        @keyframes lineMove {
          0%,
          100% {
            transform: translateX(-20%) rotate(-18deg);
          }

          50% {
            transform: translateX(20%) rotate(-18deg);
          }
        }
      `}</style>
    </main>
  );
}