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
// PRICING (ALL AMOUNTS IN PAISE)
// =====================================================

const PREMIUM_PRICES = {
  monthly: 9900,
  quarterly: 24900,
  yearly: 79900,
} as const;

const PRODUCT_BOOST_PRICE = 1900;
const PRODUCT_FEATURED_PRICE = 2900;

const JOB_BOOST_NORMAL_PRICE = 2900;
const JOB_BOOST_PREMIUM_PRICE = 1900;
const JOB_FEATURED_PRICE = 2900;

const SERVICE_BOOST_NORMAL_PRICE = 2900;
const SERVICE_BOOST_PREMIUM_PRICE = 1900;
const SERVICE_FEATURED_PRICE = 2900;

// =====================================================
// PROMOTION DURATIONS
// =====================================================

const BOOST_DURATION_DAYS = 7;
const FEATURED_DURATION_DAYS = 14;

// =====================================================
// HELPERS
// =====================================================

function getPlanFromPaymentType(type: PaymentType) {
  if (type === "PREMIUM_MONTHLY") return "monthly" as const;
  if (type === "PREMIUM_QUARTERLY") return "quarterly" as const;
  if (type === "PREMIUM_YEARLY") return "yearly" as const;

  return null;
}

function getDefaultBoostLimit(plan?: string): number {
  if (plan === "monthly") return 10;
  if (plan === "quarterly") return 30;
  if (plan === "yearly") return 120;

  return 0;
}

function getDefaultFeaturedLimit(plan?: string): number {
  if (plan === "monthly") return 3;
  if (plan === "quarterly") return 9;
  if (plan === "yearly") return 36;

  return 0;
}

function isPremiumActive(premiumSeller: any): boolean {
  if (!premiumSeller || premiumSeller.active !== true) {
    return false;
  }

  if (!premiumSeller.expiresAt) {
    return false;
  }

  const expiresAt = new Date(premiumSeller.expiresAt);

  return (
    !Number.isNaN(expiresAt.getTime()) &&
    expiresAt.getTime() > Date.now()
  );
}

function hasActivePromotion(
  value: unknown,
): boolean {
  if (!value) return false;

  const date = new Date(value as string | number | Date);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getTime() > Date.now()
  );
}

// =====================================================
// POST: CREATE CASHFREE ORDER
// =====================================================

export async function POST(request: Request) {
  try {
    // -------------------------------------------------
    // 1. Authentication
    // -------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to continue.",
        },
        { status: 401 },
      );
    }

    const userId = String(session.user.id);

    // -------------------------------------------------
    // 2. Parse request body
    // -------------------------------------------------

    let body: {
      type?: PaymentType;
      plan?: "monthly" | "quarterly" | "yearly";
      productId?: string;
      jobId?: string;
      serviceId?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const type = body.type;

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
        { status: 400 },
      );
    }

    // -------------------------------------------------
    // 3. Resolve promotion target
    // -------------------------------------------------

    const suppliedTargets = [
      body.productId ? "product" : null,
      body.jobId ? "job" : null,
      body.serviceId ? "service" : null,
    ].filter(Boolean);

    const isPremiumPayment =
      type === "PREMIUM_MONTHLY" ||
      type === "PREMIUM_QUARTERLY" ||
      type === "PREMIUM_YEARLY";

    if (
      suppliedTargets.length > 1 ||
      (isPremiumPayment && suppliedTargets.length > 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide exactly one valid payment target.",
        },
        { status: 400 },
      );
    }

    if (!isPremiumPayment && suppliedTargets.length !== 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product ID, Job ID, or Service ID is required for a promotion.",
        },
        { status: 400 },
      );
    }

    let amount = 0;
    let productId: string | null = null;
    let jobId: string | null = null;
    let serviceId: string | null = null;
    let orderNote = `DealUp ${type}`;

    let promotionTarget:
      | "premium"
      | "product"
      | "job"
      | "service" = "premium";

    // -------------------------------------------------
    // 4. Premium Seller subscription
    // -------------------------------------------------

    if (type === "PREMIUM_MONTHLY") {
      amount = PREMIUM_PRICES.monthly;
    } else if (type === "PREMIUM_QUARTERLY") {
      amount = PREMIUM_PRICES.quarterly;
    } else if (type === "PREMIUM_YEARLY") {
      amount = PREMIUM_PRICES.yearly;
    }

    // -------------------------------------------------
    // 5. Load database when processing a promotion
    // -------------------------------------------------

    if (!isPremiumPayment) {
      const client = await clientPromise;
      const db = client.db(DATABASE_NAME);

      if (!ObjectId.isValid(userId)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid user account.",
          },
          { status: 400 },
        );
      }

      const user = await db.collection("users").findOne(
        { _id: new ObjectId(userId) },
        { projection: { premiumSeller: 1 } },
      );

      const premiumSeller = user?.premiumSeller;
      const premiumActive = isPremiumActive(premiumSeller);

      // ===============================================
      // SERVICE PROMOTION
      // ===============================================

      if (body.serviceId) {
        serviceId = String(body.serviceId);
        promotionTarget = "service";

        if (!ObjectId.isValid(serviceId)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid Service ID.",
            },
            { status: 400 },
          );
        }

        const service = await db.collection("services").findOne({
          _id: new ObjectId(serviceId),
        });

        if (
          !service ||
          String(service.sellerId ?? "") !== userId
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Service not found or you do not have permission to promote it.",
            },
            { status: 404 },
          );
        }

        if (service.status !== "active") {
          return NextResponse.json(
            {
              success: false,
              message: "Only active services can be promoted.",
            },
            { status: 400 },
          );
        }

        // ---------------------------------------------
        // SERVICE FEATURED
        // ---------------------------------------------

        if (type === "FEATURED_AD") {
          if (!premiumActive) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "An active Premium Seller subscription is required to feature a service.",
              },
              { status: 403 },
            );
          }

          if (premiumSeller.featuredAds !== true) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "Featured Ads are not enabled for your Premium Seller plan.",
              },
              { status: 403 },
            );
          }

          if (hasActivePromotion(service.featuredUntil)) {
            return NextResponse.json(
              {
                success: false,
                message: "This service is already featured.",
                featuredUntil: service.featuredUntil,
              },
              { status: 409 },
            );
          }

          let featuredLimit = Number(
            premiumSeller.featuredAdsLimit ?? 0,
          );

          if (featuredLimit <= 0) {
            featuredLimit = getDefaultFeaturedLimit(
              premiumSeller.plan,
            );
          }

          const featuredUsed = Math.max(
            0,
            Number(premiumSeller.featuredAdsUsed ?? 0),
          );

          if (featuredLimit <= 0) {
            return NextResponse.json(
              {
                success: false,
                message: "Invalid Premium Seller plan.",
              },
              { status: 400 },
            );
          }

          // Free quota must be used before paid promotion.
          if (featuredUsed < featuredLimit) {
            return NextResponse.json(
              {
                success: false,
                paymentRequired: false,
                message:
                  "Your free Featured Ads quota is available. Use the Service Feature API instead.",
                featuredAdsLimit: featuredLimit,
                featuredAdsUsed: featuredUsed,
                featuredAdsRemaining:
                  featuredLimit - featuredUsed,
              },
              { status: 409 },
            );
          }

          // Quota exhausted: ₹29 for 14 days.
          amount = SERVICE_FEATURED_PRICE;
          orderNote = "DealUp Service Featured Ad";
        }

        // ---------------------------------------------
        // SERVICE BOOST
        // ---------------------------------------------

        if (type === "BOOST_AD") {
          if (hasActivePromotion(service.boostedUntil)) {
            return NextResponse.json(
              {
                success: false,
                message: "This service is already boosted.",
                boostedUntil: service.boostedUntil,
              },
              { status: 409 },
            );
          }

          // Free seller pays ₹29.
          amount = SERVICE_BOOST_NORMAL_PRICE;

          if (premiumActive) {
            let boostLimit = Number(
              premiumSeller.boostAdsLimit ?? 0,
            );

            if (boostLimit <= 0) {
              boostLimit = getDefaultBoostLimit(
                premiumSeller.plan,
              );
            }

            const boostUsed = Math.max(
              0,
              Number(premiumSeller.boostAdsUsed ?? 0),
            );

            if (boostLimit <= 0) {
              return NextResponse.json(
                {
                  success: false,
                  message: "Invalid Premium Seller plan.",
                },
                { status: 400 },
              );
            }

            // Free quota must be used first.
            if (boostUsed < boostLimit) {
              return NextResponse.json(
                {
                  success: false,
                  paymentRequired: false,
                  message:
                    "Your free Boost quota is available. Use the Service Boost API instead.",
                  boostAdsLimit: boostLimit,
                  boostAdsUsed: boostUsed,
                  boostAdsRemaining: boostLimit - boostUsed,
                },
                { status: 409 },
              );
            }

            // Premium quota exhausted: ₹19.
            amount = SERVICE_BOOST_PREMIUM_PRICE;
          }

          orderNote = "DealUp Service Boost Ad";
        }
      }

      // ===============================================
      // JOB PROMOTION
      // ===============================================

      else if (body.jobId) {
        jobId = String(body.jobId);
        promotionTarget = "job";

        if (!ObjectId.isValid(jobId)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid Job ID.",
            },
            { status: 400 },
          );
        }

        const job = await db.collection("jobs").findOne({
          _id: new ObjectId(jobId),
          employerId: userId,
        });

        if (!job) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Job not found or you do not have permission to promote it.",
            },
            { status: 404 },
          );
        }

        if (job.status !== "active") {
          return NextResponse.json(
            {
              success: false,
              message: "Only active jobs can be promoted.",
            },
            { status: 400 },
          );
        }

        if (type === "FEATURED_AD") {
          if (!premiumActive) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "An active Premium Seller subscription is required to feature a job.",
              },
              { status: 403 },
            );
          }

          if (premiumSeller.featuredAds !== true) {
            return NextResponse.json(
              {
                success: false,
                message:
                  "Featured Ads are not enabled for your Premium Seller plan.",
              },
              { status: 403 },
            );
          }

          if (hasActivePromotion(job.featuredUntil)) {
            return NextResponse.json(
              {
                success: false,
                message: "This job is already featured.",
                featuredUntil: job.featuredUntil,
              },
              { status: 409 },
            );
          }

          let featuredLimit = Number(
            premiumSeller.featuredAdsLimit ?? 0,
          );

          if (featuredLimit <= 0) {
            featuredLimit = getDefaultFeaturedLimit(
              premiumSeller.plan,
            );
          }

          const featuredUsed = Math.max(
            0,
            Number(premiumSeller.featuredAdsUsed ?? 0),
          );

          if (featuredLimit <= 0) {
            return NextResponse.json(
              {
                success: false,
                message: "Invalid Premium Seller plan.",
              },
              { status: 400 },
            );
          }

          if (featuredUsed < featuredLimit) {
            return NextResponse.json(
              {
                success: false,
                paymentRequired: false,
                message:
                  "Your free Featured Ads quota is available. Use the Job Feature API instead.",
                featuredAdsLimit: featuredLimit,
                featuredAdsUsed: featuredUsed,
                featuredAdsRemaining:
                  featuredLimit - featuredUsed,
              },
              { status: 409 },
            );
          }

          amount = JOB_FEATURED_PRICE;
          orderNote = "DealUp Job Featured Ad";
        }

        if (type === "BOOST_AD") {
          if (hasActivePromotion(job.boostedUntil)) {
            return NextResponse.json(
              {
                success: false,
                message: "This job is already boosted.",
                boostedUntil: job.boostedUntil,
              },
              { status: 409 },
            );
          }

          amount = JOB_BOOST_NORMAL_PRICE;

          if (premiumActive) {
            let boostLimit = Number(
              premiumSeller.boostAdsLimit ?? 0,
            );

            if (boostLimit <= 0) {
              boostLimit = getDefaultBoostLimit(
                premiumSeller.plan,
              );
            }

            const boostUsed = Math.max(
              0,
              Number(premiumSeller.boostAdsUsed ?? 0),
            );

            if (boostLimit <= 0) {
              return NextResponse.json(
                {
                  success: false,
                  message: "Invalid Premium Seller plan.",
                },
                { status: 400 },
              );
            }

            if (boostUsed < boostLimit) {
              return NextResponse.json(
                {
                  success: false,
                  paymentRequired: false,
                  message:
                    "Your free Boost quota is available. Use the Job Boost API instead.",
                  boostAdsLimit: boostLimit,
                  boostAdsUsed: boostUsed,
                  boostAdsRemaining: boostLimit - boostUsed,
                },
                { status: 409 },
              );
            }

            amount = JOB_BOOST_PREMIUM_PRICE;
          }

          orderNote = "DealUp Job Boost Ad";
        }
      }

      // ===============================================
      // PRODUCT PROMOTION
      // ===============================================

      else if (body.productId) {
        productId = String(body.productId);
        promotionTarget = "product";

        if (!ObjectId.isValid(productId)) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid Product ID.",
            },
            { status: 400 },
          );
        }

        // Keep the existing Product pricing unchanged.
        if (type === "BOOST_AD") {
          amount = PRODUCT_BOOST_PRICE;
          orderNote = "DealUp Product Boost Ad";
        } else {
          amount = PRODUCT_FEATURED_PRICE;
          orderNote = "DealUp Product Featured Ad";
        }
      }
    }

    // -------------------------------------------------
    // 6. Validate amount
    // -------------------------------------------------

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment amount.",
        },
        { status: 400 },
      );
    }

    // -------------------------------------------------
    // 7. Create Cashfree order ID
    // -------------------------------------------------

    const orderId =
      `dealup_${type.toLowerCase()}_${Date.now()}_${crypto
        .randomUUID()
        .slice(0, 8)}`;

    const customerEmail =
      session.user.email || `user-${userId}@dealup.local`;

    const customerPhone =
      session.user.phone || "9999999999";

    const appUrl = (
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    ).replace(/\/+$/, "");

    const returnUrl =
      `${appUrl}/dashboard/premium/payment-success?order_id=${encodeURIComponent(
        orderId,
      )}`;

    // -------------------------------------------------
    // 8. Create order with Cashfree
    // -------------------------------------------------

    const cashfreeResponse = await fetch(
      `${cashfreeConfig.baseUrl}/orders`,
      {
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

          order_note: orderNote,

          order_tags: {
            userId,
            paymentType: type,
            productId: productId ?? "",
            jobId: jobId ?? "",
            serviceId: serviceId ?? "",
            plan: getPlanFromPaymentType(type) ?? "",
            promotionTarget,
          },
        }),
        cache: "no-store",
      },
    );

    const cashfreeData = await cashfreeResponse.json();

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
            cashfreeResponse.status >= 400 &&
            cashfreeResponse.status < 500
              ? cashfreeResponse.status
              : 500,
        },
      );
    }

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
        { status: 502 },
      );
    }

    // -------------------------------------------------
    // 9. Save payment record
    // -------------------------------------------------

    const now = new Date();

    await createPaymentRecord({
      userId,
      type,

      productId,
      jobId,
      serviceId,

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
        plan: getPlanFromPaymentType(type),
        cashfreeCfOrderId: cashfreeData.cf_order_id,
        promotionTarget,
        activationStatus: "pending",
      },

      createdAt: now,
      paidAt: null,
      updatedAt: now,
    });

    // -------------------------------------------------
    // 10. Return checkout details
    // -------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        order: {
          id: orderId,
          cfOrderId: cashfreeData.cf_order_id,
          amount,
          currency: "INR",
        },

        paymentSessionId:
          cashfreeData.payment_session_id,

        paymentType: type,
        productId,
        jobId,
        serviceId,

        plan: getPlanFromPaymentType(type),

        promotionTarget,

        environment: cashfreeConfig.environment,

        priceInRupees: amount / 100,

        durationDays:
          type === "BOOST_AD"
            ? BOOST_DURATION_DAYS
            : type === "FEATURED_AD"
              ? FEATURED_DURATION_DAYS
              : null,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("CASHFREE CREATE ORDER ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown Cashfree error.";

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? message
            : "Unable to create Cashfree payment order.",
      },
      { status: 500 },
    );
  }
}