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

import {
  activatePremiumSeller,
} from "@/lib/repositories/premium.repository";

import {
  activatePaidBoost,
  activatePaidFeatured,
} from "@/lib/repositories/product.repository";

import {
  activatePaidBoostJob,
  activatePaidFeaturedJob,
} from "@/lib/repositories/job.repository";

// =====================================================
// DATABASE
// =====================================================

const DATABASE_NAME = "dealup";

// =====================================================
// Cashfree Payment Response
// =====================================================

interface CashfreePayment {
  cf_payment_id?: string | number;
  payment_status?: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_completion_time?: string | null;
}

// =====================================================
// Helper
// =====================================================

function isSuccessfulPayment(
  payment: CashfreePayment,
) {
  return (
    String(
      payment.payment_status ?? "",
    ).toUpperCase() === "SUCCESS"
  );
}

// =====================================================
// GET — Verify Cashfree Payment
// =====================================================

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

    const userId = String(
      session.user.id,
    );

    // =================================================
    // Read Order ID
    // =================================================

    const { searchParams } =
      new URL(request.url);

    const orderId =
      searchParams
        .get("order_id")
        ?.trim();

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
    // Payment Ownership
    // =================================================

    if (
      String(payment.userId) !==
      userId
    ) {
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
          "Payment and activation have already been completed.",

        payment: {
          orderId:
            payment.cashfreeOrderId,

          paymentId:
            payment.cashfreePaymentId,

          type: payment.type,

          amount: payment.amount,

          currency:
            payment.currency,
        },

        promotion:
          payment.jobId
            ? {
                type: payment.type,
                jobId:
                  payment.jobId,
              }
            : payment.productId
              ? {
                  type: payment.type,
                  productId:
                    payment.productId,
                }
              : null,
      });
    }

    // =================================================
    // Ask Cashfree for Payment Status
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

    // =================================================
    // Cashfree API Error
    // =================================================

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
    // Payment Array
    // =================================================

    const payments =
      Array.isArray(cashfreeData)
        ? (cashfreeData as CashfreePayment[])
        : [];

    // =================================================
    // Find Successful Payment
    // =================================================

    const successfulPayment =
      payments.find(
        isSuccessfulPayment,
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
              status ===
                "AUTHORIZED" ||
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
    // Cashfree Payment ID
    // =================================================

    const cashfreePaymentId =
      successfulPayment
        .cf_payment_id
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
      Number(payment.amount) / 100;

    if (
      paymentAmount !==
      expectedAmount
    ) {
      console.error(
        "CASHFREE AMOUNT MISMATCH:",
        {
          orderId,
          paymentAmount,
          expectedAmount,
        },
      );

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
    // Re-read Paid Payment
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
    // PREMIUM SELLER
    // =================================================

    if (
      paidPayment.type ===
        "PREMIUM_MONTHLY" ||
      paidPayment.type ===
        "PREMIUM_QUARTERLY" ||
      paidPayment.type ===
        "PREMIUM_YEARLY"
    ) {
      // -----------------------------------------------
      // Get Plan
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Premium Start
      // -----------------------------------------------

      const startedAt =
        new Date();

      const expiresAt =
        new Date(startedAt);

      // -----------------------------------------------
      // Monthly
      // -----------------------------------------------

      if (
        plan === "monthly"
      ) {
        expiresAt.setMonth(
          expiresAt.getMonth() +
            1,
        );
      }

      // -----------------------------------------------
      // Quarterly
      // -----------------------------------------------

      if (
        plan === "quarterly"
      ) {
        expiresAt.setMonth(
          expiresAt.getMonth() +
            3,
        );
      }

      // -----------------------------------------------
      // Yearly
      // -----------------------------------------------

      if (
        plan === "yearly"
      ) {
        expiresAt.setFullYear(
          expiresAt.getFullYear() +
            1,
        );
      }

      // -----------------------------------------------
      // Activate Premium
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Mark Activation Complete
      // -----------------------------------------------

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

          type:
            paidPayment.type,

          amount:
            paidPayment.amount,

          currency:
            paidPayment.currency,
        },
      });
    }

    // =================================================
    // JOB / PRODUCT PROMOTIONS
    // =================================================

    if (
      paidPayment.type ===
        "BOOST_AD" ||
      paidPayment.type ===
        "FEATURED_AD"
    ) {
      // =================================================
      // JOB PROMOTION
      // =================================================

      if (paidPayment.jobId) {
        const jobId =
          String(
            paidPayment.jobId,
          );

        // -----------------------------------------------
        // Validate Job ID
        // -----------------------------------------------

        if (
          !ObjectId.isValid(
            jobId,
          )
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
                "Invalid Job ID in payment record.",
            },
            {
              status: 400,
            },
          );
        }

        // -----------------------------------------------
        // Load Job
        // -----------------------------------------------

        const client =
          await clientPromise;

        const db =
          client.db(
            DATABASE_NAME,
          );

        const jobs =
          db.collection("jobs");

        const job =
          await jobs.findOne({
            _id: new ObjectId(
              jobId,
            ),
          });

        // -----------------------------------------------
        // Job Not Found
        // -----------------------------------------------

        if (!job) {
          await markPaymentActivation(
            orderId,
            "failed",
          );

          return NextResponse.json(
            {
              success: false,
              status: "failed",
              message:
                "The Job associated with this payment was not found.",
            },
            {
              status: 404,
            },
          );
        }

        // -----------------------------------------------
        // IMPORTANT OWNERSHIP CHECK
        // -----------------------------------------------

        const jobEmployerId =
          String(
            job.employerId ??
              "",
          );

        if (
          !jobEmployerId ||
          jobEmployerId !==
            userId
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
                "You are not allowed to activate promotion for this Job.",
            },
            {
              status: 403,
            },
          );
        }

        // -----------------------------------------------
        // Job must be active
        // -----------------------------------------------

        if (
          job.status !== "active"
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
                "Only active Jobs can be promoted.",
            },
            {
              status: 400,
            },
          );
        }

        // =================================================
        // JOB BOOST
        // =================================================

        if (
          paidPayment.type ===
          "BOOST_AD"
        ) {
          const activated =
            await activatePaidBoostJob(
              jobId,

              jobEmployerId,

              paidPayment.cashfreePaymentId ||
                cashfreePaymentId,
            );

          if (
            !activated.success
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
                  "Payment was successful, but Job Boost activation failed.",

                reason:
                  activated.reason,
              },
              {
                status: 500,
              },
            );
          }

          // ---------------------------------------------
          // Mark Complete
          // ---------------------------------------------

          await markPaymentActivation(
            orderId,
            "completed",
          );

          return NextResponse.json({
            success: true,
            status: "success",

            message:
              "Payment successful! Job Boost has been activated.",

            promotion: {
              type: "BOOST_AD",

              jobId,

              boostedAt:
                activated.boostedAt,

              boostedUntil:
                activated.boostedUntil,
            },

            payment: {
              orderId:
                paidPayment.cashfreeOrderId,

              paymentId:
                paidPayment.cashfreePaymentId,

              type:
                paidPayment.type,

              amount:
                paidPayment.amount,

              currency:
                paidPayment.currency,
            },
          });
        }

        // =================================================
        // JOB FEATURED
        // =================================================

        if (
          paidPayment.type ===
          "FEATURED_AD"
        ) {
          const activated =
            await activatePaidFeaturedJob(
              jobId,

              jobEmployerId,

              paidPayment.cashfreePaymentId ||
                cashfreePaymentId,
            );

          if (
            !activated.success
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
                  "Payment was successful, but Job Featured activation failed.",

                reason:
                  activated.reason,
              },
              {
                status: 500,
              },
            );
          }

          // ---------------------------------------------
          // Mark Complete
          // ---------------------------------------------

          await markPaymentActivation(
            orderId,
            "completed",
          );

          return NextResponse.json({
            success: true,
            status: "success",

            message:
              "Payment successful! Job has been featured.",

            promotion: {
              type: "FEATURED_AD",

              jobId,

              featuredAt:
                activated.featuredAt,

              featuredUntil:
                activated.featuredUntil,
            },

            payment: {
              orderId:
                paidPayment.cashfreeOrderId,

              paymentId:
                paidPayment.cashfreePaymentId,

              type:
                paidPayment.type,

              amount:
                paidPayment.amount,

              currency:
                paidPayment.currency,
            },
          });
        }
      }

      // =================================================
      // PRODUCT PROMOTION
      // =================================================

      if (
        paidPayment.productId
      ) {
        const productId =
          String(
            paidPayment.productId,
          );

        // -----------------------------------------------
        // PRODUCT BOOST
        // -----------------------------------------------

        if (
          paidPayment.type ===
          "BOOST_AD"
        ) {
          const activated =
            await activatePaidBoost(
              productId,

              userId,

              paidPayment.cashfreePaymentId ||
                cashfreePaymentId,
            );

          if (
            !activated.success
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
                  "Payment was successful, but Product Boost activation failed.",

                reason:
                  activated.reason,
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
              "Payment successful! Product Boost has been activated.",

            promotion: {
              type: "BOOST_AD",

              productId,

              boostedAt:
                activated.boostedAt,

              boostedUntil:
                activated.boostedUntil,
            },

            payment: {
              orderId:
                paidPayment.cashfreeOrderId,

              paymentId:
                paidPayment.cashfreePaymentId,

              type:
                paidPayment.type,

              amount:
                paidPayment.amount,

              currency:
                paidPayment.currency,
            },
          });
        }

        // -----------------------------------------------
        // PRODUCT FEATURED
        // -----------------------------------------------

        if (
          paidPayment.type ===
          "FEATURED_AD"
        ) {
          const activated =
            await activatePaidFeatured(
              productId,

              userId,

              paidPayment.cashfreePaymentId ||
                cashfreePaymentId,
            );

          if (
            !activated.success
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
                  "Payment was successful, but Product Featured activation failed.",

                reason:
                  activated.reason,
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
              "Payment successful! Product has been featured.",

            promotion: {
              type: "FEATURED_AD",

              productId,

              featuredAt:
                activated.featuredAt,

              featuredUntil:
                activated.featuredUntil,
            },

            payment: {
              orderId:
                paidPayment.cashfreeOrderId,

              paymentId:
                paidPayment.cashfreePaymentId,

              type:
                paidPayment.type,

              amount:
                paidPayment.amount,

              currency:
                paidPayment.currency,
            },
          });
        }
      }

      // =================================================
      // Missing Promotion Target
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
            "Promotion target is missing from the payment record.",
        },
        {
          status: 400,
        },
      );
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
          "Unsupported payment type.",
      },
      {
        status: 400,
      },
    );
  } catch (error: unknown) {
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