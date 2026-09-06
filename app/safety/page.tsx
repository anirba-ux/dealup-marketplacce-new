"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Home,
  LockKeyhole,
  MapPin,
  ShieldCheck,
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

export default function SafetyPage() {
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
        <section className="flex min-h-[75vh] items-center py-12 sm:py-20">
          <ScrollReveal className="w-full">
            <div className="max-w-5xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                Safe & Secure
              </p>

              <h1 className="text-[clamp(3rem,10vw,8rem)] font-black leading-[0.88] tracking-[-0.06em]">
                TRADE
                <br />
                WITH
                <br />
                CONFIDENCE.
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
                A few simple habits can make buying and selling on a local
                marketplace safer and more comfortable.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Steps */}
        <section className="space-y-5 sm:space-y-8">
          {/* 01 */}
          <ScrollReveal>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#091526] sm:p-10 lg:p-14">
              <div className="grid gap-8 lg:grid-cols-[0.35fr_1fr] lg:items-center">
                <span className="text-7xl font-black text-slate-200 dark:text-white/10">
                  01
                </span>

                <div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <LockKeyhole className="h-7 w-7" />
                  </div>

                  <h2 className="text-3xl font-black sm:text-5xl">
                    Know the seller.
                  </h2>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
                    Review the seller profile and available verification or
                    trust signals before deciding to continue.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* 02 */}
          <ScrollReveal>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-100 p-6 dark:border-white/10 dark:bg-[#0b192b] sm:p-10 lg:p-14">
              <div className="grid gap-8 lg:grid-cols-[1fr_0.35fr] lg:items-center">
                <div className="lg:order-1">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>

                  <h2 className="text-3xl font-black sm:text-5xl">
                    Check before you pay.
                  </h2>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
                    Inspect the product, confirm the details and make sure
                    everything matches the listing before completing a
                    transaction.
                  </p>
                </div>

                <span className="text-7xl font-black text-slate-200 dark:text-white/10 lg:order-2 lg:text-right">
                  02
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* 03 */}
          <ScrollReveal>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#091526] sm:p-10 lg:p-14">
              <div className="grid gap-8 lg:grid-cols-[0.35fr_1fr] lg:items-center">
                <span className="text-7xl font-black text-slate-200 dark:text-white/10">
                  03
                </span>

                <div>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <MapPin className="h-7 w-7" />
                  </div>

                  <h2 className="text-3xl font-black sm:text-5xl">
                    Meet safely.
                  </h2>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-8">
                    When meeting in person, choose a public and comfortable
                    location and let someone you trust know where you are.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Final */}
        <section className="py-24 text-center sm:py-32">
          <ScrollReveal>
            <ShieldCheck className="mx-auto mb-6 h-12 w-12 text-blue-500" />

            <h2 className="text-4xl font-black sm:text-6xl">
              Stay smart.
              <br />
              Stay safe.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-slate-600 dark:text-slate-400">
              Safe trading starts with simple decisions.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700"
            >
              Explore DealUp
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