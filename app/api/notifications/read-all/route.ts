import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  markAllNotificationsAsRead,
} from "@/lib/repositories/notification.repository";

export async function PATCH() {
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
        { status: 401 },
      );
    }

    // =================================================
    // Mark All as Read
    // =================================================

    const updatedCount =
      await markAllNotificationsAsRead(
        session.user.id,
      );

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "All notifications marked as read.",

        updatedCount,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "NOTIFICATIONS READ ALL ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to mark all notifications as read.",
      },
      { status: 500 },
    );
  }
}