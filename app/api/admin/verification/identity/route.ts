import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ObjectId,
} from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Types
// =====================================================

type IdentityReviewAction =
  | "approve"
  | "reject";

// =====================================================
// PATCH
//
// Admin approves/rejects Aadhaar identity verification.
//
// VERIFIED SELLER REQUIREMENTS:
//
// 1. Phone verified
// 2. Identity verified
// 3. Live selfie verified
// 4. Location verified
//
// Identity approval alone does NOT automatically make
// the seller verified.
//
// Seller becomes "verified" ONLY when all four checks
// are completed.
// =====================================================

export async function PATCH(
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
            "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // =================================================
    // Admin Authorization
    // =================================================

    if (
      session.user.role !==
      "admin"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Administrator access required.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Request Body
    // =================================================

    const body =
      await request.json();

    const submissionId =
      typeof body?.submissionId ===
      "string"
        ? body.submissionId.trim()
        : "";

    const action =
      typeof body?.action ===
      "string"
        ? body.action.trim()
        : "";

    const reason =
      typeof body?.reason ===
      "string"
        ? body.reason.trim()
        : "";

    // =================================================
    // Validate Submission ID
    // =================================================

    if (!submissionId) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Identity submission ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Validate Action
    // =================================================

    if (
      action !== "approve" &&
      action !== "reject"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid identity review action.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Reject Requires Reason
    // =================================================

    if (
      action === "reject" &&
      !reason
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "A rejection reason is required.",
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

    const submissions =
      db.collection(
        "identityVerificationSubmissions",
      );

    const users =
      db.collection(
        "users",
      );

    // =================================================
    // Find Identity Submission
    // =================================================

    const submission =
      await submissions.findOne({
        submissionId,
      });

    if (!submission) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Identity submission not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Seller User ID
    // =================================================

    const sellerUserId =
      String(
        submission.userId ??
          "",
      );

    if (
      !ObjectId.isValid(
        sellerUserId,
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid seller account.",
        },
        {
          status: 400,
        },
      );
    }

    const sellerObjectId =
      new ObjectId(
        sellerUserId,
      );

    // =================================================
    // Already Reviewed
    // =================================================

    if (
      submission.reviewStatus ===
      "approved"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This identity submission has already been approved.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      submission.reviewStatus ===
      "rejected"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This identity submission has already been rejected.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Only Pending Submission Can Be Reviewed
    // =================================================

    if (
      submission.reviewStatus !==
      "pending"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This identity submission is not awaiting review.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Find Seller
    // =================================================

    const seller =
      await users.findOne({
        _id:
          sellerObjectId,
      });

    if (!seller) {
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
    // Prevent Admin Self Review
    // =================================================

    if (
      String(
        session.user.id,
      ) === sellerUserId
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "You cannot review your own identity verification.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Current Time
    // =================================================

    const now =
      new Date();

    // =================================================
    // APPROVE IDENTITY
    // =================================================

    if (
      action === "approve"
    ) {
      // ===============================================
      // Update Identity Submission
      // ===============================================

      const submissionResult =
        await submissions.updateOne(
          {
            _id:
              submission._id,

            reviewStatus:
              "pending",
          },
          {
            $set: {
              reviewStatus:
                "approved",

              reviewedAt:
                now,

              reviewedBy:
                String(
                  session.user.id,
                ),

              rejectionReason:
                null,

              updatedAt:
                now,
            },
          },
        );

      if (
        submissionResult.modifiedCount ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Identity submission could not be approved.",
          },
          {
            status: 400,
          },
        );
      }

      // ===============================================
      // Existing Seller Verification State
      // ===============================================

      const sellerVerification =
        seller.sellerVerification ??
        {};

      // ===============================================
      // Verification Checks
      // ===============================================

      const phoneVerified =
        sellerVerification.phoneVerified ===
          true ||
        seller.isPhoneVerified ===
          true;

      // Identity is TRUE because admin
      // has just approved it.

      const identityVerified =
        true;

      const selfieVerified =
        sellerVerification.selfieVerified ===
        true;

      const locationVerified =
        sellerVerification.locationVerified ===
        true;

      // ===============================================
      // Final Verified Seller Condition
      // ===============================================

      const fullyVerified =
        phoneVerified &&
        identityVerified &&
        selfieVerified &&
        locationVerified;

      // ===============================================
      // Final Seller Status
      // ===============================================

      const finalStatus =
        fullyVerified
          ? "verified"
          : "pending";

      // ===============================================
      // Verified Timestamp
      // ===============================================

      const verifiedAt =
        fullyVerified
          ? now
          : null;

      // ===============================================
      // Update Seller
      // ===============================================

      const sellerResult =
        await users.updateOne(
          {
            _id:
              sellerObjectId,
          },
          {
            $set: {
              // ---------------------------------------
              // Identity
              // ---------------------------------------

              "sellerVerification.identityVerified":
                true,

              "sellerVerification.identityDocumentType":
                "aadhaar",

              "sellerVerification.identitySubmissionId":
                submissionId,

              "sellerVerification.identityReviewedAt":
                now,

              "sellerVerification.identityRejectionReason":
                null,

              // ---------------------------------------
              // Final Seller Verification
              // ---------------------------------------

              "sellerVerification.status":
                finalStatus,

              "sellerVerification.verifiedAt":
                verifiedAt,

              "sellerVerification.rejectionReason":
                null,

              updatedAt:
                now,
            },
          },
        );

      if (
        sellerResult.matchedCount ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,

            message:
              "Identity was approved, but seller verification could not be updated.",
          },
          {
            status: 500,
          },
        );
      }

      // ===============================================
      // Success Response
      // ===============================================

      return NextResponse.json(
        {
          success: true,

          action:
            "approve",

          submissionId,

          identityVerified:
            true,

          phoneVerified,

          selfieVerified,

          locationVerified,

          fullyVerified,

          verifiedSeller:
            fullyVerified,

          status:
            finalStatus,

          verifiedAt,

          message:
            fullyVerified
              ? "Identity approved and seller is now a Verified Seller."
              : "Identity approved successfully. Remaining verification steps are still required.",
        },
        {
          status: 200,
        },
      );
    }

    // =================================================
    // REJECT IDENTITY
    // =================================================

    const submissionResult =
      await submissions.updateOne(
        {
          _id:
            submission._id,

          reviewStatus:
            "pending",
        },
        {
          $set: {
            reviewStatus:
              "rejected",

            reviewedAt:
              now,

            reviewedBy:
              String(
                session.user.id,
              ),

            rejectionReason:
              reason,

            updatedAt:
              now,
          },
        },
      );

    if (
      submissionResult.modifiedCount ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Identity submission could not be rejected.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Update Seller After Rejection
    // =================================================

    const sellerResult =
      await users.updateOne(
        {
          _id:
            sellerObjectId,
        },
        {
          $set: {
            // -----------------------------------------
            // Identity
            // -----------------------------------------

            "sellerVerification.identityVerified":
              false,

            "sellerVerification.identityDocumentType":
              "aadhaar",

            "sellerVerification.identitySubmissionId":
              submissionId,

            "sellerVerification.identityReviewedAt":
              now,

            "sellerVerification.identityRejectionReason":
              reason,

            // -----------------------------------------
            // Seller Status
            // -----------------------------------------

            "sellerVerification.status":
              "rejected",

            "sellerVerification.rejectionReason":
              reason,

            "sellerVerification.verifiedAt":
              null,

            updatedAt:
              now,
          },
        },
      );

    if (
      sellerResult.matchedCount ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Identity was rejected, but seller verification could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Reject Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        action:
          "reject",

        submissionId,

        identityVerified:
          false,

        fullyVerified:
          false,

        verifiedSeller:
          false,

        status:
          "rejected",

        verifiedAt:
          null,

        message:
          "Aadhaar identity verification rejected.",
      },
      {
        status: 200,
      },
    );

  } catch (error) {
    console.error(
      "ADMIN IDENTITY REVIEW ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to review identity verification.",
      },
      {
        status: 500,
      },
    );
  }
}