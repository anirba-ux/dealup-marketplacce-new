import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  findProductById,
  updateProduct,
  deleteProductByOwner,
  markProductSold,
} from "@/lib/repositories/product.repository";

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
// GET Product By ID
// =====================================================

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await params;

    const product =
      await findProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
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
// UPDATE Product
// =====================================================

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
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
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // =================================================
    // Product ID
    // =================================================

    const { id } = await params;

    // =================================================
    // Existing Product
    // =================================================

    const product =
      await findProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Owner Check
    // =================================================

    if (
      product.sellerId !==
      session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied.",
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

    // =================================================
    // Product Coordinates
    // =================================================

    const productLatitude =
      Number(body.latitude);

    const productLongitude =
      Number(body.longitude);

    if (
      !Number.isFinite(
        productLatitude,
      ) ||
      !Number.isFinite(
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

    if (
      !Number.isFinite(
        sellerLatitude,
      ) ||
      !Number.isFinite(
        sellerLongitude,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your live device location is required before updating this product.",
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
      !Number.isFinite(
        sellerAccuracy,
      ) ||
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
    // Server-Side Distance Calculation
    // =================================================

    const distanceKm =
      calculateDistance(
        sellerLatitude,
        sellerLongitude,
        productLatitude,
        productLongitude,
      );

    // =================================================
    // Location Status
    // =================================================

    const locationStatus =
      getLocationStatus(
        distanceKm,
      );

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

      accuracy:
        sellerAccuracy,

      status:
        locationStatus,

      method:
        "device-gps" as const,

      capturedAt:
        now,
    };

    // =================================================
    // Safe Update Object
    // =================================================

    const updateData = {
      title:
        body.title,

      slug:
        body.title
          ?.toLowerCase()
          .trim()
          .replace(
            /[^a-z0-9]+/g,
            "-",
          )
          .replace(
            /^-|-$/g,
            "",
          ),

      description:
        body.description,

      price:
        Number(body.price),

      currency:
        "INR" as const,

      negotiable:
        body.negotiable ??
        false,

      category:
        body.category,

      subcategory:
        body.subcategory ??
        "",

      brand:
        body.brand ?? "",

      model:
        body.model ?? "",

      condition:
        body.condition,

      images:
        body.images ?? [],

      thumbnail:
        body.thumbnail ??
        body.images?.[0]?.url ??
        "",

      location: {
        country:
          "India",

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

      locationVerification,

      updatedAt:
        now,
    };

    // =================================================
    // Update Database
    // =================================================

    await updateProduct(
      id,
      updateData,
    );

    // =================================================
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Product updated successfully.",

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
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
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
// DELETE Product
// =====================================================

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await params;

    const result =
      await deleteProductByOwner(
        id,
        session.user.id,
      );

    if (!result.deletedCount) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
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
// MARK PRODUCT AS SOLD
// =====================================================

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await params;

    const product =
      await findProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (
      product.sellerId !==
      session.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied.",
        },
        {
          status: 403,
        },
      );
    }

    const success =
      await markProductSold(
        id,
        session.user.id,
      );

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to mark as sold.",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Product marked as sold successfully.",
    });
  } catch (error) {
    console.error(
      "MARK SOLD ERROR:",
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