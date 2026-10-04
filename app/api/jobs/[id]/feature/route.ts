import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  featureJob,
  findJobById,
} from "@/lib/repositories/job.repository";

// =====================================================
// PATCH — FEATURE JOB
// =====================================================

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    // -------------------------------------------------
    // Authentication
    // -------------------------------------------------

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

    const employerId =
      String(session.user.id);

    const { id } =
      await params;

    // -------------------------------------------------
    // Find Job
    // -------------------------------------------------

    const job =
      await findJobById(id);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found.",
        },
        {
          status: 404,
        },
      );
    }

    // -------------------------------------------------
    // Ownership
    // -------------------------------------------------

    if (
      String(job.employerId) !==
      employerId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not allowed to feature this job.",
        },
        {
          status: 403,
        },
      );
    }

    // -------------------------------------------------
    // Active Job
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Business Logic
    // -------------------------------------------------

    const result =
      await featureJob(
        id,
        employerId,
      );

    // -------------------------------------------------
    // Error Mapping
    // -------------------------------------------------

    if (
      result.reason ===
      "INVALID_JOB_ID"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid job ID.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      result.reason ===
      "INVALID_EMPLOYER_ID"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid employer ID.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      result.reason ===
      "JOB_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      result.reason ===
      "JOB_NOT_ACTIVE"
    ) {
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

    if (
      result.reason ===
      "EMPLOYER_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Employer account not found.",
        },
        {
          status: 404,
        },
      );
    }

    // -------------------------------------------------
    // Premium Required
    // -------------------------------------------------

    if (
      result.reason ===
      "PREMIUM_REQUIRED"
    ) {
      return NextResponse.json(
        {
          success: false,

          premiumRequired: true,

          message:
            "Premium Seller membership is required to feature a job.",
        },
        {
          status: 403,
        },
      );
    }

    // -------------------------------------------------
    // Premium Not Active
    // -------------------------------------------------

    if (
      result.reason ===
      "PREMIUM_NOT_ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,

          premiumRequired: true,

          message:
            "Your Premium Seller membership is not active.",
        },
        {
          status: 403,
        },
      );
    }

    // -------------------------------------------------
    // Premium Expired
    // -------------------------------------------------

    if (
      result.reason ===
      "PREMIUM_EXPIRED"
    ) {
      return NextResponse.json(
        {
          success: false,

          premiumRequired: true,

          message:
            "Your Premium Seller membership has expired.",
        },
        {
          status: 403,
        },
      );
    }

    // -------------------------------------------------
    // Feature Ads Disabled
    // -------------------------------------------------

    if (
      result.reason ===
      "FEATURED_ADS_NOT_ENABLED"
    ) {
      return NextResponse.json(
        {
          success: false,

          premiumRequired: true,

          message:
            "Featured Ads are not enabled for your Premium Seller plan.",
        },
        {
          status: 403,
        },
      );
    }

    // -------------------------------------------------
    // Invalid Premium Plan
    // -------------------------------------------------

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

    // -------------------------------------------------
    // Already Featured
    // -------------------------------------------------

    if (
      result.reason ===
      "ALREADY_FEATURED"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This job is already featured.",

          featuredUntil:
            result.featuredUntil,
        },
        {
          status: 409,
        },
      );
    }

    // -------------------------------------------------
    // Payment Required
    // -------------------------------------------------

    if (
      result.reason ===
        "FEATURED_QUOTA_EXHAUSTED" &&
      result.paymentRequired === true
    ) {
      return NextResponse.json(
        {
          success: false,

          paymentRequired: true,

          paymentType:
            result.paymentType ??
            "FEATURED_AD",

          price:
            result.price ?? 29,

          currency:
            result.currency ?? "INR",

          durationDays:
            result.durationDays ?? 14,

          featuredAdsLimit:
            result.featuredAdsLimit ??
            0,

          featuredAdsUsed:
            result.featuredAdsUsed ??
            0,

          featuredAdsRemaining:
            result.featuredAdsRemaining ??
            0,

          message:
            "Your free Featured Ads quota has been exhausted.",
        },
        {
          status: 402,
        },
      );
    }

    // -------------------------------------------------
    // Feature Update Failed
    // -------------------------------------------------

    if (
      result.reason ===
      "FEATURE_UPDATE_FAILED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to activate Job Feature.",
        },
        {
          status: 500,
        },
      );
    }

    // -------------------------------------------------
    // Quota Update Failed
    // -------------------------------------------------

    if (
      result.reason ===
      "FEATURED_QUOTA_UPDATE_FAILED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Featured Ads quota could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    // -------------------------------------------------
    // Unexpected Error
    // -------------------------------------------------

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to feature this job.",
        },
        {
          status: 400,
        },
      );
    }

    // -------------------------------------------------
    // Free Feature Success
    // -------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        paymentRequired: false,

        paymentType:
          result.paymentType ??
          "FEATURED_JOB",

        price:
          result.price ?? 0,

        currency:
          result.currency ?? "INR",

        durationDays:
          result.durationDays ?? 14,

        featuredAt:
          result.featuredAt,

        featuredUntil:
          result.featuredUntil,

        featuredAdsLimit:
          result.featuredAdsLimit ??
          0,

        featuredAdsUsed:
          result.featuredAdsUsed ??
          0,

        featuredAdsRemaining:
          result.featuredAdsRemaining ??
          0,

        message:
          result.message ??
          "Job featured successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "FEATURE JOB API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to feature job.",
      },
      {
        status: 500,
      },
    );
  }
}