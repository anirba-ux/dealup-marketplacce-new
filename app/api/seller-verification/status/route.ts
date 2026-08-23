import {
  NextResponse,
} from "next/server";

import {
  ObjectId,
} from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";


// =====================================================
// GET — Current Seller Verification Status
//
// Source of truth:
// users.sellerVerification
// =====================================================

export async function GET() {
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

          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const userId =
      String(
        session.user.id,
      );

    // =================================================
    // Validate User ID
    // =================================================

    if (
      !ObjectId.isValid(
        userId,
      )
    ) {
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

    // =================================================
    // Find User
    // =================================================

    const user =
      await db
        .collection("users")
        .findOne({
          _id:
            new ObjectId(
              userId,
            ),
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
    // Seller Verification
    // =================================================

    const sellerVerification =
      user.sellerVerification ??
      {};

    // =================================================
    // Verification States
    // =================================================

    const phoneVerified =
      sellerVerification.phoneVerified ===
        true ||
      user.isPhoneVerified ===
        true;

    const identityVerified =
      sellerVerification.identityVerified ===
      true;

    const selfieVerified =
      sellerVerification.selfieVerified ===
      true;

    const locationVerified =
      sellerVerification.locationVerified ===
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
    // Response
    // =================================================

    return NextResponse.json({
      success: true,

      verification: {
        phoneVerified,

        identityVerified,

        selfieVerified,

        locationVerified,

        status:
          sellerVerification.status ??
          "unverified",

        rejectionReason:
          sellerVerification.rejectionReason ??
          null,

        verifiedAt:
          sellerVerification.verifiedAt ??
          null,
      },

      progress: {
        completedSteps,

        totalSteps,

        percent:
          progressPercent,
      },
    });
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