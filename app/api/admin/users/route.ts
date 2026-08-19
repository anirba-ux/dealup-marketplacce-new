import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  findAllUsers,
  getUserStatistics,
} from "@/lib/repositories/admin-user.repository";

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
// GET USERS
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
        : 20;

    // =================================================
    // Database
    // =================================================

    const [
      users,
      statistics,
    ] = await Promise.all([
      findAllUsers({
        search,
        limit,
      }),

      getUserStatistics(),
    ]);

    // =================================================
    // Response
    // =================================================

    return NextResponse.json({
      success: true,

      users,

      statistics,
    });
  } catch (error) {
    console.error(
      "ADMIN USERS API ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to load users.",
      },
      {
        status: 500,
      },
    );
  }
}