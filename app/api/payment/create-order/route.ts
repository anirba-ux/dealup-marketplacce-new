import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  razorpay,
} from "@/lib/razorpay";

import {
  createPaymentRecord,
  type PaymentType,
} from "@/lib/repositories/payment.repository";

// =====================================================
// Payment Pricing
// =====================================================
//
// Amounts are stored in INR.
//
// Razorpay amount:
// ₹1 = 100 paise
//
// Therefore:
// ₹99  = 9900
// ₹249 = 24900
// ₹799 = 79900
// ₹29  = 2900
// ₹19  = 1900
//
// =====================================================

const PREMIUM_PRICES = {
  monthly: 9900,

  quarterly: 24900,

  yearly: 79900,
} as const;

// =====================================================
// Create Razorpay Order
// =====================================================

export async function POST(
  request: Request,
) {
  try {
    // =================================================
    // Authentication
    // =================================================

    const session =
      await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const userId =
      String(
        session.user.id,
      );

    // =================================================
    // Request Body
    // =================================================

    let body: {
      type?: PaymentType;

      plan?:
        | "monthly"
        | "quarterly"
        | "yearly";

      productId?: string;
    } = {};

    try {
      body =
        await request.json();
    } catch {
      body = {};
    }

    // =================================================
    // Payment Type
    // =================================================

    const type =
      body.type;

    if (
      type !==
        "PREMIUM_MONTHLY" &&
      type !==
        "PREMIUM_QUARTERLY" &&
      type !==
        "PREMIUM_YEARLY" &&
      type !==
        "FEATURED_AD" &&
      type !==
        "BOOST_AD"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid payment type.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Calculate Amount
    // =================================================

    let amount = 0;

    let productId:
      | string
      | null = null;

    // =================================================
    // Premium Monthly
    // =================================================

    if (
      type ===
      "PREMIUM_MONTHLY"
    ) {
      amount =
        PREMIUM_PRICES.monthly;
    }

    // =================================================
    // Premium Quarterly
    // =================================================

    if (
      type ===
      "PREMIUM_QUARTERLY"
    ) {
      amount =
        PREMIUM_PRICES.quarterly;
    }

    // =================================================
    // Premium Yearly
    // =================================================

    if (
      type ===
      "PREMIUM_YEARLY"
    ) {
      amount =
        PREMIUM_PRICES.yearly;
    }

    // =================================================
    // Featured Ad
    // =================================================

    if (
      type ===
      "FEATURED_AD"
    ) {
      amount = 2900;

      if (!body.productId) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Product ID is required for Featured Ad payment.",
          },
          {
            status: 400,
          },
        );
      }

      productId =
        String(
          body.productId,
        );
    }

    // =================================================
    // Boost Ad
    // =================================================

    if (
      type ===
      "BOOST_AD"
    ) {
      // -------------------------------------------------
      // IMPORTANT
      //
      // We do NOT trust price sent by frontend.
      //
      // For now the payment order starts with ₹19.
      // Before creating the order we will add the
      // server-side Premium/Normal seller validation.
      //
      // -------------------------------------------------

      amount = 1900;

      if (!body.productId) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Product ID is required for Boost Ad payment.",
          },
          {
            status: 400,
          },
        );
      }

      productId =
        String(
          body.productId,
        );
    }

    // =================================================
    // Premium Plan
    // =================================================

    let plan:
      | "monthly"
      | "quarterly"
      | "yearly"
      | null = null;

    if (
      type ===
      "PREMIUM_MONTHLY"
    ) {
      plan = "monthly";
    }

    if (
      type ===
      "PREMIUM_QUARTERLY"
    ) {
      plan = "quarterly";
    }

    if (
      type ===
      "PREMIUM_YEARLY"
    ) {
      plan = "yearly";
    }

    // =================================================
    // Razorpay Order
    // =================================================

    const order =
      await razorpay.orders.create(
        {
          amount,

          currency:
            "INR",

          receipt:
            `DEALUP-${Date.now()}`,

          notes: {
            userId,

            paymentType:
              type,

            productId:
              productId ??
              "",

            plan:
              plan ??
              "",
          },
        },
      );

    // =================================================
    // Save Payment
    // =================================================

    const now =
      new Date();

    await createPaymentRecord(
      {
        userId,

        type,

        productId,

        razorpayOrderId:
          order.id,

        razorpayPaymentId:
          null,

        razorpaySignature:
          null,

        amount,

        currency:
          "INR",

        status:
          "created",

        metadata: {
          plan,
        },

        createdAt:
          now,

        paidAt:
          null,

        updatedAt:
          now,
      },
    );

    // =================================================
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        order: {
          id:
            order.id,

          amount:
            order.amount,

          currency:
            order.currency,
        },

        razorpayKeyId:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID,

        paymentType:
          type,

        productId,

        plan,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "CREATE RAZORPAY ORDER ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to create payment order.",
      },
      {
        status: 500,
      },
    );
  }
}