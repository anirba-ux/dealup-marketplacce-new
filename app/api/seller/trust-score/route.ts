import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  refreshSellerTrustScore,
} from "@/lib/repositories/seller.repository";

// =====================================================
// GET — Seller Trust Score + Badge
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

    const sellerId =
      session.user.id;

    // =================================================
    // Calculate + Save Trust Score
    //
    // The repository now performs:
    //
    // - Verification checks
    // - Behaviour analysis
    // - Duplicate image detection
    // - Repeated listing detection
    // - Price change detection
    // - Abnormal price detection
    // - Location change detection
    // - Suspicious activity detection
    // - Trust score calculation
    // - Verified Seller eligibility
    // - Trusted Seller eligibility
    // =================================================

    const result =
      await refreshSellerTrustScore(
        sellerId,
      );

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        sellerId:

          result.sellerId,

        trust: {
          // -------------------------------------------
          // Score
          // -------------------------------------------

          score:
            result.trustScore,

          level:
            result.trustLevel,

          // -------------------------------------------
          // Risk
          // -------------------------------------------

          riskScore:
            result.riskScore,

          seriousRisk:
            result.seriousRisk,

          // -------------------------------------------
          // Seller Badges
          // -------------------------------------------

          verifiedSeller:
            result.verifiedSeller,

          trustedSeller:
            result.trustedSeller,

          badge: {
            type:
              result.sellerBadge,

            label:
              result.sellerBadgeLabel,

            eligible:
              result.badgeEligible,

            reasons:
              result.badgeReasons,
          },

          // -------------------------------------------
          // Verification
          // -------------------------------------------

          verificationStatus:
            result.verificationStatus,

          phoneVerified:
            result.phoneVerified,

          selfieVerified:
            result.selfieVerified,

          identityVerified:
            result.identityVerified,

          locationVerified:
            result.locationVerified,

          // -------------------------------------------
          // Seller Activity
          // -------------------------------------------

          accountAgeDays:
            result.accountAgeDays,

          successfulListings:
            result.successfulListings,

          completedSales:
            result.completedSales,

          activeProducts:
            result.activeProducts,

          totalProducts:
            result.totalProducts,

          // -------------------------------------------
          // Product Risk
          // -------------------------------------------

          productRiskScores:
            result.productRiskScores,

          // -------------------------------------------
          // Behaviour Signals
          // -------------------------------------------

          signals:
            result.trustSignals,

          // -------------------------------------------
          // Penalties
          // -------------------------------------------

          penalties:
            result.penalties,

          // -------------------------------------------
          // Timestamp
          // -------------------------------------------

          calculatedAt:
            result.calculatedAt,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "SELLER TRUST SCORE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to calculate seller trust score.",
      },
      {
        status: 500,
      },
    );
  }
}