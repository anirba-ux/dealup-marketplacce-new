"use client";

import { useEffect, useRef, useState } from "react";

import Script from "next/script";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";

import {
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Check,
  Crown,
  Headphones,
  Megaphone,
  Rocket,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

// =====================================================
// Premium Seller Status
// =====================================================

interface PremiumSellerStatus {
  active: boolean;

  plan: "monthly" | "quarterly" | "yearly" | null;

  startedAt: string | null;

  expiresAt: string | null;

  paymentId: string | null;

  orderId: string | null;

  featuredAds: boolean;

  productBoost: boolean;

  sellerAnalytics: boolean;

  premiumBadge: boolean;

  prioritySupport: boolean;

  featuredAdsLimit: number;

  featuredAdsUsed: number;

  boostAdsLimit: number;

  boostAdsUsed: number;

  remainingDays: number;
}

// =====================================================
// Premium Feature
// =====================================================

interface PremiumFeature {
  icon: React.ReactNode;

  title: string;

  description: string;

  enabled: boolean;
}

// =====================================================
// Premium Plan
// =====================================================

type PremiumPlan = "monthly" | "quarterly" | "yearly";

interface PlanOption {
  id: PremiumPlan;

  name: string;

  duration: string;

  price: number;

  description: string;

  popular?: boolean;
}

// =====================================================
// Premium Plans
// =====================================================

const plans: PlanOption[] = [
  {
    id: "monthly",

    name: "Monthly",

    duration: "30 days",

    price: 99,

    description: "Perfect for sellers who want to try Premium.",
  },

  {
    id: "quarterly",

    name: "Quarterly",

    duration: "90 days",

    price: 249,

    description: "Better value for regular sellers.",

    popular: true,
  },

  {
    id: "yearly",

    name: "Yearly",

    duration: "365 days",

    price: 799,

    description: "Best value for serious sellers.",
  },
];

// =====================================================
// Premium Dashboard
// =====================================================

export default function PremiumPage() {
  // ===================================================
  // State
  // ===================================================

  const [premium, setPremium] = useState<PremiumSellerStatus | null>(null);

  const [loading, setLoading] = useState(true);

  const [activating, setActivating] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan>("quarterly");

  const paymentSectionRef = useRef<HTMLDivElement | null>(null);

  function selectPlanAndContinue(planId: PremiumPlan) {
    setSelectedPlan(planId);
    setError("");
    setSuccess("");

    window.requestAnimationFrame(() => {
      paymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ===================================================
  // Load Premium Status
  // ===================================================

  async function loadPremiumStatus() {
    try {
      setLoading(true);

      setError("");

      const response = await fetch("/api/premium/status", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ?? "Unable to load Premium Seller status.",
        );
      }

      setPremium(data.premiumSeller);
    } catch (error) {
      console.error("PREMIUM STATUS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load Premium Seller status.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // Initial Load
  // ===================================================

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  // ===================================================
  // Activate / Pay Premium
  // ===================================================

  async function handleActivatePremium() {
    try {
      setActivating(true);

      setError("");

      setSuccess("");

      // =================================================
      // Create Razorpay Order
      // =================================================

      const response = await fetch("/api/payment/create-order", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          type:
            selectedPlan === "monthly"
              ? "PREMIUM_MONTHLY"
              : selectedPlan === "quarterly"
                ? "PREMIUM_QUARTERLY"
                : "PREMIUM_YEARLY",

          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to create payment order.");
      }

      // =================================================
      // Razorpay SDK Check
      // =================================================

      if (typeof window === "undefined") {
        throw new Error("Payment gateway is not available.");
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay payment gateway is not loaded. Please refresh the page and try again.",
        );
      }

      // =================================================
      // Open Razorpay Checkout
      // =================================================

      const razorpay = new window.Razorpay({
        key: data.razorpayKeyId,

        amount: data.order.amount,

        currency: data.order.currency,

        name: "DealUp",

        description: `Premium Seller - ${
          selectedPlan === "monthly"
            ? "Monthly"
            : selectedPlan === "quarterly"
              ? "Quarterly"
              : "Yearly"
        }`,

        order_id: data.order.id,

        handler: async (paymentResponse) => {
          try {
            setActivating(true);

            setError("");

            // =======================================
            // Verify Razorpay Payment
            // =======================================

            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                razorpayOrderId: paymentResponse.razorpay_order_id,

                razorpayPaymentId: paymentResponse.razorpay_payment_id,

                razorpaySignature: paymentResponse.razorpay_signature,

                paymentType: data.paymentType,

                plan: selectedPlan,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData?.message ?? "Payment verification failed.",
              );
            }

            // =======================================
            // Success
            // =======================================

            setSuccess(
              "Payment successful! Premium Seller has been activated.",
            );

            // =======================================
            // Reload Premium Status
            // =======================================

            await loadPremiumStatus();
          } catch (error) {
            console.error("PREMIUM PAYMENT VERIFICATION ERROR:", error);

            setError(
              error instanceof Error
                ? error.message
                : "Payment verification failed.",
            );
          } finally {
            setActivating(false);
          }
        },

        modal: {
          ondismiss: () => {
            setActivating(false);
          },
        },

        theme: {
          color: "#1565d8",
        },
      });

      razorpay.open();
    } catch (error) {
      console.error("PREMIUM PAYMENT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to start Premium payment.",
      );

      setActivating(false);
    }
  }

  // ===================================================
  // Loading
  // ===================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7faff] px-3 py-4 text-slate-950 dark:bg-[#020817] dark:text-white sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="mb-5 flex items-center justify-between">
            <BackButton />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#1565d8]/25 bg-white px-4 py-2 text-sm font-bold text-[#1565d8] shadow-sm dark:border-blue-400/30 dark:bg-white/5 dark:text-blue-200"
            >
              <span aria-hidden="true">🏠</span>
              Home
            </Link>
          </div>

          <div className="animate-pulse">
            <div className="h-12 w-72 rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="mt-4 h-6 w-full max-w-xl rounded-lg bg-slate-200 dark:bg-slate-800" />

            <div className="mt-10 h-72 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }

  // ===================================================
  // Error Without Premium Data
  // ===================================================

  if (error && !premium) {
    return (
      <main className="min-h-screen bg-[#f7faff] px-3 py-4 text-slate-950 dark:bg-[#020817] dark:text-white sm:px-5 sm:py-6">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="mb-5 flex items-center justify-between">
            <BackButton />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#1565d8]/25 bg-white px-4 py-2 text-sm font-bold text-[#1565d8] shadow-sm dark:border-blue-400/30 dark:bg-white/5 dark:text-blue-200"
            >
              <span aria-hidden="true">🏠</span>
              Home
            </Link>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <h1 className="text-xl font-bold">
                Unable to load Premium Seller
              </h1>

              <p className="mt-2 text-sm">{error}</p>

              <button
                type="button"
                onClick={loadPremiumStatus}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!premium) {
    return null;
  }

  // ===================================================
  // Feature List
  // ===================================================

  const features: PremiumFeature[] = [
    {
      icon: <Megaphone size={24} />,

      title: "Featured Ads",

      description:
        "Get your selected products greater visibility in DealUp listings.",

      enabled: premium.featuredAds,
    },

    {
      icon: <Rocket size={24} />,

      title: "Product Boost",

      description:
        "Boost eligible products to improve their position and visibility.",

      enabled: premium.productBoost,
    },

    {
      icon: <BarChart3 size={24} />,

      title: "Seller Analytics",

      description:
        "Understand product views, engagement and seller performance.",

      enabled: premium.sellerAnalytics,
    },

    {
      icon: <BadgeCheck size={24} />,

      title: "Premium Badge",

      description: "Display a professional Premium Seller identity to buyers.",

      enabled: premium.premiumBadge,
    },

    {
      icon: <Headphones size={24} />,

      title: "Priority Support",

      description: "Get priority assistance for your marketplace activities.",

      enabled: premium.prioritySupport,
    },
  ];

  // ===================================================
  // Current Plan
  // ===================================================

  const currentPlan = premium.plan
    ? plans.find((plan) => plan.id === premium.plan)
    : null;

  // ===================================================
  // Remaining Quotas
  // ===================================================

  const featuredRemaining = Math.max(
    0,
    premium.featuredAdsLimit - premium.featuredAdsUsed,
  );

  const boostRemaining = Math.max(
    0,
    premium.boostAdsLimit - premium.boostAdsUsed,
  );

  // ===================================================
  // Render
  // ===================================================

  const selectedPlanDetails =
    plans.find((plan) => plan.id === selectedPlan) ?? plans[1];

  const faqItems = [
    {
      question: "What is DealUp Premium?",
      answer:
        "DealUp Premium gives sellers extra visibility and seller-focused tools such as Featured Ads, Product Boost, Seller Analytics, Premium Badge and Priority Support.",
    },
    {
      question: "How does featured listing work?",
      answer:
        "When you use a Featured Ad, your eligible product receives greater visibility in DealUp listings for the applicable promotion period.",
    },
    {
      question: "Can I upgrade or downgrade later?",
      answer:
        "You can choose another Premium plan when your current Premium period ends. Your existing active plan remains protected until its expiry.",
    },
    {
      question: "Is my payment secure?",
      answer:
        "Premium payments are processed through Razorpay Checkout. DealUp verifies the Razorpay order, payment ID and signature before activating Premium.",
    },
    {
      question: "What happens after my plan expires?",
      answer:
        "Your Premium Seller benefits stop when the plan expires. Your normal DealUp account and listings remain available.",
    },
  ];

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <main className="min-h-screen overflow-x-hidden bg-[#f7faff] text-slate-950 dark:bg-[#020817] dark:text-white">
        <div className="mx-auto w-full max-w-[1320px] min-w-0 px-3 py-3 sm:px-5 sm:py-5 lg:px-7 lg:py-7">
          {/* =================================================
              TOP NAVIGATION
          ================================================= */}
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <BackButton />

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#1565d8]/25 bg-white px-4 py-2 text-sm font-bold text-[#1565d8] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md dark:border-blue-400/30 dark:bg-white/5 dark:text-blue-200 dark:hover:bg-white/10"
            >
              <span className="text-base leading-none" aria-hidden="true">
                🏠
              </span>
              Home
            </Link>
          </div>

          {/* =================================================
              ALERTS
          ================================================= */}
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
              {success}
            </div>
          )}

          {/* =================================================
              PREMIUM HERO
              Separate background + crown object
              -------------------------------------------------
              Desktop:
                background fills the hero
                crown stays on the right
                content stays over the background

              Mobile:
                same background
                crown moves to the upper-right
                content remains over the artwork
          ================================================= */}
          <section
            className="
              relative isolate mb-8
              min-h-[405px]
              overflow-hidden
              rounded-[24px]
              border border-slate-200
              bg-white
              shadow-sm

              sm:min-h-[425px]
              sm:rounded-[30px]

              lg:min-h-[405px]

              dark:border-white/10
              dark:bg-[#020817]
            "
          >
            {/* =================================================
                LIGHT BACKGROUND
            ================================================= */}
            <img
              src="/images/premium/light-background.png"
              alt=""
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                z-0
                h-full
                w-full
                select-none
                object-cover
                object-center
                dark:hidden
              "
            />

            {/* =================================================
                DARK BACKGROUND
            ================================================= */}
            <img
              src="/images/premium/dark-background.png"
              alt=""
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                z-0
                hidden
                h-full
                w-full
                select-none
                object-cover
                object-center
                dark:block
              "
            />

            {/* =================================================
                CROWN OBJECT
                Separate transparent image.
            ================================================= */}
            <img
              src="/images/premium/crown-obj.png"
              alt=""
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                z-[1]
                select-none
                object-contain

                /* Mobile */
                right-[-18px]
                top-[18px]
                w-[220px]
                max-w-[68%]

                /* Small devices */
                sm:right-[-10px]
                sm:top-[12px]
                sm:w-[270px]
                sm:max-w-[55%]

                /* Desktop
                   Larger + slightly shifted left to match
                   the requested reference composition. */
                lg:right-[28px]
                lg:top-1/2
                lg:w-[525px]
                lg:max-w-none
                lg:-translate-y-1/2

                xl:right-[38px]
                xl:w-[575px]
              "
            />

            {/* =================================================
                READABILITY OVERLAY
                Text remains clearly readable while the artwork
                stays visible behind it.
            ================================================= */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                z-[2]

                bg-gradient-to-r
                from-white
                via-white/90
                to-white/5

                dark:from-[#020817]
                dark:via-[#020817]/88
                dark:to-[#020817]/5
              "
            />

            {/* Soft mobile readability layer */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                z-[3]

                bg-gradient-to-b
                from-transparent
                via-transparent
                to-white/45

                dark:to-[#020817]/45

                lg:hidden
              "
            />

            {/* =================================================
                HERO CONTENT
                Always sits ABOVE background + crown.
            ================================================= */}
            <div
              className="
                relative
                z-10
                flex
                min-h-[405px]
                min-w-0
                items-center

                sm:min-h-[425px]

                lg:min-h-[405px]
              "
            >
              <div
                className="
                  w-full
                  min-w-0
                  px-5
                  py-8

                  sm:px-8
                  sm:py-10

                  lg:max-w-[720px]
                  lg:px-11
                  lg:py-12

                  xl:px-12
                "
              >
                {/* Premium Seller Badge */}
                <div
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border border-yellow-500/40
                    bg-[#ffd21f]
                    px-3.5 py-1.5
                    text-[10px]
                    font-black
                    text-slate-950
                    shadow-lg

                    sm:px-4
                    sm:py-2
                    sm:text-xs
                  "
                >
                  <Crown size={14} strokeWidth={2.8} />
                  Premium Seller
                </div>

                {/* Main Heading */}
                <h1
                  className="
                    mt-4
                    max-w-[620px]
                    text-[2.55rem]
                    font-black
                    leading-[0.88]
                    tracking-[-0.065em]
                    text-slate-950

                    sm:text-5xl
                    md:text-6xl

                    lg:text-[4.2rem]
                    xl:text-[4.8rem]

                    dark:text-white
                  "
                >
                  <span className="block">
                    Upgrade to
                  </span>

                  <span
                    className="
                      block
                      bg-gradient-to-r
                      from-[#1565d8]
                      via-[#1976f3]
                      to-[#2f8cff]
                      bg-clip-text
                      text-transparent
                    "
                  >
                    DealUp Premium
                  </span>
                </h1>

                {/* Description */}
                <p
                  className="
                    mt-4
                    max-w-[470px]
                    text-xs
                    font-medium
                    leading-5
                    text-slate-700

                    sm:text-sm
                    sm:leading-6

                    dark:text-blue-100
                  "
                >
                  Get more visibility, more buyers and grow your sales with
                  powerful seller tools.
                </p>

                {/* Feature Pills */}
                <div
                  className="
                    mt-5
                    grid
                    max-w-[600px]
                    grid-cols-2
                    gap-2

                    sm:mt-6
                    sm:grid-cols-4
                    sm:gap-2.5
                  "
                >
                  {[
                    {
                      icon: <Megaphone size={14} />,
                      label: "Featured Ads",
                      color:
                        "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                      icon: <TrendingUp size={14} />,
                      label: "Higher Visibility",
                      color:
                        "text-[#1565d8] dark:text-blue-300",
                    },
                    {
                      icon: <BarChart3 size={14} />,
                      label: "Seller Analytics",
                      color:
                        "text-violet-600 dark:text-violet-400",
                    },
                    {
                      icon: <Headphones size={14} />,
                      label: "Priority Support",
                      color:
                        "text-amber-600 dark:text-amber-400",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-1.5
                        rounded-xl
                        border
                        border-slate-200/90
                        bg-white/85
                        px-2.5
                        py-2
                        shadow-md
                        backdrop-blur-md

                        dark:border-white/10
                        dark:bg-[#071426]/80
                      "
                    >
                      <span
                        className={`shrink-0 ${item.color}`}
                      >
                        {item.icon}
                      </span>

                      <span
                        className="
                          truncate
                          text-[9px]
                          font-extrabold
                          text-slate-700

                          sm:text-[10px]

                          dark:text-slate-200
                        "
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              ACTIVE PREMIUM STATUS
          ================================================= */}
          {premium.active ? (
            <section className="mb-8 rounded-[22px] border border-emerald-200 bg-white p-4 shadow-sm dark:border-emerald-900/50 dark:bg-[#081426] sm:mb-10 sm:rounded-[28px] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 sm:text-xs">
                      ✓ Premium Active
                    </span>

                    {currentPlan && (
                      <span className="rounded-full bg-[#1565d8]/10 px-3 py-1.5 text-[10px] font-black text-[#1565d8] dark:text-blue-300 sm:text-xs">
                        {currentPlan.name}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 text-base font-black sm:text-xl">
                    Your Premium Seller account is active
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {premium.remainingDays} days remaining
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl bg-slate-100 px-5 py-3 text-center dark:bg-[#111f34]">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                    Expires
                  </p>
                  <p className="mt-1 text-sm font-black sm:text-base">
                    {premium.expiresAt
                      ? new Date(premium.expiresAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="mb-8 rounded-[22px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 sm:mb-10 sm:rounded-[28px] sm:p-6">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-xl bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <Sparkles size={19} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black sm:text-base">
                    You are currently a Free Seller
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400 sm:text-sm">
                    Upgrade to unlock promotion tools, analytics and Premium
                    Seller benefits.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* =================================================
              QUOTAS
          ================================================= */}
          <section className="mb-10 grid gap-4 sm:grid-cols-2 sm:gap-5">
            {[
              {
                title: "Featured Ads",
                icon: <Star size={18} />,
                remaining: featuredRemaining,
                used: premium.featuredAdsUsed,
                limit: premium.featuredAdsLimit,
                accent: "purple",
              },
              {
                title: "Boost Ads",
                icon: <Rocket size={18} />,
                remaining: boostRemaining,
                used: premium.boostAdsUsed,
                limit: premium.boostAdsLimit,
                accent: "blue",
              },
            ].map((item) => {
              const percentage =
                item.limit > 0
                  ? Math.min(100, (item.used / item.limit) * 100)
                  : 0;

              return (
                <div
                  key={item.title}
                  className="min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#081426] sm:rounded-[26px] sm:p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`shrink-0 rounded-xl p-2.5 ${
                          item.accent === "purple"
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-blue-100 text-[#1565d8] dark:bg-blue-900/30 dark:text-blue-300"
                        }`}
                      >
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Free quota
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-xl font-black ${
                        item.accent === "purple"
                          ? "text-purple-600"
                          : "text-[#1565d8]"
                      }`}
                    >
                      {item.remaining}
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        item.accent === "purple"
                          ? "bg-purple-500"
                          : "bg-[#1565d8]"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Used: {item.used}</span>
                    <span>Limit: {item.limit}</span>
                  </div>
                </div>
              );
            })}
          </section>

          {/* =================================================
              PREMIUM BENEFITS
          ================================================= */}
          <section className="mb-10 sm:mb-12">
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1565d8] sm:text-xs">
                Everything included
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                Premium Benefits
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Powerful tools to help you sell faster and smarter.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1565d8]/30 hover:shadow-lg dark:border-white/10 dark:bg-[#081426] dark:hover:border-blue-400/20 sm:rounded-[26px] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-xl bg-[#1565d8]/10 p-2.5 text-[#1565d8] dark:text-blue-300">
                      {feature.icon}
                    </div>

                    {feature.enabled && (
                      <span className="rounded-full bg-emerald-100 p-1.5 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Check size={13} />
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-sm font-black">{feature.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-5 text-slate-500 dark:text-slate-400 sm:text-xs sm:leading-6">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* =================================================
              SELLER ANALYTICS CTA
          ================================================= */}
          <section className="mb-10 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#1565d8] to-[#0f52ba] p-5 text-white shadow-xl shadow-blue-500/10 sm:rounded-[30px] sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-blue-100 sm:text-xs">
                  <BarChart3 size={16} />
                  Seller Analytics
                </div>

                <h2 className="mt-2 text-xl font-black leading-tight sm:text-2xl">
                  Understand what buyers are responding to.
                </h2>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-blue-100 sm:text-sm sm:leading-6">
                  Track product views, buyer inquiries, engagement and seller
                  performance from one dashboard.
                </p>
              </div>

              {premium.active && premium.sellerAnalytics ? (
                <Link
                  href="/dashboard/analytics"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-[#1565d8] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:text-sm"
                >
                  Open Analytics
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    paymentSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-[#1565d8] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:text-sm"
                >
                  Unlock Analytics
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </section>

          {/* =================================================
              PRICING
          ================================================= */}
          <section>
            <div className="mb-6 text-center sm:mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1565d8] sm:text-xs">
                Simple pricing
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">
                Choose Your Premium Plan
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm sm:leading-6">
                Simple, transparent pricing. No hidden charges.
              </p>
            </div>

            {/* Plan selector row */}
            <div className="mx-auto mb-5 grid max-w-4xl grid-cols-3 gap-2 sm:mb-6 sm:gap-3">
              {plans.map((plan) => {
                const selected = selectedPlan === plan.id;

                return (
                  <button
                    key={`selector-${plan.id}`}
                    type="button"
                    onClick={() => selectPlanAndContinue(plan.id)}
                    className={`relative min-w-0 rounded-xl border px-2 py-3 text-center transition-all duration-200 sm:rounded-2xl sm:px-4 sm:py-3.5 ${
                      selected
                        ? "border-[#1565d8] bg-[#1565d8] text-white shadow-lg shadow-blue-500/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#1565d8]/40 dark:border-white/10 dark:bg-[#081426] dark:text-slate-200"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -right-1.5 -top-2 rounded-full bg-[#f5a623] px-2 py-0.5 text-[8px] font-black text-slate-950 sm:-right-2 sm:text-[9px]">
                        Most Popular
                      </span>
                    )}

                    <span className="block text-xs font-black sm:text-sm">
                      {plan.name}
                    </span>
                    <span
                      className={`mt-0.5 block text-[10px] ${
                        selected
                          ? "text-blue-100"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {plan.duration}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pricing cards — entire card is clickable */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {plans.map((plan) => {
                const selected = selectedPlan === plan.id;

                const selectThisPlan = () => {
                  setSelectedPlan(plan.id);
                  setError("");
                  setSuccess("");
                };

                return (
                  <div
                    key={plan.id}
                    role="button"
                    tabIndex={0}
                    onClick={selectThisPlan}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectThisPlan();
                      }
                    }}
                    className={`group relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[24px] border p-5 text-left outline-none transition-all duration-300 hover:-translate-y-1 sm:rounded-[28px] sm:p-6 ${
                      selected
                        ? "border-[#1565d8] bg-white shadow-xl shadow-blue-500/10 ring-2 ring-[#1565d8]/10 dark:bg-[#07182f]"
                        : "border-slate-200 bg-white shadow-sm hover:border-[#1565d8]/40 hover:shadow-lg focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/20 dark:border-white/10 dark:bg-[#081426] dark:hover:border-blue-400/30"
                    }`}
                  >
                    {plan.popular && (
                      <span className="pointer-events-none absolute right-4 top-4 z-10 rounded-full bg-[#f5a623] px-2.5 py-1 text-[8px] font-black uppercase tracking-wide text-slate-950 shadow-sm sm:text-[9px]">
                        Most Popular
                      </span>
                    )}

                    <div className="pointer-events-none">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                            selected
                              ? "bg-[#1565d8] text-white"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {plan.id === "monthly" ? (
                            <Zap size={20} />
                          ) : plan.id === "quarterly" ? (
                            <TrendingUp size={20} />
                          ) : (
                            <Crown size={20} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-black sm:text-base">
                            {plan.name}
                          </h3>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {plan.duration}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-end gap-1">
                        <span className="text-4xl font-black tracking-tight sm:text-5xl">
                          ₹{plan.price}
                        </span>
                        <span className="pb-1 text-[10px] text-slate-500 dark:text-slate-400">
                          / plan
                        </span>
                      </div>

                      <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {plan.description}
                      </p>

                      <div className="mt-5 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-[#1565d8]" />
                          Featured listings
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-[#1565d8]" />
                          Seller analytics
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-[#1565d8]" />
                          Premium badge
                        </div>
                        <div className="flex items-center gap-2">
                          <Check size={14} className="text-[#1565d8]" />
                          Priority support
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectPlanAndContinue(plan.id);
                      }}
                      className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-xs font-black transition-all duration-200 sm:text-sm ${
                        selected
                          ? "bg-[#1565d8] text-white shadow-lg shadow-blue-500/20 hover:bg-[#0f52ba]"
                          : "border border-[#1565d8]/20 bg-blue-50 text-[#1565d8] hover:bg-[#1565d8] hover:text-white dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-[#1565d8]"
                      }`}
                    >
                      {selected ? "Selected Plan" : "Choose Plan"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* =================================================
                TRUST STRIP
            ================================================= */}
            <div className="mt-5 grid gap-3 rounded-[22px] border border-slate-200 bg-white p-3.5 dark:border-white/10 dark:bg-[#081426] sm:grid-cols-3 sm:gap-4 sm:rounded-[26px] sm:p-4">
              {[
                {
                  icon: "🛡️",
                  title: "Secure Payment",
                  text: "via Razorpay",
                },
                {
                  icon: "🚀",
                  title: "Instant Activation",
                  text: "after payment",
                },
                {
                  icon: "📅",
                  title: "Simple Plans",
                  text: "choose your duration",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1565d8]/10 text-lg">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black sm:text-sm">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* =================================================
                SUCCESSFUL SELLERS STRIP
            ================================================= */}
            <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4 dark:border-white/10 dark:from-[#0a2344] dark:to-[#081426] sm:flex-row sm:items-center sm:justify-between sm:rounded-[26px] sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f5a623]/15 text-xl">
                  👑
                </div>
                <div>
                  <h3 className="text-sm font-black sm:text-base">
                    Join thousands of successful sellers
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
                    Upgrade to DealUp Premium and take your business to the next
                    level.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex -space-x-2">
                  {["👨🏻", "👩🏻", "👨🏽", "👩🏽", "👨🏻"].map((avatar, index) => (
                    <span
                      key={`${avatar}-${index}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 dark:border-[#081426] dark:bg-slate-800"
                    >
                      {avatar}
                    </span>
                  ))}
                </span>
                10K+ Sellers Trust Us
              </div>
            </div>

            {/* =================================================
                FAQ
            ================================================= */}
            <section className="mt-8 sm:mt-10">
              <div className="mb-4">
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Frequently Asked Questions
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                  Everything you need to know about DealUp Premium.
                </p>
              </div>

              <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white dark:border-white/10 dark:bg-[#081426] sm:rounded-[26px]">
                {faqItems.map((item, index) => (
                  <details
                    key={item.question}
                    className={`group ${
                      index !== faqItems.length - 1
                        ? "border-b border-slate-200 dark:border-white/10"
                        : ""
                    }`}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-white/5 sm:px-5 sm:py-4 sm:text-sm [&::-webkit-details-marker]:hidden">
                      <span>{item.question}</span>
                      <span className="shrink-0 text-lg font-normal text-[#1565d8] transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>

                    <div className="px-4 pb-4 text-[11px] leading-5 text-slate-500 dark:text-slate-400 sm:px-5 sm:pb-5 sm:text-xs sm:leading-6">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* =================================================
                SELECTED PLAN / RAZORPAY
            ================================================= */}
            <div
              ref={paymentSectionRef}
              className="mt-6 scroll-mt-6 overflow-hidden rounded-[24px] border border-[#1565d8]/20 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm dark:from-[#0a1b34] dark:to-[#081426] sm:mt-8 sm:rounded-[28px] sm:p-7"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:text-[10px]">
                    Selected plan
                  </p>

                  <h3 className="mt-1 text-xl font-black sm:text-2xl">
                    {selectedPlanDetails.name} — ₹{selectedPlanDetails.price}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                    Complete your payment securely with Razorpay.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleActivatePremium}
                  disabled={activating}
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-6 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0f52ba] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:px-8 sm:text-sm"
                >
                  {activating ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown size={17} />
                      Pay with Razorpay
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              FINAL CTA
          ================================================= */}
          <section className="mt-8 overflow-hidden rounded-[26px] bg-gradient-to-r from-[#1565d8] to-[#0f52ba] p-6 text-center text-white shadow-xl shadow-blue-500/10 sm:mt-10 sm:rounded-[32px] sm:p-9">
            <div className="mx-auto flex max-w-3xl flex-col items-center">
              <div className="rounded-2xl bg-white/10 p-3">
                <Rocket size={25} />
              </div>

              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                Ready to Take Your Sales to the Next Level?
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm sm:leading-6">
                Upgrade to DealUp Premium and give your products the visibility
                they deserve.
              </p>

              <button
                type="button"
                onClick={handleActivatePremium}
                disabled={activating}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#f5a623] px-6 py-3 text-xs font-black text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ffb52e] disabled:opacity-60 sm:text-sm"
              >
                <Rocket size={17} />
                {activating ? "Processing..." : "Upgrade Now"}
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
