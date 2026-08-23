import { NextRequest, NextResponse } from "next/server";

import crypto from "crypto";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const COLLECTION_NAME = "productLocationSessions";

// =====================================================
// Session Lifetime
// =====================================================

const SESSION_LIFETIME_MS = 10 * 60 * 1000;

// =====================================================
// POST
//
// Desktop creates a secure mobile product-location
// session.
//
// This is ONLY for product location.
// It does NOT perform seller verification.
// It does NOT use selfie verification.
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // =================================================
    // Authentication
    // =================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,

          message: "Please log in before using mobile location.",
        },
        {
          status: 401,
        },
      );
    }

    // =================================================
    // Generate Secure Token
    // =================================================

    const token = crypto.randomBytes(32).toString("hex");

    // =================================================
    // Session ID
    // =================================================

    const sessionId = crypto.randomUUID();

    // =================================================
    // Expiration
    // =================================================

    const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);

    // =================================================
    // Database
    // =================================================

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const collection = db.collection(COLLECTION_NAME);

    // =================================================
    // Save Session
    // =================================================

    await collection.insertOne({
      sessionId,

      token,

      userId: String(session.user.id),

      status: "waiting",

      purpose: "product-location",

      mobileLocation: null,

      createdAt: new Date(),

      expiresAt,

      completedAt: null,
    });

    // =================================================
    // Mobile URL
    // =================================================

    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    const mobileUrl = `${origin}/product-location/mobile?token=${encodeURIComponent(
      token,
    )}`;
    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        token,

        mobileUrl,

        expiresAt: expiresAt.toISOString(),
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("CREATE PRODUCT LOCATION MOBILE SESSION ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to create mobile location session.",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// GET
//
// Desktop polls this endpoint while waiting for
// mobile GPS.
//
// This is ONLY for product location.
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // =================================================
    // Authentication
    // =================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,

          valid: false,

          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // =================================================
    // Token
    // =================================================

    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,

          valid: false,

          message: "Session token is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Database
    // =================================================

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const collection = db.collection(COLLECTION_NAME);

    // =================================================
    // Find Session
    // =================================================

    const locationSession = await collection.findOne({
      token,

      userId: String(session.user.id),

      purpose: "product-location",
    });

    if (!locationSession) {
      return NextResponse.json(
        {
          success: false,

          valid: false,

          message: "Product location session not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Expired
    // =================================================

    if (
      new Date() > locationSession.expiresAt &&
      locationSession.status === "waiting"
    ) {
      await collection.updateOne(
        {
          _id: locationSession._id,
        },

        {
          $set: {
            status: "expired",
          },
        },
      );

      return NextResponse.json(
        {
          success: true,

          valid: false,

          status: "expired",

          message: "Product location session has expired.",
        },
        {
          status: 410,
        },
      );
    }

    // =================================================
    // Cancelled
    // =================================================

    if (locationSession.status === "cancelled") {
      return NextResponse.json({
        success: true,

        valid: false,

        status: "cancelled",

        mobileLocation: null,
      });
    }

    // =================================================
    // Waiting
    // =================================================

    if (locationSession.status === "waiting") {
      return NextResponse.json({
        success: true,

        valid: true,

        status: "waiting",

        expiresAt: locationSession.expiresAt,

        mobileLocation: null,
      });
    }

    // =================================================
    // Completed
    // =================================================

    if (locationSession.status === "completed") {
      return NextResponse.json({
        success: true,

        valid: true,

        status: "completed",

        expiresAt: locationSession.expiresAt,

        completedAt: locationSession.completedAt,

        mobileLocation: locationSession.mobileLocation ?? null,
      });
    }

    // =================================================
    // Unknown Status
    // =================================================

    return NextResponse.json({
      success: true,

      valid: true,

      status: locationSession.status,

      mobileLocation: locationSession.mobileLocation ?? null,
    });
  } catch (error) {
    console.error("GET PRODUCT LOCATION SESSION ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        valid: false,

        message: "Unable to check product location session.",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// DELETE
//
// Cancel an existing product-location session.
// =====================================================

export async function DELETE(request: NextRequest) {
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
    // Token
    // =================================================

    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,

          message: "Session token is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Database
    // =================================================

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const collection = db.collection(COLLECTION_NAME);

    // =================================================
    // Cancel Only Own Session
    // =================================================

    const result = await collection.updateOne(
      {
        token,

        userId: String(session.user.id),

        purpose: "product-location",

        status: "waiting",
      },

      {
        $set: {
          status: "cancelled",

          completedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,

          message: "Product location session not found or is no longer active.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,

      message: "Product location session cancelled.",
    });
  } catch (error) {
    console.error("CANCEL PRODUCT LOCATION SESSION ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: "Unable to cancel product location session.",
      },
      {
        status: 500,
      },
    );
  }
}
