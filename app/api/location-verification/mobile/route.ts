import {
  NextRequest,
  NextResponse,
} from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

export async function POST(
  request: NextRequest,
) {
  try {
    // =================================================
    // Mobile User Authentication
    // =================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please log in to the same DealUp account on this mobile device.",
        },
        {
          status: 401,
        },
      );
    }

    const mobileUserId = String(
      session.user.id,
    );

    // =================================================
    // Request Body
    // =================================================

    const body = await request.json();

    const token = String(
      body?.token ?? "",
    );

    const latitude = Number(
      body?.latitude,
    );

    const longitude = Number(
      body?.longitude,
    );

    const accuracy = Number(
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
    // GPS Quality
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
      db.collection("users");

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
    // Expiry
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
    // Session Seller ID
    // =================================================

    const sellerUserId = String(
      verification.userId ?? "",
    );

    if (
      !ObjectId.isValid(
        sellerUserId,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid verification session owner.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // IMPORTANT SECURITY CHECK
    //
    // QR session belongs to the desktop seller.
    // Mobile must be logged into the SAME account.
    // =================================================

    if (
      mobileUserId !==
      sellerUserId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This verification session belongs to another DealUp account.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Prevent Completed Session
    // =================================================

    if (
      verification.status ===
      "verified"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This verification session has already been completed.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Seller Exists
    // =================================================

    const seller =
      await users.findOne({
        _id:
          new ObjectId(
            sellerUserId,
          ),
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
    // Timestamp
    // =================================================

    const now =
      new Date();

    // =================================================
    // Mobile Location
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
    // Selfie State
    // =================================================

    const selfieAlreadyVerified =
      verification.selfieVerified ===
      true;

    const finalStatus =
      selfieAlreadyVerified
        ? "verified"
        : "pending";

    // =================================================
    // Update Verification Session
    // =================================================

    const sessionResult =
      await sessions.updateOne(
        {
          _id:
            verification._id,

          userId:
            sellerUserId,

          status:
            "pending",

          locationVerified:
            false,
        },
        {
          $set: {
            mobileLocation,

            locationVerified:
              true,

            locationVerifiedAt:
              now,

            updatedAt:
              now,

            status:
              finalStatus,

            ...(finalStatus ===
            "verified"
              ? {
                  verifiedAt:
                    now,
                }
              : {}),
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
    // Update Seller Verification
    //
    // Admin still controls overall status.
    // =================================================

    const sellerResult =
      await users.updateOne(
        {
          _id:
            new ObjectId(
              sellerUserId,
            ),
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

    if (
      sellerResult.matchedCount ===
      0
    ) {
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
          finalStatus,

        message:
          selfieAlreadyVerified
            ? "Mobile location verified. Seller verification data is now complete."
            : "Mobile location verified successfully.",

        location: {
          latitude,

          longitude,

          accuracy,
        },

        verification: {
          selfieVerified:
            selfieAlreadyVerified,

          locationVerified:
            true,

          status:
            finalStatus,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
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