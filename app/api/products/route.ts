import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

import {
  createProduct,
  findLatestProducts,
} from "@/lib/repositories/product.repository";

import { Product } from "@/lib/models/product";

import { calculateDistance } from "@/lib/utils/distance";

import {
  generateUniqueProductSlug,
} from "@/lib/utils/productSlug";

// =====================================================
// Location Status
// =====================================================

function getLocationStatus(
  distanceKm: number,
): "nearby" | "different" | "far" {
  if (distanceKm <= 5) {
    return "nearby";
  }

  if (distanceKm <= 25) {
    return "different";
  }

  return "far";
}

// =====================================================
// Coordinate Validation
// =====================================================

function isValidCoordinate(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

// =====================================================
// POST — Create Product
// =====================================================

export async function POST(
  request: Request,
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

    const sellerId =
      String(
        session.user.id,
      );

    // =================================================
    // Validate Seller ObjectId
    // =================================================

    if (
      !ObjectId.isValid(
        sellerId,
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

    // =================================================
    // Request Body
    // =================================================

    const body =
      await request.json();

    // =================================================
    // Basic Validation
    // =================================================

    if (
      !body.title ||
      !body.description ||
      !body.category ||
      !body.condition
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please fill all required fields.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Product Location
    //
    // Product location selected by:
    //
    // 1. Map
    // 2. Address → Find on Map
    // 3. Current location
    //
    // Product location is mandatory.
    // =================================================

    const productLatitude =
      Number(
        body.latitude,
      );

    const productLongitude =
      Number(
        body.longitude,
      );

    if (
      !isValidCoordinate(
        productLatitude,
        productLongitude,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid product location coordinates are required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Seller Live GPS
    //
    // IMPORTANT:
    //
    // Seller's current device GPS is OPTIONAL.
    //
    // Product location is mandatory.
    //
    // If seller GPS exists:
    //   calculate distance
    //
    // If seller GPS does not exist:
    //   save product location only
    //   status = unverified
    //   method = map
    // =================================================

    const sellerLatitude =
      Number(
        body.sellerLocation?.latitude,
      );

    const sellerLongitude =
      Number(
        body.sellerLocation?.longitude,
      );

    const sellerAccuracy =
      Number(
        body.sellerLocation?.accuracy,
      );

    // =================================================
    // Detect Seller Live GPS
    // =================================================

    const hasSellerLiveLocation =
      isValidCoordinate(
        sellerLatitude,
        sellerLongitude,
      );

    // =================================================
    // Validate GPS Accuracy
    //
    // Only validate when seller GPS exists.
    // =================================================

    if (
      hasSellerLiveLocation &&
      (
        !Number.isFinite(
          sellerAccuracy,
        ) ||
        sellerAccuracy <= 0
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to verify your current GPS accuracy. Please try again.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // DATABASE
    // =================================================

    const client =
      await clientPromise;

    const db =
      client.db(
        "dealup",
      );

    const users =
      db.collection(
        "users",
      );

    // =================================================
    // Get Seller
    // =================================================

    const seller =
      await users.findOne(
        {
          _id:
            new ObjectId(
              sellerId,
            ),
        },
        {
          projection: {
            name: 1,
            isPhoneVerified: 1,
            sellerVerification: 1,
          },
        },
      );

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
    // Server-Side Distance Calculation
    //
    // IMPORTANT:
    //
    // distanceKm can be:
    //
    // number
    // OR
    // null
    //
    // because seller GPS is optional.
    // =================================================

    const distanceKm:
      | number
      | null =
      hasSellerLiveLocation
        ? calculateDistance(
            sellerLatitude,
            sellerLongitude,
            productLatitude,
            productLongitude,
          )
        : null;

    // =================================================
    // Location Status
    //
    // IMPORTANT:
    //
    // getLocationStatus() accepts ONLY number.
    //
    // Therefore distanceKm !== null is checked before
    // calling it.
    // =================================================

    const locationStatus:
      | "nearby"
      | "different"
      | "far"
      | "unverified" =
      hasSellerLiveLocation &&
      distanceKm !== null
        ? getLocationStatus(
            distanceKm,
          )
        : "unverified";

    // =================================================
    // UNIQUE SLUG
    //
    // Example:
    //
    // Pulsar 220
    // → pulsar-220
    //
    // Duplicate:
    // → pulsar-220-2
    //
    // Another duplicate:
    // → pulsar-220-3
    // =================================================

    const slug =
      await generateUniqueProductSlug(
        String(
          body.title,
        ),
      );

    // =================================================
    // Timestamp
    // =================================================

    const now =
      new Date();

    // =================================================
    // Product Location Verification
    // =================================================

    const locationVerification = {
      // -------------------------------------------------
      // Seller Live GPS
      // -------------------------------------------------

      sellerLatitude:
        hasSellerLiveLocation
          ? sellerLatitude
          : null,

      sellerLongitude:
        hasSellerLiveLocation
          ? sellerLongitude
          : null,

      // -------------------------------------------------
      // Product Location
      // -------------------------------------------------

      productLatitude,

      productLongitude,

      // -------------------------------------------------
      // Distance
      // -------------------------------------------------

      distanceKm,

      // -------------------------------------------------
      // GPS Accuracy
      // -------------------------------------------------

      accuracy:
        hasSellerLiveLocation
          ? sellerAccuracy
          : null,

      // -------------------------------------------------
      // Status
      // -------------------------------------------------

      status:
        locationStatus,

      // -------------------------------------------------
      // Method
      // -------------------------------------------------

      method:
        hasSellerLiveLocation
          ? ("device-gps" as const)
          : ("map" as const),

      // -------------------------------------------------
      // Timestamp
      // -------------------------------------------------

      capturedAt:
        now,
    };

    // =================================================
    // Product
    // =================================================

    const product: Product = {
      // =================================================
      // Basic Product Information
      // =================================================

      title:
        String(
          body.title,
        ).trim(),

      slug,

      description:
        String(
          body.description,
        ).trim(),

      price:
        Number(
          body.price,
        ),

      currency:
        "INR",

      negotiable:
        Boolean(
          body.negotiable ??
          false,
        ),

      // =================================================
      // Category
      // =================================================

      category:
        body.category,

      subcategory:
        body.subcategory ??
        "",

      // =================================================
      // Product Details
      // =================================================

      brand:
        body.brand ??
        "",

      model:
        body.model ??
        "",

      condition:
        body.condition,

      // =================================================
      // Images
      // =================================================

      images:
        body.images ??
        [],

      thumbnail:
        Array.isArray(
          body.images,
        ) &&
        body.images.length > 0
          ? body.images[0]?.url ??
            ""
          : "",

      // =================================================
      // Seller
      // =================================================

      sellerId,

      sellerName:
        seller.name ??
        session.user.name ??
        "Unknown Seller",

      sellerPhone:
        "",

      // =================================================
      // Product Location
      // =================================================

      location: {
        country:
          body.country ??
          "India",

        state:
          body.state ??
          "",

        district:
          body.district ??
          "",

        city:
          body.city ??
          "",

        pincode:
          body.pincode ??
          "",

        address:
          body.address ??
          "",

        coordinates: {
          lat:
            productLatitude,

          lng:
            productLongitude,
        },
      },

      // =================================================
      // Location Verification
      // =================================================

      locationVerification,

      // =================================================
      // Product Status
      // =================================================

      status:
        "active",

      views:
        0,

      favorites:
        0,

      // =================================================
      // Premium / Promotion
      // =================================================

      isFeatured:
        false,

      isPremium:
        false,

      isBoosted:
        false,

      boostedUntil:
        undefined,

      // =================================================
      // Timestamps
      // =================================================

      createdAt:
        now,

      updatedAt:
        now,
    };

    // =================================================
    // Save Product
    // =================================================

    const result =
      await createProduct(
        product,
      );

    // =================================================
    // Success Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Product created successfully.",

        insertedId:
          result.insertedId,

        slug,

        locationVerification: {
          // ---------------------------------------------
          // Distance
          // ---------------------------------------------

          distanceKm:
            distanceKm !== null
              ? Number(
                  distanceKm.toFixed(
                    2,
                  ),
                )
              : null,

          // ---------------------------------------------
          // Status
          // ---------------------------------------------

          status:
            locationStatus,

          // ---------------------------------------------
          // Accuracy
          // ---------------------------------------------

          accuracy:
            hasSellerLiveLocation
              ? Math.round(
                  sellerAccuracy,
                )
              : null,

          // ---------------------------------------------
          // Method
          // ---------------------------------------------

          method:
            hasSellerLiveLocation
              ? "device-gps"
              : "map",
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// GET — Latest Products
// =====================================================

export async function GET() {
  try {
    const products =
      await findLatestProducts(
        20,
      );

    return NextResponse.json(
      {
        success: true,
        products,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch latest products.",
      },
      {
        status: 500,
      },
    );
  }
}