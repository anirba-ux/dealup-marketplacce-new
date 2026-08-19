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

export async function addToWishlist(
  userId: string,
  productId: string
) {
  const collection = await getCollection();

  const existing = await collection.findOne({
    userId,
    productId,
  });

  if (existing) {
    return existing;
  }

  const result = await collection.insertOne({
  userId,
  productId,
  createdAt: new Date(),
});

// products collection
const products = await getProductsCollection();

await products.updateOne(
  {
    _id: new ObjectId(productId),
  },
  {
    $inc: {
      favorites: 1,
    },
  }
);

return result;
}

export async function removeFromWishlist(
  userId: string,
  productId: string
) {
  const collection = await getCollection();

  const result = await collection.deleteOne({
    userId,
    productId,
  });

  if (result.deletedCount > 0) {
    const products = await getProductsCollection();

    await products.updateOne(
      {
        _id: new ObjectId(productId),
      },
      {
        $inc: {
          favorites: -1,
        },
      }
    );
  }

  return result;
}

export async function isWishlisted(
  userId: string,
  productId: string
) {
  const collection = await getCollection();

  return collection.findOne({
    userId,
    productId,
  });
}

export async function getUserWishlist(
  userId: string
) {
  const collection = await getCollection();

  return collection
    .find({
      userId,
    })
    .sort({
      createdAt: -1,
    })
    .toArray();
}

export async function getWishlistProductIds(userId: string) {
  const collection = await getCollection();

  const wishlist = await collection
    .find({ userId })
    .toArray();

  return wishlist.map((item) => item.productId);
}

export async function getWishlistProducts(
  userId: string
) {
  const collection = await getCollection();

  const wishlist = await collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();

  if (wishlist.length === 0) {
    return [];
  }

  const client = await clientPromise;

  const db = client.db(DATABASE_NAME);

 const products = db.collection("products");

const productIds = wishlist.map(
  (item) => new ObjectId(item.productId)
);

const result = await products
  .find({
    _id: {
      $in: productIds,
    },
    status: "active",
  })
  .toArray();

return result.map((product: any) => ({
  ...product,
  _id: product._id.toString(),
  createdAt: product.createdAt?.toISOString(),
  updatedAt: product.updatedAt?.toISOString(),
}));
}