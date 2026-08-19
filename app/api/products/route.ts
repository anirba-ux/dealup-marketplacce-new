import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  createProduct,
  findLatestProducts,
} from "@/lib/repositories/product.repository";

import { Product } from "@/lib/models/product";

import { calculateDistance } from "@/lib/utils/distance";

// =====================================================
// Location Verification Helper
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
          message: "Unauthorized",
        },
        {
          status: 401,
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
    // =================================================

    const productLatitude = Number(
      body.latitude,
    );

    const productLongitude = Number(
      body.longitude,
    );

    if (
      !Number.isFinite(productLatitude) ||
      !Number.isFinite(productLongitude)
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

    if (
      !Number.isFinite(sellerLatitude) ||
      !Number.isFinite(sellerLongitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your live device location is required before publishing this product.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // GPS Accuracy Validation
    // =================================================

    if (
      !Number.isFinite(sellerAccuracy) ||
      sellerAccuracy <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to verify your GPS accuracy. Please try again.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // SERVER-SIDE Distance Calculation
    // =================================================

    const distanceKm = calculateDistance(
      sellerLatitude,
      sellerLongitude,
      productLatitude,
      productLongitude,
    );

    // =================================================
    // Server-Side Location Status
    // =================================================

    const locationStatus =
      getLocationStatus(distanceKm);

    // =================================================
    // Slug
    // =================================================

    const slug = body.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // =================================================
    // Timestamp
    // =================================================

    const now = new Date();

    // =================================================
    // Location Verification
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
    // Product Object
    // =================================================

    const product: Product = {
      title: body.title,

      slug,

      description: body.description,

      price: Number(body.price),

      currency: "INR",

      negotiable:
        body.negotiable ?? false,

      category: body.category,

      subcategory:
        body.subcategory ?? "",

      brand:
        body.brand ?? "",

      model:
        body.model ?? "",

      condition:
        body.condition,

      images:
        body.images ?? [],

      thumbnail:
        body.images?.length > 0
          ? body.images[0].url
          : "",

      sellerId:
        session.user.id,

      sellerName:
        session.user.name ??
        "Unknown Seller",

      sellerPhone: "",

      // =================================================
      // Product Location
      // =================================================

      location: {
        country: "India",

        state:
          body.state,

        district:
          body.district,

        city:
          body.city,

        pincode:
          body.pincode,

        address:
          body.address,

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
      // Status
      // =================================================

      status: "active",

      views: 0,

      favorites: 0,

      isFeatured: false,

      isPremium: false,

      isBoosted: false,

      boostedUntil:
        undefined,

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
    console.error(error);

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