"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ProductStatus } from "@/lib/models/product";

import {
  Eye,
  Heart,
  Pencil,
  Trash2,
  MapPin,
  MessageCircle,
  Star,
  Rocket,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

// =====================================================
// Razorpay
// =====================================================

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;

      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;

      modal?: {
        ondismiss?: () => void;
      };

      theme?: {
        color?: string;
      };
    }) => {
      open: () => void;
    };
  }
}

// =====================================================
// Props
// =====================================================

interface MyProductCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  location: string;

  views: number;
  favorites: number;
  chatCount: number;

  status: ProductStatus;

  // Boost
  isBoosted?: boolean;
  boostedUntil?: Date | string;

  // Featured
  isFeatured?: boolean;
  featuredAt?: Date | string;
  featuredUntil?: Date | string;
}

// =====================================================
// Component
// =====================================================

export default function MyProductCard({
  id,
  slug,
  title,
  price,
  image,
  location,
  views,
  favorites,
  chatCount,
  status,
  isBoosted,
  boostedUntil,
  isFeatured,
  featuredUntil,
}: MyProductCardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // =====================================================
  // Status
  // =====================================================

  const statusConfig: Record<
    ProductStatus,
    {
      label: string;
      className: string;
    }
  > = {
    draft: {
      label: "Draft",
      className:
        "bg-slate-700 text-white dark:bg-slate-600",
    },

    active: {
      label: "Active",
      className:
        "bg-emerald-500 text-white",
    },

    sold: {
      label: "Sold",
      className:
        "bg-slate-600 text-white",
    },

    expired: {
      label: "Expired",
      className:
        "bg-orange-500 text-white",
    },

    blocked: {
      label: "Blocked",
      className:
        "bg-red-500 text-white",
    },
  };

  const currentStatus =
    statusConfig[status] ?? statusConfig.active;

  // =====================================================
  // Razorpay Script
  // =====================================================

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existingScript) {
        existingScript.addEventListener("load", () =>
          resolve(true),
        );

        existingScript.addEventListener("error", () =>
          resolve(false),
        );

        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  }

  // =====================================================
  // Verify Payment
  // =====================================================

  async function verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const response = await fetch(
      "/api/payment/verify",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Payment verification failed.",
      );
    }

    return data;
  }

  // =====================================================
  // Razorpay Checkout
  // =====================================================

  async function openRazorpayCheckout(options: {
    type:
      | "BOOST_AD"
      | "FEATURED_AD";

    price: number;
    durationDays: number;
    description: string;
  }) {
    // -----------------------------------------------------
    // Load Razorpay
    // -----------------------------------------------------

    const loaded =
      await loadRazorpayScript();

    if (!loaded) {
      throw new Error(
        "Unable to load Razorpay Checkout. Please try again.",
      );
    }

    // -----------------------------------------------------
    // Create Order
    // -----------------------------------------------------

    const orderResponse = await fetch(
      "/api/payment/create-order",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          type: options.type,
          productId: id,
        }),
      },
    );

    const orderData =
      await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(
        orderData.message ||
          "Unable to create payment order.",
      );
    }

    // -----------------------------------------------------
    // Razorpay Key
    // -----------------------------------------------------

    const keyId =
      orderData.razorpayKeyId ||
      process.env
        .NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId) {
      throw new Error(
        "Razorpay Key ID is not configured.",
      );
    }

    // -----------------------------------------------------
    // Order
    // -----------------------------------------------------

    const order = orderData.order;

    if (!order?.id) {
      throw new Error(
        "Invalid Razorpay order.",
      );
    }

    // -----------------------------------------------------
    // Checkout
    // -----------------------------------------------------

    await new Promise<void>(
      (resolve, reject) => {
        let settled = false;

        const finishSuccess = () => {
          if (settled) return;

          settled = true;
          resolve();
        };

        const finishFailure = (
          error: Error,
        ) => {
          if (settled) return;

          settled = true;
          reject(error);
        };

        const razorpay =
          new window.Razorpay({
            key: keyId,

            amount: order.amount,

            currency:
              order.currency || "INR",

            name: "DealUp Marketplace",

            description:
              options.description,

            order_id: order.id,

            handler: async (
              response,
            ) => {
              try {
                // -----------------------------------------
                // Server-side verification
                // -----------------------------------------

                const verification =
                  await verifyPayment(
                    response.razorpay_order_id,
                    response.razorpay_payment_id,
                    response.razorpay_signature,
                  );

                if (verification.success) {
                  alert(
                    "Payment verified successfully.\n\n" +
                      "Your payment has been recorded. " +
                      "The service activation will be completed next.",
                  );

                  router.refresh();

                  finishSuccess();

                  return;
                }

                finishFailure(
                  new Error(
                    "Payment verification failed.",
                  ),
                );
              } catch (error) {
                finishFailure(
                  error instanceof Error
                    ? error
                    : new Error(
                        "Payment verification failed.",
                      ),
                );
              }
            },

            modal: {
              ondismiss: () => {
                finishSuccess();
              },
            },

            theme: {
              color: "#1565d8",
            },
          });

        razorpay.open();
      },
    );
  }

  // =====================================================
  // Delete Product
  // =====================================================

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?",
      );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/products/${id}`,
        {
          method: "DELETE",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete product.",
        );
      }

      alert(
        "Product deleted successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete product.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // Mark Sold
  // =====================================================

  async function handleMarkSold() {
    const confirmed =
      window.confirm(
        "Are you sure you want to mark this product as sold?",
      );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/products/${id}`,
        {
          method: "PATCH",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark product as sold.",
        );
      }

      alert(
        "Product marked as sold.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "MARK SOLD ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to mark product as sold.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // Boost Product
  // =====================================================

  async function handleBoost() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/products/${id}/boost`,
        {
          method: "PATCH",
        },
      );

      const data =
        await response.json();

      // ---------------------------------------------------
      // Payment required
      // ---------------------------------------------------

      if (
        response.status === 402 &&
        data.paymentRequired === true
      ) {
        const price = Number(
          data.price ?? 29,
        );

        const durationDays =
          Number(
            data.durationDays ?? 7,
          );

        const isPremiumSeller =
          data.isPremiumSeller === true;

        // Server remains the source of truth
        const confirmed =
          window.confirm(
            isPremiumSeller
              ? `Your free Boost Ads quota has been exhausted.\n\n` +
                  `Premium Seller Boost Ad\n` +
                  `Price: ₹${price}\n` +
                  `Duration: ${durationDays} days\n\n` +
                  `Continue to Razorpay payment?`
              : `Boost Ad payment is required.\n\n` +
                  `Price: ₹${price}\n` +
                  `Duration: ${durationDays} days\n\n` +
                  `Continue to Razorpay payment?`,
          );

        if (!confirmed) {
          return;
        }

        await openRazorpayCheckout({
          type: "BOOST_AD",

          price,

          durationDays,

          description:
            isPremiumSeller
              ? "DealUp Premium Seller Boost Ad - 7 Days"
              : "DealUp Boost Ad - 7 Days",
        });

        return;
      }

      // ---------------------------------------------------
      // Already boosted
      // ---------------------------------------------------

      if (response.status === 409) {
        alert(
          data.message ||
            "This product is already boosted.",
        );

        return;
      }

      // ---------------------------------------------------
      // Normal error
      // ---------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to boost product.",
        );
      }

      // ---------------------------------------------------
      // Free boost success
      // ---------------------------------------------------

      const isPremiumSeller =
        data.isPremiumSeller === true;

      const boostAdsRemaining =
        data.boostAdsRemaining;

      if (
        isPremiumSeller &&
        typeof boostAdsRemaining === "number"
      ) {
        alert(
          `Product boosted successfully.\n\n` +
            `Duration: 7 days\n` +
            `Free Boosts remaining: ${boostAdsRemaining}`,
        );
      } else {
        alert(
          "Product boosted successfully.",
        );
      }

      router.refresh();
    } catch (error) {
      console.error(
        "BOOST PRODUCT ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to boost product.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // Feature Product
  // =====================================================

  async function handleFeature() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/products/${id}/feature`,
        {
          method: "PATCH",
        },
      );

      const data =
        await response.json();

      // ---------------------------------------------------
      // Payment required
      // ---------------------------------------------------

      if (
        response.status === 402 &&
        data.paymentRequired === true
      ) {
        const price = Number(
          data.price ?? 29,
        );

        const durationDays =
          Number(
            data.durationDays ?? 14,
          );

        const confirmed =
          window.confirm(
            `Your free Featured Ad quota has been exhausted.\n\n` +
              `Featured Ad\n` +
              `Price: ₹${price}\n` +
              `Duration: ${durationDays} days\n\n` +
              `Continue to Razorpay payment?`,
          );

        if (!confirmed) {
          return;
        }

        await openRazorpayCheckout({
          type: "FEATURED_AD",

          price,

          durationDays,

          description:
            "DealUp Featured Ad - 14 Days",
        });

        return;
      }

      // ---------------------------------------------------
      // Already featured
      // ---------------------------------------------------

      if (response.status === 409) {
        alert(
          data.message ||
            "This product is already featured.",
        );

        return;
      }

      // ---------------------------------------------------
      // Normal error
      // ---------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to feature product.",
        );
      }

      // ---------------------------------------------------
      // Free featured success
      // ---------------------------------------------------

      const featuredAdsRemaining =
        data.featuredAdsRemaining;

      if (
        typeof featuredAdsRemaining ===
        "number"
      ) {
        alert(
          `Product featured successfully.\n\n` +
            `Duration: 14 days\n` +
            `Free Featured Ads remaining: ${featuredAdsRemaining}`,
        );
      } else {
        alert(
          "Product featured successfully.",
        );
      }

      router.refresh();
    } catch (error) {
      console.error(
        "FEATURE PRODUCT ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to feature product.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // Date Formatter
  // =====================================================

  function formatDate(
    date?: Date | string,
  ) {
    if (!date) return "--";

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return "--";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
        dark:border-slate-700
        dark:bg-slate-900
        sm:rounded-3xl
      "
    >
      {/* ===================================================
          IMAGE
      =================================================== */}

      <div
        className="
          relative
          aspect-[4/3]
          overflow-hidden
          bg-slate-100
          dark:bg-slate-800
          sm:aspect-[16/10]
        "
      >
        <Image
          src={
            image ||
            "/placeholder-product.jpg"
          }
          alt={title}
          fill
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            33vw
          "
          className="
            object-cover
            transition-transform
            duration-500
            group-hover:scale-[1.04]
          "
        />

        {/* Image overlay */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/30
            via-transparent
            to-black/10
          "
        />

        {/* =================================================
            STATUS BADGE
        ================================================= */}

        <span
          className={`
            absolute
            left-3
            top-3
            z-20
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-2.5
            py-1
            text-[10px]
            font-bold
            uppercase
            tracking-wide
            shadow-md
            sm:left-4
            sm:top-4
            sm:px-3
            sm:py-1.5
            sm:text-xs
            ${currentStatus.className}
          `}
        >
          {status === "active" && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}

          {currentStatus.label}
        </span>

        {/* =================================================
            BOOSTED BADGE
        ================================================= */}

        {isBoosted && (
          <div
            className="
              absolute
              right-3
              top-3
              z-30
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-amber-400
              px-2.5
              py-1
              text-[10px]
              font-extrabold
              tracking-wide
              text-slate-950
              shadow-lg
              sm:right-4
              sm:top-4
              sm:px-3
              sm:py-1.5
              sm:text-xs
            "
          >
            <Rocket
              size={12}
              strokeWidth={2.5}
            />

            <span>BOOSTED</span>
          </div>
        )}

        {/* =================================================
            FEATURED BADGE
        ================================================= */}

        {isFeatured && (
          <div
            className={`
              absolute
              right-3
              z-20
              inline-flex
              items-center
              gap-1
              rounded-full
              border
              border-blue-100
              bg-white/95
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-[#1565d8]
              shadow-lg
              backdrop-blur-sm
              sm:right-4
              sm:px-3
              sm:py-1.5
              sm:text-xs
              ${
                isBoosted
                  ? "top-10 sm:top-12"
                  : "top-3 sm:top-4"
              }
            `}
          >
            <Star
              size={12}
              strokeWidth={2.5}
              fill="#1565d8"
            />

            <span>Featured</span>
          </div>
        )}
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="p-4 sm:p-5">
        {/* =================================================
            TITLE
        ================================================= */}

        <div className="min-h-[42px]">
          <h2
            className="
              line-clamp-2
              text-base
              font-bold
              leading-5
              text-slate-900
              dark:text-white
              sm:text-lg
              sm:leading-6
            "
          >
            {title}
          </h2>
        </div>

        {/* =================================================
            PRICE
        ================================================= */}

        <p
          className="
            mt-2
            text-2xl
            font-extrabold
            tracking-tight
            text-[#1565d8]
            sm:mt-3
            sm:text-3xl
          "
        >
          ₹{price.toLocaleString("en-IN")}
        </p>

        {/* =================================================
            LOCATION
        ================================================= */}

        <div
          className="
            mt-2
            flex
            min-w-0
            items-center
            gap-1.5
            text-xs
            text-slate-500
            dark:text-slate-400
            sm:mt-3
            sm:text-sm
          "
        >
          <MapPin
            size={15}
            className="shrink-0 text-slate-400"
          />

          <span className="truncate">
            {location}
          </span>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div
          className="
            mt-4
            grid
            grid-cols-3
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            dark:border-slate-700
            dark:bg-slate-800
            sm:mt-5
            sm:rounded-2xl
          "
        >
          {/* Views */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-1.5
              border-r
              border-slate-200
              px-2
              py-3
              dark:border-slate-700
              sm:gap-2
              sm:py-3.5
            "
          >
            <Eye
              size={15}
              className="shrink-0 text-[#1565d8]"
            />

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-[9px]
                  text-slate-500
                  dark:text-slate-400
                  sm:text-[10px]
                "
              >
                Views
              </p>

              <p
                className="
                  text-xs
                  font-bold
                  text-slate-900
                  dark:text-white
                  sm:text-sm
                "
              >
                {views}
              </p>
            </div>
          </div>

          {/* Favorites */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-1.5
              border-r
              border-slate-200
              px-2
              py-3
              dark:border-slate-700
              sm:gap-2
              sm:py-3.5
            "
          >
            <Heart
              size={15}
              className="shrink-0 text-red-500"
            />

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-[9px]
                  text-slate-500
                  dark:text-slate-400
                  sm:text-[10px]
                "
              >
                Favorites
              </p>

              <p
                className="
                  text-xs
                  font-bold
                  text-slate-900
                  dark:text-white
                  sm:text-sm
                "
              >
                {favorites}
              </p>
            </div>
          </div>

          {/* Chats */}

          <Link
            href="/messages"
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-1.5
              px-2
              py-3
              transition
              hover:bg-white
              dark:hover:bg-slate-700
              sm:gap-2
              sm:py-3.5
            "
          >
            <MessageCircle
              size={15}
              className="shrink-0 text-green-500"
            />

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-[9px]
                  text-slate-500
                  dark:text-slate-400
                  sm:text-[10px]
                "
              >
                Chats
              </p>

              <p
                className="
                  text-xs
                  font-bold
                  text-slate-900
                  dark:text-white
                  sm:text-sm
                "
              >
                {chatCount}
              </p>
            </div>
          </Link>
        </div>

        {/* =================================================
            PRIMARY ACTIONS
        ================================================= */}

        <div
          className="
            mt-4
            grid
            grid-cols-3
            gap-2
            sm:mt-5
            sm:gap-3
          "
        >
          {/* View */}

          <Link
            href={`/products/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              min-w-0
              items-center
              justify-center
              gap-1
              rounded-xl
              border
              border-slate-300
              bg-slate-50
              px-2
              py-2.5
              text-[11px]
              font-semibold
              text-slate-700
              transition-all
              hover:border-blue-300
              hover:bg-blue-50
              hover:text-[#1565d8]
              active:scale-95
              dark:border-slate-600
              dark:bg-slate-800
              dark:text-slate-200
              dark:hover:border-blue-700
              dark:hover:bg-blue-950/40
              sm:gap-1.5
              sm:py-3
              sm:text-xs
            "
          >
            <ExternalLink
              size={14}
              className="shrink-0"
            />

            <span>View</span>
          </Link>

          {/* Active */}

          {status === "active" ? (
            <>
              {/* Edit */}

              <Link
                href={`/dashboard/my-ads/${id}/edit`}
                className="
                  inline-flex
                  min-w-0
                  items-center
                  justify-center
                  gap-1
                  rounded-xl
                  bg-[#1565d8]
                  px-2
                  py-2.5
                  text-[11px]
                  font-semibold
                  text-white
                  transition-all
                  hover:bg-[#0f52ba]
                  hover:shadow-md
                  active:scale-95
                  sm:gap-1.5
                  sm:py-3
                  sm:text-xs
                "
              >
                <Pencil
                  size={14}
                  className="shrink-0"
                />

                <span>Edit</span>
              </Link>

              {/* Delete */}

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="
                  inline-flex
                  min-w-0
                  items-center
                  justify-center
                  gap-1
                  rounded-xl
                  bg-red-500
                  px-2
                  py-2.5
                  text-[11px]
                  font-semibold
                  text-white
                  transition-all
                  hover:bg-red-600
                  hover:shadow-md
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:gap-1.5
                  sm:py-3
                  sm:text-xs
                "
              >
                <Trash2
                  size={14}
                  className="shrink-0"
                />

                <span>
                  {loading
                    ? "..."
                    : "Delete"}
                </span>
              </button>
            </>
          ) : (
            <>
              {/* Sold */}

              <div
                className="
                  inline-flex
                  min-w-0
                  items-center
                  justify-center
                  gap-1
                  rounded-xl
                  bg-slate-200
                  px-2
                  py-2.5
                  text-[11px]
                  font-semibold
                  text-slate-600
                  dark:bg-slate-700
                  dark:text-slate-300
                  sm:gap-1.5
                  sm:py-3
                  sm:text-xs
                "
              >
                <CheckCircle2
                  size={14}
                  className="shrink-0"
                />

                <span>
                  {status === "sold"
                    ? "SOLD"
                    : currentStatus.label}
                </span>
              </div>

              {/* Delete */}

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="
                  inline-flex
                  min-w-0
                  items-center
                  justify-center
                  gap-1
                  rounded-xl
                  bg-red-500
                  px-2
                  py-2.5
                  text-[11px]
                  font-semibold
                  text-white
                  transition-all
                  hover:bg-red-600
                  active:scale-95
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:gap-1.5
                  sm:py-3
                  sm:text-xs
                "
              >
                <Trash2
                  size={14}
                  className="shrink-0"
                />

                <span>
                  {loading
                    ? "..."
                    : "Delete"}
                </span>
              </button>
            </>
          )}
        </div>

        {/* =================================================
            ACTIVE PRODUCT CONTROLS
        ================================================= */}

        {status === "active" && (
          <div className="mt-3 space-y-3">
            {/* =================================================
                MARK SOLD
            ================================================= */}

            <button
              type="button"
              onClick={handleMarkSold}
              disabled={loading}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-green-600
                px-4
                py-2.5
                text-xs
                font-bold
                text-white
                shadow-sm
                transition-all
                hover:bg-green-700
                hover:shadow-md
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:py-3
                sm:text-sm
              "
            >
              <CheckCircle2
                size={16}
              />

              <span>
                {loading
                  ? "Processing..."
                  : "Mark Sold"}
              </span>
            </button>

            {/* =================================================
                BOOST
            ================================================= */}

            {isBoosted ? (
              <div
                className="
                  rounded-xl
                  border
                  border-amber-300
                  bg-amber-50
                  px-4
                  py-3
                  text-center
                  dark:border-amber-800
                  dark:bg-amber-950/30
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  <Rocket
                    size={17}
                    className="text-amber-600"
                  />

                  <p
                    className="
                      text-sm
                      font-bold
                      text-amber-700
                      dark:text-amber-400
                    "
                  >
                    Boost Active
                  </p>
                </div>

                <p
                  className="
                    mt-1.5
                    text-[11px]
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Active until
                </p>

                <p
                  className="
                    mt-0.5
                    text-sm
                    font-bold
                    text-slate-800
                    dark:text-slate-200
                  "
                >
                  {formatDate(
                    boostedUntil,
                  )}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBoost}
                disabled={loading}
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-amber-500
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-amber-600
                  hover:shadow-md
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:py-3
                  sm:text-sm
                "
              >
                <Rocket size={16} />

                <span>
                  {loading
                    ? "Processing..."
                    : "Boost This Ad"}
                </span>
              </button>
            )}

            {/* =================================================
                FEATURED
            ================================================= */}

            {isFeatured ? (
              <div
                className="
                  rounded-xl
                  border
                  border-blue-200
                  bg-blue-50
                  px-4
                  py-3
                  text-center
                  dark:border-blue-900
                  dark:bg-blue-950/40
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  <Star
                    size={17}
                    strokeWidth={2.5}
                    fill="#1565d8"
                    className="text-[#1565d8]"
                  />

                  <p
                    className="
                      text-sm
                      font-bold
                      text-[#1565d8]
                    "
                  >
                    Featured Ad Active
                  </p>
                </div>

                <p
                  className="
                    mt-1.5
                    text-[11px]
                    leading-5
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Your product is getting
                  extra visibility.
                </p>

                {featuredUntil && (
                  <p
                    className="
                      mt-1
                      text-xs
                      font-semibold
                      text-slate-700
                      dark:text-slate-300
                    "
                  >
                    Active until{" "}
                    {formatDate(
                      featuredUntil,
                    )}
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFeature}
                disabled={loading}
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#1565d8]
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-[#0f52ba]
                  hover:shadow-md
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  sm:py-3
                  sm:text-sm
                "
              >
                <Star
                  size={16}
                  fill="currentColor"
                />

                <span>
                  {loading
                    ? "Processing..."
                    : "Feature This Ad"}
                </span>
              </button>
            )}
          </div>
        )}

        {/* =================================================
            SOLD MESSAGE
        ================================================= */}

        {status === "sold" && (
          <div
            className="
              mt-3
              rounded-xl
              border
              border-green-200
              bg-green-50
              px-4
              py-3
              text-center
              dark:border-green-900
              dark:bg-green-950/30
            "
          >
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <CheckCircle2
                size={16}
                className="text-green-600"
              />

              <p
                className="
                  text-sm
                  font-bold
                  text-green-700
                  dark:text-green-400
                "
              >
                This product has been sold
              </p>
            </div>

            <p
              className="
                mt-1
                text-[11px]
                leading-5
                text-slate-500
                dark:text-slate-400
              "
            >
              Buyers can no longer contact
              you for this product.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}