import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

// =====================================================
// GET — Current Seller Verification Status
//
// Source of truth:
// users.sellerVerification
//
// IMPORTANT:
// This API supports BOTH:
//
// 1. New correctionRequest object
// 2. Existing flat correction fields
//
// This keeps the verification system backward compatible.
// =====================================================

export async function GET() {
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
    // Validate User ID
    // =================================================

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid user account.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Database
    // =================================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const users =
      db.collection("users");

    // =================================================
    // Find Seller
    // =================================================

    const seller =
      await users.findOne({
        _id:
          new ObjectId(userId),
      });

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User account not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Seller Verification
    // =================================================

    const verification =
      seller.sellerVerification ??
      {};

    // =================================================
    // FOUR VERIFICATION CHECKS
    //
    // 1. Phone
    // 2. Identity
    // 3. Live Selfie
    // 4. Location
    // =================================================

    const phoneVerified =
      verification.phoneVerified ===
        true ||
      seller.isPhoneVerified ===
        true;

    const identityVerified =
      verification.identityVerified ===
      true;

    const selfieVerified =
      verification.selfieVerified ===
      true;

    const locationVerified =
      verification.locationVerified ===
      true;

    // =================================================
    // Progress
    // =================================================

    const completedSteps = [
      phoneVerified,
      identityVerified,
      selfieVerified,
      locationVerified,
    ].filter(Boolean).length;

    const totalSteps = 4;

    const progressPercent =
      Math.round(
        (completedSteps /
          totalSteps) *
          100,
      );

    // =================================================
    // Overall Verification Status
    // =================================================

    const status =
      verification.status ??
      "unverified";

    // =================================================
    // CORRECTION REQUEST
    //
    // We support BOTH:
    //
    // A) sellerVerification.correctionRequest
    //
    // B) Existing flat fields:
    //
    // correctionRequired
    // correctionType
    // correctionReason
    // correctionMessage
    // correctionRequestedAt
    // correctionRequestedBy
    // correctionResolvedAt
    // =================================================

    const storedCorrectionRequest =
      verification.correctionRequest ??
      null;

    // =================================================
    // Flat correction fields
    // =================================================

    const flatCorrectionRequired =
      verification.correctionRequired ===
      true;

    const flatCorrectionType =
      verification.correctionType ??
      null;

    const flatCorrectionReason =
      verification.correctionReason ??
      null;

    const flatCorrectionMessage =
      verification.correctionMessage ??
      null;

    const flatCorrectionRequestedAt =
      verification.correctionRequestedAt ??
      null;

    const flatCorrectionRequestedBy =
      verification.correctionRequestedBy ??
      null;

    const flatCorrectionResolvedAt =
      verification.correctionResolvedAt ??
      null;

    // =================================================
    // Build correction request
    //
    // Prefer the new nested structure.
    // Otherwise convert the existing flat structure.
    // =================================================

    let correctionRequest: any =
      null;

    if (
      storedCorrectionRequest &&
      typeof storedCorrectionRequest ===
        "object"
    ) {
      correctionRequest = {
        required:
          storedCorrectionRequest.required ===
          true,

        type:
          storedCorrectionRequest.type ??
          null,

        reason:
          storedCorrectionRequest.reason ??
          null,

        message:
          storedCorrectionRequest.message ??
          null,

        requestedAt:
          storedCorrectionRequest.requestedAt ??
          null,

        requestedBy:
          storedCorrectionRequest.requestedBy ??
          null,

        sellerViewed:
          storedCorrectionRequest.sellerViewed ===
          true,

        sellerViewedAt:
          storedCorrectionRequest.sellerViewedAt ??
          null,

        resolved:
          storedCorrectionRequest.resolved ===
          true,

        resolvedAt:
          storedCorrectionRequest.resolvedAt ??
          null,
      };
    } else if (
      flatCorrectionRequired ||
      flatCorrectionType ||
      flatCorrectionReason ||
      flatCorrectionMessage
    ) {
      correctionRequest = {
        required:
          flatCorrectionRequired,

        type:
          flatCorrectionType,

        reason:
          flatCorrectionReason,

        message:
          flatCorrectionMessage,

        requestedAt:
          flatCorrectionRequestedAt,

        requestedBy:
          flatCorrectionRequestedBy
            ? {
                userId:
                  String(
                    flatCorrectionRequestedBy,
                  ),
              }
            : null,

        sellerViewed:
          false,

        sellerViewedAt:
          null,

        resolved:
          false,

        resolvedAt:
          flatCorrectionResolvedAt,
      };
    }

    // =================================================
    // Correction Required
    //
    // action_required alone should NOT invent a message.
    //
    // But if correction data exists, it is required.
    // =================================================

    const correctionRequired =
      correctionRequest?.required ===
        true ||
      flatCorrectionRequired ===
        true;

    // =================================================
    // Seller verification details
    // =================================================

    const verifiedAt =
      verification.verifiedAt ??
      null;

    const rejectionReason =
      verification.rejectionReason ??
      null;

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        verification: {
          // -------------------------------------------
          // Four Checks
          // -------------------------------------------

          phoneVerified,

          identityVerified,

          selfieVerified,

          locationVerified,

          // -------------------------------------------
          // Overall Status
          // -------------------------------------------

          status,

          rejectionReason,

          verifiedAt,

          // -------------------------------------------
          // Correction
          // -------------------------------------------

          correctionRequired,

          correctionRequest,
        },

        progress: {
          completedSteps,

          totalSteps,

          percent:
            progressPercent,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "SELLER VERIFICATION STATUS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load seller verification status.",
      },
      {
        status: 500,
      },
    );
  }
}