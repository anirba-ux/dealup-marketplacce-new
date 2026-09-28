import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  createSupportTicket,
  findTicketsByUser,
} from "@/lib/repositories/support.repository";

import { createNotification } from "@/lib/repositories/notification.repository";

import type {
  SupportTicketCategory,
  SupportTicketPriority,
} from "@/lib/models/supportTicket";

const validCategories: SupportTicketCategory[] = [
  "account",
  "buying",
  "selling",
  "payment",
  "verification",
  "messages",
  "safety",
  "technical",
  "other",
];

function getPriority(
  category: SupportTicketCategory,
): SupportTicketPriority {
  switch (category) {
    case "safety":
      return "high";

    case "payment":
      return "high";

    case "verification":
      return "normal";

    case "account":
      return "normal";

    case "technical":
      return "normal";

    default:
      return "normal";
  }
}

/* =========================================================
   GET
   Current logged-in user's support tickets
   ========================================================= */

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please log in to view your support tickets.",
        },
        { status: 401 },
      );
    }

    const userId = String(session.user.id);

    const tickets = await findTicketsByUser(
      userId,
      50,
    );

    const safeTickets = tickets.map(
      (ticket) => ({
        id:
          ticket._id?.toString() ?? "",

        ticketId:
          ticket.ticketId,

        category:
          ticket.category,

        subject:
          ticket.subject,

        description:
          ticket.description,

        productId:
          ticket.productId?.toString() ??
          null,

        status:
          ticket.status,

        priority:
          ticket.priority,

        assignedTo:
          ticket.assignedTo?.toString() ??
          null,

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

    return NextResponse.json(
      {
        success: true,

        tickets:
          safeTickets,

        count:
          safeTickets.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Support ticket fetch error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load your support tickets right now.",
      },
      { status: 500 },
    );
  }
}

/* =========================================================
   POST
   Create a new support ticket
   ========================================================= */

export async function POST(
  request: Request,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please log in to create a support request.",
        },
        { status: 401 },
      );
    }

    const userId = String(
      session.user.id,
    );

    const userEmail =
      typeof session.user.email ===
      "string"
        ? session.user.email
            .trim()
            .toLowerCase()
        : "";

    const userName =
      typeof session.user.name ===
        "string" &&
      session.user.name.trim()
        ? session.user.name.trim()
        : "DealUp User";

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account email is required to create a support request.",
        },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const requestBody =
      body as {
        category?: unknown;
        subject?: unknown;
        description?: unknown;
        productId?: unknown;
      };

    const category =
      typeof requestBody.category ===
      "string"
        ? requestBody.category.trim()
        : "";

    const subject =
      typeof requestBody.subject ===
      "string"
        ? requestBody.subject.trim()
        : "";

    const description =
      typeof requestBody.description ===
      "string"
        ? requestBody.description.trim()
        : "";

    const productId =
      typeof requestBody.productId ===
        "string" &&
      requestBody.productId.trim()
        ? requestBody.productId.trim()
        : null;

    /* =====================================================
       Category validation
       ===================================================== */

    if (
      !validCategories.includes(
        category as SupportTicketCategory,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select a valid support category.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       Subject validation
       ===================================================== */

    if (!subject) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject is required.",
        },
        { status: 400 },
      );
    }

    if (subject.length > 150) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subject cannot be longer than 150 characters.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       Description validation
       ===================================================== */

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please describe your problem.",
        },
        { status: 400 },
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide more details about your problem.",
        },
        { status: 400 },
      );
    }

    if (description.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Description cannot be longer than 3000 characters.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       Create ticket
       ===================================================== */

    const ticketCategory =
      category as SupportTicketCategory;

    const priority =
      getPriority(ticketCategory);

    const ticket =
      await createSupportTicket({
        userId,

        userEmail,

        userName,

        category:
          ticketCategory,

        subject,

        description,

        productId,

        priority,
      });

    /* =====================================================
       Create notification
       Ticket created → notify customer
       ===================================================== */

    await createNotification({
      userId,

      type:
        "support_ticket_created",

      title:
        "Support request created",

      message:
        `Your support request ${ticket.ticketId} has been created successfully. Our support team will review it shortly.`,

      ticketId:
        ticket.ticketId,
    });

    /* =====================================================
       Success response
       ===================================================== */

    return NextResponse.json(
      {
        success: true,

        message:
          "Your support request has been submitted successfully.",

        ticketId:
          ticket.ticketId,

        status:
          ticket.status,

        priority:
          ticket.priority,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Support ticket creation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create your support request right now. Please try again later.",
      },
      { status: 500 },
    );
  }
}