import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  countUnreadNotifications,
  findNotificationsByUser,
} from "@/lib/repositories/notification.repository";

export async function GET() {
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

    const userId = session.user.id;

    // =================================================
    // Load Notifications
    // =================================================

    const [
      notifications,
      unreadCount,
    ] = await Promise.all([
      findNotificationsByUser(
        userId,
        50,
      ),

      countUnreadNotifications(
        userId,
      ),
    ]);

    // =================================================
    // Safe Response
    // =================================================

    const safeNotifications =
      notifications.map(
        (notification) => ({
          id:
            notification._id?.toString() ??
            "",

          type:
            notification.type,

          title:
            notification.title,

          message:
            notification.message,

          ticketId:
            notification.ticketId ??
            null,

          read:
            notification.read,

          createdAt:
            notification.createdAt,

          updatedAt:
            notification.updatedAt,
        }),
      );

    return NextResponse.json(
      {
        success: true,

        notifications:
          safeNotifications,

        unreadCount,

        count:
          safeNotifications.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "NOTIFICATIONS GET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load notifications.",
      },
      { status: 500 },
    );
  }
}