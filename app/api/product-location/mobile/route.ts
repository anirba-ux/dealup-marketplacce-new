import {
  NextRequest,
  NextResponse,
} from "next/server";

import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const COLLECTION_NAME =
  "productLocationSessions";

// =====================================================
// GPS Validation
// =====================================================

function isValidCoordinate(
  latitude: number,
  longitude: number,
) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

// =====================================================
// POST
//
// Mobile sends its current GPS location after scanning
// the Product Location QR code.
//
// IMPORTANT:
// This endpoint is ONLY for product location.
// It does NOT perform seller verification.
// It does NOT require selfie verification.
// =====================================================

export async function POST(
  request: NextRequest,
) {
  try {
    // =================================================
    // Request Body
    // =================================================

    const body =
      await request.json();

    const token =
      typeof body.token ===
      "string"
        ? body.token.trim()
        : "";

    const latitude =
      Number(
        body.latitude,
      );

    const longitude =
      Number(
        body.longitude,
      );

    const accuracy =
      Number(
        body.accuracy,
      );

    // =================================================
    // Token Validation
    // =================================================

    if (!token) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Location session token is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Coordinate Validation
    // =================================================

    if (
      !isValidCoordinate(
        latitude,
        longitude,
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Valid GPS coordinates are required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Accuracy Validation
    // =================================================

    if (
      !Number.isFinite(
        accuracy,
      ) ||
      accuracy <= 0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Valid GPS accuracy is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Accuracy Safety Limit
    //
    // We do not accept extremely inaccurate GPS.
    //
    // 100 metres is a reasonable product-location
    // threshold for this flow.
    // =================================================

    if (
      accuracy > 100
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Your mobile GPS is not accurate enough. Please move outdoors or to an open area and try again.",
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
      client.db(
        DATABASE_NAME,
      );

    const collection =
      db.collection(
        COLLECTION_NAME,
      );

    // =================================================
    // Find Session
    //
    // Token itself is the secure capability for the
    // mobile device.
    // =================================================

    const locationSession =
      await collection.findOne({
        token,

        purpose:
          "product-location",
      });

    // =================================================
    // Session Not Found
    // =================================================

    if (
      !locationSession
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This product location session is invalid or no longer available.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Session Expired
    // =================================================

    if (
      new Date() >
      locationSession.expiresAt
    ) {
      await collection.updateOne(
        {
          _id:
            locationSession._id,
        },

        {
          $set: {
            status:
              "expired",
          },
        },
      );

      return NextResponse.json(
        {
          success: false,

          message:
            "This product location session has expired. Please generate a new QR code.",
        },
        {
          status: 410,
        },
      );
    }

    // =================================================
    // Session Status
    // =================================================

    if (
      locationSession.status ===
      "cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This product location session has been cancelled.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      locationSession.status ===
      "completed"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This product location session has already been completed.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      locationSession.status !==
      "waiting"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This product location session is not ready to receive GPS.",
        },
        {
          status: 409,
        },
      );
    }

    // =================================================
    // Save Mobile GPS
    // =================================================

    const now =
      new Date();

    const mobileLocation = {
      latitude,

      longitude,

      accuracy,

      method:
        "mobile-gps",

      capturedAt:
        now,
    };

    const result =
      await collection.updateOne(
        {
          _id:
            locationSession._id,

          status:
            "waiting",
        },

        {
          $set: {
            status:
              "completed",

            mobileLocation,

            completedAt:
              now,

            updatedAt:
              now,
          },
        },
      );

    // =================================================
    // Race Condition Protection
    // =================================================

    if (
      result.modifiedCount ===
      0
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This product location session has already been completed or changed.",
        },
        {
          status: 409,
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
          "Product location captured successfully.",

        location: {
          latitude,

          longitude,

          accuracy,

          capturedAt:
            now.toISOString(),
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PRODUCT LOCATION MOBILE GPS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to save mobile GPS location.",
      },
      {
        status: 500,
      },
    );
  }
}