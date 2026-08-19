import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const COLLECTION_NAME = "products";

// =====================================================
// Get Products Collection
// =====================================================

async function getProductsCollection() {
  const client = await clientPromise;

  return client
    .db(DATABASE_NAME)
    .collection(COLLECTION_NAME);
}

// =====================================================
// Find All Products — Admin
// =====================================================

export async function findAllAdminProducts({
  search = "",
  limit = 50,
}: {
  search?: string;
  limit?: number;
} = {}) {
  const collection =
    await getProductsCollection();

  const safeLimit = Math.min(
    Math.max(
      Number.isFinite(limit)
        ? limit
        : 50,
      1,
    ),
    100,
  );

  // ===================================================
  // Search
  // ===================================================

  const query: Record<
    string,
    unknown
  > = {};

  if (search.trim()) {
    const searchValue =
      search.trim();

    query.$or = [
      {
        title: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        description: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        sellerId: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        "location.city": {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        categoryName: {
          $regex: searchValue,
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
      .sort({
        createdAt: -1,
      })
      .limit(safeLimit)
      .toArray();

  // ===================================================
  // Convert ObjectId
  // ===================================================

  return products.map(
    (product) => ({
      ...product,

      _id:
        product._id.toString(),
    }),
  );
}

// =====================================================
// Product Statistics
// =====================================================

export async function getProductStatistics() {
  const collection =
    await getProductsCollection();

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    premiumProducts,
  ] = await Promise.all([
    // -----------------------------------------------
    // Total
    // -----------------------------------------------

    collection.countDocuments({}),

    // -----------------------------------------------
    // Active
    // -----------------------------------------------

    collection.countDocuments({
      $or: [
        {
          status: "active",
        },
        {
          isActive: true,
        },
      ],
    }),

    // -----------------------------------------------
    // Featured
    // -----------------------------------------------

    collection.countDocuments({
      isFeatured: true,
    }),

    // -----------------------------------------------
    // Premium
    // -----------------------------------------------

    collection.countDocuments({
      isPremium: true,
    }),
  ]);

  return {
    totalProducts,

    activeProducts,

    featuredProducts,

    premiumProducts,
  };
}

// =====================================================
// Find Product By ID — Admin
// =====================================================

export async function findAdminProductById(
  productId: string,
) {
  const collection =
    await getProductsCollection();

  const product =
    await collection.findOne({
      _id: new (
        await import("mongodb")
      ).ObjectId(productId),
    });

  if (!product) {
    return null;
  }

  return {
    ...product,

    _id:
      product._id.toString(),
  };
}