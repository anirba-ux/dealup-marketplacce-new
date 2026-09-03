import { NextResponse } from "next/server";

import crypto from "crypto";

import { auth } from "@/auth";

import {
  findPaymentByOrderId,
  findPaymentByPaymentId,
  markPaymentAsPaid,
  markPaymentActivation,
} from "@/lib/repositories/payment.repository";

import {
  activatePremiumSeller,
} from "@/lib/repositories/premium.repository";

import {
  activatePaidBoost,
  activatePaidFeatured,
} from "@/lib/repositories/product.repository";

// =====================================================
// POST — Verify Razorpay Payment
// =====================================================

export async function POST(
  request: Request,
) {
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

    const userId =
      String(session.user.id);

    // =================================================
    // Request Body
    // =================================================

    let body: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Required Fields
    // =================================================

    const razorpayOrderId =
      body.razorpayOrderId?.trim();

    const razorpayPaymentId =
      body.razorpayPaymentId?.trim();

    const razorpaySignature =
      body.razorpaySignature?.trim();

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay payment details are required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Find Payment Record
    // =================================================

    const payment =
      await findPaymentByOrderId(
        razorpayOrderId,
      );

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment order not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Ownership Check
    // =================================================

    if (
      payment.userId !== userId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not allowed to verify this payment.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Payment ID Duplicate Check
    // =================================================

    const existingPayment =
      await findPaymentByPaymentId(
        razorpayPaymentId,
      );

    if (
      existingPayment &&
      existingPayment.razorpayOrderId !==
        razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This Razorpay payment is already associated with another order.",
        },
        {
          status: 409,
        },
      );
    }

    // =================================================
    // Razorpay Secret
    // =================================================

    const razorpaySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!razorpaySecret) {
      console.error(
        "RAZORPAY_KEY_SECRET is missing.",
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment configuration error.",
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Generate Razorpay Signature
    // =================================================

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          razorpaySecret,
        )
        .update(
          `${razorpayOrderId}|${razorpayPaymentId}`,
        )
        .digest("hex");

    // =================================================
    // Timing Safe Comparison
    // =================================================

    const generatedBuffer =
      Buffer.from(
        generatedSignature,
        "utf8",
      );

    const receivedBuffer =
      Buffer.from(
        razorpaySignature,
        "utf8",
      );

    if (
      generatedBuffer.length !==
      receivedBuffer.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment signature.",
        },
        {
          status: 400,
        },
      );
    }

    const signatureValid =
      crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer,
      );

    if (!signatureValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment signature verification failed.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Mark Payment Paid
    // =================================================

    if (
      payment.status !== "paid"
    ) {
      const updateResult =
        await markPaymentAsPaid(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        );

      if (!updateResult.success) {
        const latestPayment =
          await findPaymentByOrderId(
            razorpayOrderId,
          );

        if (
          latestPayment?.status !==
          "paid"
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Unable to update payment status.",
            },
            {
              status: 500,
            },
          );
        }
      }
    }

    // =================================================
    // Re-read Payment
    // =================================================

    const paidPayment =
      await findPaymentByOrderId(
        razorpayOrderId,
      );

    if (!paidPayment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment record could not be loaded.",
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Already Activated
    // =================================================

    if (
      paidPayment.metadata
        ?.activationStatus ===
      "completed"
    ) {
      return NextResponse.json(
        {
          success: true,
          alreadyProcessed: true,
          message:
            "Payment and activation have already been completed.",
          payment: {
            orderId:
              paidPayment.razorpayOrderId,
            paymentId:
              paidPayment.razorpayPaymentId,
            type:
              paidPayment.type,
            amount:
              paidPayment.amount,
            currency:
              paidPayment.currency,
            status:
              paidPayment.status,
          },
        },
        {
          status: 200,
        },
      );
    }

    // =================================================
    // Activation
    // =================================================

    let activationResult:
      | {
          success: boolean;
          alreadyProcessed?: boolean;
          reason?: string;
          [key: string]: unknown;
        }
      | null = null;

    // =================================================
    // PREMIUM
    // =================================================

    if (
      paidPayment.type ===
        "PREMIUM_MONTHLY" ||
      paidPayment.type ===
        "PREMIUM_QUARTERLY" ||
      paidPayment.type ===
        "PREMIUM_YEARLY"
    ) {
      const plan =
        paidPayment.metadata
          ?.plan;

      if (
        plan !== "monthly" &&
        plan !== "quarterly" &&
        plan !== "yearly"
      ) {
        await markPaymentActivation(
          razorpayOrderId,
          "failed",
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid Premium plan.",
          },
          {
            status: 400,
          },
        );
      }

      const startedAt =
        new Date();

      const expiresAt =
        new Date(startedAt);

      if (
        plan === "monthly"
      ) {
        expiresAt.setMonth(
          expiresAt.getMonth() + 1,
        );
      }

      if (
        plan === "quarterly"
      ) {
        expiresAt.setMonth(
          expiresAt.getMonth() + 3,
        );
      }

      if (
        plan === "yearly"
      ) {
        expiresAt.setFullYear(
          expiresAt.getFullYear() + 1,
        );
      }

      const activated =
        await activatePremiumSeller(
          userId,
          {
            plan,
            startedAt,
            expiresAt,
            paymentId:
              paidPayment
                .razorpayPaymentId,
            orderId:
              paidPayment
                .razorpayOrderId,
          },
        );

      activationResult = {
        success: activated,
      };
    }

    // =================================================
    // PAID BOOST
    // =================================================

    if (
      paidPayment.type ===
      "BOOST_AD"
    ) {
      if (
        !paidPayment.productId
      ) {
        await markPaymentActivation(
          razorpayOrderId,
          "failed",
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Product ID is missing from Boost payment.",
          },
          {
            status: 400,
          },
        );
      }

      activationResult =
        await activatePaidBoost(
          paidPayment.productId,
          userId,
          paidPayment
            .razorpayPaymentId!,
        );
    }

    // =================================================
    // PAID FEATURED
    // =================================================

    if (
      paidPayment.type ===
      "FEATURED_AD"
    ) {
      if (
        !paidPayment.productId
      ) {
        await markPaymentActivation(
          razorpayOrderId,
          "failed",
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Product ID is missing from Featured payment.",
          },
          {
            status: 400,
          },
        );
      }

      activationResult =
        await activatePaidFeatured(
          paidPayment.productId,
          userId,
          paidPayment
            .razorpayPaymentId!,
        );
    }

    // =================================================
    // Activation Failed
    // =================================================

    if (
      !activationResult?.success
    ) {
      await markPaymentActivation(
        razorpayOrderId,
        "failed",
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment was successful, but the product/service could not be activated. Please contact support.",
          payment: {
            orderId:
              paidPayment.razorpayOrderId,
            paymentId:
              paidPayment.razorpayPaymentId,
            type:
              paidPayment.type,
            status:
              paidPayment.status,
          },
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Mark Activation Completed
    // =================================================

    await markPaymentActivation(
      razorpayOrderId,
      "completed",
    );

    // =================================================
    // SUCCESS
    // =================================================

    return NextResponse.json(
      {
        success: true,

        alreadyProcessed:
          activationResult
            .alreadyProcessed ??
          false,

        message:
          "Payment verified and activated successfully.",

        payment: {
          orderId:
            paidPayment
              .razorpayOrderId,

          paymentId:
            paidPayment
              .razorpayPaymentId,

          type:
            paidPayment.type,

          amount:
            paidPayment.amount,

          currency:
            paidPayment.currency,

          status:
            paidPayment.status,
        },

        activation:
          activationResult,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "RAZORPAY PAYMENT VERIFY ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify payment.",
      },
      {
        status: 500,
      },
    );
  }
}