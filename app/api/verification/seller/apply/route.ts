import { NextRequest, NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

// =====================================
// POST — Apply For Seller Verification
// =====================================

export async function POST(request: NextRequest) {
  try {
    // =====================================
    // Authentication
    // =====================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // =====================================
    // User ID
    // =====================================

    const userId = session.user.id;

    let userObjectId: ObjectId;

    try {
      userObjectId = new ObjectId(userId);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Database
    // =====================================

    const client = await clientPromise;

    const db = client.db("dealup");

    const users = db.collection("users");

    const products = db.collection("products");

    const applications = db.collection("sellerVerificationApplications");

    // =====================================
    // Find Seller
    // =====================================

    const user = await users.findOne(
      {
        _id: userObjectId,
      },
      {
        projection: {
          password: 0,
        },
      },
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================
    // Phone Verification Required
    // =====================================

    if (user.isPhoneVerified !== true) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please verify your phone number before applying for Seller Verification.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Already Verified Seller
    // =====================================

    if (user.sellerVerification?.status === "verified") {
      return NextResponse.json(
        {
          success: false,
          error: "You are already a Verified Seller.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Check Existing Pending Application
    // =====================================

    const existingApplication = await applications.findOne({
      sellerId: userObjectId,
      status: "pending",
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your Seller Verification application is already under review.",
        },
        {
          status: 409,
        },
      );
    }

    // =====================================
    // Find Active Products
    // =====================================

    const activeProducts = await products
      .find({
        sellerId: userId,
        status: "active",
      })
      .sort({
        createdAt: -1,
      })
      .toArray();

    // =====================================
    // At Least One Active Product Required
    // =====================================

    if (activeProducts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please publish at least one active product before applying for Seller Verification.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================
    // Select Primary Product
    // =====================================

    const primaryProduct = activeProducts[0];

    // =====================================
    // Create Application
    // =====================================

    const now = new Date();

    const application = {
      sellerId: userObjectId,

      status: "pending",

      // =====================================
      // Seller Snapshot
      // =====================================

      seller: {
        name: user.name ?? "",

        image: user.image ?? "",

        phone: user.phone ?? "",

        isPhoneVerified: user.isPhoneVerified === true,

        address: {
          city: user.address?.city ?? "",

          district: user.address?.district ?? "",

          state: user.address?.state ?? "",
        },
      },

      // =====================================
      // Verification Selfie
      // =====================================

      verificationSelfie: {
        url: null,

        capturedAt: null,
      },

      // =====================================
      // Primary Product
      // =====================================

      primaryProductId: primaryProduct._id,

      // =====================================
      // Application Dates
      // =====================================

      requestedAt: now,

      submittedAt: null,

      reviewedAt: null,

      reviewedBy: null,

      // =====================================
      // Rejection
      // =====================================

      rejectionReason: null,

      createdAt: now,

      updatedAt: now,
    };

    // =====================================
    // Save Application
    // =====================================

    const result = await applications.insertOne(application);

    // =====================================
    // Update User Verification Status
    // =====================================

    await users.updateOne(
      {
        _id: userObjectId,
      },
      {
        $set: {
          "sellerVerification.status": "pending",

          "sellerVerification.phoneVerified": true,

          "sellerVerification.requestedAt": now,

          "sellerVerification.verifiedAt": null,

          "sellerVerification.rejectionReason": null,

          updatedAt: now,
        },
      },
    );

    // =====================================
    // Success
    // =====================================

    return NextResponse.json(
      {
        success: true,

        message: "Seller Verification application started.",

        applicationId: result.insertedId.toString(),

        primaryProductId: primaryProduct._id.toString(),

        activeProductCount: activeProducts.length,

        nextStep: "LIVE_SELFIE",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("SELLER VERIFICATION APPLY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to start Seller Verification.",
      },
      {
        status: 500,
      },
    );
  }
}
