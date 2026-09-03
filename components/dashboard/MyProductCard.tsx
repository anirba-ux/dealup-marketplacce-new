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

  status: ProductStatus;

  chatCount: number;

  // ===================================================
  // Boost
  // ===================================================

  isBoosted?: boolean;
  boostedUntil?: Date | string;

  // ===================================================
  // Featured
  // ===================================================

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

  status,

  chatCount,

  isBoosted,
  boostedUntil,

  isFeatured,
  featuredAt,
  featuredUntil,
}: MyProductCardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // ===================================================
  // Status Color
  // ===================================================

  const statusColor: Record<
    ProductStatus,
    string
  > = {
    draft: "bg-slate-500",
    active: "bg-green-500",
    sold: "bg-gray-500",
    expired: "bg-orange-500",
    blocked: "bg-red-500",
  };

  // ===================================================
  // Load Razorpay Checkout
  // ===================================================

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true),
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false),
        );

        return;
      }

      const script =
        document.createElement("script");

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

  // ===================================================
  // Verify Razorpay Payment
  // ===================================================

  async function verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    const response =
      await fetch(
        "/api/payment/verify",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            razorpayOrderId,

            razorpayPaymentId,

            razorpaySignature,
          }),
        },
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Payment verification failed.",
      );
    }

    return data;
  }

  // ===================================================
  // Open Razorpay Checkout
  // ===================================================

  async function openRazorpayCheckout(
    options: {
      type:
        | "BOOST_AD"
        | "FEATURED_AD";

      price: number;

      durationDays: number;

      description: string;
    },
  ) {
    // =================================================
    // Load Razorpay
    // =================================================

    const loaded =
      await loadRazorpayScript();

    if (!loaded) {
      throw new Error(
        "Unable to load Razorpay Checkout. Please try again.",
      );
    }

    // =================================================
    // Create Order
    // =================================================

    const orderResponse =
      await fetch(
        "/api/payment/create-order",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
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

    // =================================================
    // Key
    // =================================================

    const keyId =
      orderData.razorpayKeyId ||
      process.env
        .NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!keyId) {
      throw new Error(
        "Razorpay Key ID is not configured.",
      );
    }

    // =================================================
    // Order
    // =================================================

    const order =
      orderData.order;

    if (!order?.id) {
      throw new Error(
        "Invalid Razorpay order.",
      );
    }

    // =================================================
    // Open Checkout
    // =================================================

    await new Promise<void>(
      (resolve, reject) => {
        let settled = false;

        const finishSuccess =
          () => {
            if (settled) return;

            settled = true;

            resolve();
          };

        const finishFailure =
          (error: Error) => {
            if (settled) return;

            settled = true;

            reject(error);
          };

        const razorpay =
          new window.Razorpay({
            key: keyId,

            amount:
              order.amount,

            currency:
              order.currency ||
              "INR",

            name:
              "DealUp Marketplace",

            description:
              options.description,

            order_id:
              order.id,

            handler:
              async (
                response,
              ) => {
                try {
                  // ===================================
                  // Server-side Verification
                  // ===================================

                  const verification =
                    await verifyPayment(
                      response.razorpay_order_id,

                      response.razorpay_payment_id,

                      response.razorpay_signature,
                    );

                  // ===================================
                  // Verified
                  // ===================================

                  if (
                    verification.success
                  ) {
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
              color:
                "#1565d8",
            },
          });

        razorpay.open();
      },
    );
  }

  // ===================================================
  // Delete Product
  // ===================================================

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?",
      );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response =
        await fetch(
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

  // ===================================================
  // Mark Sold
  // ===================================================

  async function handleMarkSold() {
    const confirmed =
      window.confirm(
        "Are you sure you want to mark this product as sold?",
      );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response =
        await fetch(
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

  // ===================================================
  // Boost Product
  // ===================================================

  async function handleBoost() {
    try {
      setLoading(true);

      const response =
        await fetch(
          `/api/products/${id}/boost`,
          {
            method: "PATCH",
          },
        );

      const data =
        await response.json();

      // =================================================
      // PAYMENT REQUIRED
      // =================================================

      if (
        response.status === 402 &&
        data.paymentRequired === true
      ) {
        const price =
          Number(
            data.price ?? 29,
          );

        const durationDays =
          Number(
            data.durationDays ?? 7,
          );

        const isPremiumSeller =
          data.isPremiumSeller ===
          true;

        // ===============================================
        // IMPORTANT SECURITY CHECK
        //
        // The server is the source of truth for price.
        // We only display the server-provided price.
        // ===============================================

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

        // ===============================================
        // Razorpay Payment
        // ===============================================

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

      // =================================================
      // ALREADY BOOSTED
      // =================================================

      if (
        response.status ===
        409
      ) {
        alert(
          data.message ||
            "This product is already boosted.",
        );

        return;
      }

      // =================================================
      // NORMAL ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to boost product.",
        );
      }

      // =================================================
      // SUCCESS — FREE BOOST
      // =================================================

      const isPremiumSeller =
        data.isPremiumSeller ===
        true;

      const boostAdsRemaining =
        data.boostAdsRemaining;

      if (
        isPremiumSeller &&
        typeof boostAdsRemaining ===
          "number"
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

  // ===================================================
  // Feature Product
  // ===================================================

  async function handleFeature() {
    try {
      setLoading(true);

      const response =
        await fetch(
          `/api/products/${id}/feature`,
          {
            method: "PATCH",
          },
        );

      const data =
        await response.json();

      // =================================================
      // PAYMENT REQUIRED
      // =================================================

      if (
        response.status === 402 &&
        data.paymentRequired === true
      ) {
        const price =
          Number(
            data.price ?? 29,
          );

        const durationDays =
          Number(
            data.durationDays ?? 14,
          );

        // ===============================================
        // ONE confirmation
        // ===============================================

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

        // ===============================================
        // Razorpay Payment
        // ===============================================

        await openRazorpayCheckout({
          type: "FEATURED_AD",

          price,

          durationDays,

          description:
            "DealUp Featured Ad - 14 Days",
        });

        return;
      }

      // =================================================
      // ALREADY FEATURED
      // =================================================

      if (
        response.status ===
        409
      ) {
        alert(
          data.message ||
            "This product is already featured.",
        );

        return;
      }

      // =================================================
      // NORMAL ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to feature product.",
        );
      }

      // =================================================
      // SUCCESS — FREE FEATURED
      // =================================================

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

  // ===================================================
  // Date Formatter
  // ===================================================

  function formatDate(
    date?: Date | string,
  ) {
    if (!date) return "--";

    const parsedDate =
      new Date(date);

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

  // ===================================================
  // Render
  // ===================================================

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-2xl
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className="
          relative
          h-56
          overflow-hidden
        "
      >
        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        <Image
          src={
            image ||
            "/placeholder-product.jpg"
          }
          alt={title}
          fill
          sizes="
            (max-width:768px) 100vw,
            (max-width:1200px) 50vw,
            33vw
          "
          className="
            object-cover
            transition-transform
            duration-500
            hover:scale-110
          "
        />

        {/* =================================================
            STATUS
        ================================================= */}

        <span
          className={`
            absolute
            left-4
            top-4
            z-30
            rounded-full
            px-3
            py-1
            text-xs
            font-semibold
            text-white
            shadow-md
            ${statusColor[status]}
          `}
        >
          {status}
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
              z-50
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-amber-400
              px-3
              py-1
              text-xs
              font-bold
              text-slate-900
              shadow-lg
            "
          >
            <Rocket size={13} />

            <span>
              BOOSTED
            </span>
          </div>
        )}

        {/* =================================================
            FEATURED BADGE
        =================================================

        If Boosted:
          Featured appears below Boosted.

        If not Boosted:
          Featured remains top-right.
        ================================================= */}

        {isFeatured && (
          <div
            className={`
              absolute
              right-3
              z-40
              pointer-events-none
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-[#1565d8]/20
              bg-white/95
              px-3
              py-1.5
              text-xs
              font-bold
              text-[#1565d8]
              shadow-lg
              backdrop-blur-sm
              ${
                isBoosted
                  ? "top-11"
                  : "top-3"
              }
            `}
          >
            <Star
              size={14}
              strokeWidth={2.5}
              fill="#1565d8"
              className="text-[#1565d8]"
            />

            <span>
              Featured
            </span>
          </div>
        )}
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="space-y-4 p-5">

        {/* =================================================
            TITLE
        ================================================= */}

        <h2
          className="
            line-clamp-2
            text-xl
            font-bold
            text-slate-900
            dark:text-white
          "
        >
          {title}
        </h2>

        {/* =================================================
            PRICE
        ================================================= */}

        <p
          className="
            text-3xl
            font-extrabold
            text-[#1565d8]
          "
        >
          ₹{price.toLocaleString("en-IN")}
        </p>

        {/* =================================================
            LOCATION
        ================================================= */}

        <div
          className="
            flex
            items-center
            gap-2
            text-slate-500
            dark:text-slate-400
          "
        >
          <MapPin size={18} />

          <span>
            {location}
          </span>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div
          className="
            grid
            grid-cols-3
            gap-4
            rounded-2xl
            bg-slate-50
            p-4
            dark:bg-slate-800
          "
        >
          {/* Views */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <Eye
              size={18}
              className="text-[#1565d8]"
            />

            <div>
              <p
                className="
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Views
              </p>

              <p
                className="
                  font-bold
                  text-slate-900
                  dark:text-white
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
              items-center
              gap-2
            "
          >
            <Heart
              size={18}
              className="text-red-500"
            />

            <div>
              <p
                className="
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Favorites
              </p>

              <p
                className="
                  font-bold
                  text-slate-900
                  dark:text-white
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
              items-center
              gap-2
              rounded-lg
              transition
              hover:bg-slate-100
              dark:hover:bg-slate-700
            "
          >
            <MessageCircle
              size={18}
              className="text-green-600"
            />

            <div>
              <p
                className="
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Chats
              </p>

              <p
                className="
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {chatCount}
              </p>
            </div>
          </Link>
        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div
          className="
            grid
            grid-cols-3
            gap-3
          "
        >
          {/* View */}

          <Link
            href={`/products/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              items-center
              justify-center
              rounded-xl
              border
              border-slate-300
              bg-[var(--secondary)]
              py-3
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-100
              hover:text-[#1565d8]
            "
          >
            View
          </Link>

          {/* Active */}

          {status === "active" ? (
            <>
              {/* Edit */}

              <Link
                href={`/dashboard/my-ads/${id}/edit`}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#1565d8]
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#0f52ba]
                "
              >
                <Pencil size={16} />

                Edit
              </Link>

              {/* Delete */}

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-red-500
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Trash2 size={16} />

                {loading
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </>
          ) : (
            <>
              {/* Sold */}

              <div
                className="
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-200
                  py-3
                  text-sm
                  font-semibold
                  text-slate-600
                "
              >
                ✓ SOLD
              </div>

              {/* Delete */}

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-red-500
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Trash2 size={16} />

                Delete
              </button>
            </>
          )}
        </div>

        {/* =================================================
            ACTIVE PRODUCT CONTROLS
        ================================================= */}

        {status === "active" && (
          <div
            className="
              mt-3
              space-y-3
            "
          >
            {/* =================================================
                MARK SOLD
            ================================================= */}

            <button
              type="button"
              onClick={handleMarkSold}
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-green-600
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-green-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Processing..."
                : "✓ Mark Sold"}
            </button>

            {/* =================================================
                BOOST AD
            ================================================= */}

            {isBoosted ? (
              <div
                className="
                  rounded-xl
                  border
                  border-amber-300
                  bg-amber-50
                  p-4
                  text-center
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
                    size={18}
                    className="text-amber-600"
                  />

                  <p
                    className="
                      font-semibold
                      text-amber-700
                    "
                  >
                    Boost Active
                  </p>
                </div>

                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-600
                  "
                >
                  Active until
                </p>

                <p
                  className="
                    font-bold
                    text-slate-800
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
                  w-full
                  rounded-xl
                  bg-amber-500
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-amber-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Processing..."
                  : "🚀 Boost Ad"}
              </button>
            )}

            {/* =================================================
                FEATURED AD
            ================================================= */}

            {isFeatured ? (
              <div
                className="
                  rounded-xl
                  border
                  border-blue-200
                  bg-blue-50
                  p-4
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
                    size={18}
                    strokeWidth={2.5}
                    fill="#1565d8"
                    className="text-[#1565d8]"
                  />

                  <p
                    className="
                      font-semibold
                      text-[#1565d8]
                    "
                  >
                    Featured Ad Active
                  </p>
                </div>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-600
                    dark:text-slate-400
                  "
                >
                  Your product is getting
                  extra visibility.
                </p>

                {featuredUntil && (
                  <p
                    className="
                      mt-2
                      text-sm
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
                  w-full
                  rounded-xl
                  bg-[#1565d8]
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#0f52ba]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Processing..."
                  : "💎 Feature This Ad"}
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
              p-4
              text-center
            "
          >
            <p
              className="
                font-semibold
                text-green-700
              "
            >
              ✓ This product has been sold
            </p>

            <p
              className="
                mt-1
                text-sm
                text-slate-600
              "
            >
              Buyers can no longer contact
              you for this product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}