import clientPromise from "@/lib/db/mongodb";

import { Report } from "@/lib/models/report";

const DATABASE_NAME =
  "dealup";

const COLLECTION_NAME =
  "reports";

// =====================================================
// Collection
// =====================================================

async function getCollection() {
  const client =
    await clientPromise;

  return client
    .db(DATABASE_NAME)
    .collection<Report>(
      COLLECTION_NAME,
    );
}

// =====================================================
// Create Report
// =====================================================

export async function createReport(
  report: Report,
) {
  const collection =
    await getCollection();

  return collection.insertOne(
    report,
  );
}

// =====================================================
// Find Existing Report
//
// One user should report the same
// product only once.
// =====================================================

export async function findReportByUserAndProduct(
  productId: string,
  reportedBy: string,
) {
  const collection =
    await getCollection();

  return collection.findOne({
    productId,

    reportedBy,
  });
}

// =====================================================
// Get All Reports - Admin
// =====================================================

export async function findAllReports() {
  const collection =
    await getCollection();

  return collection
    .find({})
    .sort({
      createdAt: -1,
    })
    .toArray();
}

// =====================================================
// Get Reports By Product
// =====================================================

export async function findReportsByProduct(
  productId: string,
) {
  const collection =
    await getCollection();

  return collection
    .find({
      productId,
    })
    .sort({
      createdAt: -1,
    })
    .toArray();
}

// =====================================================
// Get Reports By Seller
// =====================================================

export async function findReportsBySeller(
  sellerId: string,
) {
  const collection =
    await getCollection();

  return collection
    .find({
      sellerId,
    })
    .sort({
      createdAt: -1,
    })
    .toArray();
}

// =====================================================
// Count Reports By Seller
// =====================================================

export async function countReportsBySeller(
  sellerId: string,
) {
  const collection =
    await getCollection();

  return collection.countDocuments({
    sellerId,
  });
}

// =====================================================
// Count Pending Reports By Seller
// =====================================================

export async function countPendingReportsBySeller(
  sellerId: string,
) {
  const collection =
    await getCollection();

  return collection.countDocuments({
    sellerId,

    status: "pending",
  });
}