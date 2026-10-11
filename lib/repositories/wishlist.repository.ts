
import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";
import { Wishlist } from "@/lib/models/wishlist";

const DATABASE_NAME = "dealup";
const COLLECTION_NAME = "wishlists";

async function getCollection() {
  const client = await clientPromise;

  return client
    .db(DATABASE_NAME)
    .collection<Wishlist>(COLLECTION_NAME);
}

async function getProductsCollection() {
  const client = await clientPromise;

  return client
    .db(DATABASE_NAME)
    .collection("products");
}

/**
 * Add a product to a user's wishlist.
 */
export async function addToWishlist(
  userId: string,
  productId: string
) {
  if (!ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const collection = await getCollection();

  const existing = await collection.findOne({
    userId,
    productId,
  });

  if (existing) {
    return existing;
  }

  const products = await getProductsCollection();

  const product = await products.findOne({
    _id: new ObjectId(productId),
    status: "active",
  });

  if (!product) {
    throw new Error("Product not found or inactive");
  }

  const result = await collection.insertOne({
    userId,
    productId,
    createdAt: new Date(),
  });

  await products.updateOne(
    { _id: new ObjectId(productId) },
    { $inc: { favorites: 1 } }
  );

  return result;
}

/**
 * Remove a product from a user's wishlist.
 */
export async function removeFromWishlist(
  userId: string,
  productId: string
) {
  const collection = await getCollection();

  const result = await collection.deleteOne({
    userId,
    productId,
  });

  if (result.deletedCount > 0 && ObjectId.isValid(productId)) {
    const products = await getProductsCollection();

    await products.updateOne(
      { _id: new ObjectId(productId) },
      [
        {
          $set: {
            favorites: {
              $max: [
                {
                  $subtract: [
                    { $ifNull: ["$favorites", 0] },
                    1,
                  ],
                },
                0,
              ],
            },
          },
        },
      ]
    );
  }

  return result;
}

/**
 * Check whether a product is wishlisted by a user.
 */
export async function isWishlisted(
  userId: string,
  productId: string
) {
  return getCollection().then((collection) =>
    collection.findOne({
      userId,
      productId,
    })
  );
}

/**
 * Return all raw wishlist records for a user.
 */
export async function getUserWishlist(userId: string) {
  const collection = await getCollection();

  return collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Return IDs of products that still exist and are active.
 * Used by the Navbar wishlist count and wishlist buttons.
 */
export async function getWishlistProductIds(
  userId: string
): Promise<string[]> {
  const products = await getWishlistProducts(userId);

  return products.map((product: any) => product._id);
}

/**
 * Return existing active products in wishlist order.
 */
export async function getWishlistProducts(userId: string) {
  const collection = await getCollection();

  const wishlist = await collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  if (wishlist.length === 0) {
    return [];
  }

  const validIds = wishlist
    .map((item) => item.productId)
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  if (validIds.length === 0) {
    return [];
  }

  const productsCollection = await getProductsCollection();

  const products = await productsCollection
    .find({
      _id: { $in: validIds },
      status: "active",
    })
    .toArray();

  // Preserve the user's original wishlist order.
  const productsById = new Map(
    products.map((product: any) => [
      product._id.toString(),
      product,
    ])
  );

  return wishlist
    .map((item) => productsById.get(item.productId))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .map((product: any) => ({
      ...product,
      _id: product._id.toString(),
      createdAt:
        product.createdAt instanceof Date
          ? product.createdAt.toISOString()
          : product.createdAt,
      updatedAt:
        product.updatedAt instanceof Date
          ? product.updatedAt.toISOString()
          : product.updatedAt,
    }));
}
