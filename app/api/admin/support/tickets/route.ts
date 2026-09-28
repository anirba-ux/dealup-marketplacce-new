import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  findAllAdminSupportTickets,
  getAdminSupportStatistics,
} from "@/lib/repositories/adminSupport.repository";

// =====================================================
// GET
// Admin Support Tickets
// =====================================================

export async function GET(request: NextRequest) {
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

    // =================================================
    // Admin Authorization
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
    // Search Params
    // =================================================

    const { searchParams } = new URL(request.url);

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      searchParams.get("status")?.trim() || "";

    const category =
      searchParams.get("category")?.trim() || "";

    const priority =
      searchParams.get("priority")?.trim() || "";

    const limitParam =
      searchParams.get("limit");

    const limit = limitParam
      ? Number(limitParam)
      : 100;

    // =================================================
    // Fetch Tickets + Statistics
    // =================================================

    const [tickets, statistics] =
      await Promise.all([
        findAllAdminSupportTickets({
          search,
          status: status as any,
          category: category as any,
          priority: priority as any,
          limit,
        }),

        getAdminSupportStatistics(),
      ]);

    // =================================================
    // Safe Response
    // =================================================

    const safeTickets = tickets.map(
      (ticket) => ({
        id:
          ticket._id?.toString() ?? "",

        ticketId:
          ticket.ticketId,

        userId:
          ticket.userId?.toString() ?? "",

        userName:
          ticket.userName,

        userEmail:
          ticket.userEmail,

        category:
          ticket.category,

        subject:
          ticket.subject,

        description:
          ticket.description,

        productId:
          ticket.productId?.toString() ?? null,

        status:
          ticket.status,

        priority:
          ticket.priority,

        assignedTo:
          ticket.assignedTo?.toString() ?? null,

        createdAt:
          ticket.createdAt,

        updatedAt:
          ticket.updatedAt,

        resolvedAt:
          ticket.resolvedAt ?? null,

        closedAt:
          ticket.closedAt ?? null,
      }),
    );

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        tickets: safeTickets,

        count: safeTickets.length,

        statistics,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "ADMIN SUPPORT TICKETS GET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load support tickets.",
      },
      {
        status: 500,
      },
    );
  }
}