
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";
import { findServiceById } from "@/lib/repositories/service.repository";

const DB_NAME = "dealup";
const FEATURED_PRICE = 29;
const FEATURED_DAYS = 14;

type Plan = "monthly" | "quarterly" | "yearly";

const FEATURED_QUOTAS: Record<Plan, number> = {
  monthly: 3,
  quarterly: 9,
  yearly: 36,
};

function getPlan(value: unknown): Plan | null {
  if (typeof value !== "string") return null;

  const plan = value.toLowerCase();

  if (plan === "monthly") return "monthly";
  if (plan === "quarterly") return "quarterly";
  if (plan === "yearly") return "yearly";

  return null;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  let quotaReserved = false;
  let userId = "";
  let serviceId = "";

  try {
    const session = await auth();
    userId = session?.user?.id ?? "";

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    serviceId = resolvedParams.serviceId;

    if (!ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid service ID." },
        { status: 400 }
      );
    }

    const service = await findServiceById(serviceId);

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404 }
      );
    }

    if (String(service.sellerId) !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only feature your own service.",
        },
        { status: 403 }
      );
    }

    if (service.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Only active services can be featured.",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    if (
      service.isFeatured === true &&
      service.featuredUntil &&
      new Date(service.featuredUntil).getTime() > now.getTime()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This service is already featured.",
        },
        { status: 409 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");
    const services = db.collection("services");

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          premiumSeller: 1,
        },
      }
    );

    const premiumSeller = user?.premiumSeller as
      | {
          active?: boolean;
          expiresAt?: Date | string;
          plan?: string;
          featuredAds?: boolean;
          featuredAdsUsed?: number;
        }
      | undefined;

    const premiumExpiry = premiumSeller?.expiresAt
      ? new Date(premiumSeller.expiresAt).getTime()
      : 0;

    const isPremiumActive =
      premiumSeller?.active === true &&
      Number.isFinite(premiumExpiry) &&
      premiumExpiry > now.getTime();

    if (!isPremiumActive) {
      return NextResponse.json(
        {
          success: false,
          paymentRequired: true,
          paymentType: "FEATURED_AD",
          price: FEATURED_PRICE,
          currency: "INR",
          durationDays: FEATURED_DAYS,
          message:
            "Active Premium Seller membership is required to feature a service.",
        },
        { status: 402 }
      );
    }

    if (premiumSeller?.featuredAds !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "Featured Ads are not included in your current plan.",
        },
        { status: 403 }
      );
    }

    const plan = getPlan(premiumSeller.plan);

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message: "Your Premium Seller plan could not be verified.",
        },
        { status: 400 }
      );
    }

    const quotaLimit = FEATURED_QUOTAS[plan];
    const used = Math.max(
      0,
      Number(premiumSeller.featuredAdsUsed ?? 0)
    );

    // Free Featured quota exhausted: use the existing Cashfree checkout.
    if (used >= quotaLimit) {
      return NextResponse.json(
        {
          success: false,
          paymentRequired: true,
          paymentType: "FEATURED_AD",
          serviceId,
          price: FEATURED_PRICE,
          currency: "INR",
          durationDays: FEATURED_DAYS,
          message:
            "Your free Featured Ads quota is exhausted. Pay ₹29 to feature this service for 14 days.",
        },
        { status: 402 }
      );
    }

    // Reserve one free Featured quota atomically.
    const quotaResult = await users.updateOne(
      {
        _id: new ObjectId(userId),
        "premiumSeller.active": true,
        "premiumSeller.featuredAds": true,
        "premiumSeller.plan": premiumSeller.plan,
        "premiumSeller.expiresAt": { $gt: now },
        $expr: {
          $lt: [
            { $ifNull: ["$premiumSeller.featuredAdsUsed", 0] },
            quotaLimit,
          ],
        },
      },
      {
        $inc: {
          "premiumSeller.featuredAdsUsed": 1,
        },
      }
    );

    if (quotaResult.modifiedCount !== 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your Featured quota has changed. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    quotaReserved = true;

    const featuredUntil = new Date(
      now.getTime() + FEATURED_DAYS * 24 * 60 * 60 * 1000
    );

    // Activate only if the service is still eligible.
    const serviceResult = await services.updateOne(
      {
        _id: new ObjectId(serviceId),
        sellerId: userId,
        status: "active",
        $or: [
          { isFeatured: { $ne: true } },
          { featuredUntil: { $lte: now } },
          { featuredUntil: { $exists: false } },
          { featuredUntil: null },
        ],
      },
      {
        $set: {
          isFeatured: true,
          featuredAt: now,
          featuredUntil,
          updatedAt: now,
        },
      }
    );

    if (serviceResult.modifiedCount !== 1) {
      // Service activation failed: return the reserved quota.
      await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $inc: {
            "premiumSeller.featuredAdsUsed": -1,
          },
        }
      );

      quotaReserved = false;

      return NextResponse.json(
        {
          success: false,
          message:
            "The service could not be featured. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    quotaReserved = false;

    return NextResponse.json({
      success: true,
      paymentRequired: false,
      message: "Service featured successfully using your free quota.",
      serviceId,
      featuredAt: now,
      featuredUntil,
      quota: {
        plan,
        used: used + 1,
        limit: quotaLimit,
        remaining: quotaLimit - used - 1,
      },
    });
  } catch (error) {
    // Best-effort rollback if an unexpected error happens after reservation.
    if (quotaReserved && userId && ObjectId.isValid(userId)) {
      try {
        const client = await clientPromise;

        await client
          .db(DB_NAME)
          .collection("users")
          .updateOne(
            { _id: new ObjectId(userId) },
            {
              $inc: {
                "premiumSeller.featuredAdsUsed": -1,
              },
            }
          );
      } catch (rollbackError) {
        console.error(
          "Featured quota rollback failed:",
          rollbackError
        );
      }
    }

    console.error("Service feature API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to feature this service right now.",
      },
      { status: 500 }
    );
  }
}
