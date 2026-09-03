import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  getPremiumSellerStatus,
} from "@/lib/repositories/premium.repository";

// =====================================================
// GET — Premium Seller Status
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
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // =================================================
    // Seller ID
    // =================================================

    const userId =
      String(
        session.user.id,
      );

    // =================================================
    // Get Premium Status
    // =================================================

    const premiumSeller =
      await getPremiumSellerStatus(
        userId,
      );

    // =================================================
    // User Not Found
    // =================================================

    if (!premiumSeller) {
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
    // Remaining Days
    // =================================================

    let remainingDays = 0;

    if (
      premiumSeller.active &&
      premiumSeller.expiresAt
    ) {
      const difference =
        premiumSeller.expiresAt.getTime() -
        Date.now();

      if (difference > 0) {
        remainingDays =
          Math.ceil(
            difference /
              (1000 *
                60 *
                60 *
                24),
          );
      }
    }

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        premiumSeller: {
          ...premiumSeller,

          remainingDays,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PREMIUM STATUS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load Premium Seller status.",
      },
      {
        status: 500,
      },
    );
  }
}