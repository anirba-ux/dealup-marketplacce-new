
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";
import {
  findConversation,
  createConversation,
} from "@/lib/repositories/chat.repository";

type ListingType = "product" | "service" | "business";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Please log in to contact the seller." },
        { status: 401 },
      );
    }

    const buyerId = (session.user as { id?: string }).id;

    if (!buyerId || !ObjectId.isValid(buyerId)) {
      return NextResponse.json(
        { error: "Your session is invalid. Please log in again." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const { productId, sellerId } = body;

    const listingType: ListingType =
      body.listingType ?? "product";

    if (
      typeof productId !== "string" ||
      typeof sellerId !== "string" ||
      !ObjectId.isValid(productId) ||
      !ObjectId.isValid(sellerId)
    ) {
      return NextResponse.json(
        { error: "Invalid listing or seller information." },
        { status: 400 },
      );
    }

    if (
      !["product", "service", "business"].includes(listingType)
    ) {
      return NextResponse.json(
        { error: "Invalid listing type." },
        { status: 400 },
      );
    }

    if (buyerId === sellerId) {
      return NextResponse.json(
        { error: "You cannot chat with yourself." },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("dealup");

    const collectionName =
      listingType === "product" ? "products" : "services";

    const listing = await db.collection(collectionName).findOne({
      _id: new ObjectId(productId),
    });

    if (!listing) {
      return NextResponse.json(
        { error: "This listing could not be found." },
        { status: 404 },
      );
    }

    if (String(listing.sellerId) !== sellerId) {
      return NextResponse.json(
        { error: "Seller information does not match this listing." },
        { status: 403 },
      );
    }

    if (
      listingType !== "product" &&
      listing.listingType !== listingType
    ) {
      return NextResponse.json(
        { error: "The listing type does not match." },
        { status: 400 },
      );
    }

    let conversation = await findConversation(
      productId,
      buyerId,
      sellerId,
      listingType,
    );

    if (!conversation) {
      conversation = await createConversation(
        productId,
        buyerId,
        sellerId,
        listingType,
      );
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);

    return NextResponse.json(
      { error: "Unable to open chat right now. Please try again." },
      { status: 500 },
    );
  }
}
