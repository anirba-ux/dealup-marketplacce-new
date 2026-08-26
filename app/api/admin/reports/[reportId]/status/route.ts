import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Report Status
// =====================================================

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

// =====================================================
// PATCH — Admin Update Report Status
// =====================================================

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // =================================================
    // 1. Authentication
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

    // =================================================
    // 2. Admin Authorization
    // =================================================

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

    // =================================================
    // 3. Report ID
    // =================================================

    const { reportId } =
      await context.params;

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

    // =================================================
    // 4. Request Body
    // =================================================

    const body = await request.json();

    const newStatus =
      String(
        body?.status ?? "",
      ) as ReportStatus;

    const adminNote =
      String(
        body?.adminNote ?? "",
      ).trim();

    // =================================================
    // 5. Validate Status
    // =================================================

    if (
      !allowedStatuses.includes(
        newStatus,
      )
    ) {
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

    // =================================================
    // 6. Validate Admin Note
    // =================================================

    if (adminNote.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin note cannot exceed 1000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // 7. Database
    // =================================================

    const client =
      await clientPromise;

    const db =
      client.db("dealup");

    const reportsCollection =
      db.collection("reports");

    // =================================================
    // 8. Find Report
    // =================================================

    const report =
      await reportsCollection.findOne({
        _id:
          new ObjectId(reportId),
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

    // =================================================
    // 9. Already Same Status
    // =================================================

    if (
      report.status ===
        newStatus &&
      !adminNote
    ) {
      return NextResponse.json({
        success: true,

        message:
          "Report already has this status.",

        reportId,

        status:
          newStatus,
      });
    }

    // =================================================
    // 10. Update Metadata
    // =================================================

    const now =
      new Date();

    const updateData: Record<
      string,
      unknown
    > = {
      status:
        newStatus,

      updatedAt:
        now,

      reviewedBy:
        String(
          session.user.id,
        ),

      reviewedAt:
        now,
    };

    // =================================================
    // 11. Admin Note
    //
    // Only save when supplied.
    // Existing note is not accidentally
    // overwritten with an empty string.
    // =================================================

    if (adminNote) {
      updateData.adminNote =
        adminNote;
    }

    // =================================================
    // 12. Update Report
    // =================================================

    await reportsCollection.updateOne(
      {
        _id:
          new ObjectId(reportId),
      },
      {
        $set:
          updateData,
      },
    );

    // =================================================
    // 13. Response
    // =================================================

    return NextResponse.json({
      success: true,

      message:
        "Report status updated successfully.",

      reportId,

      status:
        newStatus,

      reviewedBy:
        String(
          session.user.id,
        ),

      reviewedAt:
        now,

      ...(adminNote
        ? {
            adminNote,
          }
        : {}),
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