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


// =====================================================
// POST — Create Mobile Direct Verification Session
//
// Used when the seller is already using DealUp
// directly on a mobile device.
//
// No QR code is required.
//
// IMPORTANT:
// A user who has already completed both
// selfie + location verification cannot create
// another verification session.
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

          message:
            "Please log in before starting verification.",
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
      db.collection(
        "users",
      );


    const sessions =
      db.collection(
        "locationVerificationSessions",
      );


    // =================================================
    // Find User
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
    // ALREADY VERIFIED
    //
    // IMPORTANT:
    // Never create another mobile session.
    // =================================================

    if (
      selfieVerified &&
      locationVerified
    ) {

      return NextResponse.json(
        {
          success: false,

          alreadyVerified: true,

          selfieVerified: true,

          locationVerified: true,

          message:
            "Your Live Selfie and mobile location have already been verified.",
        },
        {
          status: 200,
        },
      );

    }


    // =================================================
    // Check Existing Active Session
    //
    // Prevent multiple pending sessions.
    // =================================================

    const existingSession =
      await sessions.findOne({
        userId,

        status:
          "pending",

        expiresAt: {
          $gt:
            new Date(),
        },
      });


    // =================================================
    // Reuse Existing Active Session
    // =================================================

    if (
      existingSession
    ) {

      return NextResponse.json(
        {
          success: true,

          mode:
            "mobile",

          token:
            existingSession.token,

          expiresAt:
            existingSession.expiresAt,

          reused: true,
        },
        {
          status: 200,
        },
      );

    }


    // =================================================
    // Generate Secure Token
    // =================================================

    const token =
      randomBytes(
        32,
      ).toString(
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
          5 *
            60 *
            1000,
      );


    // =================================================
    // Create Session
    // =================================================

    await sessions.insertOne({

      token,

      userId,

      mode:
        "mobile",

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
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        mode:
          "mobile",

        token,

        expiresAt,

        reused: false,
      },
      {
        status: 200,
      },
    );


  } catch (error) {

    console.error(
      "CREATE MOBILE VERIFICATION SESSION ERROR:",
      error,
    );


    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to create mobile verification session.",
      },
      {
        status: 500,
      },
    );

  }
}


// =====================================================
// GET — Validate Mobile Verification Session
//
// Used by the mobile verification page after:
// - QR scan
// - Direct mobile verification
// =====================================================

export async function GET(
  request: NextRequest,
) {
  try {

    // =================================================
    // Mobile Authentication
    // =================================================

    const session =
      await auth();


    if (!session?.user?.id) {

      return NextResponse.json(
        {
          success: false,

          valid: false,

          authenticated: false,

          message:
            "Please log in to the same DealUp account on this mobile device.",
        },
        {
          status: 401,
        },
      );

    }


    const mobileUserId =
      String(
        session.user.id,
      );


    // =================================================
    // Token
    // =================================================

    const token =
      request.nextUrl.searchParams.get(
        "token",
      );


    if (!token) {

      return NextResponse.json(
        {
          success: false,

          valid: false,

          authenticated: true,

          message:
            "Verification token is required.",
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

          valid: false,

          authenticated: true,

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
          success: true,

          valid: false,

          authenticated: true,

          status:
            "expired",

          message:
            "This verification session has expired.",
        },
        {
          status: 410,
        },
      );

    }


    // =================================================
    // Verification Owner
    // =================================================

    const verificationUserId =
      String(
        verification.userId ??
          "",
      );


    // =================================================
    // SAME USER SECURITY CHECK
    // =================================================

    if (
      !verificationUserId ||
      mobileUserId !==
        verificationUserId
    ) {

      return NextResponse.json(
        {
          success: false,

          valid: false,

          authenticated: true,

          message:
            "This verification session belongs to another DealUp account.",
        },
        {
          status: 403,
        },
      );

    }


    // =================================================
    // Verification State
    // =================================================

    const selfieVerified =
      verification.selfieVerified ===
      true;


    const locationVerified =
      verification.locationVerified ===
      true;


    const fullyVerified =
      selfieVerified &&
      locationVerified;


    // =================================================
    // Session Status
    // =================================================

    const status =
      fullyVerified
        ? "verified"
        : "pending";


    // =================================================
    // Response
    //
    // Never expose private user information.
    // =================================================

    return NextResponse.json(
      {
        success: true,

        valid: true,

        authenticated: true,

        mode:
          verification.mode ??
          "desktop-mobile",

        status,

        selfieVerified,

        locationVerified,

        expiresAt:
          verification.expiresAt,

        verifiedAt:
          verification.verifiedAt ??
          null,
      },
      {
        status: 200,
      },
    );


  } catch (error) {

    console.error(
      "MOBILE SESSION VALIDATION ERROR:",
      error,
    );


    return NextResponse.json(
      {
        success: false,

        valid: false,

        authenticated: false,

        message:
          "Unable to validate verification session.",
      },
      {
        status: 500,
      },
    );

  }
}