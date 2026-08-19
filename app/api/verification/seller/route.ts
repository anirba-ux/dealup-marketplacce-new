import { NextRequest, NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

// =====================================================
// POST — Submit Seller Verification
// =====================================================

export async function POST(
  request: NextRequest,
) {
  try {
    // =================================================
    // Authentication
    // =================================================

    const session =
      await auth();

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
    // User ID
    // =================================================

    const userId =
      String(session.user.id);

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        {
          status: 400,
        },
      );
    }

    const userObjectId =
      new ObjectId(userId);

    // =================================================
    // Request Body
    // =================================================

    const body =
      await request.json();

    const imageUrl =
      body?.imageUrl;

    const publicId =
      body?.publicId;

    // =================================================
    // Validate Live Selfie
    // =================================================

    if (
      typeof imageUrl !== "string" ||
      !imageUrl.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Live selfie image URL is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof publicId !== "string" ||
      !publicId.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Live selfie public ID is required.",
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
    // Find User
    // =================================================

    const user =
      await users.findOne({
        _id: userObjectId,
      });

    if (!user) {
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
    // Phone Verification Required
    // =================================================

    const phoneVerified =
      user.isPhoneVerified === true ||
      user.sellerVerification
        ?.phoneVerified === true;

    if (!phoneVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify your phone number before applying for Seller Verification.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Existing Seller Verification
    // =================================================

    const currentVerification =
      user.sellerVerification ?? {};

    const currentStatus =
      currentVerification.status ??
      "unverified";

    // =================================================
    // Already Pending
    // =================================================

    if (
      currentStatus ===
      "pending"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your Seller Verification request is already under review.",
        },
        {
          status: 409,
        },
      );
    }

    // =================================================
    // Already Verified
    // =================================================

    if (
      currentStatus ===
        "verified" &&
      currentVerification
        .identityVerified === true &&
      currentVerification
        .locationVerified === true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your seller account is already verified.",
        },
        {
          status: 409,
        },
      );
    }

    // =================================================
    // Prevent Re-application While Suspended
    // =================================================

    if (
      currentStatus ===
      "suspended"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your Seller Verification is currently suspended. Please contact support.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Submit Verification
    // =================================================

    const submittedAt =
      new Date();

    const sellerVerification = {
      ...currentVerification,

      // =================================================
      // Verification Status
      // =================================================

      status:
        "pending",

      // =================================================
      // Phone
      // =================================================

      phoneVerified:
        true,

      // =================================================
      // Identity
      //
      // Admin will verify this later.
      // =================================================

      identityVerified:
        false,

      // =================================================
      // Location
      //
      // Admin will verify this later.
      // =================================================

      locationVerified:
        currentVerification
          .locationVerified === true,

      // =================================================
      // Live Selfie
      // =================================================

      liveSelfie: {
        imageUrl:
          imageUrl.trim(),

        publicId:
          publicId.trim(),

        capturedAt:
          submittedAt,
      },

      // =================================================
      // Application Dates
      // =================================================

      submittedAt,

      verifiedAt:
        null,

      rejectionReason:
        null,

      // =================================================
      // Suspension Data
      // =================================================

      suspendedAt:
        null,

      suspensionReason:
        null,
    };

    // =================================================
    // Update User
    // =================================================

    const result =
      await users.updateOne(
        {
          _id:
            userObjectId,
        },
        {
          $set: {
            sellerVerification,

            updatedAt:
              submittedAt,
          },
        },
      );

    // =================================================
    // Verify Database Update
    // =================================================

    if (
      result.matchedCount ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User account could not be updated.",
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
          "Seller Verification request submitted successfully.",

        status:
          "pending",

        verification: {
          phoneVerified:
            true,

          identityVerified:
            false,

          locationVerified:
            sellerVerification
              .locationVerified,

          status:
            "pending",

          submittedAt,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    // =================================================
    // Error
    // =================================================

    console.error(
      "SELLER VERIFICATION SUBMIT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to submit Seller Verification.",
      },
      {
        status: 500,
      },
    );
  }
}