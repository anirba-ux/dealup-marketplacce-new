import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

export async function GET(
  request: NextRequest,
) {
  try {
    const session =
      await auth();

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

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

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
      new Date() >
      verification.expiresAt
    ) {
      return NextResponse.json({
        success: true,

        status:
          "expired",
      });
    }

    return NextResponse.json({
      success: true,

      status:
        verification.status,

      mobileLocation:
        verification.mobileLocation ??
        null,

      verifiedAt:
        verification.verifiedAt ??
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