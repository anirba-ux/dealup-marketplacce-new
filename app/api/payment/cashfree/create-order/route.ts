import { NextResponse } from "next/server";

import { auth } from "@/auth";

import { cashfreeConfig } from "@/lib/cashfree";

import {
  createPaymentRecord,
  type PaymentType,
} from "@/lib/repositories/payment.repository";

// =====================================================
// Cashfree Payment Pricing
// =====================================================

const PREMIUM_PRICES = {
  monthly: 9900,
  quarterly: 24900,
  yearly: 79900,
} as const;

// =====================================================
// Helpers
// =====================================================

function getPlanFromPaymentType(type: PaymentType) {
  if (type === "PREMIUM_MONTHLY") {
    return "monthly" as const;
  }

  if (type === "PREMIUM_QUARTERLY") {
    return "quarterly" as const;
  }

  if (type === "PREMIUM_YEARLY") {
    return "yearly" as const;
  }

  return null;
}

// =====================================================
// Create Cashfree Order
// =====================================================

export async function POST(request: Request) {
  try {
    // =================================================
    // Authentication
    // =================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const userId = String(session.user.id);

    // =================================================
    // Request Body
    // =================================================

    let body: {
      type?: PaymentType;
      plan?: "monthly" | "quarterly" | "yearly";
      productId?: string;
    } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const type = body.type;

    // =================================================
    // Validate Payment Type
    // =================================================

    if (
      type !== "PREMIUM_MONTHLY" &&
      type !== "PREMIUM_QUARTERLY" &&
      type !== "PREMIUM_YEARLY" &&
      type !== "FEATURED_AD" &&
      type !== "BOOST_AD"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment type.",
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

    let productId: string | null = null;

    // -------------------------------------------------
    // Premium Monthly
    // -------------------------------------------------

    if (type === "PREMIUM_MONTHLY") {
      amount = PREMIUM_PRICES.monthly;
    }

    // -------------------------------------------------
    // Premium Quarterly
    // -------------------------------------------------

    if (type === "PREMIUM_QUARTERLY") {
      amount = PREMIUM_PRICES.quarterly;
    }

    // -------------------------------------------------
    // Premium Yearly
    // -------------------------------------------------

    if (type === "PREMIUM_YEARLY") {
      amount = PREMIUM_PRICES.yearly;
    }

    // -------------------------------------------------
    // Featured Ad
    // -------------------------------------------------

    if (type === "FEATURED_AD") {
      amount = 2900;

      if (!body.productId) {
        return NextResponse.json(
          {
            success: false,
            message: "Product ID is required for Featured Ad payment.",
          },
          {
            status: 400,
          },
        );
      }

      productId = String(body.productId);
    }

    // -------------------------------------------------
    // Boost Ad
    // -------------------------------------------------

    if (type === "BOOST_AD") {
      amount = 1900;

      if (!body.productId) {
        return NextResponse.json(
          {
            success: false,
            message: "Product ID is required for Boost Ad payment.",
          },
          {
            status: 400,
          },
        );
      }

      productId = String(body.productId);
    }

    // =================================================
    // Premium Plan
    // =================================================

    const plan = getPlanFromPaymentType(type);

    // =================================================
    // Amount Validation
    // =================================================

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment amount.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Cashfree Order ID
    // =================================================

    const orderId = `dealup_${type.toLowerCase()}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    // =================================================
    // Customer Details
    // =================================================

    const customerEmail = session.user.email || `user-${userId}@dealup.local`;

    const customerPhone = session.user.phone || "9999999999";

    // =================================================
    // Return URL
    // =================================================

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const returnUrl = `${appUrl}/dashboard/premium/payment-success?order_id=${encodeURIComponent(orderId)}`;

    // =================================================
    // Cashfree Create Order
    // =================================================

    const cashfreeResponse = await fetch(`${cashfreeConfig.baseUrl}/orders`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        "x-api-version": cashfreeConfig.apiVersion,

        "x-client-id": cashfreeConfig.appId,

        "x-client-secret": cashfreeConfig.secretKey,

        "x-request-id": crypto.randomUUID(),

        "x-idempotency-key": crypto.randomUUID(),
      },

      body: JSON.stringify({
        order_id: orderId,

        order_amount: amount / 100,

        order_currency: "INR",

        customer_details: {
          customer_id: userId,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },

        order_meta: {
          return_url: returnUrl,
        },

        order_note: `DealUp ${type}`,

        order_tags: {
          userId,
          paymentType: type,
          productId: productId ?? "",
          plan: plan ?? "",
        },
      }),
    });

    // =================================================
    // Read Cashfree Response
    // =================================================

    const cashfreeData = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error("CASHFREE CREATE ORDER ERROR:", cashfreeData);

      return NextResponse.json(
        {
          success: false,
          message:
            cashfreeData?.message || "Unable to create Cashfree payment order.",
        },
        {
          status:
            cashfreeResponse.status >= 400 && cashfreeResponse.status < 500
              ? cashfreeResponse.status
              : 500,
        },
      );
    }

    // =================================================
    // Validate Cashfree Response
    // =================================================

    if (!cashfreeData?.cf_order_id || !cashfreeData?.payment_session_id) {
      console.error("CASHFREE INVALID ORDER RESPONSE:", cashfreeData);

      return NextResponse.json(
        {
          success: false,
          message: "Cashfree did not return a valid payment session.",
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Save Payment Record
    // =================================================

    const now = new Date();

    await createPaymentRecord({
      userId,
      type,
      productId,

      razorpayOrderId: "",
      razorpayPaymentId: null,
      razorpaySignature: null,

      cashfreeOrderId: orderId,

      cashfreePaymentSessionId: cashfreeData.payment_session_id,

      cashfreePaymentId: null,

      amount,
      currency: "INR",
      status: "created",

      metadata: {
        plan,
        cashfreeCfOrderId: cashfreeData.cf_order_id,
      },

      createdAt: now,
      paidAt: null,
      updatedAt: now,
    });

    // =================================================
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        order: {
          id: orderId,

          cfOrderId: cashfreeData.cf_order_id,

          amount,

          currency: "INR",
        },

        paymentSessionId: cashfreeData.payment_session_id,

        paymentType: type,

        productId,

        plan,

        environment: cashfreeConfig.environment,
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error("CASHFREE CREATE ORDER ERROR:", error);

    const message =
      error instanceof Error ? error.message : "Unknown Cashfree error.";

    return NextResponse.json(
      {
        success: false,

        message:
          process.env.NODE_ENV === "development"
            ? message
            : "Unable to create Cashfree payment order.",
      },
      {
        status: 500,
      },
    );
  }
}
