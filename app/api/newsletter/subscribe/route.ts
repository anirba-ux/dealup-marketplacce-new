import { NextResponse } from "next/server";

import clientPromise from "@/lib/db/mongodb";

const DATABASE_NAME = "dealup";

const SUBSCRIBERS_COLLECTION = "newsletterSubscribers";
const NOTIFICATIONS_COLLECTION = "adminNotifications";

export async function POST(request: Request) {
  try {
    // =====================================================
    // Read Request
    // =====================================================

    const body = await request.json();

    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    // =====================================================
    // Validate Email
    // =====================================================

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your email address.",
        },
        { status: 400 },
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // Database
    // =====================================================

    const client = await clientPromise;

    const db = client.db(DATABASE_NAME);

    const subscribers =
      db.collection(SUBSCRIBERS_COLLECTION);

    const notifications =
      db.collection(NOTIFICATIONS_COLLECTION);

    // =====================================================
    // Prevent Duplicate Emails
    // =====================================================

    await subscribers.createIndex(
      { email: 1 },
      { unique: true },
    );

    const existingSubscriber =
      await subscribers.findOne(
        { email },
        {
          projection: {
            _id: 1,
          },
        },
      );

    // =====================================================
    // Already Subscribed
    // =====================================================

    if (existingSubscriber) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message:
          "You are already subscribed to the DealUp newsletter.",
      });
    }

    // =====================================================
    // Create Subscriber
    // =====================================================

    const now = new Date();

    const subscriberResult =
      await subscribers.insertOne({
        email,
        status: "active",
        source: "footer",
        subscribedAt: now,
        updatedAt: now,
      });

    // =====================================================
    // Create Admin Notification
    // =====================================================

    await notifications.insertOne({
      type: "newsletter_subscriber",

      title: "New Newsletter Subscriber",

      message:
        "A new user has subscribed to the DealUp newsletter.",

      email,

      subscriberId:
        subscriberResult.insertedId,

      read: false,

      priority: "normal",

      createdAt: now,

      updatedAt: now,
    });

    // =====================================================
    // Success
    // =====================================================

    return NextResponse.json({
      success: true,
      alreadySubscribed: false,
      message:
        "You have successfully subscribed to the DealUp newsletter.",
    });
  } catch (error: any) {
    console.error(
      "NEWSLETTER SUBSCRIBE ERROR:",
      error,
    );

    // =====================================================
    // Duplicate Key Protection
    // =====================================================

    if (error?.code === 11000) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message:
          "You are already subscribed to the DealUp newsletter.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to subscribe right now. Please try again.",
      },
      { status: 500 },
    );
  }
}