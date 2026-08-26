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
) {
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

export async function POST(request: Request) {
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

    const sellerId = String(session.user.id);

    // =================================================
    // Validate Seller ObjectId
    // =================================================

    if (!ObjectId.isValid(sellerId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid seller account.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Request Body
    // =================================================

    const body = await request.json();

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
          message: "Please fill all required fields.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Product Coordinates
    //
    // These represent the actual location
    // of the product selected on the map.
    // =================================================

    const productLatitude = Number(
      body.latitude,
    );

    const productLongitude = Number(
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
    // This is the seller's CURRENT device location.
    //
    // We do NOT require the seller to have a previously
    // verified location in sellerVerification.
    // =================================================

    const sellerLatitude = Number(
      body.sellerLocation?.latitude,
    );

    const sellerLongitude = Number(
      body.sellerLocation?.longitude,
    );

    const sellerAccuracy = Number(
      body.sellerLocation?.accuracy,
    );

    // =================================================
    // Validate Seller Live GPS
    // =================================================

    if (
      !isValidCoordinate(
        sellerLatitude,
        sellerLongitude,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your current device location is required before publishing this product.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Validate GPS Accuracy
    // =================================================

    if (
      !Number.isFinite(sellerAccuracy) ||
      sellerAccuracy <= 0
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

    const client = await clientPromise;

    const db = client.db("dealup");

    const users = db.collection("users");

    // =================================================
    // Get Seller
    // =================================================

    const seller = await users.findOne(
      {
        _id: new ObjectId(sellerId),
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
          message: "Seller account not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // SERVER-SIDE DISTANCE CALCULATION
    //
    // Current Seller GPS
    //          ↓
    //       distance
    //          ↑
    // Product Location
    // =================================================

    const distanceKm = calculateDistance(
      sellerLatitude,
      sellerLongitude,
      productLatitude,
      productLongitude,
    );

    // =================================================
    // Location Status
    // =================================================

    const locationStatus =
      getLocationStatus(distanceKm);

    // =================================================
    // Slug
    // =================================================

    const slug =
      body.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    // =================================================
    // Timestamp
    // =================================================

    const now = new Date();

    // =================================================
    // Product Location Verification
    //
    // This records the seller's CURRENT GPS and
    // the distance from seller to product location.
    //
    // It does NOT automatically make the seller
    // a Verified Seller.
    // =================================================

    const locationVerification = {
      sellerLatitude,
      sellerLongitude,

      productLatitude,
      productLongitude,

      distanceKm,

      accuracy: sellerAccuracy,

      status: locationStatus,

      method: "device-gps" as const,

      capturedAt: now,
    };

    // =================================================
    // Product
    // =================================================

    const product: Product = {
      title: body.title,

      slug,

      description: body.description,

      price: Number(body.price),

      currency: "INR",

      negotiable: body.negotiable ?? false,

      category: body.category,

      subcategory: body.subcategory ?? "",

      brand: body.brand ?? "",

      model: body.model ?? "",

      condition: body.condition,

      images: body.images ?? [],

      thumbnail:
        body.images?.length > 0
          ? body.images[0].url
          : "",

      sellerId,

      sellerName:
        seller.name ??
        session.user.name ??
        "Unknown Seller",

      sellerPhone: "",

      // =================================================
      // Product Location
      // =================================================

      location: {
        country:
          body.country ?? "India",

        state:
          body.state ?? "",

        district:
          body.district ?? "",

        city:
          body.city ?? "",

        pincode:
          body.pincode ?? "",

        address:
          body.address ?? "",

        coordinates: {
          lat: productLatitude,

          lng: productLongitude,
        },
      },

      // =================================================
      // Location Verification
      // =================================================

      locationVerification,

      // =================================================
      // Status
      // =================================================

      status: "active",

      views: 0,

      favorites: 0,

      // =================================================
      // Premium / Promotion
      // =================================================

      isFeatured: false,

      isPremium: false,

      isBoosted: false,

      boostedUntil: undefined,

      // =================================================
      // Timestamps
      // =================================================

      createdAt: now,

      updatedAt: now,
    };

    // =================================================
    // Save Product
    // =================================================

    const result =
      await createProduct(product);

    // =================================================
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Product created successfully.",

        insertedId:
          result.insertedId,

        locationVerification: {
          distanceKm:
            Number(
              distanceKm.toFixed(2),
            ),

          status:
            locationStatus,

          accuracy:
            Math.round(
              sellerAccuracy,
            ),
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
        message: "Internal Server Error",
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
      await findLatestProducts(20);

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