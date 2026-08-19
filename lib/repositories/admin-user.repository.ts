import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const COLLECTION_NAME = "users";

// =====================================================
// Get Users Collection
// =====================================================

async function getUsersCollection() {
  const client = await clientPromise;

  return client
    .db(DATABASE_NAME)
    .collection(COLLECTION_NAME);
}

// =====================================================
// Admin User List
// =====================================================

export async function findAllUsers({
  search = "",
  limit = 20,
}: {
  search?: string;
  limit?: number;
} = {}) {
  const collection =
    await getUsersCollection();

  const safeLimit = Math.min(
    Math.max(limit, 1),
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
        name: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        email: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  // ===================================================
  // Users
  // ===================================================

  const users =
    await collection
      .find(query)
      .project({
        password: 0,
      })
      .sort({
        createdAt: -1,
      })
      .limit(safeLimit)
      .toArray();

  // ===================================================
  // Convert ObjectId
  // ===================================================

  return users.map((user) => ({
    ...user,

    _id: user._id.toString(),
  }));
}

// =====================================================
// Get User Statistics
// =====================================================

export async function getUserStatistics() {
  const collection =
    await getUsersCollection();

  const [
    totalUsers,
    verifiedSellers,
    pendingSellers,
    suspendedUsers,
  ] = await Promise.all([
    collection.countDocuments({}),

    collection.countDocuments({
      "sellerVerification.status":
        "verified",
    }),

    collection.countDocuments({
      "sellerVerification.status":
        "pending",
    }),

    collection.countDocuments({
      "sellerVerification.status":
        "suspended",
    }),
  ]);

  return {
    totalUsers,

    verifiedSellers,

    pendingSellers,

    suspendedUsers,
  };
}