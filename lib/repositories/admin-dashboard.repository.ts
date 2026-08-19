import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

// =====================================================
// Dashboard Statistics
// =====================================================

export async function getAdminDashboardStatistics() {
  const client =
    await clientPromise;

  const db =
    client.db(DATABASE_NAME);

  const usersCollection =
    db.collection("users");

  const productsCollection =
    db.collection("products");

  const reportsCollection =
    db.collection("reports");

  // ===================================================
  // Run all counts together
  // ===================================================

  const [
    totalUsers,

    totalProducts,

    activeProducts,

    verifiedSellers,

    pendingVerification,

    suspendedUsers,

    totalReports,

    pendingReports,
  ] = await Promise.all([
    // -----------------------------------------------
    // Users
    // -----------------------------------------------

    usersCollection.countDocuments({}),

    // -----------------------------------------------
    // Products
    // -----------------------------------------------

    productsCollection.countDocuments({}),

    // -----------------------------------------------
    // Active Products
    // -----------------------------------------------

    productsCollection.countDocuments({
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
    // Verified Sellers
    // -----------------------------------------------

    usersCollection.countDocuments({
      "sellerVerification.status":
        "verified",
    }),

    // -----------------------------------------------
    // Pending Seller Verification
    // -----------------------------------------------

    usersCollection.countDocuments({
      "sellerVerification.status":
        "pending",
    }),

    // -----------------------------------------------
    // Suspended Users
    // -----------------------------------------------

    usersCollection.countDocuments({
      $or: [
        {
          "sellerVerification.status":
            "suspended",
        },
        {
          status: "suspended",
        },
      ],
    }),

    // -----------------------------------------------
    // Total Reports
    // -----------------------------------------------

    reportsCollection.countDocuments({}),

    // -----------------------------------------------
    // Pending Reports
    // -----------------------------------------------

    reportsCollection.countDocuments({
      status: "pending",
    }),
  ]);

  // ===================================================
  // Return
  // ===================================================

  return {
    totalUsers,

    totalProducts,

    activeProducts,

    verifiedSellers,

    pendingVerification,

    suspendedUsers,

    totalReports,

    pendingReports,
  };
}