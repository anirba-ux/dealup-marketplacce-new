"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  ImageIcon,
  Megaphone,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create",
    subtitle: "Your Listing",
    description:
      "Add clear product images, an accurate title, price and useful information so buyers immediately understand your product.",
    icon: ImageIcon,
    accent: "blue",
  },
  {
    number: "02",
    title: "Stand",
    subtitle: "Out",
    description:
      "A clear and attractive listing makes your product easier to notice and helps create a stronger first impression.",
    icon: Sparkles,
    accent: "orange",
  },
  {
    number: "03",
    title: "Reach",
    subtitle: "More Buyers",
    description:
      "Connect with buyers around your local area and make your products easier to discover.",
    icon: Target,
    accent: "blue",
  },
  {
    number: "04",
    title: "Sell",
    subtitle: "Faster",
    description:
      "Better presentation, stronger visibility and clear information can help buyers make decisions faster.",
    icon: Rocket,
    accent: "orange",
  },
];

const sellerPoints = [
  "Use clear product images",
  "Write an accurate product title",
  "Add complete product information",
  "Keep your price and condition clear",
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
      }
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
      style={{ transitionDelay: `${delay}ms` }}
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
      className={`pointer-events-none absolute rounded-full border border-slate-300/60 dark:border-white/10 ${className}`}
      style={{
        animation: "floatShape 7s ease-in-out infinite",
        animationDelay: delay,
      }}
    />
  );
}

export default function SellFasterPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#07111f] dark:text-white">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(21,101,216,0.08),transparent_38%)] dark:bg-[radial-gradient(circle_at_50%_25%,rgba(21,101,216,0.20),transparent_38%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(245,166,35,0.05),transparent_30%)] dark:bg-[radial-gradient(circle_at_85%_70%,rgba(245,166,35,0.08),transparent_30%)]" />

        <FloatingShape
          className="left-[8%] top-[25%] h-28 w-28"
          delay="0s"
        />

        <FloatingShape
          className="right-[10%] top-[20%] h-20 w-20"
          delay="1.5s"
        />

        <FloatingShape
          className="bottom-[15%] left-[18%] h-12 w-12"
          delay="2s"
        />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 rotate-[-18deg] bg-gradient-to-r from-transparent via-[#1565d8]/15 to-transparent dark:via-[#1565d8]/40 animate-[lineMove_6s_ease-in-out_infinite]" />

        <div className="relative mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-x-1 hover:border-[#1565d8]/40 hover:text-[#1565d8] dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:shadow-none dark:hover:bg-white/10 dark:hover:text-white sm:px-4"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </button>

            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#1565d8]/40 hover:text-[#1565d8] dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:shadow-none dark:hover:bg-white/10 dark:hover:text-white sm:px-4"
            >
              <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
              Home
            </Link>
          </div>

          {/* Hero Content */}
          <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center text-center">
            <div className="relative mb-10 flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-[#1565d8]/20 dark:border-[#1565d8]/30" />

              <div className="absolute inset-4 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-dashed border-[#f5a623]/20 dark:border-[#f5a623]/25" />

              <span className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#1565d8]" />

              <span className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#f5a623]" />

              <div className="relative flex h-20 w-20 animate-[heroFloat_4s_ease-in-out_infinite] items-center justify-center rounded-[26px] border border-[#1565d8]/20 bg-white shadow-[0_20px_60px_rgba(21,101,216,0.12)] dark:border-[#1565d8]/30 dark:bg-[#0d1a2d] dark:shadow-[0_0_60px_rgba(21,101,216,0.20)] sm:h-24 sm:w-24">
                <Rocket className="h-10 w-10 text-[#1565d8] dark:text-[#3b82f6]" />

                <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#16a34a] text-white shadow-lg">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            </div>

            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1565d8]/15 bg-[#1565d8]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1565d8] dark:border-[#1565d8]/20 dark:text-blue-400 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                DealUp Seller Tools
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                Sell
                <span className="block bg-gradient-to-r from-[#1565d8] via-blue-500 to-[#f5a623] bg-clip-text text-transparent">
                  Faster
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <p className="mt-7 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                Create stronger listings, reach more local buyers and make it
                easier for people to understand what you are selling.
              </p>
            </ScrollReveal>

            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              <span>Scroll</span>

              <div className="h-10 w-px overflow-hidden bg-slate-300 dark:bg-white/10">
                <div className="h-1/2 w-full animate-[scrollLine_2s_ease-in-out_infinite] bg-[#1565d8]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ====================================================== */}

      <section className="relative overflow-hidden bg-white px-4 py-24 dark:bg-[#091526] sm:px-6 sm:py-32 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#1565d8]/5 blur-[120px] dark:bg-[#1565d8]/10" />

        <div className="relative mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5a623]">
              Why Selling Better Matters
            </p>

            <h2 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Your listing gets
              <span className="block text-[#1565d8] dark:text-[#3b82f6]">
                the first impression.
              </span>
            </h2>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Buyers need clear information to quickly understand your
              product, compare it and decide whether they want to contact you.
            </p>
          </ScrollReveal>

          <div className="mt-16 h-px w-full overflow-hidden bg-slate-200 dark:bg-white/10">
            <div className="h-full w-1/3 animate-[horizontalMove_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#1565d8] to-transparent" />
          </div>
        </div>
      </section>

      {/* =====================================================
          SELLING JOURNEY
      ====================================================== */}

      <section className="relative bg-slate-50 px-4 py-24 dark:bg-[#07111f] sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1565d8] dark:text-blue-400">
              How It Works
            </p>

            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
              Four moves.
              <span className="block text-slate-400 dark:text-slate-500">
                Better selling.
              </span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <ScrollReveal key={step.number} delay={index * 140}>
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-[#1565d8]/30 hover:shadow-xl dark:border-white/10 dark:bg-[#0b192b] dark:shadow-none dark:hover:border-[#1565d8]/50">
                    <div className="absolute right-5 top-3 text-6xl font-black text-slate-100 transition-all duration-500 group-hover:text-[#1565d8]/10 dark:text-white/[0.025] dark:group-hover:text-[#1565d8]/10">
                      {step.number}
                    </div>

                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                        step.accent === "orange"
                          ? "bg-[#f5a623]/10 text-[#d88900]"
                          : "bg-[#1565d8]/10 text-[#1565d8]"
                      } transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#1565d8] group-hover:text-white dark:text-[#3b82f6]`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                      {step.number}
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="text-xl font-bold text-[#1565d8] dark:text-[#3b82f6]">
                      {step.subtitle}
                    </p>

                    <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
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
          SELLER CHECKLIST
      ====================================================== */}

      <section className="relative overflow-hidden bg-white px-4 py-24 dark:bg-[#091526] sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute right-[-120px] top-1/4 h-80 w-80 rounded-full bg-[#f5a623]/5 blur-[110px] dark:bg-[#f5a623]/10" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <ScrollReveal>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 rounded-[40px] border border-[#1565d8]/10 animate-pulse" />

              <div className="relative rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#0b192b] dark:shadow-2xl sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1565d8] text-white">
                    <TrendingUp className="h-7 w-7" />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Seller Checklist
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#16a34a]">
                      Ready to publish
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {sellerPoints.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all duration-300 hover:translate-x-2 hover:border-[#1565d8]/30 dark:border-white/5 dark:bg-[#07111f]"
                    >
                      <Check className="h-5 w-5 shrink-0 text-[#22c55e]" />

                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={180}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5a623]">
                Sell With Purpose
              </p>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] sm:text-6xl">
                Make every
                <span className="block text-[#1565d8] dark:text-[#3b82f6]">
                  detail count.
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                The more useful information buyers have, the easier it becomes
                for them to understand your listing and start a conversation.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <Megaphone className="h-6 w-6 text-[#f5a623]" />

                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Clear listings create better conversations.
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =====================================================
          FINAL
      ====================================================== */}

      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-24 dark:bg-[#07111f] sm:px-6 lg:px-8">
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1565d8]/10 animate-[spin_20s_linear_infinite]" />

        <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f5a623]/10 animate-[spin_14s_linear_infinite_reverse]" />

        <ScrollReveal className="relative max-w-4xl text-center">
          <Zap className="mx-auto h-14 w-14 animate-[heroFloat_4s_ease-in-out_infinite] text-[#1565d8] dark:text-[#3b82f6]" />

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#f5a623]">
            The Result
          </p>

          <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight text-slate-900 dark:text-white sm:text-7xl lg:text-8xl">
            Better listings.
            <span className="block bg-gradient-to-r from-[#1565d8] to-[#f5a623] bg-clip-text text-transparent">
              Faster selling.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            Present your product clearly, reach nearby buyers and make your
            next deal easier.
          </p>

          <Link
            href="/sell"
            className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#1565d8] px-6 py-3.5 font-bold text-white transition hover:bg-[#0f52ba]"
          >
            Start Selling
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </ScrollReveal>
      </section>

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