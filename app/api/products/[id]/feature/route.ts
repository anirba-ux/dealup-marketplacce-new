import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  featureProduct,
} from "@/lib/repositories/product.repository";

// =====================================================
// PATCH — Feature Product
// =====================================================
//
// Featured Ad Rules:
//
// Premium Seller:
// - Monthly   → 3 free Featured Ads
// - Quarterly → 9 free Featured Ads
// - Yearly    → 36 free Featured Ads
//
// Free Featured:
// - Duration = 14 days
//
// Free quota exhausted:
// - Payment required
// - ₹29 / 14 days
//
// =====================================================

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
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
    // Product ID
    // =================================================

    const { id } =
      await context.params;

    // =================================================
    // Seller ID
    // =================================================

    const sellerId =
      String(
        session.user.id,
      );

    // =================================================
    // Feature Product
    //
    // All business rules are handled
    // inside featureProduct().
    // =================================================

    const result =
      await featureProduct(
        id,
        sellerId,
      );

    // =================================================
    // Invalid Product ID
    // =================================================

    if (
      result.reason ===
      "INVALID_PRODUCT_ID"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid product ID.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Invalid Seller ID
    // =================================================

    if (
      result.reason ===
      "INVALID_SELLER_ID"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid seller account.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Product Not Found
    // =================================================

    if (
      result.reason ===
      "PRODUCT_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Product Not Active
    // =================================================

    if (
      result.reason ===
      "PRODUCT_NOT_ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Only active products can be featured.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Seller Not Found
    // =================================================

    if (
      result.reason ===
      "SELLER_NOT_FOUND"
    ) {
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

    // =================================================
    // Premium Required
    // =================================================

    if (
      result.reason ===
      "PREMIUM_REQUIRED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Premium Seller membership is required.",

          premiumRequired: true,
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Premium Not Active
    // =================================================

    if (
      result.reason ===
      "PREMIUM_NOT_ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Your Premium Seller membership is not active.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Premium Expired
    // =================================================

    if (
      result.reason ===
      "PREMIUM_EXPIRED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Your Premium Seller membership has expired.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Invalid Premium Plan
    // =================================================

    if (
      result.reason ===
      "INVALID_PREMIUM_PLAN"
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

    // =================================================
    // Featured Ads Not Enabled
    // =================================================

    if (
      result.reason ===
      "FEATURED_ADS_NOT_ENABLED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Featured Ads is not enabled for your Premium plan.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Already Featured
    // =================================================

    if (
      result.reason ===
      "ALREADY_FEATURED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This product is already featured.",

          featuredUntil:
            result.featuredUntil ??
            null,
        },
        {
          status: 409,
        },
      );
    }

    // =================================================
    // Featured Quota Exhausted
    //
    // IMPORTANT:
    //
    // No free quota remains.
    //
    // Payment flow will be connected later.
    //
    // Premium Seller:
    // ₹29 / 14 days
    // =================================================

    if (
      result.reason ===
      "FEATURED_QUOTA_EXHAUSTED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Your free Featured Ad quota has been exhausted.",

          paymentRequired:
            true,

          paymentType:
            "FEATURED_AD",

          price:
            result.price ?? 29,

          currency:
            result.currency ??
            "INR",

          durationDays:
            result.durationDays ??
            14,

          featuredAdsLimit:
            result.featuredAdsLimit ??
            0,

          featuredAdsUsed:
            result.featuredAdsUsed ??
            0,

          featuredAdsRemaining:
            result.featuredAdsRemaining ??
            0,
        },
        {
          status: 402,
        },
      );
    }

    // =================================================
    // Feature Update Failed
    // =================================================

    if (
      result.reason ===
      "FEATURE_UPDATE_FAILED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Failed to feature product.",
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Quota Update Failed
    //
    // Product activation was rolled back.
    // =================================================

    if (
      result.reason ===
      "FEATURED_QUOTA_UPDATE_FAILED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Featured Ad could not be activated. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Unexpected Failure
    // =================================================

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Failed to feature product.",
        },
        {
          status: 400,
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
          "Product featured successfully.",

        product: {
          id,

          isFeatured:
            true,

          featuredAt:
            result.featuredAt,

          featuredUntil:
            result.featuredUntil,
        },

        // =================================================
        // Premium Featured Quota
        // =================================================

        featuredQuota: {
          limit:
            result.featuredAdsLimit,

          used:
            result.featuredAdsUsed,

          remaining:
            result.featuredAdsRemaining,
        },

        // =================================================
        // Payment
        // =================================================

        paymentRequired:
          false,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "FEATURE PRODUCT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Internal Server Error.",
      },
      {
        status: 500,
      },
    );
  }
}