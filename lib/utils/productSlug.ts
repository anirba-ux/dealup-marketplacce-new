import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const COLLECTION_NAME = "products";

// =====================================================
// Slugify Product Title
// =====================================================

export function slugifyProductTitle(
  title: string,
): string {
  const slug =
    String(title ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return slug || "product";
}

// =====================================================
// Generate Unique Product Slug
//
// CREATE:
// generateUniqueProductSlug("Pulsar 220")
//
// EDIT:
// generateUniqueProductSlug(
//   "Pulsar 220",
//   currentProductId,
// )
//
// During edit the current product itself is ignored.
// =====================================================

export async function generateUniqueProductSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const client =
    await clientPromise;

  const db =
    client.db(
      DATABASE_NAME,
    );

  const collection =
    db.collection(
      COLLECTION_NAME,
    );

  const baseSlug =
    slugifyProductTitle(
      title,
    );

  let candidate =
    baseSlug;

  let counter = 2;

  while (true) {
    const query: {
      slug: string;
      _id?: {
        $ne: ObjectId;
      };
    } = {
      slug: candidate,
    };

    // =================================================
    // EDIT MODE
    //
    // Ignore current product.
    // Otherwise its own slug would look like a collision.
    // =================================================

    if (
      excludeId &&
      ObjectId.isValid(
        excludeId,
      )
    ) {
      query._id = {
        $ne:
          new ObjectId(
            excludeId,
          ),
      };
    }

    const existing =
      await collection.findOne(
        query,
        {
          projection: {
            _id: 1,
          },
        },
      );

    // =================================================
    // Available
    // =================================================

    if (!existing) {
      return candidate;
    }

    // =================================================
    // Collision
    //
    // pulsar-220
    // pulsar-220-2
    // pulsar-220-3
    // ...
    // =================================================

    candidate =
      `${baseSlug}-${counter}`;

    counter++;
  }
}