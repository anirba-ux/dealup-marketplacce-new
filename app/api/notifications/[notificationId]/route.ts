import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  markNotificationAsRead,
} from "@/lib/repositories/notification.repository";

interface RouteContext {
  params: Promise<{
    notificationId: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
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

    const { notificationId } =
      await context.params;

    const cleanNotificationId =
      notificationId?.trim();

    if (!cleanNotificationId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Notification ID is required.",
        },
        { status: 400 },
      );
    }

    const updated =
      await markNotificationAsRead(
        cleanNotificationId,
        session.user.id,
      );

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Notification not found or already marked as read.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Notification marked as read.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "NOTIFICATION READ ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to mark notification as read.",
      },
      { status: 500 },
    );
  }
}