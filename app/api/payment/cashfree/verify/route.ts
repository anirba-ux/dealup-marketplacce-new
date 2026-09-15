import { NextResponse } from "next/server";

import { auth } from "@/auth";

import { cashfreeConfig } from "@/lib/cashfree";

import {
  findPaymentByCashfreeOrderId,
  findPaymentByCashfreePaymentId,
  markCashfreePaymentAsFailed,
  markCashfreePaymentAsPaid,
  markPaymentActivation,
} from "@/lib/repositories/payment.repository";

import {
  activatePremiumSeller,
} from "@/lib/repositories/premium.repository";

interface CashfreePayment {
  cf_payment_id?: string | number;

  payment_status?: string;

  payment_amount?: number;

  payment_currency?: string;

  payment_completion_time?: string | null;
}

export async function GET(
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
    // Read Order ID
    // =================================================

    const { searchParams } =
      new URL(request.url);

    const orderId =
      searchParams.get("order_id")?.trim();

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cashfree order ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Find Local Payment
    // =================================================

    const payment =
      await findPaymentByCashfreeOrderId(
        orderId,
      );

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message:
            "Payment order was not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Ownership Check
    // =================================================

    if (payment.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message:
            "You are not allowed to verify this payment.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Already Activated
    // =================================================

    if (
      payment.metadata
        ?.activationStatus ===
      "completed"
    ) {
      return NextResponse.json({
        success: true,
        status: "success",
        alreadyProcessed: true,
        message:
          "Payment and Premium activation have already been completed.",
        payment: {
          orderId:
            payment.cashfreeOrderId,
          paymentId:
            payment.cashfreePaymentId,
          type: payment.type,
          amount: payment.amount,
          currency: payment.currency,
        },
      });
    }

    // =================================================
    // Cashfree Get Payments For Order
    // =================================================

    const cashfreeResponse =
      await fetch(
        `${cashfreeConfig.baseUrl}/orders/${encodeURIComponent(
          orderId,
        )}/payments`,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            "x-api-version":
              cashfreeConfig.apiVersion,

            "x-client-id":
              cashfreeConfig.appId,

            "x-client-secret":
              cashfreeConfig.secretKey,

            "x-request-id":
              crypto.randomUUID(),
          },

          cache: "no-store",
        },
      );

    const cashfreeData =
      await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error(
        "CASHFREE PAYMENT STATUS ERROR:",
        cashfreeData,
      );

      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message:
            cashfreeData?.message ??
            "Unable to verify Cashfree payment.",
        },
        {
          status: 502,
        },
      );
    }

    // =================================================
    // Find Successful Payment
    // =================================================

    const payments =
      Array.isArray(cashfreeData)
        ? cashfreeData
        : [];

    const successfulPayment =
      payments.find(
        (
          item: CashfreePayment,
        ) =>
          String(
            item.payment_status ??
              "",
          ).toUpperCase() ===
          "SUCCESS",
      );

    // =================================================
    // Pending Payment
    // =================================================

    if (!successfulPayment) {
      const hasPendingPayment =
        payments.some(
          (
            item: CashfreePayment,
          ) => {
            const status =
              String(
                item.payment_status ??
                  "",
              ).toUpperCase();

            return (
              status === "PENDING" ||
              status === "AUTHORIZED" ||
              status === "ACTIVE"
            );
          },
        );

      if (hasPendingPayment) {
        return NextResponse.json({
          success: false,
          status: "pending",
          message:
            "Your payment is still being processed.",
        });
      }

      await markCashfreePaymentAsFailed(
        orderId,
      );

      return NextResponse.json({
        success: false,
        status: "failed",
        message:
          "Cashfree payment was not successful.",
      });
    }

    // =================================================
    // Payment ID
    // =================================================

    const cashfreePaymentId =
      successfulPayment.cf_payment_id
        ? String(
            successfulPayment.cf_payment_id,
          )
        : null;

    if (!cashfreePaymentId) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message:
            "Cashfree payment ID was not returned.",
        },
        {
          status: 502,
        },
      );
    }

    // =================================================
    // Duplicate Payment Check
    // =================================================

    const existingPayment =
      await findPaymentByCashfreePaymentId(
        cashfreePaymentId,
      );

    if (
      existingPayment &&
      existingPayment.cashfreeOrderId !==
        orderId
    ) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message:
            "This Cashfree payment is already associated with another order.",
        },
        {
          status: 409,
        },
      );
    }

    // =================================================
    // Amount Verification
    // =================================================

    const paymentAmount =
      Number(
        successfulPayment.payment_amount ??
          0,
      );

    const expectedAmount =
      payment.amount / 100;

    if (
      paymentAmount !== expectedAmount
    ) {
      await markCashfreePaymentAsFailed(
        orderId,
      );

      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message:
            "Payment amount does not match the order amount.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Currency Verification
    // =================================================

    if (
      successfulPayment.payment_currency &&
      successfulPayment.payment_currency !==
        payment.currency
    ) {
      await markCashfreePaymentAsFailed(
        orderId,
      );

      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message:
            "Payment currency does not match the order currency.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Mark Payment As Paid
    // =================================================

    await markCashfreePaymentAsPaid(
      orderId,
      cashfreePaymentId,
    );

    // =================================================
    // Re-read Payment
    // =================================================

    const paidPayment =
      await findPaymentByCashfreeOrderId(
        orderId,
      );

    if (!paidPayment) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message:
            "Paid payment record could not be loaded.",
        },
        {
          status: 500,
        },
      );
    }

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
          orderId,
          "failed",
        );

        return NextResponse.json(
          {
            success: false,
            status: "failed",
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

      if (plan === "monthly") {
        expiresAt.setMonth(
          expiresAt.getMonth() + 1,
        );
      }

      if (plan === "quarterly") {
        expiresAt.setMonth(
          expiresAt.getMonth() + 3,
        );
      }

      if (plan === "yearly") {
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
              paidPayment.cashfreePaymentId,

            orderId:
              paidPayment.cashfreeOrderId,
          },
        );

      if (!activated) {
        await markPaymentActivation(
          orderId,
          "failed",
        );

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message:
              "Payment was successful, but Premium activation failed.",
          },
          {
            status: 500,
          },
        );
      }

      await markPaymentActivation(
        orderId,
        "completed",
      );

      return NextResponse.json({
        success: true,
        status: "success",
        message:
          "Payment successful! Premium Seller has been activated.",
        payment: {
          orderId:
            paidPayment.cashfreeOrderId,
          paymentId:
            paidPayment.cashfreePaymentId,
          type: paidPayment.type,
          amount: paidPayment.amount,
          currency: paidPayment.currency,
        },
      });
    }

    // =================================================
    // Unsupported Payment Type
    // =================================================

    await markPaymentActivation(
      orderId,
      "failed",
    );

    return NextResponse.json(
      {
        success: false,
        status: "failed",
        message:
          "This Cashfree payment type is not supported by this verification route yet.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "CASHFREE VERIFY ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify Cashfree payment.",
      },
      {
        status: 500,
      },
    );
  }
}