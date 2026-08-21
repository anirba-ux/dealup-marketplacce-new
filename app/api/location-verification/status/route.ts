import {
  NextRequest,
  NextResponse,
} from "next/server";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

export async function GET(
  request: NextRequest,
) {
  try {
    // =================================================
    // Desktop User Authentication
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

    // =================================================
    // Find Session
    //
    // IMPORTANT:
    // Token MUST belong to the currently
    // logged-in desktop user.
    // =================================================

    const verification =
      await db
        .collection(
          "locationVerificationSessions",
        )
        .findOne({
          token,

          userId:
            String(
              session.user.id,
            ),
        });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Verification session not found or does not belong to this user.",
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
      return NextResponse.json({
        success: true,

        status:
          "expired",

        selfieVerified:
          verification.selfieVerified ===
          true,

        locationVerified:
          verification.locationVerified ===
          true,

        selfieUrl:
          verification.selfieUrl ??
          null,

        mobileLocation:
          verification.mobileLocation ??
          null,

        verifiedAt:
          verification.verifiedAt ??
          null,
      });
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
    // Response
    // =================================================

    return NextResponse.json({
      success: true,

      status:
        fullyVerified
          ? "verified"
          : verification.status ??
            "pending",

      selfieVerified,

      locationVerified,

      selfieUrl:
        verification.selfieUrl ??
        null,

      mobileLocation:
        verification.mobileLocation ??
        null,

      verifiedAt:
        verification.verifiedAt ??
        null,

      selfieVerifiedAt:
        verification.selfieVerifiedAt ??
        null,

      locationVerifiedAt:
        verification.locationVerifiedAt ??
        null,
    });
  } catch (error) {
    console.error(
      "LOCATION STATUS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to check verification status.",
      },
      {
        status: 500,
      },
    );
  }
}