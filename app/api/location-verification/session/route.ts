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
    // Desktop Seller Authentication
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

    // =================================================
    // Generate Secure Token
    // =================================================

    const token =
      randomBytes(32).toString(
        "hex",
      );

    // =================================================
    // Database
    // =================================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const now =
      new Date();

    // =================================================
    // Session expires after 5 minutes
    // =================================================

    const expiresAt =
      new Date(
        now.getTime() +
          5 * 60 * 1000,
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

        userId:
          String(
            session.user.id,
          ),

        status:
          "pending",

        createdAt:
          now,

        updatedAt:
          now,

        expiresAt,

        mobileLocation:
          null,

        desktopLocation:
          null,

        verifiedAt:
          null,
      });

    // =================================================
    // Base URL
    // =================================================
    //
    // Local development:
    //
    // NEXT_PUBLIC_APP_URL=
    // http://192.168.31.79:3000
    //
    // Production:
    //
    // NEXT_PUBLIC_APP_URL=
    // https://your-domain.com
    //
    // =================================================

    const baseUrl =
      process.env
        .NEXT_PUBLIC_APP_URL ||
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
      "CREATE LOCATION SESSION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to create location verification session.",
      },
      {
        status: 500,
      },
    );
  }
}