import {
  NextRequest,
  NextResponse,
} from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

// =====================================================
// POST — Resolve Seller Verification Correction
//
// Seller submits a corrected verification.
//
// IMPORTANT:
//
// Only the requested correction is resolved.
//
// Example:
//
// Location correction
// → locationVerified = true
//
// Selfie correction
// → selfieVerified = true
//
// Identity correction
// → identityVerified = true
//
// Other verification states are NOT reset.
//
// After correction:
// sellerVerification.status = "pending"
//
// Admin can review again.
// =====================================================

type CorrectionType =
  | "identity"
  | "selfie"
  | "location"
  | "multiple";

export async function POST(
  request: NextRequest,
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

    const sellerId =
      String(session.user.id);

    // =================================================
    // Validate Seller ID
    // =================================================

    if (
      !ObjectId.isValid(sellerId)
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
    // Request Body
    // =================================================

    let body: any = {};

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const submittedType =
      typeof body?.type === "string"
        ? body.type
        : "";

    // =================================================
    // Database
    // =================================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const usersCollection =
      db.collection("users");

    // =================================================
    // Find Seller
    // =================================================

    const seller =
      await usersCollection.findOne({
        _id: new ObjectId(sellerId),
      });

    if (!seller) {
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
    // Seller Verification
    // =================================================

    const sellerVerification =
      seller.sellerVerification ?? {};

    // =================================================
    // Correction Request
    // =================================================

    const correctionRequest =
      sellerVerification.correctionRequest;

    if (!correctionRequest) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No verification correction request exists.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Check Active Correction
    // =================================================

    if (
      correctionRequest.required !==
      true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "There is no active verification correction request.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      correctionRequest.resolved ===
      true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This verification correction has already been resolved.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Correction Type
    // =================================================

    const correctionType =
      correctionRequest.type as
        | CorrectionType
        | undefined;

    const allowedTypes: CorrectionType[] =
      [
        "identity",
        "selfie",
        "location",
        "multiple",
      ];

    if (
      !correctionType ||
      !allowedTypes.includes(
        correctionType,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid correction request type.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Optional Type Safety
    //
    // If the client sends a type,
    // it must match the admin request.
    // =================================================

    if (
      submittedType &&
      submittedType !==
        correctionType
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Correction type does not match the active admin request.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Timestamp
    // =================================================

    const now = new Date();

    // =================================================
    // Build Update
    // =================================================

    const setFields: Record<
      string,
      unknown
    > = {
      "sellerVerification.status":
        "pending",

      "sellerVerification.correctionRequest.required":
        false,

      "sellerVerification.correctionRequest.resolved":
        true,

      "sellerVerification.correctionRequest.resolvedAt":
        now,

      "sellerVerification.correctionRequest.sellerViewed":
        true,

      "sellerVerification.correctionRequest.sellerViewedAt":
        correctionRequest.sellerViewedAt ??
        now,

      updatedAt: now,
    };

    // =================================================
    // IMPORTANT
    //
    // We do NOT automatically mark a verification
    // as verified merely because the seller calls
    // this endpoint.
    //
    // The actual verification endpoint must first
    // update the corresponding verification field.
    //
    // This endpoint only resolves the correction
    // AFTER the requested verification is complete.
    // =================================================

    // =================================================
    // Validate Corrected Verification
    // =================================================

    if (
      correctionType ===
      "location"
    ) {
      if (
        sellerVerification.locationVerified !==
        true
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Location verification must be completed before resolving this correction.",
          },
          {
            status: 400,
          },
        );
      }
    }

    if (
      correctionType ===
      "selfie"
    ) {
      if (
        sellerVerification.selfieVerified !==
        true
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Live selfie verification must be completed before resolving this correction.",
          },
          {
            status: 400,
          },
        );
      }
    }

    if (
      correctionType ===
      "identity"
    ) {
      if (
        sellerVerification.identityVerified !==
        true
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Identity verification must be completed before resolving this correction.",
          },
          {
            status: 400,
          },
        );
      }
    }

    // =================================================
    // Multiple Corrections
    //
    // For multiple, all four verification checks
    // must currently be completed.
    // =================================================

    if (
      correctionType ===
      "multiple"
    ) {
      const allVerified =
        sellerVerification.phoneVerified ===
          true &&
        sellerVerification.identityVerified ===
          true &&
        sellerVerification.selfieVerified ===
          true &&
        sellerVerification.locationVerified ===
          true;

      if (!allVerified) {
        return NextResponse.json(
          {
            success: false,
            message:
              "All required verification checks must be completed before resolving this correction.",
          },
          {
            status: 400,
          },
        );
      }
    }

    // =================================================
    // Update Seller
    //
    // IMPORTANT:
    // Only correction state changes here.
    //
    // Existing verification fields remain untouched.
    // =================================================

    const result =
      await usersCollection.updateOne(
        {
          _id: new ObjectId(
            sellerId,
          ),

          "sellerVerification.correctionRequest.required":
            true,

          "sellerVerification.correctionRequest.resolved":
            false,
        },
        {
          $set: setFields,
        },
      );

    // =================================================
    // Database Safety Check
    // =================================================

    if (
      result.matchedCount ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Correction request changed before it could be resolved. Please refresh and try again.",
        },
        {
          status: 409,
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
          "Verification correction completed and submitted for admin review.",

        verification: {
          status: "pending",

          correctionResolved:
            true,

          correctionType,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "VERIFICATION CORRECTION RESOLVE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to resolve verification correction.",
      },
      {
        status: 500,
      },
    );
  }
}