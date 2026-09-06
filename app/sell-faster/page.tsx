"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, ImageIcon, Rocket, Target, Zap } from "lucide-react";
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

function FloatingShape({
  className,
}: {
  className: string;
}) {
  return <div className={`pointer-events-none absolute rounded-full ${className}`} />;
}

export default function SellFasterPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#07111f] dark:text-white">
      {/* Decorative shapes */}
      <FloatingShape className="right-[-100px] top-32 h-64 w-64 border border-blue-500/20 bg-blue-500/5 blur-[1px] dark:border-blue-400/20 dark:bg-blue-400/5" />

      <FloatingShape className="left-[-80px] top-[520px] h-52 w-52 border border-orange-500/20 bg-orange-500/5 dark:border-orange-400/20 dark:bg-orange-400/5" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
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
        <section className="relative flex min-h-[75vh] items-center py-12 sm:py-20 lg:min-h-[85vh]">
          <div className="max-w-5xl">
            <ScrollReveal>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                Sell Faster
              </p>

              <h1 className="text-[clamp(3rem,10vw,8rem)] font-black leading-[0.88] tracking-[-0.06em]">
                LIST.
                <br />
                STAND
                <br />
                OUT.
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
                Create better listings, reach the right local buyers and
                make your products easier to discover.
              </p>
            </ScrollReveal>

            <ScrollReveal className="mt-10">
              <Link
                href="/sell"
                className="group inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Start Selling
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>
          </div>

          {/* Motion line */}
          <div className="absolute bottom-10 right-0 hidden w-1/3 lg:block">
            <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
            <div className="mt-3 ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </section>

        {/* Feature 1 */}
        <section className="relative rounded-[2rem] bg-white px-5 py-16 shadow-sm ring-1 ring-slate-200 dark:bg-[#091526] dark:ring-white/10 sm:px-10 sm:py-20 lg:px-16">
          <ScrollReveal>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <span className="text-7xl font-black text-slate-200 dark:text-white/10 sm:text-8xl">
                  01
                </span>

                <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">
                  Better
                  <br />
                  Images.
                </h2>
              </div>

              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <ImageIcon className="h-7 w-7" />
                </div>

                <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                  Clear and attractive product photos help buyers understand
                  what you are selling and make your listing more trustworthy.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Feature 2 */}
        <section className="py-20 sm:py-28">
          <ScrollReveal>
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="order-2 lg:order-1">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                  <Target className="h-7 w-7" />
                </div>

                <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                  Use clear titles, accurate descriptions and useful product
                  details so the right buyers can quickly understand your
                  offer.
                </p>
              </div>

              <div className="order-1 lg:order-2 lg:text-right">
                <span className="text-7xl font-black text-slate-200 dark:text-white/10 sm:text-8xl">
                  02
                </span>

                <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">
                  Clear
                  <br />
                  Information.
                </h2>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Feature 3 */}
        <section className="rounded-[2rem] bg-slate-100 px-5 py-16 dark:bg-[#0b192b] sm:px-10 sm:py-20 lg:px-16">
          <ScrollReveal>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <span className="text-7xl font-black text-slate-200 dark:text-white/10 sm:text-8xl">
                  03
                </span>

                <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">
                  More
                  <br />
                  Visibility.
                </h2>
              </div>

              <div>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Rocket className="h-7 w-7" />
                </div>

                <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                  Reach nearby buyers through local discovery and strong
                  product presentation. Better visibility can lead to faster
                  conversations.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center sm:py-32">
          <ScrollReveal>
            <Zap className="mx-auto mb-6 h-12 w-12 text-orange-500" />

            <h2 className="text-4xl font-black tracking-tight sm:text-6xl">
              Ready to sell
              <br />
              faster?
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-slate-600 dark:text-slate-400">
              Put your product in front of local buyers today.
            </p>

            <Link
              href="/sell"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-600"
            >
              Create Listing
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