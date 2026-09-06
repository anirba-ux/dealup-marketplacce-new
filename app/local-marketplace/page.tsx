"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  MapPin,
  Navigation,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useRef } from "react";

function ScrollReveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

export default function LocalMarketplacePage() {
  const cities = [
    "Bansberia",
    "Hooghly",
    "Chinsurah",
    "Tribeni",
    "Kalyani",
    "Kolkata",
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#07111f] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-10">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:px-4"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </div>

        {/* Hero */}
        <section className="relative flex min-h-[75vh] items-center py-12 sm:py-20">
          <ScrollReveal className="w-full">
            <div className="max-w-5xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                <MapPin className="h-8 w-8" />
              </div>

              <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-orange-600 dark:text-orange-400">
                Local Marketplace
              </p>

              <h1 className="text-[clamp(3rem,10vw,8rem)] font-black leading-[0.88] tracking-[-0.06em]">
                BUY
                <br />
                CLOSE.
                <br />
                SELL
                <br />
                LOCAL.
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
                Discover products around you, connect with nearby sellers and
                make local buying and selling simpler.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Step 01 */}
        <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-[#091526] dark:ring-white/10 sm:p-10 lg:p-14">
          <ScrollReveal>
            <div className="grid gap-10 lg:grid-cols-[0.35fr_1fr] lg:items-center">
              <span className="text-7xl font-black text-slate-200 dark:text-white/10 sm:text-8xl">
                01
              </span>

              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Search className="h-7 w-7" />
                </div>

                <h2 className="text-3xl font-black sm:text-5xl">
                  Discover nearby products.
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
                  Browse products based on your location and discover useful
                  listings from sellers around your area.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Step 02 */}
        <section className="py-20 sm:py-28">
          <ScrollReveal>
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                  <Navigation className="h-7 w-7" />
                </div>

                <h2 className="text-3xl font-black sm:text-5xl">
                  Choose your location.
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
                  Your location helps DealUp surface products that are more
                  relevant to where you actually want to buy or sell.
                </p>
              </div>

              <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-[#0b192b]">
                <div className="absolute h-52 w-52 rounded-full border border-blue-500/20" />
                <div className="absolute h-32 w-32 rounded-full border border-blue-500/30" />
                <MapPin className="relative z-10 h-12 w-12 animate-bounce text-blue-500" />
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Step 03 */}
        <section className="rounded-[2rem] bg-slate-100 p-6 dark:bg-[#0b192b] sm:p-10 lg:p-14">
          <ScrollReveal>
            <div className="grid gap-10 lg:grid-cols-[0.35fr_1fr] lg:items-center">
              <span className="text-7xl font-black text-slate-200 dark:text-white/10 sm:text-8xl">
                03
              </span>

              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Users className="h-7 w-7" />
                </div>

                <h2 className="text-3xl font-black sm:text-5xl">
                  Connect locally.
                </h2>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
                  Find sellers and buyers closer to you and make local
                  conversations easier.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Cities */}
        <section className="py-24 sm:py-32">
          <ScrollReveal>
            <div className="mb-10">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                Your Local Network
              </p>

              <h2 className="mt-3 text-4xl font-black sm:text-6xl">
                Start close.
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {cities.map((city, index) => (
                <div
                  key={city}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 dark:border-white/10 dark:bg-[#091526] dark:hover:border-blue-500/40"
                >
                  <span className="text-xs font-bold text-slate-300 dark:text-white/20">
                    0{index + 1}
                  </span>

                  <p className="mt-4 font-bold text-slate-800 dark:text-white">
                    {city}
                  </p>

                  <MapPin className="mt-4 h-4 w-4 text-blue-500" />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* Final CTA */}
        <section className="pb-24 text-center sm:pb-32">
          <ScrollReveal>
            <h2 className="text-4xl font-black sm:text-6xl">
              Your next deal
              <br />
              could be nearby.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-slate-600 dark:text-slate-400">
              Explore local products and discover what is available around
              you.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700"
            >
              Explore Products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </ScrollReveal>
        </section>
      </div>

      <style jsx>{`
        .reveal {
          opacity: 0;
          transform: translateY(45px);
          transition:
            opacity 800ms ease,
            transform 800ms cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </main>
  );
}