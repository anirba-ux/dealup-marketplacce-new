"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  Home,
  LockKeyhole,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

const safetySteps = [
  {
    number: "01",
    title: "Know",
    subtitle: "The Seller",
    description:
      "Review the seller profile, available verification information and listing details before making a decision.",
    icon: UserCheck,
  },
  {
    number: "02",
    title: "Keep",
    subtitle: "Communication Safe",
    description:
      "Use clear and responsible communication when discussing the product, price and meeting arrangements.",
    icon: MessageCircle,
  },
  {
    number: "03",
    title: "Meet",
    subtitle: "Safely",
    description:
      "When meeting a seller, choose a suitable public place and let someone you trust know about your plans.",
    icon: MapPin,
  },
  {
    number: "04",
    title: "Check",
    subtitle: "Before You Pay",
    description:
      "Inspect the product and confirm the important details before completing a transaction.",
    icon: LockKeyhole,
  },
];

const safetyPoints = [
  {
    icon: UserCheck,
    title: "Check Seller Information",
    description:
      "Review the available seller profile and verification signals before contacting them.",
  },
  {
    icon: Eye,
    title: "Inspect Before Buying",
    description:
      "Check the product carefully and make sure its condition matches the listing.",
  },
  {
    icon: MapPin,
    title: "Choose a Safe Meeting Place",
    description:
      "For local transactions, prefer a suitable public location and avoid isolated places.",
  },
  {
    icon: LockKeyhole,
    title: "Protect Your Information",
    description:
      "Avoid sharing unnecessary personal, financial or account information with other users.",
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

export default function SafetyPage() {
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
            {/* Animated shield */}
            <div className="relative mb-10 flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
              {/* Outer ring */}
              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-[#1565d8]/25" />

              {/* Inner dashed ring */}
              <div className="absolute inset-4 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-dashed border-[#f5a623]/25" />

              {/* Orbit dots */}
              <span className="absolute left-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#1565d8]" />

              <span className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[#f5a623]" />

              {/* Shield */}
              <div className="relative flex h-20 w-20 animate-[heroFloat_4s_ease-in-out_infinite] items-center justify-center rounded-[26px] border border-[#1565d8]/25 bg-[#0d1a2d] shadow-[0_0_60px_rgba(21,101,216,0.20)] sm:h-24 sm:w-24">
                <ShieldCheck className="h-11 w-11 text-[#3b82f6] sm:h-13 sm:w-13" />

                {/* Check */}
                <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#16a34a] text-white shadow-lg">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            </div>

            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1565d8]/20 bg-[#1565d8]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                DealUp Safety
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                Stay
                <span className="block bg-gradient-to-r from-white via-blue-400 to-[#f5a623] bg-clip-text text-transparent">
                  Safe & Secure.
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <p className="mt-7 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Simple safety practices can help you make more informed and
                responsible decisions when buying and selling on DealUp.
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
                Safety First
              </p>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Trade with
                <span className="block text-[#3b82f6]">
                  awareness.
                </span>
                Trade with confidence.
              </h2>

              <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                DealUp provides useful marketplace information and trust
                signals, but every buyer and seller should still make careful
                decisions throughout a transaction.
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
          SAFETY JOURNEY
      ====================================================== */}
      <section className="relative bg-[#07111f] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#1565d8]">
              Safe Transaction
            </p>

            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
              Four simple habits.
              <span className="block text-slate-500">
                Better decisions.
              </span>
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {safetySteps.map((step, index) => {
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
          SAFETY CHECKLIST
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#091526] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute right-[-100px] top-1/4 h-80 w-80 rounded-full bg-[#1565d8]/10 blur-[110px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {/* Safety visual */}
          <ScrollReveal>
            <div className="relative mx-auto w-full max-w-md">
              {/* Outer shield */}
              <div className="absolute -inset-5 rounded-[40px] border border-[#1565d8]/10 animate-pulse" />

              <div className="relative rounded-[32px] border border-white/10 bg-[#0b192b] p-6 shadow-2xl sm:p-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1565d8] text-white">
                    <ShieldCheck className="h-7 w-7" />
                  </div>

                  <div>
                    <p className="font-bold">Safety Checklist</p>

                    <p className="mt-1 text-xs text-slate-500">
                      Before completing a transaction
                    </p>
                  </div>
                </div>

                {/* Checklist */}
                <div className="mt-8 space-y-3">
                  {[
                    "Seller information reviewed",
                    "Product details checked",
                    "Meeting place considered",
                    "Payment details confirmed",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-[#07111f] px-4 py-3 transition-all duration-300 hover:translate-x-2 hover:border-[#1565d8]/30"
                    >
                      <CheckCircle2
                        className="h-5 w-5 shrink-0 text-[#22c55e]"
                        style={{
                          animation: "checkPop 2.5s ease-in-out infinite",
                          animationDelay: `${index * 300}ms`,
                        }}
                      />

                      <span className="text-sm text-slate-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status */}
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#22c55e]/10 bg-[#22c55e]/5 px-4 py-4">
                  <span className="text-xs font-semibold text-slate-400">
                    Safety awareness
                  </span>

                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#22c55e]">
                    <CheckCircle2 className="h-4 w-4" />
                    READY
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={180}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5a623]">
                Stay Protected
              </p>

              <h2 className="mt-6 text-4xl font-black leading-[1.05] sm:text-6xl">
                Small checks.
                <span className="block text-[#3b82f6]">
                  Big difference.
                </span>
              </h2>

              <p className="mt-7 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Taking a few moments to check the seller, product and
                transaction details can help you avoid unnecessary risks.
              </p>

              <div className="mt-9 space-y-5">
                {safetyPoints.map((point, index) => {
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
          COMMUNITY SAFETY
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#07111f] px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-[#1565d8]/20 bg-[#0b192b] text-[#3b82f6] shadow-[0_0_50px_rgba(21,101,216,0.12)]">
              <Users className="h-9 w-9 animate-[heroFloat_4s_ease-in-out_infinite]" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#f5a623]">
              A Safer Marketplace
            </p>
          </ScrollReveal>

          <ScrollReveal delay={220}>
            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
              Safety is
              <span className="block text-[#3b82f6]">
                everyone&apos;s responsibility.
              </span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={350}>
            <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Stay aware, communicate responsibly, protect your personal
              information and make careful decisions throughout every
              marketplace interaction.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={450}>
            <div className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
              <ShieldCheck className="h-5 w-5 text-[#3b82f6]" />
              Stay aware. Stay safe.
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
          <ShieldCheck className="mx-auto h-14 w-14 animate-[heroFloat_4s_ease-in-out_infinite] text-[#3b82f6]" />

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-[#f5a623]">
            The Goal
          </p>

          <h2 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            Stay smart.
            <span className="block bg-gradient-to-r from-[#3b82f6] to-[#f5a623] bg-clip-text text-transparent">
              Stay safe.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Use available information, follow responsible transaction
            practices and trust your judgement when buying or selling on
            DealUp.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
            <ShieldCheck className="h-5 w-5 text-[#3b82f6]" />
            Safe trading starts with awareness.
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

        @keyframes checkPop {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.15);
          }
        }
      `}</style>
    </main>
  );
}