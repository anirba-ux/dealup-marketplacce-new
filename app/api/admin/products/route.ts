import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  findAllAdminProducts,
  getProductStatistics,
} from "@/lib/repositories/admin-product.repository";

// =====================================================
// Admin Authorization
// =====================================================

async function requireAdmin(): Promise<
  | {
      authorized: true;
      response: null;
    }
  | {
      authorized: false;
      response: NextResponse;
    }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      authorized: false,

      response: NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      ),
    };
  }

  if (session.user.role !== "admin") {
    return {
      authorized: false,

      response: NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        },
      ),
    };
  }

  return {
    authorized: true,
    response: null,
  };
}

// =====================================================
// GET ADMIN PRODUCTS
// =====================================================

export async function GET(
  request: NextRequest,
) {
  try {
    // =================================================
    // Security
    // =================================================

    const admin =
      await requireAdmin();

    if (!admin.authorized) {
      return admin.response;
    }

    // =================================================
    // Search
    // =================================================

    const search =
      request.nextUrl.searchParams.get(
        "search",
      ) ?? "";

    // =================================================
    // Limit
    // =================================================

    const limitParam =
      request.nextUrl.searchParams.get(
        "limit",
      );

    const parsedLimit =
      Number(limitParam);

    const limit =
      Number.isFinite(parsedLimit)
        ? parsedLimit
        : 50;

    // =================================================
    // Database
    // =================================================

    const [
      products,
      statistics,
    ] = await Promise.all([
      findAllAdminProducts({
        search,
        limit,
      }),

      getProductStatistics(),
    ]);

    // =================================================
    // Response
    // =================================================

    return NextResponse.json({
      success: true,

      products,

      statistics,
    });
  } catch (error) {
    console.error(
      "ADMIN PRODUCTS API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load products.",
      },
      {
        status: 500,
      },
    );
  }
}