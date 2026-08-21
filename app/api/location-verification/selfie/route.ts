import {
  NextRequest,
  NextResponse,
} from "next/server";

import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

export async function POST(
  request: NextRequest,
) {
  try {
    // =================================================
    // Read Request
    // =================================================

    const body =
      await request.json();

    const token =
      String(
        body?.token ?? "",
      );

    const imageUrl =
      String(
        body?.imageUrl ?? "",
      );

    const publicId =
      String(
        body?.publicId ?? "",
      );

    // =================================================
    // Validate
    // =================================================

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

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Live selfie image is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!publicId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selfie image ID is required.",
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

    const sessions =
      db.collection(
        "locationVerificationSessions",
      );

    const users =
      db.collection("users");

    // =================================================
    // Find Verification Session
    // =================================================

    const verification =
      await sessions.findOne({
        token,
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
      !verification.expiresAt ||
      new Date() >
        new Date(
          verification.expiresAt,
        )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification session has expired.",
        },
        {
          status: 410,
        },
      );
    }

    // =================================================
    // Prevent Reusing Completed Selfie
    // =================================================

    if (
      verification.selfieVerified === true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Live selfie has already been submitted.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Seller User ID
    // =================================================

    const sellerUserId =
      String(
        verification.userId ?? "",
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
    // Check Seller
    // =================================================

    const seller =
      await users.findOne({
        _id: sellerObjectId,
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
    // Timestamp
    // =================================================

    const now =
      new Date();

    // =================================================
    // Update Verification Session
    // =================================================

    const sessionResult =
      await sessions.updateOne(
        {
          _id:
            verification._id,

          status:
            "pending",

          selfieVerified: false,
        },
        {
          $set: {
            selfieVerified:
              true,

            selfieUrl:
              imageUrl,

            selfiePublicId:
              publicId,

            selfieVerifiedAt:
              now,

            updatedAt:
              now,
          },
        },
      );

    if (
      sessionResult.modifiedCount ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selfie verification could not be completed.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Update Seller Verification
    //
    // IMPORTANT:
    // Overall seller status remains controlled
    // by Admin.
    // =================================================

    const sellerResult =
      await users.updateOne(
        {
          _id:
            sellerObjectId,
        },
        {
          $set: {
            "sellerVerification.selfieVerified":
              true,

            "sellerVerification.selfieUrl":
              imageUrl,

            "sellerVerification.selfiePublicId":
              publicId,

            "sellerVerification.selfieVerifiedAt":
              now,

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
            "Selfie was captured but seller verification could not be updated.",
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Live selfie verified successfully.",

        selfie: {
          verified: true,

          imageUrl,

          publicId,

          verifiedAt:
            now,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "MOBILE SELFIE VERIFICATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Mobile selfie verification failed.",
      },
      {
        status: 500,
      },
    );
  }
}