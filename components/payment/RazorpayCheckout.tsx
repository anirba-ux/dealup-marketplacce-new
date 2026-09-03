"use client";

import Script from "next/script";

interface RazorpayCheckoutProps {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  name?: string;
  description?: string;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: () => void;
}

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

export default function RazorpayCheckout({
  orderId,
  amount,
  currency,
  keyId,
  name = "DealUp Marketplace",
  description = "DealUp Payment",
  onSuccess,
  onFailure,
}: RazorpayCheckoutProps) {
  const openCheckout = () => {
    if (!window.Razorpay) {
      alert(
        "Razorpay Checkout is still loading. Please try again.",
      );

      return;
    }

    const razorpay =
      new window.Razorpay({
        key: keyId,

        amount,

        currency,

        name,

        description,

        order_id: orderId,

        handler: (response) => {
          onSuccess(response);
        },

        modal: {
          ondismiss: () => {
            onFailure?.();
          },
        },

        theme: {
          color: "#1565d8",
        },
      });

    razorpay.open();
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Razorpay script loaded.
        }}
        onError={() => {
          console.error(
            "Failed to load Razorpay Checkout.",
          );
        }}
      />

      <button
        type="button"
        onClick={openCheckout}
        className="rounded-xl bg-[#1565d8] px-5 py-3 font-semibold text-white transition hover:bg-[#0f52ba]"
      >
        Pay Now
      </button>
    </>
  );
}