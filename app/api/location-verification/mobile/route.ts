import {
  NextRequest,
  NextResponse,
} from "next/server";

import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

export async function POST(
  request: NextRequest,
) {
  try {
    // =================================================
    // Read Request Body
    // =================================================

    const body =
      await request.json();

    const token =
      String(
        body?.token ?? "",
      );

    const latitude =
      Number(
        body?.latitude,
      );

    const longitude =
      Number(
        body?.longitude,
      );

    const accuracy =
      Number(
        body?.accuracy,
      );

    // =================================================
    // Validate Token
    // =================================================

    if (!token) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Verification token is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Validate Latitude
    // =================================================

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid latitude.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Validate Longitude
    // =================================================

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid longitude.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Validate GPS Accuracy
    // =================================================

    if (
      !Number.isFinite(accuracy) ||
      accuracy <= 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid GPS accuracy.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Minimum GPS Quality
    // =================================================

    if (accuracy > 200) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Mobile GPS accuracy is not sufficient. Please enable precise location and try again.",

          accuracy,
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

    const sessions =
      db.collection(
        "locationVerificationSessions",
      );

    const users =
      db.collection(
        "users",
      );

    // =================================================
    // Find Verification Session
    // =================================================

    const verification =
      await sessions.findOne({
        token,
      });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Verification session not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Check Expiry
    // =================================================

    if (
      !verification.expiresAt ||
      new Date() >
        new Date(
          verification.expiresAt,
        )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Verification session has expired.",
        },
        {
          status: 410,
        },
      );
    }

    // =================================================
    // Prevent Reusing Verified Session
    // =================================================

    if (
      verification.status ===
      "verified"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This location verification session has already been completed.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Seller User ID
    // =================================================

    const sellerUserId =
      String(
        verification.userId ?? "",
      );

    if (
      !ObjectId.isValid(
        sellerUserId,
      )
    ) {
      console.error(
        "INVALID SELLER USER ID IN LOCATION SESSION:",
        sellerUserId,
      );

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

    const sellerObjectId =
      new ObjectId(
        sellerUserId,
      );

    // =================================================
    // Find Seller
    // =================================================

    const seller =
      await users.findOne({
        _id: sellerObjectId,
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
    // Current Verification
    // =================================================

    const currentVerification =
      seller.sellerVerification ??
      {};

    // =================================================
    // Timestamp
    // =================================================

    const now =
      new Date();

    // =================================================
    // Mobile Location Data
    // =================================================

    const mobileLocation = {
      latitude,

      longitude,

      accuracy,

      method:
        "mobile-gps",

      capturedAt:
        now,
    };

    // =================================================
    // 1. Update Verification Session
    // =================================================

    const sessionResult =
      await sessions.updateOne(
        {
          _id:
            verification._id,

          status:
            "pending",
        },

        {
          $set: {
            status:
              "verified",

            mobileLocation,

            verifiedAt:
              now,

            updatedAt:
              now,
          },
        },
      );

    if (
      sessionResult.modifiedCount ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Location verification session could not be completed.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // 2. Update Seller Verification
    //
    // IMPORTANT:
    //
    // We DO NOT change:
    //
    // sellerVerification.status
    //
    // because Admin approval controls
    // the overall seller verification status.
    //
    // We only mark LOCATION as verified.
    // =================================================

    const sellerResult =
      await users.updateOne(
        {
          _id:
            sellerObjectId,
        },

        {
          $set: {
            "sellerVerification.locationVerified":
              true,

            "sellerVerification.locationVerifiedAt":
              now,

            "sellerVerification.locationVerificationMethod":
              "mobile-gps",

            "sellerVerification.locationVerificationAccuracy":
              accuracy,

            updatedAt:
              now,
          },
        },
      );

    // =================================================
    // Seller Update Failed
    // =================================================

    if (
      sellerResult.matchedCount ===
      0
    ) {
      console.error(
        "SELLER LOCATION VERIFICATION UPDATE FAILED:",
        sellerUserId,
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "Location was captured but seller verification could not be updated.",
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

        status:
          "verified",

        message:
          "Mobile location verified successfully.",

        location: {
          latitude,

          longitude,

          accuracy,
        },

        sellerVerification: {
          locationVerified:
            true,

          locationVerifiedAt:
            now,
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
      "MOBILE LOCATION VERIFICATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Mobile location verification failed.",
      },
      {
        status: 500,
      },
    );
  }
}