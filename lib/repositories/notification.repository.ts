import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

import {
  Notification,
  NotificationType,
} from "@/lib/models/notification";

const DB_NAME = "dealup";
const COLLECTION_NAME = "notifications";

// =====================================================
// Collection
// =====================================================

async function getCollection() {
  const client = await clientPromise;

  return client
    .db(DB_NAME)
    .collection<Notification>(COLLECTION_NAME);
}

// =====================================================
// Create Notification
// =====================================================

interface CreateNotificationInput {
  userId: string | ObjectId;

  type: NotificationType;

  title: string;

  message: string;

  ticketId?: string | null;
}

export async function createNotification(
  input: CreateNotificationInput,
) {
  const collection = await getCollection();

  const userId =
    input.userId instanceof ObjectId
      ? input.userId
      : new ObjectId(input.userId);

  const now = new Date();

  const notification: Notification = {
    userId,

    type: input.type,

    title: input.title.trim(),

    message: input.message.trim(),

    ticketId:
      input.ticketId?.trim() || null,

    read: false,

    createdAt: now,

    updatedAt: now,
  };

  const result =
    await collection.insertOne(
      notification,
    );

  return {
    ...notification,
    _id: result.insertedId,
  };
}

// =====================================================
// Find User Notifications
// =====================================================

export async function findNotificationsByUser(
  userId: string,
  limit = 50,
) {
  if (!ObjectId.isValid(userId)) {
    return [];
  }

  const collection = await getCollection();

  const safeLimit = Math.min(
    Math.max(limit, 1),
    100,
  );

  return collection
    .find({
      userId: new ObjectId(userId),
    })
    .sort({
      createdAt: -1,
    })
    .limit(safeLimit)
    .toArray();
}

// =====================================================
// Count Unread Notifications
// =====================================================

export async function countUnreadNotifications(
  userId: string,
) {
  if (!ObjectId.isValid(userId)) {
    return 0;
  }

  const collection = await getCollection();

  return collection.countDocuments({
    userId: new ObjectId(userId),
    read: false,
  });
}

// =====================================================
// Mark One Notification as Read
// =====================================================

export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
) {
  if (
    !ObjectId.isValid(notificationId) ||
    !ObjectId.isValid(userId)
  ) {
    return false;
  }

  const collection = await getCollection();

  const result =
    await collection.updateOne(
      {
        _id: new ObjectId(
          notificationId,
        ),

        userId: new ObjectId(userId),
      },
      {
        $set: {
          read: true,
          updatedAt: new Date(),
        },
      },
    );

  return result.modifiedCount > 0;
}

// =====================================================
// Mark All Notifications as Read
// =====================================================

export async function markAllNotificationsAsRead(
  userId: string,
) {
  if (!ObjectId.isValid(userId)) {
    return 0;
  }

  const collection = await getCollection();

  const result =
    await collection.updateMany(
      {
        userId: new ObjectId(userId),
        read: false,
      },
      {
        $set: {
          read: true,
          updatedAt: new Date(),
        },
      },
    );

  return result.modifiedCount;
}