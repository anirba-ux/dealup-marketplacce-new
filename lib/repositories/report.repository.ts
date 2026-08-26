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
// Get Resolved Reports By Product
//
// IMPORTANT:
//
// Only reports resolved by admin are treated
// as confirmed moderation evidence.
//
// pending / reviewing:
//    not confirmed
//
// rejected:
//    ignored
//
// resolved:
//    confirmed evidence
// =====================================================

export async function findResolvedReportsByProduct(
  productId: string,
) {
  const collection =
    await getCollection();

  return collection
    .find({
      productId,

      status:
        "resolved",
    })
    .sort({
      updatedAt: -1,
    })
    .toArray();
}

// =====================================================
// Get Resolved Reports By Seller
//
// Used by seller trust / risk analysis.
//
// Only resolved reports are returned.
// =====================================================

export async function findResolvedReportsBySeller(
  sellerId: string,
) {
  const collection =
    await getCollection();

  return collection
    .find({
      sellerId,

      status:
        "resolved",
    })
    .sort({
      updatedAt: -1,
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

    status:
      "pending",
  });
}

// =====================================================
// Count Resolved Reports By Seller
// =====================================================

export async function countResolvedReportsBySeller(
  sellerId: string,
) {
  const collection =
    await getCollection();

  return collection.countDocuments({
    sellerId,

    status:
      "resolved",
  });
}

// =====================================================
// Get Resolved Report Summary By Seller
//
// This gives the Trust Engine a simple summary
// instead of making it understand the entire
// reports collection.
// =====================================================

export async function getResolvedReportSummaryBySeller(
  sellerId: string,
) {
  const reports =
    await findResolvedReportsBySeller(
      sellerId,
    );

  let scam = 0;

  let fake = 0;

  let duplicate = 0;

  let spam = 0;

  let sold = 0;

  let wrongCategory = 0;

  let other = 0;

  for (
    const report of reports
  ) {
    const reason =
      String(
        report.reason ?? "",
      )
        .trim()
        .toLowerCase();

    switch (reason) {
      case "scam":
        scam++;
        break;

      case "fake":
        fake++;
        break;

      case "duplicate":
        duplicate++;
        break;

      case "spam":
        spam++;
        break;

      case "sold":
        sold++;
        break;

      case "wrong_category":
        wrongCategory++;
        break;

      default:
        other++;
        break;
    }
  }

  // ===================================================
  // Risk Level
  //
  // Keep this simple.
  //
  // scam / fake:
  //    very high
  //
  // duplicate:
  //    high
  //
  // spam:
  //    medium
  //
  // everything else:
  //    low
  // ===================================================

  let level:
    | "none"
    | "low"
    | "medium"
    | "high"
    | "very_high" =
    "none";

  if (
    scam > 0 ||
    fake > 0
  ) {
    level =
      "very_high";
  } else if (
    duplicate > 0
  ) {
    level =
      "high";
  } else if (
    spam > 0
  ) {
    level =
      "medium";
  } else if (
    reports.length > 0
  ) {
    level =
      "low";
  }

  return {
    totalResolved:
      reports.length,

    scam,

    fake,

    duplicate,

    spam,

    sold,

    wrongCategory,

    other,

    level,
  };
}