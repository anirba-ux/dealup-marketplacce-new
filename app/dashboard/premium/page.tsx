"use client";

import { useEffect, useState } from "react";

import Script from "next/script";

import {
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

  plan:
    | "monthly"
    | "quarterly"
    | "yearly"
    | null;

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

type PremiumPlan =
  | "monthly"
  | "quarterly"
  | "yearly";

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

    description:
      "Perfect for sellers who want to try Premium.",
  },

  {
    id: "quarterly",

    name: "Quarterly",

    duration: "90 days",

    price: 249,

    description:
      "Better value for regular sellers.",

    popular: true,
  },

  {
    id: "yearly",

    name: "Yearly",

    duration: "365 days",

    price: 799,

    description:
      "Best value for serious sellers.",
  },
];

// =====================================================
// Premium Dashboard
// =====================================================

export default function PremiumPage() {
  // ===================================================
  // State
  // ===================================================

  const [
    premium,
    setPremium,
  ] =
    useState<PremiumSellerStatus | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    activating,
    setActivating,
  ] =
    useState(false);

  const [
    selectedPlan,
    setSelectedPlan,
  ] =
    useState<PremiumPlan>(
      "quarterly",
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  // ===================================================
  // Load Premium Status
  // ===================================================

  async function loadPremiumStatus() {
    try {
      setLoading(true);

      setError("");

      const response =
        await fetch(
          "/api/premium/status",
          {
            cache: "no-store",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to load Premium Seller status.",
        );
      }

      setPremium(
        data.premiumSeller,
      );
    } catch (error) {
      console.error(
        "PREMIUM STATUS ERROR:",
        error,
      );

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

      const response =
        await fetch(
          "/api/payment/create-order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              type:
                selectedPlan ===
                "monthly"
                  ? "PREMIUM_MONTHLY"
                  : selectedPlan ===
                      "quarterly"
                    ? "PREMIUM_QUARTERLY"
                    : "PREMIUM_YEARLY",

              plan:
                selectedPlan,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to create payment order.",
        );
      }

      // =================================================
      // Razorpay SDK Check
      // =================================================

      if (
        typeof window ===
        "undefined"
      ) {
        throw new Error(
          "Payment gateway is not available.",
        );
      }

      if (
        !window.Razorpay
      ) {
        throw new Error(
          "Razorpay payment gateway is not loaded. Please refresh the page and try again.",
        );
      }

      // =================================================
      // Open Razorpay Checkout
      // =================================================

      const razorpay =
        new window.Razorpay({
          key:
            data.razorpayKeyId,

          amount:
            data.order.amount,

          currency:
            data.order.currency,

          name:
            "DealUp",

          description:
            `Premium Seller - ${
              selectedPlan ===
              "monthly"
                ? "Monthly"
                : selectedPlan ===
                    "quarterly"
                  ? "Quarterly"
                  : "Yearly"
            }`,

          order_id:
            data.order.id,

          handler:
            async (
              paymentResponse,
            ) => {
              try {
                setActivating(
                  true,
                );

                setError("");

                // =======================================
                // Verify Razorpay Payment
                // =======================================

                const verifyResponse =
                  await fetch(
                    "/api/payment/verify",
                    {
                      method:
                        "POST",

                      headers: {
                        "Content-Type":
                          "application/json",
                      },

                      body: JSON.stringify(
                        {
                          razorpayOrderId:
                            paymentResponse.razorpay_order_id,

                          razorpayPaymentId:
                            paymentResponse.razorpay_payment_id,

                          razorpaySignature:
                            paymentResponse.razorpay_signature,

                          paymentType:
                            data.paymentType,

                          plan:
                            selectedPlan,
                        },
                      ),
                    },
                  );

                const verifyData =
                  await verifyResponse.json();

                if (
                  !verifyResponse.ok
                ) {
                  throw new Error(
                    verifyData?.message ??
                      "Payment verification failed.",
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
                console.error(
                  "PREMIUM PAYMENT VERIFICATION ERROR:",
                  error,
                );

                setError(
                  error instanceof
                    Error
                    ? error.message
                    : "Payment verification failed.",
                );
              } finally {
                setActivating(
                  false,
                );
              }
            },

          modal: {
            ondismiss: () => {
              setActivating(
                false,
              );
            },
          },

          theme: {
            color:
              "#1565d8",
          },
        });

      razorpay.open();
    } catch (error) {
      console.error(
        "PREMIUM PAYMENT ERROR:",
        error,
      );

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
      <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl">
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

  if (
    error &&
    !premium
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <h1 className="text-xl font-bold">
              Unable to load Premium Seller
            </h1>

            <p className="mt-2 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadPremiumStatus
              }
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
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

  const features: PremiumFeature[] =
    [
      {
        icon: (
          <Megaphone
            size={24}
          />
        ),

        title:
          "Featured Ads",

        description:
          "Get your selected products greater visibility in DealUp listings.",

        enabled:
          premium.featuredAds,
      },

      {
        icon: (
          <Rocket
            size={24}
          />
        ),

        title:
          "Product Boost",

        description:
          "Boost eligible products to improve their position and visibility.",

        enabled:
          premium.productBoost,
      },

      {
        icon: (
          <BarChart3
            size={24}
          />
        ),

        title:
          "Seller Analytics",

        description:
          "Understand product views, engagement and seller performance.",

        enabled:
          premium.sellerAnalytics,
      },

      {
        icon: (
          <BadgeCheck
            size={24}
          />
        ),

        title:
          "Premium Badge",

        description:
          "Display a professional Premium Seller identity to buyers.",

        enabled:
          premium.premiumBadge,
      },

      {
        icon: (
          <Headphones
            size={24}
          />
        ),

        title:
          "Priority Support",

        description:
          "Get priority assistance for your marketplace activities.",

        enabled:
          premium.prioritySupport,
      },
    ];

  // ===================================================
  // Current Plan
  // ===================================================

  const currentPlan =
    premium.plan
      ? plans.find(
          (plan) =>
            plan.id ===
            premium.plan,
        )
      : null;

  // ===================================================
  // Remaining Quotas
  // ===================================================

  const featuredRemaining =
    Math.max(
      0,
      premium.featuredAdsLimit -
        premium.featuredAdsUsed,
    );

  const boostRemaining =
    Math.max(
      0,
      premium.boostAdsLimit -
        premium.boostAdsUsed,
    );

  // ===================================================
  // Render
  // ===================================================

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            Header
        ================================================= */}

        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#1565d8] p-3 text-white">
              <Crown
                size={28}
              />
            </div>

            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
                Premium Seller
              </h1>

              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Grow your DealUp business with powerful seller tools.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            Alerts
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
            {success}
          </div>
        )}

        {/* =================================================
            Active Premium
        ================================================= */}

        {premium.active ? (
          <div className="mb-10 rounded-3xl border border-[#1565d8]/20 bg-white p-7 shadow-sm dark:bg-slate-900">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-100 px-4 py-1.5 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Premium Active
                  </span>

                  {currentPlan && (
                    <span className="rounded-full bg-[#1565d8]/10 px-4 py-1.5 text-sm font-bold text-[#1565d8]">
                      {currentPlan.name}
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                  Your Premium Seller account is active
                </h2>

                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  {premium.remainingDays} days remaining
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-6 py-4 text-center dark:bg-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expires
                </p>

                <p className="mt-1 font-bold text-slate-900 dark:text-white">
                  {premium.expiresAt
                    ? new Date(
                        premium.expiresAt,
                      ).toLocaleDateString(
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
          </div>
        ) : (
          <div className="mb-10 rounded-3xl border border-orange-200 bg-orange-50 p-7 dark:border-orange-900/50 dark:bg-orange-950/20">

            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <Sparkles
                  size={24}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  You are currently a Free Seller
                </h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Upgrade to Premium Seller to unlock promotion tools, analytics and seller benefits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            Promotion Quota
        ================================================= */}

        <div className="mb-10 grid gap-6 md:grid-cols-2">

          {/* Featured */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Star
                    size={22}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Featured Ads
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Free quota
                  </p>
                </div>
              </div>

              <span className="text-2xl font-extrabold text-purple-600">
                {featuredRemaining}
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-purple-500 transition-all"
                style={{
                  width:
                    premium.featuredAdsLimit >
                    0
                      ? `${Math.min(
                          100,
                          (premium.featuredAdsUsed /
                            premium.featuredAdsLimit) *
                            100,
                        )}%`
                      : "0%",
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>
                Used:{" "}
                {premium.featuredAdsUsed}
              </span>

              <span>
                Limit:{" "}
                {premium.featuredAdsLimit}
              </span>
            </div>
          </div>

          {/* Boost */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-[#1565d8] dark:bg-blue-900/30">
                  <Rocket
                    size={22}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Boost Ads
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Free quota
                  </p>
                </div>
              </div>

              <span className="text-2xl font-extrabold text-[#1565d8]">
                {boostRemaining}
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-[#1565d8] transition-all"
                style={{
                  width:
                    premium.boostAdsLimit >
                    0
                      ? `${Math.min(
                          100,
                          (premium.boostAdsUsed /
                            premium.boostAdsLimit) *
                            100,
                        )}%`
                      : "0%",
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>
                Used:{" "}
                {premium.boostAdsUsed}
              </span>

              <span>
                Limit:{" "}
                {premium.boostAdsLimit}
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            Features
        ================================================= */}

        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Premium Benefits
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Everything included with Premium Seller.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(
              (feature) => (
                <div
                  key={
                    feature.title
                  }
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="rounded-2xl bg-[#1565d8]/10 p-3 text-[#1565d8]">
                      {feature.icon}
                    </div>

                    {feature.enabled && (
                      <div className="rounded-full bg-green-100 p-1.5 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <Check
                          size={16}
                        />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {
                      feature.description
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        </section>

        {/* =================================================
            Plans
        ================================================= */}

        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Choose Your Premium Plan
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Secure payment through Razorpay.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map(
              (plan) => {
                const selected =
                  selectedPlan ===
                  plan.id;

                return (
                  <button
                    key={
                      plan.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedPlan(
                        plan.id,
                      )
                    }
                    className={`relative rounded-3xl border p-7 text-left transition ${
                      selected
                        ? "border-[#1565d8] bg-[#1565d8]/5 shadow-lg"
                        : "border-slate-200 bg-white shadow-sm hover:border-[#1565d8]/40 dark:border-slate-700 dark:bg-slate-900"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute right-5 top-5 rounded-full bg-[#f5a623] px-3 py-1 text-xs font-bold text-white">
                        Most Popular
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-xl p-3 ${
                          selected
                            ? "bg-[#1565d8] text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {plan.id ===
                        "monthly" ? (
                          <Zap
                            size={22}
                          />
                        ) : plan.id ===
                          "quarterly" ? (
                          <TrendingUp
                            size={22}
                          />
                        ) : (
                          <Crown
                            size={22}
                          />
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {plan.name}
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {plan.duration}
                        </p>
                      </div>
                    </div>

                    <div className="mt-7">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                        ₹
                        {
                          plan.price
                        }
                      </span>
                    </div>

                    <p className="mt-4 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {
                        plan.description
                      }
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#1565d8]">
                      <Check
                        size={18}
                      />

                      Premium Seller
                    </div>
                  </button>
                );
              },
            )}
          </div>

          {/* =================================================
              Payment Button
          ================================================= */}

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Selected plan
                </p>

                <h3 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {
                    plans.find(
                      (plan) =>
                        plan.id ===
                        selectedPlan,
                    )?.name
                  }{" "}
                  — ₹
                  {
                    plans.find(
                      (plan) =>
                        plan.id ===
                        selectedPlan,
                    )?.price
                  }
                </h3>
              </div>

              <button
                type="button"
                onClick={
                  handleActivatePremium
                }
                disabled={
                  activating
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1565d8] px-8 py-4 font-bold text-white shadow-sm transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activating ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    Processing...
                  </>
                ) : (
                  <>
                    <Crown
                      size={20}
                    />

                    Pay with Razorpay
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

      </div>
    </main>
    </>
  );
}