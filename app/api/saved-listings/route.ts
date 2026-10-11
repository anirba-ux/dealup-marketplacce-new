import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

export const runtime = "nodejs";

const DATABASE_NAME = "dealup";
const COLLECTION_NAME = "savedListings";

const listingTypes = ["job", "service", "business"] as const;
type ListingType = (typeof listingTypes)[number];

let indexPromise: Promise<string> | null = null;

async function getSavedCollection() {
  const client = await clientPromise;
  const collection = client
    .db(DATABASE_NAME)
    .collection(COLLECTION_NAME);

  if (!indexPromise) {
    indexPromise = collection.createIndex(
      { userId: 1, listingType: 1, listingId: 1 },
      { unique: true, name: "unique_saved_listing" },
    );
  }

  await indexPromise;
  return collection;
}

function isListingType(value: unknown): value is ListingType {
  return (
    typeof value === "string" &&
    listingTypes.includes(value as ListingType)
  );
}

async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  return userId ? String(userId) : null;
}

async function isActiveListing(
  listingType: ListingType,
  listingId: string,
) {
  const client = await clientPromise;
  const db = client.db(DATABASE_NAME);
  const _id = new ObjectId(listingId);

  if (listingType === "job") {
    return Boolean(
      await db.collection("jobs").findOne(
        { _id, status: "active" },
        { projection: { _id: 1 } },
      ),
    );
  }

  return Boolean(
    await db.collection("services").findOne(
      {
        _id,
        status: "active",
        listingType,
      },
      { projection: { _id: 1 } },
    ),
  );
}

// GET /api/saved-listings?type=job
// GET /api/saved-listings?type=service&listingId=...
export async function GET(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({
        saved: false,
        listingIds: [],
      });
    }

    const { searchParams } = new URL(request.url);
    const listingType = searchParams.get("type");

    if (!isListingType(listingType)) {
      return NextResponse.json(
        { message: "A valid listing type is required" },
        { status: 400 },
      );
    }

    const collection = await getSavedCollection();
    const listingId = searchParams.get("listingId");

    if (listingId) {
      const saved = await collection.findOne({
        userId,
        listingType,
        listingId,
      });

      return NextResponse.json({
        saved: Boolean(saved),
      });
    }

    const items = await collection
      .find(
        { userId, listingType },
        { projection: { _id: 0, listingId: 1 } },
      )
      .toArray();

    return NextResponse.json({
      listingIds: items.map((item) => String(item.listingId)),
    });
  } catch (error) {
    console.error("Saved listings GET error:", error);

    return NextResponse.json(
      { message: "Unable to load saved listings" },
      { status: 500 },
    );
  }
}

// POST /api/saved-listings
// Body: { listingType, listingId, saved: true | false }
export async function POST(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Please log in to save listings" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { listingType, listingId, saved } = body ?? {};

    if (
      !isListingType(listingType) ||
      typeof listingId !== "string" ||
      !ObjectId.isValid(listingId) ||
      typeof saved !== "boolean"
    ) {
      return NextResponse.json(
        { message: "Invalid saved listing details" },
        { status: 400 },
      );
    }

    const normalizedId = new ObjectId(listingId).toString();

    if (saved) {
      const active = await isActiveListing(
        listingType,
        normalizedId,
      );

      if (!active) {
        return NextResponse.json(
          { message: "This listing is no longer available" },
          { status: 404 },
        );
      }
    }

    const collection = await getSavedCollection();

    if (saved) {
      await collection.updateOne(
        {
          userId,
          listingType,
          listingId: normalizedId,
        },
        {
          $setOnInsert: {
            userId,
            listingType,
            listingId: normalizedId,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    } else {
      await collection.deleteOne({
        userId,
        listingType,
        listingId: normalizedId,
      });
    }

    return NextResponse.json({
      success: true,
      saved,
      listingType,
      listingId: normalizedId,
    });
  } catch (error) {
    console.error("Saved listings POST error:", error);

    return NextResponse.json(
      { message: "Unable to update saved listing" },
      { status: 500 },
    );
  }
}