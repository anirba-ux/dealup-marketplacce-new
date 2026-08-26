import {
  NextResponse,
} from "next/server";

import {
  revalidatePath,
} from "next/cache";

import { auth } from "@/auth";

import {
  findProductById,
  updateProduct,
  deleteProductByOwner,
  markProductSold,
} from "@/lib/repositories/product.repository";

import {
  calculateDistance,
} from "@/lib/utils/distance";

import {
  generateUniqueProductSlug,
} from "@/lib/utils/productSlug";

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
// Coordinate Validation
// =====================================================

function isValidCoordinate(
  latitude: number,
  longitude: number,
) {
  return (
    Number.isFinite(
      latitude,
    ) &&
    Number.isFinite(
      longitude,
    ) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(
      latitude === 0 &&
      longitude === 0
    )
  );
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
    const { id } =
      await params;

    const product =
      await findProductById(
        id,
      );

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

    return NextResponse.json(
      {
        success: true,
        product,
      },
      {
        status: 200,
      },
    );
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

    const session =
      await auth();

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

    // =================================================
    // Product ID
    // =================================================

    const { id } =
      await params;

    // =================================================
    // Existing Product
    // =================================================

    const product =
      await findProductById(
        id,
      );

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
    // Existing Product Coordinates
    // =================================================

    const existingLatitude =
      Number(
        product.location
          ?.coordinates?.lat,
      );

    const existingLongitude =
      Number(
        product.location
          ?.coordinates?.lng,
      );

    // =================================================
    // Product Coordinates From Request
    //
    // If frontend sends new coordinates,
    // use them.
    //
    // Otherwise preserve existing coordinates.
    // =================================================

    const productLatitude =
      body.latitude !==
      undefined
        ? Number(
            body.latitude,
          )
        : existingLatitude;

    const productLongitude =
      body.longitude !==
      undefined
        ? Number(
            body.longitude,
          )
        : existingLongitude;

    // =================================================
    // Product Coordinate Validation
    // =================================================

    const validProductCoordinates =
      isValidCoordinate(
        productLatitude,
        productLongitude,
      );

    if (
      !validProductCoordinates
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
    // GPS is OPTIONAL during product update.
    //
    // If available:
    //   calculate distance
    //   verify accuracy
    //   save locationVerification
    //
    // If unavailable:
    //   normal update continues
    // =================================================

    const sellerLocation =
      body.sellerLocation;

    const hasSellerLocation =
      sellerLocation &&
      typeof sellerLocation ===
        "object";

    const hasLatitude =
      hasSellerLocation &&
      sellerLocation.latitude !==
        undefined;

    const hasLongitude =
      hasSellerLocation &&
      sellerLocation.longitude !==
        undefined;

    const hasAccuracy =
      hasSellerLocation &&
      sellerLocation.accuracy !==
        undefined;

    // =================================================
    // Seller GPS Values
    // =================================================

    const sellerLatitude =
      hasLatitude
        ? Number(
            sellerLocation.latitude,
          )
        : NaN;

    const sellerLongitude =
      hasLongitude
        ? Number(
            sellerLocation.longitude,
          )
        : NaN;

    const sellerAccuracy =
      hasAccuracy
        ? Number(
            sellerLocation.accuracy,
          )
        : NaN;

    // =================================================
    // Detect Partial GPS
    // =================================================

    const hasPartialGps =
      (hasLatitude ||
        hasLongitude) &&
      !(
        Number.isFinite(
          sellerLatitude,
        ) &&
        Number.isFinite(
          sellerLongitude,
        )
      );

    if (
      hasPartialGps
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Both seller latitude and longitude are required when using live GPS.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Does Valid Seller GPS Exist?
    // =================================================

    const hasValidSellerGps =
      Number.isFinite(
        sellerLatitude,
      ) &&
      Number.isFinite(
        sellerLongitude,
      );

    // =================================================
    // Location Verification
    // =================================================

    let locationVerification:
      | {
          sellerLatitude: number;

          sellerLongitude: number;

          productLatitude: number;

          productLongitude: number;

          distanceKm: number;

          accuracy: number;

          status:
            | "nearby"
            | "different"
            | "far";

          method:
            | "device-gps";

          capturedAt: Date;
        }
      | null = null;

    // =================================================
    // Perform GPS Verification Only When GPS Exists
    // =================================================

    if (
      hasValidSellerGps
    ) {
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
      // Location Verification
      // =================================================

      locationVerification = {
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
          "device-gps",

        capturedAt:
          new Date(),
      };
    }

    // =================================================
    // Current Time
    // =================================================

    const now =
      new Date();

    // =================================================
    // Detect Product Location Change
    // =================================================

    const oldLatitude =
      Number(
        product.location
          ?.coordinates?.lat,
      );

    const oldLongitude =
      Number(
        product.location
          ?.coordinates?.lng,
      );

    const locationChanged =
      oldLatitude !==
        productLatitude ||
      oldLongitude !==
        productLongitude;

    // =================================================
    // Detect Title Change
    // =================================================

    const newTitle =
      String(
        body.title ??
          product.title ??
          "",
      ).trim();

    const titleChanged =
      newTitle !==
      String(
        product.title ??
          "",
      ).trim();

    // =================================================
    // SLUG
    //
    // IMPORTANT:
    //
    // If title did NOT change:
    // keep the existing slug.
    //
    // If title changed:
    // generate a unique slug.
    // =================================================

    const slug =
      titleChanged
        ? await generateUniqueProductSlug(
            newTitle,
            id,
          )
        : product.slug;

    // =================================================
    // Safe Update Object
    // =================================================

    const updateData: any = {
      title:
        newTitle,

      slug,

      description:
        body.description,

      price:
        Number(
          body.price,
        ),

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
        body.brand ??
        "",

      model:
        body.model ??
        "",

      condition:
        body.condition,

      images:
        body.images ??
        [],

      thumbnail:
        body.thumbnail ??
        body.images?.[0]?.url ??
        "",

      // =================================================
      // Product Location
      // =================================================

      location: {
        country:
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

      updatedAt:
        now,
    };

    // =================================================
    // Location Verification Handling
    //
    // 1. Fresh GPS exists:
    //    Save fresh verification.
    //
    // 2. No GPS + location unchanged:
    //    updateData does not touch verification.
    //
    // 3. No GPS + location changed:
    //    Remove old verification.
    // =================================================

    if (
      locationVerification
    ) {
      updateData.locationVerification =
        locationVerification;
    } else if (
      locationChanged
    ) {
      updateData.locationVerification =
        null;
    }

    // =================================================
    // Update Database
    // =================================================

    await updateProduct(
      id,
      updateData,
    );

    // =================================================
    // Revalidate Product Pages
    //
    // Old slug:
    // necessary when title changed.
    //
    // New slug:
    // always refresh.
    // =================================================

    if (
      product.slug
    ) {
      revalidatePath(
        `/products/${product.slug}`,
      );
    }

    if (
      slug &&
      slug !== product.slug
    ) {
      revalidatePath(
        `/products/${slug}`,
      );
    }

    // =================================================
    // Revalidate Main Listing Pages
    // =================================================

    revalidatePath(
      "/",
    );

    revalidatePath(
      "/search",
    );

    revalidatePath(
      "/dashboard/my-ads",
    );

    // =================================================
    // Success Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Product updated successfully.",

        productId:
          id,

        slug,

        gpsUsed:
          Boolean(
            locationVerification,
          ),

        locationVerification:
          locationVerification
            ? {
                distanceKm:
                  Number(
                    locationVerification
                      .distanceKm
                      .toFixed(
                        2,
                      ),
                  ),

                status:
                  locationVerification.status,

                accuracy:
                  Math.round(
                    locationVerification
                      .accuracy,
                  ),
              }
            : null,
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
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // =================================================
    // Product ID
    // =================================================

    const { id } =
      await params;

    // =================================================
    // Delete Product
    // =================================================

    const result =
      await deleteProductByOwner(
        id,
        session.user.id,
      );

    // =================================================
    // Product Not Found
    // =================================================

    if (
      !result.deletedCount
    ) {
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
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Product deleted successfully.",
      },
      {
        status: 200,
      },
    );
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
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // =================================================
    // Product ID
    // =================================================

    const { id } =
      await params;

    // =================================================
    // Existing Product
    // =================================================

    const product =
      await findProductById(
        id,
      );

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
    // Mark Product Sold
    // =================================================

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

    // =================================================
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Product marked as sold successfully.",
      },
      {
        status: 200,
      },
    );
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