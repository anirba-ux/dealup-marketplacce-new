
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";
import { findServiceById } from "@/lib/repositories/service.repository";

interface RouteProps {
  params: Promise<{ serviceId: string }>;
}

function getBoostLimit(plan: unknown): number {
  if (plan === "monthly") return 10;
  if (plan === "quarterly") return 30;
  if (plan === "yearly") return 120;
  return 0;
}

export async function PATCH(
  _request: Request,
  { params }: RouteProps,
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 },
      );
    }

    const sellerId = String(session.user.id);
    const { serviceId } = await params;

    if (!ObjectId.isValid(serviceId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Service ID." },
        { status: 400 },
      );
    }

    const service = await findServiceById(serviceId);

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found." },
        { status: 404 },
      );
    }

    if (String(service.sellerId) !== sellerId) {
      return NextResponse.json(
        { success: false, message: "You cannot boost another seller's Service." },
        { status: 403 },
      );
    }

    if (service.status !== "active") {
      return NextResponse.json(
        { success: false, message: "Only active Services can be boosted." },
        { status: 400 },
      );
    }

    const now = new Date();
    const currentBoostExpiry = service.boostedUntil
      ? new Date(service.boostedUntil)
      : null;

    if (
      currentBoostExpiry &&
      !Number.isNaN(currentBoostExpiry.getTime()) &&
      currentBoostExpiry.getTime() > now.getTime()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "This Service is already boosted.",
          boostedUntil: currentBoostExpiry,
        },
        { status: 409 },
      );
    }

    if (!ObjectId.isValid(sellerId)) {
      return NextResponse.json(
        { success: false, message: "Invalid seller account." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("dealup");
    const users = db.collection("users");

    const user = await users.findOne(
      { _id: new ObjectId(sellerId) },
      { projection: { premiumSeller: 1 } },
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Seller account not found." },
        { status: 404 },
      );
    }

    const premium = user.premiumSeller;
    const premiumExpiry = premium?.expiresAt
      ? new Date(premium.expiresAt)
      : null;

    const isPremium =
      premium?.active === true &&
      premiumExpiry !== null &&
      !Number.isNaN(premiumExpiry.getTime()) &&
      premiumExpiry.getTime() > now.getTime();

    // Free sellers must pay ₹29 for 7 days.
    if (!isPremium) {
      return NextResponse.json(
        {
          success: false,
          paymentRequired: true,
          paymentType: "BOOST_AD",
          price: 29,
          currency: "INR",
          durationDays: 7,
          isPremiumSeller: false,
          boostAdsLimit: 0,
          boostAdsUsed: 0,
          boostAdsRemaining: 0,
          message: "Payment is required to boost this Service.",
        },
        { status: 402 },
      );
    }

    const boostAdsLimit =
      Number(premium.boostAdsLimit ?? 0) > 0
        ? Number(premium.boostAdsLimit)
        : getBoostLimit(premium.plan);

    if (boostAdsLimit <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid Premium Seller plan." },
        { status: 400 },
      );
    }

    const boostAdsUsed = Math.max(
      0,
      Number(premium.boostAdsUsed ?? 0),
    );

    // Premium quota exhausted: paid Boost is ₹19 for 7 days.
    if (boostAdsUsed >= boostAdsLimit) {
      return NextResponse.json(
        {
          success: false,
          paymentRequired: true,
          paymentType: "BOOST_AD",
          price: 19,
          currency: "INR",
          durationDays: 7,
          isPremiumSeller: true,
          boostAdsLimit,
          boostAdsUsed,
          boostAdsRemaining: 0,
          message: "Your free Boost quota has been exhausted.",
        },
        { status: 402 },
      );
    }

    // Keep the stored limit in sync for older Premium records.
    if (Number(premium.boostAdsLimit ?? 0) <= 0) {
      await users.updateOne(
        {
          _id: new ObjectId(sellerId),
          "premiumSeller.active": true,
          "premiumSeller.expiresAt": { $gt: now },
          "premiumSeller.plan": premium.plan,
        },
        {
          $set: {
            "premiumSeller.boostAdsLimit": boostAdsLimit,
            "premiumSeller.updatedAt": now,
          },
        },
      );
    }

    // Atomically reserve one free Boost quota.
    const quotaResult = await users.updateOne(
      {
        _id: new ObjectId(sellerId),
        "premiumSeller.active": true,
        "premiumSeller.expiresAt": { $gt: now },
        "premiumSeller.boostAdsLimit": boostAdsLimit,
        "premiumSeller.boostAdsUsed": { $lt: boostAdsLimit },
      },
      {
        $inc: { "premiumSeller.boostAdsUsed": 1 },
        $set: { "premiumSeller.updatedAt": now },
      },
    );

    if (quotaResult.modifiedCount !== 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Your Boost quota changed. Please refresh and try again.",
        },
        { status: 409 },
      );
    }

    const boostedUntil = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    // Activate only if no other request has boosted this Service.
    const activation = await db.collection("services").updateOne(
      {
        _id: new ObjectId(serviceId),
        sellerId,
        status: "active",
        $or: [
          { boostedUntil: { $exists: false } },
          { boostedUntil: null },
          { boostedUntil: { $lte: now } },
        ],
      },
      {
        $set: {
          isBoosted: true,
          boostedAt: now,
          boostedUntil,
          updatedAt: now,
        },
      },
    );

    if (activation.modifiedCount !== 1) {
      // Release the reserved quota if activation did not succeed.
      await users.updateOne(
        {
          _id: new ObjectId(sellerId),
          "premiumSeller.boostAdsUsed": { $gt: 0 },
        },
        {
          $inc: { "premiumSeller.boostAdsUsed": -1 },
          $set: { "premiumSeller.updatedAt": new Date() },
        },
      );

      return NextResponse.json(
        {
          success: false,
          message: "Service Boost could not be activated. Please try again.",
        },
        { status: 409 },
      );
    }

    const boostAdsUsedAfter = boostAdsUsed + 1;

    return NextResponse.json(
      {
        success: true,
        paymentRequired: false,
        paymentType: "BOOST_AD",
        price: 0,
        currency: "INR",
        durationDays: 7,
        isPremiumSeller: true,
        boostAdsLimit,
        boostAdsUsed: boostAdsUsedAfter,
        boostAdsRemaining: Math.max(
          0,
          boostAdsLimit - boostAdsUsedAfter,
        ),
        boostedAt: now,
        boostedUntil,
        message: "Service boosted successfully using your free quota.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("SERVICE BOOST API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to boost this Service." },
      { status: 500 },
    );
  }
}
