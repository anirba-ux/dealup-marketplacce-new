import { ObjectId } from "mongodb";

import { getConversationCountByProduct } from "./chat.repository";

import clientPromise from "@/lib/db/mongodb";

import { Product } from "@/lib/models/product";

import { findCategoryById } from "./category.repository";

import { calculateDistance } from "@/lib/utils/distance";

import {
  calculateProductRisk,
} from "@/lib/risk/productRisk";

const DATABASE_NAME = "dealup";
const COLLECTION_NAME = "products";

// =====================================================
// MongoDB Collection
// =====================================================

async function getCollection() {
  const client = await clientPromise;

  const db = client.db(DATABASE_NAME);

  console.log("DATABASE:", db.databaseName);
  console.log("COLLECTION:", COLLECTION_NAME);

  return db.collection<Product>(COLLECTION_NAME);
}

// =====================================================
// Attach Seller Phone Verification
// =====================================================

async function attachSellerPhoneVerification(
  products: any[],
) {
  const client = await clientPromise;

  const db = client.db(DATABASE_NAME);

  const users = db.collection("users");

  return Promise.all(
    products.map(async (product) => {
      if (!product.sellerId) {
        return {
          ...product,
          sellerIsPhoneVerified: false,
        };
      }

      let seller;

      try {
        seller = await users.findOne(
          {
            _id: new ObjectId(product.sellerId),
          },
          {
            projection: {
              isPhoneVerified: 1,
            },
          },
        );
      } catch {
        return {
          ...product,
          sellerIsPhoneVerified: false,
        };
      }

      return {
        ...product,

        sellerIsPhoneVerified:
          seller?.isPhoneVerified === true,
      };
    }),
  );
}

// =====================================================
// Create Product
// =====================================================

export async function createProduct(
  product: Product,
) {
  const collection = await getCollection();

  const result =
    await collection.insertOne(product);

  return result;
}

// =====================================================
// Find Product By Id
// =====================================================

export async function findProductById(
  id: string,
) {
  const collection = await getCollection();

  const product =
    await collection.findOne({
      _id: new ObjectId(id),
    });

  return product;
}

// =====================================================
// Find Product By Slug
// =====================================================

export async function findProductBySlug(
  slug: string,
) {
  const collection = await getCollection();

  const product =
    await collection.findOne({
      slug,
    });

  if (!product) {
    return null;
  }

  const category =
    await findCategoryById(
      product.category.toString(),
    );

  return {
    ...product,

    categoryName:
      category?.name ?? "Unknown",

    categorySlug:
      category?.slug ?? "",
  };
}

// =====================================================
// Active Products By Seller
// =====================================================

export async function findActiveProductsBySeller(
  sellerId: string,
  currentProductId?: string,
  limit = 3,
) {
  const collection =
    await getCollection();

  const query: any = {
    sellerId,
    status: "active",
  };

  if (currentProductId) {
    query._id = {
      $ne: new ObjectId(
        currentProductId,
      ),
    };
  }

  return collection
    .find(query)
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .toArray();
}

// =====================================================
// Seller Statistics
// =====================================================

export async function findSellerStats(
  sellerId: string,
) {
  const collection =
    await getCollection();

  const products =
    await collection
      .find({
        sellerId,
        status: "active",
      })
      .toArray();

  const activeAds =
    products.length;

  const totalViews =
    products.reduce(
      (sum, product) =>
        sum + (product.views ?? 0),
      0,
    );

  return {
    activeAds,
    totalViews,
  };
}

// =====================================================
// Latest Products
// =====================================================

export async function findLatestProducts(
  limit = 20,
) {
  await removeExpiredBoosts();

  const collection =
    await getCollection();

  const products =
    await collection
      .find({
        status: "active",
      })
      .sort({
        isBoosted: -1,
        createdAt: -1,
      })
      .limit(limit)
      .toArray();

  return attachSellerPhoneVerification(
    products,
  );
}

// =====================================================
// Products By Seller
// =====================================================

export async function findProductsBySeller(
  sellerId: string,
) {
  const collection =
    await getCollection();

  const products =
    await collection
      .find({
        sellerId,

        status: {
          $in: [
            "active",
            "sold",
          ],
        },
      })
      .sort({
        updatedAt: -1,
      })
      .toArray();

  return Promise.all(
    products.map(
      async (product) => ({
        ...product,

        isBoosted:
          product.isBoosted,

        chatCount:
          await getConversationCountByProduct(
            product._id!.toString(),
          ),
      }),
    ),
  );
}

// =====================================================
// Featured Products
// =====================================================

export async function findFeaturedProducts(
  limit = 8,
) {
  await removeExpiredBoosts();

  const collection =
    await getCollection();

  const products =
    await collection
      .find({
        status: "active",
      })
      .sort({
        isBoosted: -1,
        createdAt: -1,
      })
      .limit(limit)
      .toArray();

  return attachSellerPhoneVerification(
    products,
  );
}

// =====================================================
// Products By Category
// =====================================================

export async function findProductsByCategory(
  category: string,
) {
  const collection =
    await getCollection();

  return collection
    .find({
      category,

      status: "active",
    })
    .toArray();
}

// =====================================================
// Search Products - Full Search Page
// =====================================================

export async function searchProductsPage({
  keyword,
  category,
  sort,
  condition,
  maxPrice,
  radius,
  lat,
  lng,
  page = 1,
}: {
  keyword: string;
  category?: string;
  sort?: string;
  condition?: string;
  maxPrice?: string;
  radius?: string;
  lat?: string;
  lng?: string;
  page?: number;
}) {
  const collection =
    await getCollection();

  const query: any = {
    status: "active",
  };

  // ===================================================
  // Category
  // ===================================================

  if (category) {
    query.subcategory =
      category;
  }

  // ===================================================
  // Condition
  // ===================================================

  if (condition) {
    const conditions =
      condition.split(",");

    query.condition = {
      $in: conditions,
    };
  }

  // ===================================================
  // Max Price
  // ===================================================

  if (maxPrice) {
    query.price = {
      $lte: Number(maxPrice),
    };
  }

  // ===================================================
  // Keyword
  // ===================================================

  if (keyword.trim()) {
    query.$or = [
      {
        title: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        brand: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        model: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        category: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        subcategory: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        "location.city": {
          $regex: keyword,
          $options: "i",
        },
      },
    ];
  }

  // ===================================================
  // Sorting
  // ===================================================

  let sortOption:
    Record<string, 1 | -1> = {
    isBoosted: -1,
    createdAt: -1,
  };

  switch (sort) {
    case "newest":
      sortOption = {
        isBoosted: -1,
        createdAt: -1,
      };
      break;

    case "oldest":
      sortOption = {
        createdAt: 1,
      };
      break;

    case "price_asc":
      sortOption = {
        price: 1,
      };
      break;

    case "price_desc":
      sortOption = {
        price: -1,
      };
      break;

    case "most_viewed":
      sortOption = {
        views: -1,
      };
      break;
  }

  // ===================================================
  // Pagination
  // ===================================================

  const limit = 20;

  const skip =
    (page - 1) * limit;

  const totalProducts =
    await collection.countDocuments(
      query,
    );

  const totalPages =
    Math.ceil(
      totalProducts / limit,
    );

  const products =
    await collection
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray();

  return {
    products,

    currentPage: page,

    totalPages,

    totalProducts,
  };
}

// =====================================================
// UPDATE PRODUCT
//
// Server-side tracking:
// - Price history
// - Location history
// - Product risk
//
// Client cannot directly modify history.
// =====================================================

export async function updateProduct(
  id: string,
  data: Partial<Product>,
) {
  const collection =
    await getCollection();

  // ===================================================
  // Find Existing Product
  // ===================================================

  const existingProduct =
    await collection.findOne({
      _id: new ObjectId(id),
    });

  if (!existingProduct) {
    throw new Error(
      "Product not found.",
    );
  }

  const now = new Date();

  // ===================================================
  // Remove Client Supplied History
  // ===================================================

  const {
    priceHistory:
      _ignoredPriceHistory,

    locationHistory:
      _ignoredLocationHistory,

    productHistory:
      _ignoredProductHistory,

    ...safeData
  } = data as any;

  // ===================================================
  // Existing Price History
  // ===================================================

  const existingPriceHistory =
    Array.isArray(
      (existingProduct as any)
        .priceHistory,
    )
      ? (existingProduct as any)
          .priceHistory
      : [];

  // ===================================================
  // Existing Location History
  // ===================================================

  const existingLocationHistory =
    Array.isArray(
      (existingProduct as any)
        .locationHistory,
    )
      ? (existingProduct as any)
          .locationHistory
      : [];

  // ===================================================
  // PRICE CHANGE DETECTION
  // ===================================================

  const oldPrice =
    Number(
      existingProduct.price,
    );

  const newPrice =
    data.price !== undefined
      ? Number(data.price)
      : oldPrice;

  const priceChanged =
    Number.isFinite(oldPrice) &&
    Number.isFinite(newPrice) &&
    oldPrice !== newPrice;

  // ===================================================
  // LOCATION CHANGE DETECTION
  // ===================================================

  const oldLocation =
    (existingProduct as any)
      .location ?? {};

  const newLocation =
    (data as any).location ??
    oldLocation;

  const oldCoordinates =
    oldLocation.coordinates ??
    {};

  const newCoordinates =
    newLocation.coordinates ??
    oldCoordinates;

  const oldLat =
    Number(
      oldCoordinates.lat,
    );

  const oldLng =
    Number(
      oldCoordinates.lng,
    );

  const newLat =
    Number(
      newCoordinates.lat,
    );

  const newLng =
    Number(
      newCoordinates.lng,
    );

  // ===================================================
  // Compare Location Fields
  // ===================================================

  const locationChanged =
    oldLocation.country !==
      newLocation.country ||

    oldLocation.state !==
      newLocation.state ||

    oldLocation.district !==
      newLocation.district ||

    oldLocation.city !==
      newLocation.city ||

    oldLocation.pincode !==
      newLocation.pincode ||

    oldLocation.address !==
      newLocation.address ||

    oldLat !== newLat ||

    oldLng !== newLng;

  // ===================================================
  // PRICE HISTORY ENTRY
  // ===================================================

  const priceHistoryEntry = {
    price: newPrice,

    previousPrice:
      oldPrice,

    changedAt: now,

    changedBy:
      existingProduct.sellerId,

    changedByName:
      existingProduct.sellerName ??
      "Unknown Seller",
  };

  // ===================================================
  // LOCATION HISTORY ENTRY
  // ===================================================

  const locationHistoryEntry = {
    country:
      newLocation.country ??
      "India",

    state:
      newLocation.state ??
      "",

    district:
      newLocation.district ??
      "",

    city:
      newLocation.city ??
      "",

    pincode:
      newLocation.pincode ??
      "",

    address:
      newLocation.address ??
      "",

    coordinates: {
      lat: newLat,
      lng: newLng,
    },

    // ================================================
    // Previous Location
    // ================================================

    previousLocation: {
      country:
        oldLocation.country ??
        "India",

      state:
        oldLocation.state ??
        "",

      district:
        oldLocation.district ??
        "",

      city:
        oldLocation.city ??
        "",

      pincode:
        oldLocation.pincode ??
        "",

      address:
        oldLocation.address ??
        "",

      coordinates: {
        lat: oldLat,
        lng: oldLng,
      },
    },

    changedAt: now,

    changedBy:
      existingProduct.sellerId,

    changedByName:
      existingProduct.sellerName ??
      "Unknown Seller",
  };

  // ===================================================
  // Build Updated Price History
  // ===================================================

  const updatedPriceHistory =
    priceChanged
      ? [
          ...existingPriceHistory,

          priceHistoryEntry,
        ]
      : existingPriceHistory;

  // ===================================================
  // Build Updated Location History
  // ===================================================

  const updatedLocationHistory =
    locationChanged
      ? [
          ...existingLocationHistory,

          locationHistoryEntry,
        ]
      : existingLocationHistory;

  // ===================================================
  // Build Product For Risk Engine
  // ===================================================

  const updatedProductForRisk =
    {
      ...existingProduct,

      ...safeData,

      price: newPrice,

      priceHistory:
        updatedPriceHistory,

      locationHistory:
        updatedLocationHistory,
    };

  // ===================================================
  // Calculate Product Risk
  // ===================================================

  const productRisk =
    calculateProductRisk({
      price:
        updatedProductForRisk.price,

      priceHistory:
        updatedProductForRisk
          .priceHistory,

      locationHistory:
        updatedProductForRisk
          .locationHistory,

      locationVerification:
        updatedProductForRisk
          .locationVerification,
    });

  // ===================================================
  // MongoDB Update Operation
  // ===================================================

  const updateOperation: any = {
    $set: {
      ...safeData,

      risk: productRisk,

      updatedAt: now,
    },
  };

  // ===================================================
  // Add Price History
  // ===================================================

  if (priceChanged) {
    updateOperation.$push = {
      ...(updateOperation.$push ??
        {}),

      priceHistory:
        priceHistoryEntry,
    };
  }

  // ===================================================
  // Add Location History
  // ===================================================

  if (locationChanged) {
    updateOperation.$push = {
      ...(updateOperation.$push ??
        {}),

      locationHistory:
        locationHistoryEntry,
    };
  }

  // ===================================================
  // Update MongoDB
  // ===================================================

  return collection.updateOne(
    {
      _id: new ObjectId(id),
    },

    updateOperation,
  );
}

// =====================================================
// Delete Product
// =====================================================

export async function deleteProduct(
  id: string,
) {
  const collection =
    await getCollection();

  return collection.deleteOne({
    _id: new ObjectId(id),
  });
}

// =====================================================
// Delete Product By Owner
// =====================================================

export async function deleteProductByOwner(
  id: string,
  sellerId: string,
) {
  const collection =
    await getCollection();

  return collection.deleteOne({
    _id: new ObjectId(id),

    sellerId,
  });
}

// =====================================================
// Increase Product Views
// =====================================================

export async function increaseProductViews(
  id: string,
) {
  const collection =
    await getCollection();

  return collection.updateOne(
    {
      _id: new ObjectId(id),
    },

    {
      $inc: {
        views: 1,
      },
    },
  );
}

// =====================================================
// Related Products
// =====================================================

export async function findRelatedProducts(
  category: string,
  currentProductId: string,
  limit = 4,
) {
  const collection =
    await getCollection();

  return collection
    .find({
      category,

      status: "active",

      _id: {
        $ne: new ObjectId(
          currentProductId,
        ),
      },
    })
    .limit(limit)
    .toArray();
}

// =====================================================
// Mark Product As Sold
// =====================================================

export async function markProductSold(
  productId: string,
  sellerId: string,
) {
  const collection =
    await getCollection();

  const result =
    await collection.updateOne(
      {
        _id: new ObjectId(
          productId,
        ),

        sellerId,
      },

      {
        $set: {
          status: "sold",

          updatedAt:
            new Date(),
        },
      },
    );

  return (
    result.modifiedCount > 0
  );
}

// =====================================================
// Boost Product
// =====================================================

export async function boostProduct(
  productId: string,
  sellerId: string,
) {
  const collection =
    await getCollection();

  const boostedUntil =
    new Date();

  // 7 days boost
  boostedUntil.setDate(
    boostedUntil.getDate() + 7,
  );

  const result =
    await collection.updateOne(
      {
        _id: new ObjectId(
          productId,
        ),

        sellerId,
      },

      {
        $set: {
          isBoosted: true,

          boostedUntil,

          updatedAt:
            new Date(),
        },
      },
    );

  return (
    result.modifiedCount > 0
  );
}

// =====================================================
// Remove Expired Boosts
// =====================================================

export async function removeExpiredBoosts() {
  const collection =
    await getCollection();

  await collection.updateMany(
    {
      isBoosted: true,

      boostedUntil: {
        $lt: new Date(),
      },
    },

    {
      $set: {
        isBoosted: false,
      },
    },
  );
}

// =====================================================
// Search Products
// =====================================================

export async function searchProducts(
  query: string,
  limit = 5,
) {
  const collection =
    await getCollection();

  const keyword =
    query.trim();

  if (!keyword) {
    return [];
  }

  console.log(
    "Search Keyword:",
    keyword,
  );

  const total =
    await collection.countDocuments();

  console.log(
    "Total Products:",
    total,
  );

  const activeProducts =
    await collection.countDocuments({
      status: "active",
    });

  console.log(
    "Active Products:",
    activeProducts,
  );

  return collection
    .find({
      status: "active",

      $or: [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },

        {
          brand: {
            $regex: keyword,
            $options: "i",
          },
        },

        {
          model: {
            $regex: keyword,
            $options: "i",
          },
        },

        {
          category: {
            $regex: keyword,
            $options: "i",
          },
        },

        {
          subcategory: {
            $regex: keyword,
            $options: "i",
          },
        },

        {
          "location.city": {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    })

    .sort({
      isBoosted: -1,
      createdAt: -1,
    })

    .limit(limit)

    .toArray();
}

// =====================================================
// Nearby Products
// =====================================================

export async function findNearbyProducts(
  userLat: number,
  userLng: number,
  radius = 25,
) {
  const collection =
    await getCollection();

  const products =
    await collection
      .find({
        status: "active",
      })
      .toArray();

  const nearbyProducts =
    products

      .map((product) => {
        const coordinates =
          product.location
            ?.coordinates;

        if (!coordinates) {
          return null;
        }

        const lat =
          Number(
            coordinates.lat,
          );

        const lng =
          Number(
            coordinates.lng,
          );

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng)
        ) {
          return null;
        }

        const distance =
          calculateDistance(
            userLat,
            userLng,
            lat,
            lng,
          );

        return {
          ...product,

          distance,
        };
      })

      .filter(
        (
          product,
        ): product is NonNullable<
          typeof product
        > =>
          product !== null,
      )

      .filter(
        (product) =>
          product.distance <=
          radius,
      )

      .sort(
        (a, b) =>
          a.distance -
          b.distance,
      );

  return attachSellerPhoneVerification(
    nearbyProducts,
  );
}

// =====================================================
// Search Nearby Products
// =====================================================

export async function searchNearbyProducts({
  keyword,
  category,
  condition,
  maxPrice,
  sort,
  lat,
  lng,
  radius,
}: {
  keyword: string;

  category?: string;

  condition?: string;

  maxPrice?: string;

  sort?: string;

  lat: number;

  lng: number;

  radius: number;
}) {
  const collection =
    await getCollection();

  const query: any = {
    status: "active",
  };

  // ===================================================
  // Category
  // ===================================================

  if (category) {
    query.subcategory =
      category;
  }

  // ===================================================
  // Condition
  // ===================================================

  if (condition) {
    const conditions =
      condition.split(",");

    query.condition = {
      $in: conditions,
    };
  }

  // ===================================================
  // Price
  // ===================================================

  if (maxPrice) {
    query.price = {
      $lte: Number(maxPrice),
    };
  }

  // ===================================================
  // Keyword
  // ===================================================

  if (keyword.trim()) {
    query.$or = [
      {
        title: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        brand: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        model: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        category: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        subcategory: {
          $regex: keyword,
          $options: "i",
        },
      },

      {
        "location.city": {
          $regex: keyword,
          $options: "i",
        },
      },
    ];
  }

  // ===================================================
  // Fetch Products
  // ===================================================

  const products =
    await collection
      .find(query)
      .toArray();

  // ===================================================
  // Calculate Distance
  // ===================================================

  const nearbyProducts =
    products.map(
      (product) => {
        const coordinates =
          product.location
            ?.coordinates;

        if (!coordinates) {
          return {
            ...product,

            distance:
              Number.MAX_SAFE_INTEGER,
          };
        }

        const productLat =
          Number(
            coordinates.lat,
          );

        const productLng =
          Number(
            coordinates.lng,
          );

        if (
          !Number.isFinite(
            productLat,
          ) ||
          !Number.isFinite(
            productLng,
          )
        ) {
          return {
            ...product,

            distance:
              Number.MAX_SAFE_INTEGER,
          };
        }

        const distance =
          calculateDistance(
            lat,
            lng,
            productLat,
            productLng,
          );

        return {
          ...product,

          distance,
        };
      },
    );

  // ===================================================
  // Radius Filter
  // ===================================================

  let filteredProducts =
    nearbyProducts.filter(
      (product) =>
        product.distance <=
        radius,
    );

  // ===================================================
  // Sort
  // ===================================================

  switch (sort) {
    case "price_asc":
      filteredProducts.sort(
        (a, b) =>
          a.price - b.price,
      );
      break;

    case "price_desc":
      filteredProducts.sort(
        (a, b) =>
          b.price - a.price,
      );
      break;

    case "most_viewed":
      filteredProducts.sort(
        (a, b) =>
          (b.views ?? 0) -
          (a.views ?? 0),
      );
      break;

    case "oldest":
      filteredProducts.sort(
        (a, b) =>
          new Date(
            a.createdAt,
          ).getTime() -
          new Date(
            b.createdAt,
          ).getTime(),
      );
      break;

    case "newest":
      filteredProducts.sort(
        (a, b) =>
          new Date(
            b.createdAt,
          ).getTime() -
          new Date(
            a.createdAt,
          ).getTime(),
      );
      break;

    default:
      // Default = nearest
      filteredProducts.sort(
        (a, b) =>
          a.distance -
          b.distance,
      );
  }

  return filteredProducts;
}