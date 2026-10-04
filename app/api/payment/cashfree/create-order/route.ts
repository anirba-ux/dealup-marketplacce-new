import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import { cashfreeConfig } from "@/lib/cashfree";
import clientPromise from "@/lib/db/mongodb";

import {
  createPaymentRecord,
  type PaymentType,
} from "@/lib/repositories/payment.repository";

// =====================================================
// DATABASE
// =====================================================

const DATABASE_NAME = "dealup";

// =====================================================
// Cashfree Payment Pricing
// Amounts are stored in paise
// =====================================================

const PREMIUM_PRICES = {
  monthly: 9900,
  quarterly: 24900,
  yearly: 79900,
} as const;

// =====================================================
// Job Promotion Pricing
// =====================================================

const JOB_BOOST_PRICES = {
  normalSeller: 2900, // ₹29
  premiumQuotaExhausted: 1900, // ₹19
} as const;

const JOB_FEATURED_PRICE = 2900; // ₹29

const JOB_BOOST_DURATION_DAYS = 7;
const JOB_FEATURED_DURATION_DAYS = 14;

// =====================================================
// Helpers
// =====================================================

function getPlanFromPaymentType(
  type: PaymentType,
) {
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
// Job Premium Helpers
// =====================================================

function getDefaultBoostLimit(
  plan?: string,
): number {
  if (plan === "monthly") {
    return 10;
  }

  if (plan === "quarterly") {
    return 30;
  }

  if (plan === "yearly") {
    return 120;
  }

  return 0;
}

function getDefaultFeaturedLimit(
  plan?: string,
): number {
  if (plan === "monthly") {
    return 3;
  }

  if (plan === "quarterly") {
    return 9;
  }

  if (plan === "yearly") {
    return 36;
  }

  return 0;
}

// =====================================================
// Create Cashfree Order
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

    const userId = String(
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
      jobId?: string;
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
    // Variables
    // =================================================

    let amount = 0;

    let productId: string | null =
      null;

    let jobId: string | null = null;

    let orderNote = `DealUp ${type}`;

    // =================================================
    // Premium Plans
    // =================================================

    if (type === "PREMIUM_MONTHLY") {
      amount = PREMIUM_PRICES.monthly;
    }

    if (type === "PREMIUM_QUARTERLY") {
      amount = PREMIUM_PRICES.quarterly;
    }

    if (type === "PREMIUM_YEARLY") {
      amount = PREMIUM_PRICES.yearly;
    }

    // =================================================
    // FEATURED AD
    // =================================================

    if (type === "FEATURED_AD") {
      // -------------------------------------------------
      // JOB FEATURED PAYMENT
      // -------------------------------------------------

      if (body.jobId) {
        const requestedJobId =
          String(body.jobId);

        if (
          !ObjectId.isValid(
            requestedJobId,
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid Job ID.",
            },
            {
              status: 400,
            },
          );
        }

        const client =
          await clientPromise;

        const db =
          client.db(DATABASE_NAME);

        const jobs =
          db.collection("jobs");

        const users =
          db.collection("users");

        // -----------------------------------------------
        // Find only user's own active job
        // -----------------------------------------------

        const job =
          await jobs.findOne({
            _id: new ObjectId(
              requestedJobId,
            ),
            employerId: userId,
          });

        if (!job) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Job not found or you do not have permission to promote this job.",
            },
            {
              status: 404,
            },
          );
        }

        // -----------------------------------------------
        // Job must be active
        // -----------------------------------------------

        if (job.status !== "active") {
          return NextResponse.json(
            {
              success: false,
              message:
                "Only active jobs can be featured.",
            },
            {
              status: 400,
            },
          );
        }

        // -----------------------------------------------
        // Prevent duplicate active feature
        // -----------------------------------------------

        const featuredUntil =
          job.featuredUntil
            ? new Date(
                job.featuredUntil,
              )
            : null;

        if (
          featuredUntil &&
          !Number.isNaN(
            featuredUntil.getTime(),
          ) &&
          featuredUntil.getTime() >
            Date.now()
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "This job is already featured.",
              featuredUntil,
            },
            {
              status: 409,
            },
          );
        }

        // -----------------------------------------------
        // Find seller Premium information
        // -----------------------------------------------

        const employer =
          await users.findOne(
            {
              _id: new ObjectId(
                userId,
              ),
            },
            {
              projection: {
                premiumSeller: 1,
              },
            },
          );

        if (!employer) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Seller account not found.",
            },
            {
              status: 404,
            },
          );
        }

        const premiumSeller =
          employer.premiumSeller;

        if (!premiumSeller) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Premium Seller membership is required to feature a job.",
            },
            {
              status: 403,
            },
          );
        }

        // -----------------------------------------------
        // Premium must be active
        // -----------------------------------------------

        const premiumExpiresAt =
          premiumSeller.expiresAt
            ? new Date(
                premiumSeller.expiresAt,
              )
            : null;

        const premiumActive =
          premiumSeller.active ===
            true &&
          premiumExpiresAt !==
            null &&
          !Number.isNaN(
            premiumExpiresAt.getTime(),
          ) &&
          premiumExpiresAt.getTime() >
            Date.now();

        if (!premiumActive) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Premium Seller membership is inactive or expired.",
            },
            {
              status: 403,
            },
          );
        }

        // -----------------------------------------------
        // Featured Ads feature must be enabled
        // -----------------------------------------------

        if (
          premiumSeller.featuredAds !==
          true
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Featured Ads are not enabled for your Premium Seller plan.",
            },
            {
              status: 403,
            },
          );
        }

        // -----------------------------------------------
        // Determine Featured quota
        // -----------------------------------------------

        let featuredAdsLimit =
          Number(
            premiumSeller.featuredAdsLimit ??
              0,
          );

        if (featuredAdsLimit <= 0) {
          featuredAdsLimit =
            getDefaultFeaturedLimit(
              premiumSeller.plan,
            );
        }

        const featuredAdsUsed =
          Math.max(
            0,
            Number(
              premiumSeller.featuredAdsUsed ??
                0,
            ),
          );

        if (
          featuredAdsLimit <= 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid Premium Seller plan.",
            },
            {
              status: 400,
            },
          );
        }

        // -----------------------------------------------
        // IMPORTANT:
        // If free quota is still available,
        // payment should NOT be created.
        // -----------------------------------------------

        if (
          featuredAdsUsed <
          featuredAdsLimit
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Your free Featured Ads quota is still available. Please use the Job Feature API instead of creating a payment order.",
              paymentRequired: false,
              featuredAdsLimit,
              featuredAdsUsed,
              featuredAdsRemaining:
                featuredAdsLimit -
                featuredAdsUsed,
            },
            {
              status: 409,
            },
          );
        }

        // -----------------------------------------------
        // Paid Job Featured
        // -----------------------------------------------

        amount =
          JOB_FEATURED_PRICE;

        jobId = requestedJobId;

        orderNote =
          "DealUp Job Featured Ad";
      }

      // -------------------------------------------------
      // EXISTING PRODUCT FEATURED PAYMENT
      // -------------------------------------------------

      else if (body.productId) {
        productId = String(
          body.productId,
        );

        // Keep existing Product pricing
        amount = 2900;

        orderNote =
          "DealUp Product Featured Ad";
      }

      // -------------------------------------------------
      // Missing ID
      // -------------------------------------------------

      else {
        return NextResponse.json(
          {
            success: false,
            message:
              "Product ID or Job ID is required for Featured Ad payment.",
          },
          {
            status: 400,
          },
        );
      }
    }

    // =================================================
    // BOOST AD
    // =================================================

    if (type === "BOOST_AD") {
      // -------------------------------------------------
      // JOB BOOST PAYMENT
      // -------------------------------------------------

      if (body.jobId) {
        const requestedJobId =
          String(body.jobId);

        if (
          !ObjectId.isValid(
            requestedJobId,
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid Job ID.",
            },
            {
              status: 400,
            },
          );
        }

        const client =
          await clientPromise;

        const db =
          client.db(DATABASE_NAME);

        const jobs =
          db.collection("jobs");

        const users =
          db.collection("users");

        // -----------------------------------------------
        // Find user's own active job
        // -----------------------------------------------

        const job =
          await jobs.findOne({
            _id: new ObjectId(
              requestedJobId,
            ),
            employerId: userId,
          });

        if (!job) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Job not found or you do not have permission to promote this job.",
            },
            {
              status: 404,
            },
          );
        }

        // -----------------------------------------------
        // Job must be active
        // -----------------------------------------------

        if (job.status !== "active") {
          return NextResponse.json(
            {
              success: false,
              message:
                "Only active jobs can be boosted.",
            },
            {
              status: 400,
            },
          );
        }

        // -----------------------------------------------
        // Prevent duplicate active boost
        // -----------------------------------------------

        const boostedUntil =
          job.boostedUntil
            ? new Date(
                job.boostedUntil,
              )
            : null;

        if (
          boostedUntil &&
          !Number.isNaN(
            boostedUntil.getTime(),
          ) &&
          boostedUntil.getTime() >
            Date.now()
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "This job is already boosted.",
              boostedUntil,
            },
            {
              status: 409,
            },
          );
        }

        // -----------------------------------------------
        // Find seller Premium information
        // -----------------------------------------------

        const employer =
          await users.findOne(
            {
              _id: new ObjectId(
                userId,
              ),
            },
            {
              projection: {
                premiumSeller: 1,
              },
            },
          );

        if (!employer) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Seller account not found.",
            },
            {
              status: 404,
            },
          );
        }

        const premiumSeller =
          employer.premiumSeller;

        // -----------------------------------------------
        // Default:
        // Normal seller = ₹29
        // -----------------------------------------------

        amount =
          JOB_BOOST_PRICES.normalSeller;

        // -----------------------------------------------
        // Check active Premium
        // -----------------------------------------------

        if (premiumSeller) {
          const premiumExpiresAt =
            premiumSeller.expiresAt
              ? new Date(
                  premiumSeller.expiresAt,
                )
              : null;

          const premiumActive =
            premiumSeller.active ===
              true &&
            premiumExpiresAt !==
              null &&
            !Number.isNaN(
              premiumExpiresAt.getTime(),
            ) &&
            premiumExpiresAt.getTime() >
              Date.now();

          if (premiumActive) {
            let boostAdsLimit =
              Number(
                premiumSeller.boostAdsLimit ??
                  0,
              );

            if (boostAdsLimit <= 0) {
              boostAdsLimit =
                getDefaultBoostLimit(
                  premiumSeller.plan,
                );
            }

            const boostAdsUsed =
              Math.max(
                0,
                Number(
                  premiumSeller.boostAdsUsed ??
                    0,
                ),
              );

            if (
              boostAdsLimit <= 0
            ) {
              return NextResponse.json(
                {
                  success: false,
                  message:
                    "Invalid Premium Seller plan.",
                },
                {
                  status: 400,
                },
              );
            }

            // -------------------------------------------
            // Free quota still available
            // -------------------------------------------

            if (
              boostAdsUsed <
              boostAdsLimit
            ) {
              return NextResponse.json(
                {
                  success: false,
                  message:
                    "Your free Boost quota is still available. Please use the Job Boost API instead of creating a payment order.",
                  paymentRequired: false,
                  boostAdsLimit,
                  boostAdsUsed,
                  boostAdsRemaining:
                    boostAdsLimit -
                    boostAdsUsed,
                },
                {
                  status: 409,
                },
              );
            }

            // -------------------------------------------
            // Premium quota exhausted
            // ₹19
            // -------------------------------------------

            amount =
              JOB_BOOST_PRICES.premiumQuotaExhausted;
          }
        }

        jobId = requestedJobId;

        orderNote =
          "DealUp Job Boost Ad";
      }

      // -------------------------------------------------
      // EXISTING PRODUCT BOOST PAYMENT
      // -------------------------------------------------

      else if (body.productId) {
        productId = String(
          body.productId,
        );

        // IMPORTANT:
        // Keep existing Product Boost price
        // untouched.
        amount = 1900;

        orderNote =
          "DealUp Product Boost Ad";
      }

      // -------------------------------------------------
      // Missing ID
      // -------------------------------------------------

      else {
        return NextResponse.json(
          {
            success: false,
            message:
              "Product ID or Job ID is required for Boost Ad payment.",
          },
          {
            status: 400,
          },
        );
      }
    }

    // =================================================
    // Premium Plan
    // =================================================

    const plan =
      getPlanFromPaymentType(type);

    // =================================================
    // Amount Validation
    // =================================================

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment amount.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Cashfree Order ID
    // =================================================

    const orderId =
      `dealup_${type.toLowerCase()}_${Date.now()}_${crypto
        .randomUUID()
        .slice(0, 8)}`;

    // =================================================
    // Customer Details
    // =================================================

    const customerEmail =
      session.user.email ||
      `user-${userId}@dealup.local`;

    const customerPhone =
      session.user.phone ||
      "9999999999";

    // =================================================
    // Return URL
    // =================================================

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const returnUrl =
      `${appUrl}/dashboard/premium/payment-success?order_id=${encodeURIComponent(
        orderId,
      )}`;

    // =================================================
    // Cashfree Create Order
    // =================================================

    const cashfreeResponse =
      await fetch(
        `${cashfreeConfig.baseUrl}/orders`,
        {
          method: "POST",

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

            "x-idempotency-key":
              crypto.randomUUID(),
          },

          body: JSON.stringify({
            order_id: orderId,

            order_amount:
              amount / 100,

            order_currency: "INR",

            customer_details: {
              customer_id: userId,
              customer_email:
                customerEmail,
              customer_phone:
                customerPhone,
            },

            order_meta: {
              return_url:
                returnUrl,
            },

            order_note: orderNote,

            order_tags: {
              userId,

              paymentType: type,

              productId:
                productId ?? "",

              jobId:
                jobId ?? "",

              plan:
                plan ?? "",
            },
          }),
        },
      );

    // =================================================
    // Read Cashfree Response
    // =================================================

    const cashfreeData =
      await cashfreeResponse.json();

    if (!cashfreeResponse.ok) {
      console.error(
        "CASHFREE CREATE ORDER ERROR:",
        cashfreeData,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            cashfreeData?.message ||
            "Unable to create Cashfree payment order.",
        },
        {
          status:
            cashfreeResponse.status >=
              400 &&
            cashfreeResponse.status <
              500
              ? cashfreeResponse.status
              : 500,
        },
      );
    }

    // =================================================
    // Validate Cashfree Response
    // =================================================

    if (
      !cashfreeData?.cf_order_id ||
      !cashfreeData?.payment_session_id
    ) {
      console.error(
        "CASHFREE INVALID ORDER RESPONSE:",
        cashfreeData,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Cashfree did not return a valid payment session.",
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

      jobId,

      razorpayOrderId: "",

      razorpayPaymentId: null,

      razorpaySignature: null,

      cashfreeOrderId: orderId,

      cashfreePaymentSessionId:
        cashfreeData.payment_session_id,

      cashfreePaymentId: null,

      amount,

      currency: "INR",

      status: "created",

      metadata: {
        plan,

        cashfreeCfOrderId:
          cashfreeData.cf_order_id,

        promotionTarget:
          jobId
            ? "job"
            : productId
              ? "product"
              : "premium",
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

          cfOrderId:
            cashfreeData.cf_order_id,

          amount,

          currency: "INR",
        },

        paymentSessionId:
          cashfreeData.payment_session_id,

        paymentType: type,

        productId,

        jobId,

        plan,

        environment:
          cashfreeConfig.environment,

        priceInRupees:
          amount / 100,

        durationDays:
          jobId
            ? type === "BOOST_AD"
              ? JOB_BOOST_DURATION_DAYS
              : JOB_FEATURED_DURATION_DAYS
            : null,
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error(
      "CASHFREE CREATE ORDER ERROR:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown Cashfree error.";

    return NextResponse.json(
      {
        success: false,

        message:
          process.env.NODE_ENV ===
          "development"
            ? message
            : "Unable to create Cashfree payment order.",
      },
      {
        status: 500,
      },
    );
  }
}