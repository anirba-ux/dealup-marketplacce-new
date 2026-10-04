import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  boostJob,
  findJobById,
} from "@/lib/repositories/job.repository";

// =====================================================
// PATCH — BOOST JOB
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
            "You are not allowed to boost this job.",
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
            "Only active jobs can be boosted.",
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
      await boostJob(
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
            "Only active jobs can be boosted.",
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

    if (
      result.reason ===
      "ALREADY_BOOSTED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This job is already boosted.",
          boostedUntil:
            result.boostedUntil,
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
        "BOOST_PAYMENT_REQUIRED" &&
      result.paymentRequired === true
    ) {
      return NextResponse.json(
        {
          success: false,

          paymentRequired: true,

          paymentType:
            result.paymentType ??
            "BOOST_AD",

          price:
            result.price ?? 29,

          currency:
            result.currency ?? "INR",

          durationDays:
            result.durationDays ?? 7,

          isPremiumSeller:
            result.isPremiumSeller ??
            false,

          boostAdsLimit:
            result.boostAdsLimit ?? 0,

          boostAdsUsed:
            result.boostAdsUsed ?? 0,

          boostAdsRemaining:
            result.boostAdsRemaining ?? 0,

          message:
            result.isPremiumSeller
              ? "Your free Boost Ads quota has been exhausted."
              : "Payment is required to boost this job.",
        },
        {
          status: 402,
        },
      );
    }

    if (
      result.reason ===
      "BOOST_UPDATE_FAILED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to activate Job Boost.",
        },
        {
          status: 500,
        },
      );
    }

    if (
      result.reason ===
      "BOOST_QUOTA_UPDATE_FAILED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Boost quota could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    // -------------------------------------------------
    // Unexpected Failure
    // -------------------------------------------------

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to boost this job.",
        },
        {
          status: 400,
        },
      );
    }

    // -------------------------------------------------
    // Free Boost Success
    // -------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        paymentRequired: false,

        paymentType:
          result.paymentType ??
          "BOOST_JOB",

        price:
          result.price ?? 0,

        currency:
          result.currency ?? "INR",

        durationDays:
          result.durationDays ?? 7,

        isPremiumSeller:
          result.isPremiumSeller ??
          false,

        boostAdsLimit:
          result.boostAdsLimit ??
          0,

        boostAdsUsed:
          result.boostAdsUsed ??
          0,

        boostAdsRemaining:
          result.boostAdsRemaining ??
          0,

        boostedAt:
          result.boostedAt,

        boostedUntil:
          result.boostedUntil,

        message:
          result.message ??
          "Job boosted successfully.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "BOOST JOB API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to boost job.",
      },
      {
        status: 500,
      },
    );
  }
}