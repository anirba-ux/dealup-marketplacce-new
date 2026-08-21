import {
  NextRequest,
  NextResponse,
} from "next/server";

import { randomBytes } from "crypto";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

export async function POST(
  request: NextRequest,
) {
  try {
    // =================================================
    // Authenticated Desktop / Mobile User
    // =================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
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
    // Generate Secure Token
    // =================================================

    const token = randomBytes(32).toString(
      "hex",
    );

    // =================================================
    // Database
    // =================================================

    const client = await clientPromise;

    const db = client.db("dealup");

    const now = new Date();

    // =================================================
    // Session expires after 5 minutes
    // =================================================

    const expiresAt = new Date(
      now.getTime() + 5 * 60 * 1000,
    );

    // =================================================
    // Create Verification Session
    // =================================================

    await db
      .collection(
        "locationVerificationSessions",
      )
      .insertOne({
        token,

        userId,

        status: "pending",

        // ---------------------------------------------
        // Selfie
        // ---------------------------------------------

        selfieVerified: false,

        selfieUrl: null,

        selfiePublicId: null,

        selfieVerifiedAt: null,

        // ---------------------------------------------
        // Mobile Location
        // ---------------------------------------------

        locationVerified: false,

        mobileLocation: null,

        locationVerifiedAt: null,

        // ---------------------------------------------
        // Session
        // ---------------------------------------------

        createdAt: now,

        updatedAt: now,

        expiresAt,

        verifiedAt: null,
      });

    // =================================================
    // Base URL
    // =================================================
    //
    // Production:
    //
    // NEXT_PUBLIC_APP_URL=
    // https://dealup-marketplacce-new.vercel.app
    //
    // Local fallback:
    //
    // request.nextUrl.origin
    //
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