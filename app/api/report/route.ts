import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import { createReport, findReportByUserAndProduct } from "@/lib/repositories/report.repository";

import { findProductById } from "@/lib/repositories/product.repository";

const allowedReasons = [
  "spam",
  "fake",
  "duplicate",
  "wrong_category",
  "scam",
  "sold",
  "other",
] as const;

export async function POST(
  req: NextRequest,
) {
  try {
    // =====================================================
    // 1. Authentication
    // =====================================================

    const session = await auth();

    const currentUserId =
      session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must be logged in to report a product.",
        },
        {
          status: 401,
        },
      );
    }

    // =====================================================
    // 2. Request Body
    // =====================================================

    const body = await req.json();

    const productId =
      String(body?.productId ?? "").trim();

    const sellerId =
      String(body?.sellerId ?? "").trim();

    const reason =
      String(body?.reason ?? "").trim();

    const message =
      String(body?.message ?? "").trim();

    // =====================================================
    // 3. Basic Validation
    // =====================================================

    if (
      !productId ||
      !sellerId ||
      !reason
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 4. Validate Report Reason
    // =====================================================

    if (
      !allowedReasons.includes(
        reason as (typeof allowedReasons)[number],
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid report reason.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 5. Validate Message Length
    // =====================================================

    if (message.length > 300) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Additional details cannot exceed 300 characters.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 6. Prevent Self Reporting
    // =====================================================

    if (
      String(currentUserId) ===
      sellerId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot report your own product.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 7. Find Product
    // =====================================================

    const product =
      await findProductById(
        productId,
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

    // =====================================================
    // 8. Verify Seller
    //
    // Never trust sellerId coming
    // directly from the browser.
    // =====================================================

    if (
      String(product.sellerId) !==
      sellerId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Seller information does not match the product.",
        },
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // 9. Prevent Duplicate Reports
    // =====================================================

    const existingReport =
      await findReportByUserAndProduct(
        productId,
        String(currentUserId),
      );

    if (existingReport) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You have already reported this product.",
        },
        {
          status: 409,
        },
      );
    }

    // =====================================================
    // 10. Create Report
    // =====================================================

    const now = new Date();

    await createReport({
      productId,

      sellerId,

      reportedBy:
        String(currentUserId),

      reason:
        reason as any,

      message:
        message || undefined,

      status:
        "pending",

      createdAt:
        now,

      updatedAt:
        now,
    });

    // =====================================================
    // 11. Success
    // =====================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Product reported successfully.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "REPORT PRODUCT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}