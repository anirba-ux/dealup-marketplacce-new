import { NextResponse } from "next/server";

import { auth } from "@/auth";

import { refreshSellerTrustScore } from "@/lib/repositories/seller.repository";

import { getSellerBadge } from "@/lib/risk/sellerTrust";

// =====================================================
// GET — Seller Trust Score + Badge
// =====================================================

export async function GET() {
  try {
    // =================================================
    // Authentication
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

    // =================================================
    // Seller ID
    // =================================================

    const sellerId = session.user.id;

    // =================================================
    // Calculate + Save Trust Score
    // =================================================

    const result = await refreshSellerTrustScore(sellerId);

    // =================================================
    // Serious Bad History
    //
    // This will be connected to the
    // reports/bad-history system later.
    //
    // For now we do NOT assume that
    // the seller has bad history.
    // =================================================

    const hasSeriousBadHistory = false;

    // =================================================
    // Calculate Seller Badge
    // =================================================

    const badge = getSellerBadge({
      verificationStatus: result.verificationStatus,

      phoneVerified: result.phoneVerified,

      identityVerified: result.identityVerified,

      locationVerified: result.locationVerified,

      trustScore: result.trustScore,

      trustLevel: result.trustLevel,

      hasSeriousBadHistory,
    });

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        trust: {
          score: result.trustScore,

          level: result.trustLevel,

          phoneVerified: result.phoneVerified,

          verificationStatus: result.verificationStatus,

          identityVerified: result.identityVerified,

          locationVerified: result.locationVerified,

          activeProducts: result.activeProducts,

          totalProducts: result.totalProducts,

          badge,

          calculatedAt: result.calculatedAt,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("SELLER TRUST SCORE ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Failed to calculate seller trust score.",
      },
      {
        status: 500,
      },
    );
  }
}
