import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

type ReportStatus =
  | "pending"
  | "reviewing"
  | "resolved"
  | "rejected";

interface RouteContext {
  params: Promise<{
    reportId: string;
  }>;
}

const allowedStatuses: ReportStatus[] = [
  "pending",
  "reviewing",
  "resolved",
  "rejected",
];

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // ================================================
    // Authentication
    // ================================================

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

    // ================================================
    // Admin Authorization
    // ================================================

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    // ================================================
    // Params
    // ================================================

    const { reportId } = await context.params;

    if (!ObjectId.isValid(reportId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid report ID.",
        },
        {
          status: 400,
        },
      );
    }

    // ================================================
    // Request Body
    // ================================================

    const body = await request.json();

    const newStatus =
      String(body?.status ?? "") as ReportStatus;

    // ================================================
    // Validate Status
    // ================================================

    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid report status.",
        },
        {
          status: 400,
        },
      );
    }

    // ================================================
    // Database
    // ================================================

    const client = await clientPromise;

    const db = client.db("dealup");

    const reportsCollection =
      db.collection("reports");

    // ================================================
    // Find Report
    // ================================================

    const report =
      await reportsCollection.findOne({
        _id: new ObjectId(reportId),
      });

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: "Report not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ================================================
    // Already Same Status
    // ================================================

    if (report.status === newStatus) {
      return NextResponse.json({
        success: true,
        message:
          "Report already has this status.",
        status: newStatus,
      });
    }

    // ================================================
    // Update
    // ================================================

    const now = new Date();

    await reportsCollection.updateOne(
      {
        _id: new ObjectId(reportId),
      },
      {
        $set: {
          status: newStatus,
          updatedAt: now,
        },
      },
    );

    // ================================================
    // Response
    // ================================================

    return NextResponse.json({
      success: true,
      message:
        "Report status updated successfully.",
      reportId,
      status: newStatus,
    });
  } catch (error) {
    console.error(
      "ADMIN REPORT STATUS UPDATE ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update report status.",
      },
      {
        status: 500,
      },
    );
  }
}