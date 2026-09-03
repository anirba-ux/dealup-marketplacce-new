import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  activatePremiumSeller,
  getPremiumSellerStatus,
  type PremiumPlan,
} from "@/lib/repositories/premium.repository";

// =====================================================
// POST — Activate / Renew Premium Seller
//
// Premium Seller V1
//
// IMPORTANT:
// This is a development/test activation endpoint.
// Payment integration will be added in Premium V2.
//
// Subscription rules:
//
// 1. No Premium / expired Premium
//    → new plan starts immediately.
//
// 2. Active Premium
//    → new plan starts after current expiry.
//
// 3. Existing Premium time is never lost.
//
// 4. New expiry is calculated inside
//    premium.repository.ts.
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

    // =================================================
    // Seller ID
    // =================================================

    const userId = String(
      session.user.id,
    );

    // =================================================
    // Request Body
    // =================================================

    let body: {
      plan?: PremiumPlan;
    } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // =================================================
    // Validate Plan
    // =================================================

    const plan = body.plan;

    if (
      plan !== "monthly" &&
      plan !== "quarterly" &&
      plan !== "yearly"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid Premium plan is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Activate / Renew Premium
    //
    // IMPORTANT:
    //
    // Do NOT calculate subscription dates here.
    //
    // premium.repository.ts handles:
    //
    // Active Premium:
    // current expiresAt + new plan duration
    //
    // Expired / inactive:
    // now + new plan duration
    // =================================================

    const activated =
      await activatePremiumSeller(
        userId,
        {
          plan,

          // These values are kept for API compatibility.
          // The repository determines the actual
          // subscription dates.
          startedAt: new Date(),

          expiresAt: new Date(),

          // -------------------------------------------
          // V1 Test Activation
          // -------------------------------------------

          paymentId: null,

          orderId:
            `PREMIUM-V1-${Date.now()}`,
        },
      );

    // =================================================
    // Activation Failed
    // =================================================

    if (!activated) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to activate Premium Seller.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Get Final Premium Status
    //
    // This is important because the repository may
    // have extended an existing active subscription.
    //
    // Therefore we should NOT return the temporary
    // dates created above.
    // =================================================

    const premiumSeller =
      await getPremiumSellerStatus(
        userId,
      );

    if (!premiumSeller) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Premium Seller activated, but status could not be loaded.",
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Premium Seller activated successfully.",

        premiumSeller: {
          ...premiumSeller,

          features: {
            featuredAds:
              premiumSeller.featuredAds,

            productBoost:
              premiumSeller.productBoost,

            sellerAnalytics:
              premiumSeller.sellerAnalytics,

            premiumBadge:
              premiumSeller.premiumBadge,

            prioritySupport:
              premiumSeller.prioritySupport,
          },
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PREMIUM ACTIVATE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to activate Premium Seller.",
      },
      {
        status: 500,
      },
    );
  }
}