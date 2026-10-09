import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

import {
  createService,
  searchServicesPage,
} from "@/lib/repositories/service.repository";

import { serviceSchema } from "@/lib/validations/service";


// =====================================================
// Helper: Create URL-safe slug
// =====================================================

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}


// =====================================================
// GET /api/services
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // ---------------------------------------------------
    // Search
    // ---------------------------------------------------

    const query =
      searchParams.get("query")?.trim() || undefined;

    const category =
      searchParams.get("category") || undefined;

    const subcategory =
      searchParams.get("subcategory") || undefined;

    const city =
      searchParams.get("city") || undefined;

    const district =
      searchParams.get("district") || undefined;

    // ---------------------------------------------------
    // Listing Type
    // ---------------------------------------------------

    const listingTypeParam =
      searchParams.get("listingType");

    const listingType =
      listingTypeParam === "service" ||
      listingTypeParam === "business"
        ? listingTypeParam
        : undefined;

    // ---------------------------------------------------
    // Service Mode
    // ---------------------------------------------------

    const serviceModeParam =
      searchParams.get("serviceMode");

    const serviceMode =
      serviceModeParam === "at_business" ||
      serviceModeParam === "home_visit" ||
      serviceModeParam === "both" ||
      serviceModeParam === "remote"
        ? serviceModeParam
        : undefined;

    // ---------------------------------------------------
    // Pagination
    // ---------------------------------------------------

    const pageParam = Number(
      searchParams.get("page") || "1"
    );

    const limitParam = Number(
      searchParams.get("limit") || "20"
    );

    const page =
      Number.isFinite(pageParam) && pageParam > 0
        ? Math.floor(pageParam)
        : 1;

    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.floor(limitParam), 50)
        : 20;

    // ---------------------------------------------------
    // Search Services
    // ---------------------------------------------------

    const result = await searchServicesPage({
      query,
      category,
      subcategory,
      city,
      district,
      listingType,
      serviceMode,
      page,
      limit,
    });

    // ---------------------------------------------------
    // Response
    // ---------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "[GET /api/services]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch services",
      },
      {
        status: 500,
      }
    );
  }
}


// =====================================================
// POST /api/services
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // ---------------------------------------------------
    // Authentication
    // ---------------------------------------------------

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        {
          status: 401,
        }
      );
    }

    // ---------------------------------------------------
    // Authenticated User ID
    // ---------------------------------------------------

    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User identity could not be verified",
        },
        {
          status: 401,
        }
      );
    }

    // ---------------------------------------------------
    // Validate MongoDB ObjectId
    // ---------------------------------------------------

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user identity",
        },
        {
          status: 401,
        }
      );
    }

    // ---------------------------------------------------
    // Parse JSON
    // ---------------------------------------------------

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------
    // Validate Service Data
    // ---------------------------------------------------

    const parsed =
      serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid service data",
          errors: parsed.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const data = parsed.data;

    // ---------------------------------------------------
    // Validate Coordinates
    // ---------------------------------------------------

    const latitude =
      data.location.coordinates.lat;

    const longitude =
      data.location.coordinates.lng;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid location coordinates are required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      latitude === 0 &&
      longitude === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a valid service location",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------
    // MongoDB
    // ---------------------------------------------------

    const client = await clientPromise;

    const db = client.db("dealup");

    // ---------------------------------------------------
    // Load Current User
    // ---------------------------------------------------

    const user = await db
      .collection("users")
      .findOne(
        {
          _id: new ObjectId(userId),
        },
        {
          projection: {
            name: 1,
            email: 1,
            phone: 1,
            image: 1,
            isPhoneVerified: 1,
            isVerified: 1,
            sellerVerification: 1,
            trustScore: 1,
          },
        }
      );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found",
        },
        {
          status: 404,
        }
      );
    }

    // ---------------------------------------------------
    // Create Base Slug
    // ---------------------------------------------------

    const baseSlug = createSlug(data.title);

    if (!baseSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid service title is required",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------------------------
    // Generate Unique Slug
    // ---------------------------------------------------

    let slug = baseSlug;

    const existingSlug =
      await db.collection("services").findOne(
        {
          slug,
        },
        {
          projection: {
            _id: 1,
          },
        }
      );

    if (existingSlug) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    // ---------------------------------------------------
    // Create Service
    // ---------------------------------------------------

    const service = {
      ...data,

      // -------------------------------------------------
      // Required Model Fields
      // -------------------------------------------------

      slug,

      currency: "INR" as const,

      // -------------------------------------------------
      // Seller Information
      // -------------------------------------------------

      sellerId: userId,

      sellerName:
        user.name ||
        session.user.name ||
        "DealUp Seller",

      sellerPhone:
        user.phone || undefined,

      // -------------------------------------------------
      // Verification
      // -------------------------------------------------

      phoneVerified:
        user.isPhoneVerified ?? false,

      identityVerified:
        user.sellerVerification
          ?.identityVerified ?? false,

      businessVerified: false,

      trustedProvider: false,

      // -------------------------------------------------
      // Promotion
      // -------------------------------------------------

      isFeatured: false,

      isBoosted: false,

      // -------------------------------------------------
      // Counters
      // -------------------------------------------------

      views: 0,

      enquiries: 0,

      favorites: 0,

      // -------------------------------------------------
      // Status
      // -------------------------------------------------

      status: "active" as const,

      // -------------------------------------------------
      // Timestamps
      // -------------------------------------------------

      createdAt: new Date(),

      updatedAt: new Date(),
    };

    // ---------------------------------------------------
    // Save
    // ---------------------------------------------------

    const created =
      await createService(service);

    // ---------------------------------------------------
    // Success
    // ---------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Service published successfully",
        service: created,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "[POST /api/services]",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create service",
      },
      {
        status: 500,
      }
    );
  }
}