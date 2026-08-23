import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ObjectId,
} from "mongodb";

import {
  randomBytes,
} from "crypto";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

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

    const users =
      db.collection("users");

    const sessions =
      db.collection(
        "locationVerificationSessions",
      );

    // =================================================
    // Find Current User
    // =================================================

    const user =
      await users.findOne({
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
    // Permanent Seller Verification
    // =================================================

    const sellerVerification =
      user.sellerVerification ??
      {};

    const selfieVerified =
      sellerVerification.selfieVerified ===
      true;

    const locationVerified =
      sellerVerification.locationVerified ===
      true;

    // =================================================
    // ALREADY COMPLETED
    //
    // IMPORTANT:
    // Never create another QR/session.
    // =================================================

    if (
      selfieVerified &&
      locationVerified
    ) {
      return NextResponse.json({
        success: false,

        alreadyVerified: true,

        selfieVerified: true,

        locationVerified: true,

        message:
          "Your Live Selfie and mobile location have already been verified.",
      });
    }

    // =================================================
    // Check Existing Active Session
    //
    // Prevent duplicate pending sessions.
    // =================================================

    const existingSession =
      await sessions.findOne({
        userId,

        status: "pending",

        expiresAt: {
          $gt: new Date(),
        },
      });

    // =================================================
    // Reuse Existing Session
    // =================================================

    if (
      existingSession
    ) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        request.nextUrl.origin;

      const mobileUrl =
        `${baseUrl}/location/verify/${existingSession.token}`;

      return NextResponse.json({
        success: true,

        reused: true,

        token:
          existingSession.token,

        mobileUrl,

        expiresAt:
          existingSession.expiresAt,
      });
    }

    // =================================================
    // Generate Secure Token
    // =================================================

    const token =
      randomBytes(32).toString(
        "hex",
      );

    // =================================================
    // Session Expiry
    //
    // 5 minutes
    // =================================================

    const now =
      new Date();

    const expiresAt =
      new Date(
        now.getTime() +
          5 * 60 * 1000,
      );

    // =================================================
    // Create Verification Session
    // =================================================

    await sessions.insertOne({
      token,

      userId,

      status:
        "pending",

      // -----------------------------------------------
      // Selfie
      // -----------------------------------------------

      selfieVerified:
        false,

      selfieUrl:
        null,

      selfiePublicId:
        null,

      selfieVerifiedAt:
        null,

      // -----------------------------------------------
      // Location
      // -----------------------------------------------

      locationVerified:
        false,

      mobileLocation:
        null,

      locationVerifiedAt:
        null,

      // -----------------------------------------------
      // Session
      // -----------------------------------------------

      createdAt:
        now,

      updatedAt:
        now,

      expiresAt,

      verifiedAt:
        null,
    });

    // =================================================
    // Base URL
    // =================================================

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin;

    // =================================================
    // Mobile Verification URL
    // =================================================

    const mobileUrl =
      `${baseUrl}/location/verify/${token}`;

    // =================================================
    // Response
    // =================================================

    return NextResponse.json({
      success: true,

      reused: false,

      token,

      mobileUrl,

      expiresAt,
    });
  } catch (error) {
    console.error(
      "CREATE LOCATION VERIFICATION SESSION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to create verification session.",
      },
      {
        status: 500,
      },
    );
  }
}