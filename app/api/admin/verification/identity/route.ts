import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

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
// This DOES NOT directly make the seller fully verified.
// =====================================================

export async function PATCH(
  request: NextRequest,
) {
  try {
    // ===================================================
    // Authentication
    // ===================================================

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

    // ===================================================
    // Admin Authorization
    // ===================================================

    if (session.user.role !== "admin") {
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

    // ===================================================
    // Request Body
    // ===================================================

    const body = await request.json();

    const submissionId =
      typeof body?.submissionId ===
      "string"
        ? body.submissionId.trim()
        : "";

    const action =
      typeof body?.action === "string"
        ? body.action.trim()
        : "";

    const reason =
      typeof body?.reason === "string"
        ? body.reason.trim()
        : "";

    // ===================================================
    // Validate Submission ID
    // ===================================================

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

    // ===================================================
    // Validate Action
    // ===================================================

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

    // ===================================================
    // Reject requires reason
    // ===================================================

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

    // ===================================================
    // Database
    // ===================================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const submissions =
      db.collection(
        "identityVerificationSubmissions",
      );

    const users =
      db.collection("users");

    // ===================================================
    // Find Submission
    // ===================================================

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

    // ===================================================
    // Validate Seller ID
    // ===================================================

    const sellerUserId =
      String(
        submission.userId ?? "",
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

    // ===================================================
    // Already Reviewed
    // ===================================================

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

    // ===================================================
    // Only Pending Submission Can Be Reviewed
    // ===================================================

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

    // ===================================================
    // Find Seller
    // ===================================================

    const seller =
      await users.findOne({
        _id:
          new ObjectId(
            sellerUserId,
          ),
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

    // ===================================================
    // Prevent Admin Self Review
    // ===================================================

    if (
      String(session.user.id) ===
      sellerUserId
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

    // ===================================================
    // Current Time
    // ===================================================

    const now = new Date();

    // ===================================================
    // APPROVE IDENTITY
    // ===================================================

    if (
      action === "approve"
    ) {
      // -----------------------------------------------
      // Update submission
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Update seller identity
      //
      // IMPORTANT:
      // This does NOT automatically make seller
      // fully verified.
      // -----------------------------------------------

      await users.updateOne(
        {
          _id:
            new ObjectId(
              sellerUserId,
            ),
        },
        {
          $set: {
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

            updatedAt:
              now,
          },
        },
      );

      return NextResponse.json(
        {
          success: true,

          action:
            "approve",

          submissionId,

          status:
            "approved",

          identityVerified:
            true,

          message:
            "Aadhaar identity verification approved successfully.",
        },
      );
    }

    // ===================================================
    // REJECT IDENTITY
    // ===================================================

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

    // ===================================================
    // Update Seller
    //
    // Seller becomes eligible to submit again.
    // ===================================================

    await users.updateOne(
      {
        _id:
          new ObjectId(
            sellerUserId,
          ),
      },
      {
        $set: {
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

          "sellerVerification.status":
            "rejected",

          "sellerVerification.rejectionReason":
            reason,

          updatedAt:
            now,
        },
      },
    );

    // ===================================================
    // Success
    // ===================================================

    return NextResponse.json(
      {
        success: true,

        action:
          "reject",

        submissionId,

        status:
          "rejected",

        identityVerified:
          false,

        message:
          "Aadhaar identity verification rejected.",
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