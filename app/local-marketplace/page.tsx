"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Home,
  MapPin,
  Navigation,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  Users,
} from "lucide-react";

const discoverySteps = [
  {
    number: "01",
    title: "Discover",
    subtitle: "Nearby Products",
    description:
      "Explore products available around your city and discover listings closer to you.",
    icon: Search,
  },
  {
    number: "02",
    title: "Choose",
    subtitle: "Your Location",
    description:
      "Use location information to understand where products and sellers are located.",
    icon: MapPin,
  },
  {
    number: "03",
    title: "Connect",
    subtitle: "With Sellers",
    description:
      "Find relevant local sellers and communicate with them about the products you are interested in.",
    icon: Users,
  },
  {
    number: "04",
    title: "Trade",
    subtitle: "Locally",
    description:
      "Meet locally, inspect the product and make a responsible transaction decision.",
    icon: Store,
  },
];

const localBenefits = [
  {
    icon: MapPin,
    title: "Nearby Discovery",
    description:
      "Find products listed around your local area without searching far away.",
  },
  {
    icon: Navigation,
    title: "Location Awareness",
    description:
      "Useful location information helps buyers understand where a listing is available.",
  },
  {
    icon: Users,
    title: "Local Connections",
    description:
      "Connect with sellers and buyers who are part of the same local marketplace.",
  },
  {
    icon: Package,
    title: "Simple Local Trade",
    description:
      "Make buying and selling more convenient by focusing on products available nearby.",
  },
];

const cities = [
  "Bansberia",
  "Hooghly",
  "Chinsurah",
  "Tribeni",
  "Kalyani",
  "Kolkata",
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

export default function LocalMarketplacePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(21,101,216,0.20),transparent_38%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_70%,rgba(245,166,35,0.07),transparent_30%)]" />

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
            {/* Animated Location */}
            <div className="relative mb-10 flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
              {/* Outer ring */}
              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-[#1565d8]/25" />

              {/* Inner ring */}
              <div className="absolute inset-4 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-dashed border-[#f5a623]/25" />

              {/* Orbit dots */}
              <span className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#1565d8]" />

              <span className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#f5a623]" />

              {/* Main location icon */}
              <div className="relative flex h-20 w-20 animate-[heroFloat_4s_ease-in-out_infinite] items-center justify-center rounded-[26px] border border-[#1565d8]/25 bg-[#0d1a2d] shadow-[0_0_60px_rgba(21,101,216,0.20)] sm:h-24 sm:w-24">
                <MapPin className="h-11 w-11 text-[#3b82f6] sm:h-12 sm:w-12" />

                {/* Location pulse */}
                <span className="absolute inset-3 animate-ping rounded-full bg-[#1565d8]/10" />
              </div>
            </div>

            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1565d8]/20 bg-[#1565d8]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400 sm:text-xs">
                <MapPin className="h-3.5 w-3.5" />
                Local Marketplace
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                Buy
                <span className="block bg-gradient-to-r from-white via-blue-400 to-[#f5a623] bg-clip-text text-transparent">
                  Local.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={220}>
              <p className="mt-3 text-3xl font-black text-slate-500 sm:text-5xl">
                Sell Local.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={350}>
              <p className="mt-7 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Discover products, connect with nearby people and make local
                buying and selling simpler on DealUp.
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
          LOCAL INTRO
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#091526] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#1565d8]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5a623]">
                Think Local
              </p>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                What&apos;s around you
                <span className="block text-[#3b82f6]">
                  matters.
                </span>
              </h2>

              <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                A local marketplace brings nearby products and people closer,
                making discovery and communication more convenient.
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
          DISCOVERY JOURNEY
      ====================================================== */}
      <section className="relative bg-[#07111f] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1565d8]">
              Local Discovery
            </p>

            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
              Discover nearby.
              <span className="block text-slate-500">
                Connect locally.
              </span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {discoverySteps.map((step, index) => {
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
          LOCAL MAP / DISCOVERY VISUAL
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#091526] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute right-[-100px] top-1/4 h-80 w-80 rounded-full bg-[#1565d8]/10 blur-[110px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {/* Map Visual */}
          <ScrollReveal>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-5 rounded-[40px] border border-[#1565d8]/10 animate-pulse" />

              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0b192b] p-5 shadow-2xl sm:p-7">
                {/* Map area */}
                <div className="relative h-[330px] overflow-hidden rounded-2xl bg-[#07111f]">
                  {/* Map lines */}
                  <div className="absolute left-[20%] top-[-20%] h-[150%] w-px rotate-[25deg] bg-white/5" />

                  <div className="absolute left-[55%] top-[-20%] h-[150%] w-px rotate-[-18deg] bg-white/5" />

                  <div className="absolute left-[-20%] top-[45%] h-px w-[150%] rotate-[-10deg] bg-white/5" />

                  <div className="absolute left-[-20%] top-[70%] h-px w-[150%] rotate-[8deg] bg-white/5" />

                  {/* Central location */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute -inset-8 animate-ping rounded-full bg-[#1565d8]/10" />

                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#1565d8] text-white shadow-[0_0_35px_rgba(21,101,216,0.45)]">
                      <Navigation className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Nearby locations */}
                  <div className="absolute left-[22%] top-[28%]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d1d32] text-[#3b82f6] shadow-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="absolute right-[20%] top-[23%]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d1d32] text-[#f5a623] shadow-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="absolute bottom-[22%] left-[27%]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d1d32] text-[#3b82f6] shadow-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="absolute bottom-[18%] right-[24%]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d1d32] text-[#f5a623] shadow-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Connection lines */}
                  <div className="absolute left-[28%] top-[36%] h-px w-[25%] rotate-[18deg] bg-[#1565d8]/30" />

                  <div className="absolute right-[30%] top-[37%] h-px w-[22%] rotate-[-18deg] bg-[#f5a623]/20" />

                  <div className="absolute bottom-[32%] left-[30%] h-px w-[22%] rotate-[-20deg] bg-[#1565d8]/30" />
                </div>

                {/* Location info */}
                <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/5 bg-[#07111f] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#3b82f6]">
                      <MapPin className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        Nearby Marketplace
                      </p>

                      <p className="text-[10px] text-slate-500">
                        Products around your area
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#22c55e]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={180}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5a623]">
                Your Local Area
              </p>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] sm:text-6xl">
                Your marketplace
                <span className="block text-[#3b82f6]">
                  starts nearby.
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                DealUp is designed to make local discovery easier by bringing
                nearby products and people into one marketplace experience.
              </p>

              <div className="mt-9 space-y-5">
                {localBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;

                  return (
                    <ScrollReveal
                      key={benefit.title}
                      delay={300 + index * 100}
                    >
                      <div className="group flex gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#3b82f6] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#1565d8] group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="font-bold text-white">
                            {benefit.title}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {benefit.description}
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
          CITIES
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#07111f] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1565d8]">
              Local Communities
            </p>

            <h2 className="mt-5 text-4xl font-black sm:text-6xl">
              From your city.
              <span className="block text-slate-500">
                For your community.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Discover the local marketplace experience across nearby cities
              and communities.
            </p>
          </ScrollReveal>

          {/* City pills */}
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {cities.map((city, index) => (
              <ScrollReveal key={city} delay={index * 90}>
                <div className="group flex items-center gap-2 rounded-full border border-white/10 bg-[#0b192b] px-5 py-3 text-sm font-semibold text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-[#1565d8]/40 hover:text-white">
                  <MapPin className="h-4 w-4 text-[#3b82f6] transition-transform duration-300 group-hover:scale-110" />
                  {city}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          COMMUNITY SCENE
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#091526] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-[#1565d8]/20 bg-[#0b192b] text-[#3b82f6] shadow-[0_0_50px_rgba(21,101,216,0.12)]">
              <Users className="h-9 w-9 animate-[heroFloat_4s_ease-in-out_infinite]" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#f5a623]">
              Local Connections
            </p>
          </ScrollReveal>

          <ScrollReveal delay={220}>
            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
              Closer products.
              <span className="block text-[#3b82f6]">
                Closer connections.
              </span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={350}>
            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              A local marketplace makes it easier to discover what is
              available around you and connect with people in your community.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={450}>
            <div className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
              <ShieldCheck className="h-5 w-5 text-[#3b82f6]" />
              Discover locally. Trade responsibly.
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
          <MapPin className="mx-auto h-14 w-14 animate-[heroFloat_4s_ease-in-out_infinite] text-[#3b82f6]" />

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#f5a623]">
            The Goal
          </p>

          <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            Think local.
            <span className="block bg-gradient-to-r from-[#3b82f6] to-[#f5a623] bg-clip-text text-transparent">
              Trade local.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Discover products around you, connect with your local community
            and make buying and selling more convenient.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
            <Navigation className="h-5 w-5 text-[#f5a623]" />
            Your local marketplace starts here.
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