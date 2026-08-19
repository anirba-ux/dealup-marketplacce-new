import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Types
// =====================================================

type VerificationAction =
  | "approve"
  | "reject"
  | "suspend";

interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

// =====================================================
// PATCH
//
// Final Seller Verification
//
// APPROVE:
// Phone + Identity + Location must all be verified.
//
// REJECT:
// Seller verification rejected.
//
// SUSPEND:
// Seller verification suspended.
// =====================================================

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // =================================================
    // Authentication
    // =================================================

    const session = await auth();

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
    // Admin Authorization
    // =================================================

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Params
    // =================================================

    const { userId } =
      await context.params;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid seller ID.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Request Body
    // =================================================

    const body =
      await request.json();

    const action =
      String(
        body?.action ?? "",
      ) as VerificationAction;

    const reason =
      typeof body?.reason === "string"
        ? body.reason.trim()
        : "";

    // =================================================
    // Validate Action
    // =================================================

    const allowedActions: VerificationAction[] =
      [
        "approve",
        "reject",
        "suspend",
      ];

    if (
      !allowedActions.includes(
        action,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid verification action.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Validate Reason
    // =================================================

    if (
      (action === "reject" ||
        action === "suspend") &&
      !reason
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A reason is required for rejection or suspension.",
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

    const usersCollection =
      db.collection("users");

    // =================================================
    // Find Seller
    // =================================================

    const seller =
      await usersCollection.findOne(
        {
          _id:
            new ObjectId(
              userId,
            ),
        },
      );

    if (!seller) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seller not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Prevent Admin Self Verification
    // =================================================

    if (
      String(session.user.id) ===
      userId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot change your own seller verification.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Current Verification
    // =================================================

    const verification =
      seller.sellerVerification ?? {
        status: "unverified",

        phoneVerified:
          seller.isPhoneVerified ??
          false,

        identityVerified:
          false,

        locationVerified:
          false,
      };

    // =================================================
    // Verification Checks
    // =================================================

    const phoneVerified =
      Boolean(
        verification.phoneVerified ??
          seller.isPhoneVerified ??
          false,
      );

    const identityVerified =
      Boolean(
        verification.identityVerified,
      );

    const locationVerified =
      Boolean(
        verification.locationVerified,
      );

    // =================================================
    // Current Time
    // =================================================

    const now =
      new Date();

    // =================================================
    // APPROVE
    //
    // IMPORTANT:
    //
    // Seller can ONLY become fully verified when:
    //
    // 1. Phone verified
    // 2. Aadhaar identity verified
    // 3. Location verified
    //
    // Product selling alone is NOT enough.
    // isVerified is NOT used here.
    // =================================================

    if (
      action === "approve"
    ) {
      // =================================================
      // Check Phone
      // =================================================

      if (!phoneVerified) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller phone verification is not complete.",

            verification: {
              phoneVerified,

              identityVerified,

              locationVerified,
            },
          },
          {
            status: 400,
          },
        );
      }

      // =================================================
      // Check Identity
      // =================================================

      if (!identityVerified) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller Aadhaar identity verification is not complete.",

            verification: {
              phoneVerified,

              identityVerified,

              locationVerified,
            },
          },
          {
            status: 400,
          },
        );
      }

      // =================================================
      // Check Location
      // =================================================

      if (!locationVerified) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller location verification is not complete.",

            verification: {
              phoneVerified,

              identityVerified,

              locationVerified,
            },
          },
          {
            status: 400,
          },
        );
      }

      // =================================================
      // ALL THREE VERIFIED
      // =================================================

      const result =
        await usersCollection.updateOne(
          {
            _id:
              new ObjectId(
                userId,
              ),
        },
          {
            $set: {
              "sellerVerification.status":
                "verified",

              "sellerVerification.verifiedAt":
                now,

              "sellerVerification.rejectionReason":
                null,

              "sellerVerification.suspendedAt":
                null,

              "sellerVerification.suspensionReason":
                null,

              updatedAt:
                now,
            },
          },
        );

      if (
        result.modifiedCount ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller verification was not updated.",
          },
          {
            status: 400,
          },
        );
      }

      // =================================================
      // Success
      // =================================================

      return NextResponse.json({
        success: true,

        action: "approve",

        status: "verified",

        verification: {
          phoneVerified,

          identityVerified,

          locationVerified,
        },

        message:
          "Seller has been fully verified successfully.",
      });
    }

    // =================================================
    // REJECT
    // =================================================

    if (
      action === "reject"
    ) {
      const result =
        await usersCollection.updateOne(
          {
            _id:
              new ObjectId(
                userId,
              ),
          },
          {
            $set: {
              "sellerVerification.status":
                "rejected",

              "sellerVerification.rejectionReason":
                reason,

              "sellerVerification.verifiedAt":
                null,

              "sellerVerification.suspendedAt":
                null,

              "sellerVerification.suspensionReason":
                null,

              updatedAt:
                now,
            },
          },
        );

      if (
        result.modifiedCount ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller verification was not updated.",
          },
          {
            status: 400,
          },
        );
      }

      return NextResponse.json({
        success: true,

        action: "reject",

        status: "rejected",

        message:
          "Seller verification rejected successfully.",
      });
    }

    // =================================================
    // SUSPEND
    // =================================================

    if (
      action === "suspend"
    ) {
      const result =
        await usersCollection.updateOne(
          {
            _id:
              new ObjectId(
                userId,
              ),
          },
          {
            $set: {
              "sellerVerification.status":
                "suspended",

              "sellerVerification.suspendedAt":
                now,

              "sellerVerification.suspensionReason":
                reason,

              "sellerVerification.verifiedAt":
                null,

              updatedAt:
                now,
            },
          },
        );

      if (
        result.modifiedCount ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Seller verification was not updated.",
          },
          {
            status: 400,
          },
        );
      }

      return NextResponse.json({
        success: true,

        action: "suspend",

        status: "suspended",

        message:
          "Seller has been suspended successfully.",
      });
    }

    // =================================================
    // Fallback
    // =================================================

    return NextResponse.json(
      {
        success: false,

        message:
          "Invalid action.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "ADMIN SELLER VERIFICATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to update seller verification.",
      },
      {
        status: 500,
      },
    );
  }
}