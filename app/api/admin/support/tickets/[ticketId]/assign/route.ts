import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";

import clientPromise from "@/lib/db/mongodb";

import {
  assignSupportTicket,
  findTicketByTicketId,
} from "@/lib/repositories/support.repository";

import {
  createNotification,
} from "@/lib/repositories/notification.repository";

const DB_NAME = "dealup";
const USERS_COLLECTION = "users";

interface RouteContext {
  params: Promise<{
    ticketId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // =====================================================
    // Admin Authentication
    // =====================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 },
      );
    }

    // =====================================================
    // Ticket ID
    // =====================================================

    const { ticketId } = await context.params;

    const cleanTicketId = ticketId?.trim();

    if (!cleanTicketId) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket ID is required.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Find Ticket
    // =====================================================

    const ticket =
      await findTicketByTicketId(cleanTicketId);

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Support ticket not found.",
        },
        { status: 404 },
      );
    }

    // =====================================================
    // Closed Ticket Protection
    // =====================================================

    if (ticket.status === "closed") {
      return NextResponse.json(
        {
          success: false,
          message:
            "A closed ticket cannot be assigned.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Parse Request Body
    // =====================================================

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const agentId =
      typeof (body as { agentId?: unknown })
        ?.agentId === "string"
        ? (body as { agentId: string })
            .agentId.trim()
        : "";

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Agent ID is required.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Validate Agent ObjectId
    // =====================================================

    if (!ObjectId.isValid(agentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid agent ID.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Check Whether Assignment Actually Changed
    // =====================================================

    const previousAssignedTo =
      ticket.assignedTo?.toString() ?? null;

    const assignmentChanged =
      previousAssignedTo !== agentId;

    // =====================================================
    // Verify Agent
    //
    // The selected user must actually exist
    // and must have admin role.
    // =====================================================

    const client = await clientPromise;

    const usersCollection = client
      .db(DB_NAME)
      .collection(USERS_COLLECTION);

    const agent = await usersCollection.findOne(
      {
        _id: new ObjectId(agentId),
        role: "admin",
      },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          image: 1,
          role: 1,
        },
      },
    );

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected support agent was not found or is not an admin.",
        },
        { status: 404 },
      );
    }

    // =====================================================
    // Assign Ticket
    // =====================================================

    await assignSupportTicket(
      cleanTicketId,
      agentId,
    );

    // =====================================================
    // Reload Updated Ticket
    // =====================================================

    const updatedTicket =
      await findTicketByTicketId(
        cleanTicketId,
      );

    if (!updatedTicket) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ticket was assigned but could not be loaded again.",
        },
        { status: 500 },
      );
    }

    // =====================================================
    // Create Customer Notification
    //
    // Only create a notification when the assigned
    // support agent actually changes.
    // =====================================================

    if (
      assignmentChanged &&
      updatedTicket.userId
    ) {
      const agentName =
        typeof agent.name === "string" &&
        agent.name.trim()
          ? agent.name.trim()
          : "DealUp Support";

      await createNotification({
        userId: updatedTicket.userId,
        type: "support_ticket_assigned",
        title: "Support request assigned",
        message:
          `Your support request ${updatedTicket.ticketId} has been assigned to ${agentName}.`,
        ticketId: updatedTicket.ticketId,
      });
    }

    // =====================================================
    // Safe Response
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Support ticket assigned successfully.",
        ticket: {
          id:
            updatedTicket._id?.toString() ?? "",
          ticketId:
            updatedTicket.ticketId,
          status:
            updatedTicket.status,
          priority:
            updatedTicket.priority,
          assignedTo:
            updatedTicket.assignedTo
              ?.toString() ?? null,
          updatedAt:
            updatedTicket.updatedAt,
          resolvedAt:
            updatedTicket.resolvedAt ?? null,
          closedAt:
            updatedTicket.closedAt ?? null,
        },
        agent: {
          id:
            agent._id?.toString() ?? "",
          name:
            typeof agent.name === "string" &&
            agent.name.trim()
              ? agent.name.trim()
              : "DealUp Admin",
          email:
            typeof agent.email === "string"
              ? agent.email.trim()
              : "",
          image:
            typeof agent.image === "string" &&
            agent.image.trim()
              ? agent.image.trim()
              : null,
          role:
            typeof agent.role === "string"
              ? agent.role
              : "admin",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "ADMIN SUPPORT ASSIGNMENT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to assign support ticket.",
      },
      { status: 500 },
    );
  }
}