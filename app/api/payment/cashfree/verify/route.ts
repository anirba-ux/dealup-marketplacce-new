import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";
import { cashfreeConfig } from "@/lib/cashfree";

import {
  findPaymentByCashfreeOrderId,
  findPaymentByCashfreePaymentId,
  markCashfreePaymentAsFailed,
  markCashfreePaymentAsPaid,
  markPaymentActivation,
} from "@/lib/repositories/payment.repository";

import { activatePremiumSeller } from "@/lib/repositories/premium.repository";

import {
  activatePaidBoost,
  activatePaidFeatured,
} from "@/lib/repositories/product.repository";

import {
  activatePaidBoostJob,
  activatePaidFeaturedJob,
} from "@/lib/repositories/job.repository";

import {
  activatePaidBoostService,
  activatePaidFeaturedService,
} from "@/lib/repositories/service.repository";

const DATABASE_NAME = "dealup";

interface CashfreePayment {
  cf_payment_id?: string | number;
  payment_status?: string;
  payment_amount?: number;
  payment_currency?: string;
}

async function updateCashfreeActivation(
  orderId: string,
  status: "completed" | "failed",
) {
  return markPaymentActivation(orderId, status, "cashfree");
}

function jsonPayment(payment: {
  cashfreeOrderId?: string | null;
  cashfreePaymentId?: string | null;
  type: string;
  amount: number;
  currency: string;
}) {
  return {
    orderId: payment.cashfreeOrderId,
    paymentId: payment.cashfreePaymentId,
    type: payment.type,
    amount: payment.amount,
    currency: payment.currency,
  };
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const userId = String(session.user.id);
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id")?.trim();

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cashfree order ID is required.",
        },
        { status: 400 },
      );
    }

    const payment = await findPaymentByCashfreeOrderId(orderId);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "Payment order was not found.",
        },
        { status: 404 },
      );
    }

    if (String(payment.userId) !== userId) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "You are not allowed to verify this payment.",
        },
        { status: 403 },
      );
    }

    if (payment.metadata?.activationStatus === "completed") {
      return NextResponse.json({
        success: true,
        status: "success",
        alreadyProcessed: true,
        message: "Payment and activation have already been completed.",
        payment: jsonPayment(payment),
      });
    }

    // Verify payment directly with Cashfree.
    const cashfreeResponse = await fetch(
      `${cashfreeConfig.baseUrl}/orders/${encodeURIComponent(orderId)}/payments`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": cashfreeConfig.apiVersion,
          "x-client-id": cashfreeConfig.appId,
          "x-client-secret": cashfreeConfig.secretKey,
          "x-request-id": crypto.randomUUID(),
        },
        cache: "no-store",
      },
    );

    const cashfreeData: unknown = await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error("CASHFREE PAYMENT STATUS ERROR:", cashfreeData);

      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "Unable to verify Cashfree payment.",
        },
        { status: 502 },
      );
    }

    const payments: CashfreePayment[] = Array.isArray(cashfreeData)
      ? cashfreeData
      : [];

    const successfulPayment = payments.find(
      (item) =>
        String(item.payment_status ?? "").toUpperCase() === "SUCCESS",
    );

    if (!successfulPayment) {
      const pending = payments.some((item) =>
        ["PENDING", "AUTHORIZED", "ACTIVE"].includes(
          String(item.payment_status ?? "").toUpperCase(),
        ),
      );

      if (pending) {
        return NextResponse.json({
          success: false,
          status: "pending",
          message: "Your payment is still being processed.",
        });
      }

      await markCashfreePaymentAsFailed(orderId);

      return NextResponse.json({
        success: false,
        status: "failed",
        message: "Cashfree payment was not successful.",
      });
    }

    const cashfreePaymentId = successfulPayment.cf_payment_id
      ? String(successfulPayment.cf_payment_id)
      : null;

    if (!cashfreePaymentId) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "Cashfree payment ID was not returned.",
        },
        { status: 502 },
      );
    }

    const existingPayment =
      await findPaymentByCashfreePaymentId(cashfreePaymentId);

    if (
      existingPayment &&
      existingPayment.cashfreeOrderId !== orderId
    ) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "This payment is already associated with another order.",
        },
        { status: 409 },
      );
    }

    const actualAmount = Number(successfulPayment.payment_amount ?? 0);
    const expectedAmount = Number(payment.amount) / 100;

    if (actualAmount !== expectedAmount) {
      await markCashfreePaymentAsFailed(orderId);

      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "Payment amount does not match the order amount.",
        },
        { status: 400 },
      );
    }

    if (
      successfulPayment.payment_currency &&
      successfulPayment.payment_currency !== payment.currency
    ) {
      await markCashfreePaymentAsFailed(orderId);

      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "Payment currency does not match the order currency.",
        },
        { status: 400 },
      );
    }

    await markCashfreePaymentAsPaid(orderId, cashfreePaymentId);

    const paidPayment = await findPaymentByCashfreeOrderId(orderId);

    if (!paidPayment) {
      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "Paid payment record could not be loaded.",
        },
        { status: 500 },
      );
    }

    // =====================================================
    // PREMIUM SELLER
    // =====================================================

    if (
      paidPayment.type === "PREMIUM_MONTHLY" ||
      paidPayment.type === "PREMIUM_QUARTERLY" ||
      paidPayment.type === "PREMIUM_YEARLY"
    ) {
      const plan = paidPayment.metadata?.plan;

      if (
        plan !== "monthly" &&
        plan !== "quarterly" &&
        plan !== "yearly"
      ) {
        await updateCashfreeActivation(orderId, "failed");

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message: "Invalid Premium plan.",
          },
          { status: 400 },
        );
      }

      const startedAt = new Date();
      const expiresAt = new Date(startedAt);

      if (plan === "monthly") {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (plan === "quarterly") {
        expiresAt.setMonth(expiresAt.getMonth() + 3);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      const activated = await activatePremiumSeller(userId, {
        plan,
        startedAt,
        expiresAt,
        paymentId: paidPayment.cashfreePaymentId,
        orderId: paidPayment.cashfreeOrderId,
      });

      if (!activated) {
        await updateCashfreeActivation(orderId, "failed");

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message:
              "Payment was successful, but Premium activation failed.",
          },
          { status: 500 },
        );
      }

      await updateCashfreeActivation(orderId, "completed");

      return NextResponse.json({
        success: true,
        status: "success",
        message: "Premium Seller has been activated.",
        payment: jsonPayment(paidPayment),
      });
    }

    // =====================================================
    // BOOST / FEATURED PROMOTIONS
    // =====================================================

    if (
      paidPayment.type !== "BOOST_AD" &&
      paidPayment.type !== "FEATURED_AD"
    ) {
      await updateCashfreeActivation(orderId, "failed");

      return NextResponse.json(
        {
          success: false,
          status: "failed",
          message: "Unsupported payment type.",
        },
        { status: 400 },
      );
    }

    const promotionPaymentId = String(
      paidPayment.cashfreePaymentId || cashfreePaymentId,
    );

    // =====================================================
    // SERVICE / BUSINESS PROMOTION
    // =====================================================

    if (paidPayment.serviceId) {
      const serviceId = String(paidPayment.serviceId);

      if (!ObjectId.isValid(serviceId)) {
        await updateCashfreeActivation(orderId, "failed");

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message: "Invalid Service ID.",
          },
          { status: 400 },
        );
      }

      const client = await clientPromise;
      const db = client.db(DATABASE_NAME);

      const service = await db.collection("services").findOne({
        _id: new ObjectId(serviceId),
      });

      if (
        !service ||
        String(service.sellerId ?? "") !== userId ||
        service.status !== "active"
      ) {
        await updateCashfreeActivation(orderId, "failed");

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message:
              "Service not found, inactive, or not owned by this user.",
          },
          { status: 400 },
        );
      }

      // Featured Service requires an active Premium Seller subscription.
      if (paidPayment.type === "FEATURED_AD") {
        if (!ObjectId.isValid(userId)) {
          await updateCashfreeActivation(orderId, "failed");

          return NextResponse.json(
            {
              success: false,
              status: "failed",
              message: "Unable to verify Premium Seller eligibility.",
            },
            { status: 403 },
          );
        }

        const user = await db.collection("users").findOne(
          { _id: new ObjectId(userId) },
          { projection: { premiumSeller: 1 } },
        );

        const premiumSeller = user?.premiumSeller as
          | {
              active?: boolean;
              expiresAt?: Date | string;
              featuredAds?: boolean;
            }
          | undefined;

        const premiumExpiresAt = premiumSeller?.expiresAt
          ? new Date(premiumSeller.expiresAt)
          : null;

        if (
          premiumSeller?.active !== true ||
          !premiumExpiresAt ||
          Number.isNaN(premiumExpiresAt.getTime()) ||
          premiumExpiresAt.getTime() <= Date.now() ||
          premiumSeller.featuredAds !== true
        ) {
          await updateCashfreeActivation(orderId, "failed");

          return NextResponse.json(
            {
              success: false,
              status: "failed",
              message:
                "An active Premium Seller subscription with Featured Ads access is required.",
            },
            { status: 403 },
          );
        }
      }

      // BOOST and FEATURED are separate branches.
      // This avoids the TypeScript union-property error.

      if (paidPayment.type === "BOOST_AD") {
        const activated = await activatePaidBoostService(
          serviceId,
          userId,
          promotionPaymentId,
        );

        if (!activated.success) {
          await updateCashfreeActivation(orderId, "failed");

          return NextResponse.json(
            {
              success: false,
              status: "failed",
              message: "Service Boost activation failed.",
              reason: activated.reason,
            },
            { status: 500 },
          );
        }

        await updateCashfreeActivation(orderId, "completed");

        return NextResponse.json({
          success: true,
          status: "success",
          message: "Service Boost has been activated.",
          promotion: {
            type: "BOOST_AD",
            serviceId,
            boostedAt: activated.boostedAt,
            boostedUntil: activated.boostedUntil,
          },
          payment: jsonPayment(paidPayment),
        });
      }

      const activated = await activatePaidFeaturedService(
        serviceId,
        userId,
        promotionPaymentId,
      );

      if (!activated.success) {
        await updateCashfreeActivation(orderId, "failed");

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message: "Service Featured activation failed.",
            reason: activated.reason,
          },
          { status: 500 },
        );
      }

      await updateCashfreeActivation(orderId, "completed");

      return NextResponse.json({
        success: true,
        status: "success",
        message: "Service Featured promotion has been activated.",
        promotion: {
          type: "FEATURED_AD",
          serviceId,
          featuredAt: activated.featuredAt,
          featuredUntil: activated.featuredUntil,
        },
        payment: jsonPayment(paidPayment),
      });
    }

    // =====================================================
    // JOB PROMOTION
    // =====================================================

    if (paidPayment.jobId) {
      const jobId = String(paidPayment.jobId);

      if (!ObjectId.isValid(jobId)) {
        await updateCashfreeActivation(orderId, "failed");

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message: "Invalid Job ID.",
          },
          { status: 400 },
        );
      }

      const client = await clientPromise;
      const db = client.db(DATABASE_NAME);

      const job = await db.collection("jobs").findOne({
        _id: new ObjectId(jobId),
      });

      const employerId = String(job?.employerId ?? "");

      if (
        !job ||
        employerId !== userId ||
        job.status !== "active"
      ) {
        await updateCashfreeActivation(orderId, "failed");

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message:
              "Job not found, inactive, or not owned by this user.",
          },
          { status: 400 },
        );
      }

      if (paidPayment.type === "BOOST_AD") {
        const activated = await activatePaidBoostJob(
          jobId,
          employerId,
          promotionPaymentId,
        );

        if (!activated.success) {
          await updateCashfreeActivation(orderId, "failed");

          return NextResponse.json(
            {
              success: false,
              status: "failed",
              message: "Job Boost activation failed.",
              reason: activated.reason,
            },
            { status: 500 },
          );
        }

        await updateCashfreeActivation(orderId, "completed");

        return NextResponse.json({
          success: true,
          status: "success",
          message: "Job Boost has been activated.",
          promotion: {
            type: "BOOST_AD",
            jobId,
            boostedAt: activated.boostedAt,
            boostedUntil: activated.boostedUntil,
          },
          payment: jsonPayment(paidPayment),
        });
      }

      const activated = await activatePaidFeaturedJob(
        jobId,
        employerId,
        promotionPaymentId,
      );

      if (!activated.success) {
        await updateCashfreeActivation(orderId, "failed");

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message: "Job Featured activation failed.",
            reason: activated.reason,
          },
          { status: 500 },
        );
      }

      await updateCashfreeActivation(orderId, "completed");

      return NextResponse.json({
        success: true,
        status: "success",
        message: "Job Featured promotion has been activated.",
        promotion: {
          type: "FEATURED_AD",
          jobId,
          featuredAt: activated.featuredAt,
          featuredUntil: activated.featuredUntil,
        },
        payment: jsonPayment(paidPayment),
      });
    }

    // =====================================================
    // PRODUCT PROMOTION
    // =====================================================

    if (paidPayment.productId) {
      const productId = String(paidPayment.productId);

      if (paidPayment.type === "BOOST_AD") {
        const activated = await activatePaidBoost(
          productId,
          userId,
          promotionPaymentId,
        );

        if (!activated.success) {
          await updateCashfreeActivation(orderId, "failed");

          return NextResponse.json(
            {
              success: false,
              status: "failed",
              message: "Product Boost activation failed.",
              reason: activated.reason,
            },
            { status: 500 },
          );
        }

        await updateCashfreeActivation(orderId, "completed");

        return NextResponse.json({
          success: true,
          status: "success",
          message: "Product Boost has been activated.",
          promotion: {
            type: "BOOST_AD",
            productId,
            boostedAt: activated.boostedAt,
            boostedUntil: activated.boostedUntil,
          },
          payment: jsonPayment(paidPayment),
        });
      }

      const activated = await activatePaidFeatured(
        productId,
        userId,
        promotionPaymentId,
      );

      if (!activated.success) {
        await updateCashfreeActivation(orderId, "failed");

        return NextResponse.json(
          {
            success: false,
            status: "failed",
            message: "Product Featured activation failed.",
            reason: activated.reason,
          },
          { status: 500 },
        );
      }

      await updateCashfreeActivation(orderId, "completed");

      return NextResponse.json({
        success: true,
        status: "success",
        message: "Product Featured promotion has been activated.",
        promotion: {
          type: "FEATURED_AD",
          productId,
          featuredAt: activated.featuredAt,
          featuredUntil: activated.featuredUntil,
        },
        payment: jsonPayment(paidPayment),
      });
    }

    await updateCashfreeActivation(orderId, "failed");

    return NextResponse.json(
      {
        success: false,
        status: "failed",
        message: "Promotion target is missing from the payment record.",
      },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error("CASHFREE VERIFY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to verify Cashfree payment.",
      },
      { status: 500 },
    );
  }
}