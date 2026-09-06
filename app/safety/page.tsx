"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Ban,
  Check,
  CheckCircle2,
  Eye,
  Home,
  LockKeyhole,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserCheck,
} from "lucide-react";

const safetyFeatures = [
  {
    number: "01",
    icon: UserCheck,
    title: "Verified Sellers",
    description:
      "Check seller verification information before deciding to buy.",
    accent: "blue",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "Safe Communication",
    description:
      "Keep your conversations focused on the product and transaction.",
    accent: "orange",
  },
  {
    number: "03",
    icon: Eye,
    title: "Check Before You Buy",
    description:
      "Review the product details, condition and seller information carefully.",
    accent: "blue",
  },
  {
    number: "04",
    icon: Ban,
    title: "Report Suspicious Activity",
    description:
      "If something looks suspicious, stop the transaction and report it.",
    accent: "orange",
  },
];

const safetyTips = [
  {
    icon: MapPin,
    title: "Meet in a Safe Place",
    text: "Prefer a public and familiar location when meeting a seller or buyer.",
  },
  {
    icon: LockKeyhole,
    title: "Never Share Sensitive Information",
    text: "Never share your password, OTP, PIN or other private account details.",
  },
  {
    icon: CheckCircle2,
    title: "Inspect Before Payment",
    text: "Check the product carefully and make sure it matches the listing.",
  },
  {
    icon: TriangleAlert,
    title: "Trust Your Instinct",
    text: "If a deal feels suspicious or unusually rushed, take a step back.",
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

export default function SafetyPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#07111f] dark:text-white">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(21,101,216,0.08),transparent_38%)] dark:bg-[radial-gradient(circle_at_50%_25%,rgba(21,101,216,0.20),transparent_38%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(245,166,35,0.05),transparent_30%)] dark:bg-[radial-gradient(circle_at_85%_70%,rgba(245,166,35,0.08),transparent_30%)]" />

        <FloatingShape
          className="left-[8%] top-[26%] h-28 w-28"
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

          {/* Hero */}
          <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center text-center">
            <div className="relative mb-10 flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-[#1565d8]/20 dark:border-[#1565d8]/30" />

              <div className="absolute inset-4 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-dashed border-[#f5a623]/20 dark:border-[#f5a623]/25" />

              <span className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#1565d8]" />

              <span className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#f5a623]" />

              <div className="relative flex h-20 w-20 animate-[heroFloat_4s_ease-in-out_infinite] items-center justify-center rounded-[26px] border border-[#1565d8]/20 bg-white shadow-[0_20px_60px_rgba(21,101,216,0.12)] dark:border-[#1565d8]/30 dark:bg-[#0d1a2d] dark:shadow-[0_0_60px_rgba(21,101,216,0.20)] sm:h-24 sm:w-24">
                <ShieldCheck className="h-11 w-11 text-[#1565d8] dark:text-[#3b82f6]" />

                <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#16a34a] text-white shadow-lg">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            </div>

            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1565d8]/15 bg-[#1565d8]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1565d8] dark:border-[#1565d8]/20 dark:text-blue-400 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                DealUp Safety
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                Trade
                <span className="block bg-gradient-to-r from-[#1565d8] via-blue-500 to-[#f5a623] bg-clip-text text-transparent">
                  Safely
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <p className="mt-7 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                Simple habits can help you buy and sell with more confidence
                on DealUp.
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
        <div className="relative mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5a623]">
              Protection Matters
            </p>

            <h2 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Simple habits.
              <span className="block text-[#1565d8] dark:text-[#3b82f6]">
                Safer transactions.
              </span>
            </h2>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Keep these four things in mind whenever you buy or sell
              something on DealUp.
            </p>
          </ScrollReveal>

          <div className="mt-16 h-px w-full overflow-hidden bg-slate-200 dark:bg-white/10">
            <div className="h-full w-1/3 animate-[horizontalMove_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#1565d8] to-transparent" />
          </div>
        </div>
      </section>

      {/* =====================================================
          SAFETY FEATURES
      ====================================================== */}

      <section className="relative bg-slate-50 px-4 py-24 dark:bg-[#07111f] sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1565d8] dark:text-blue-400">
              Stay Protected
            </p>

            <h2 className="mt-5 text-4xl font-black sm:text-6xl">
              Four things.
              <span className="block text-slate-400 dark:text-slate-500">
                Every buyer should know.
              </span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {safetyFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <ScrollReveal key={feature.number} delay={index * 140}>
                  <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-[#1565d8]/30 hover:shadow-xl dark:border-white/10 dark:bg-[#0b192b] dark:shadow-none dark:hover:border-[#1565d8]/50">
                    <div className="absolute right-5 top-3 text-6xl font-black text-slate-100 transition-all duration-500 group-hover:text-[#1565d8]/10 dark:text-white/[0.025]">
                      {feature.number}
                    </div>

                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                        feature.accent === "orange"
                          ? "bg-[#f5a623]/10 text-[#d88900]"
                          : "bg-[#1565d8]/10 text-[#1565d8]"
                      } transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-[#1565d8] group-hover:text-white dark:text-[#3b82f6]`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                      {feature.number}
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                      {feature.title}
                    </h3>

                    <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {feature.description}
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
          SAFETY TIPS
      ====================================================== */}

      <section className="relative overflow-hidden bg-white px-4 py-24 dark:bg-[#091526] sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute right-[-120px] top-1/4 h-80 w-80 rounded-full bg-[#1565d8]/5 blur-[110px] dark:bg-[#1565d8]/10" />

        <div className="relative mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5a623]">
              Safety Tips
            </p>

            <h2 className="mt-6 text-4xl font-black sm:text-6xl">
              Stay smart.
              <span className="block text-[#1565d8] dark:text-[#3b82f6]">
                Stay safe.
              </span>
            </h2>
          </ScrollReveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {safetyTips.map((tip, index) => {
              const Icon = tip.icon;

              return (
                <ScrollReveal key={tip.title} delay={index * 120}>
                  <div className="group flex h-full gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-[#1565d8]/30 hover:shadow-lg dark:border-white/10 dark:bg-[#0b192b] dark:hover:border-[#1565d8]/40">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-[#1565d8] transition-all duration-500 group-hover:bg-[#1565d8] group-hover:text-white dark:text-[#3b82f6]">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {tip.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {tip.text}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL
      ====================================================== */}

      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-slate-50 px-4 py-24 dark:bg-[#07111f] sm:px-6 lg:px-8">
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#1565d8]/10 animate-[spin_20s_linear_infinite]" />

        <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f5a623]/10 animate-[spin_14s_linear_infinite_reverse]" />

        <ScrollReveal className="relative max-w-4xl text-center">
          <ShieldCheck className="mx-auto h-14 w-14 animate-[heroFloat_4s_ease-in-out_infinite] text-[#1565d8] dark:text-[#3b82f6]" />

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#f5a623]">
            The Result
          </p>

          <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight text-slate-900 dark:text-white sm:text-7xl lg:text-8xl">
            Trade smart.
            <span className="block bg-gradient-to-r from-[#1565d8] to-[#f5a623] bg-clip-text text-transparent">
              Trade safe.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            Review seller information, inspect products and use safe
            communication and meeting practices.
          </p>

          <Link
            href="/"
            className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-[#1565d8] px-6 py-3.5 font-bold text-white transition hover:bg-[#0f52ba]"
          >
            Explore DealUp
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