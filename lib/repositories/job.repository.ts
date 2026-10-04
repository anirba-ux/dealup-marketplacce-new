import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

import { Job } from "@/lib/models/job";

const DATABASE_NAME = "dealup";
const COLLECTION_NAME = "jobs";

async function getCollection() {
  const client = await clientPromise;

  const db = client.db(DATABASE_NAME);

  return db.collection<Job>(COLLECTION_NAME);
}

// =====================================================
// Create Job
// =====================================================

export async function createJob(job: Job) {
  const collection = await getCollection();

  const result = await collection.insertOne(job);

  return result;
}

// =====================================================
// Find Job By ID
// =====================================================

export async function findJobById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();

  return collection.findOne({
    _id: new ObjectId(id),
  });
}

// =====================================================
// Find Jobs By Employer
// =====================================================

export async function findJobsByEmployer(employerId: string) {
  const collection = await getCollection();

  return collection
    .find({
      employerId,
    })
    .sort({
      createdAt: -1,
    })
    .toArray();
}

// =====================================================
// Find Active Jobs
// =====================================================

export async function findActiveJobs(limit = 20) {
  const collection = await getCollection();

  return collection
    .find({
      status: "active",
    })
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .toArray();
}

// =====================================================
// SEARCH JOBS
// =====================================================

export interface SearchJobsOptions {
  query?: string;
  category?: string;
  city?: string;
  district?: string;
  page?: number;
  limit?: number;
}

export async function searchJobsPage(options: SearchJobsOptions = {}) {
  const collection = await getCollection();

  const { query, category, city, district, page = 1, limit = 20 } = options;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));

  const skip = (safePage - 1) * safeLimit;

  // ---------------------------------------------------
  // Build MongoDB filter
  // ---------------------------------------------------

  const filter: Record<string, unknown> = {
    status: "active",
  };

  // ---------------------------------------------------
  // Keyword Search
  // ---------------------------------------------------

  if (query?.trim()) {
    const searchRegex = {
      $regex: query.trim(),
      $options: "i",
    };

    filter.$or = [
      { "jobs.title": searchRegex },
      { "jobs.category": searchRegex },
      { "jobs.subcategory": searchRegex },
      { "jobs.description": searchRegex },
      { "employer.companyName": searchRegex },
      { employerName: searchRegex },
    ];
  }

  // ---------------------------------------------------
  // Category
  // ---------------------------------------------------

  if (category?.trim() && category.trim().toLowerCase() !== "jobs") {
    filter["jobs.category"] = {
      $regex: category.trim(),
      $options: "i",
    };
  }

  // ---------------------------------------------------
  // City
  // ---------------------------------------------------

  if (city?.trim()) {
    filter.$or = [
      ...(Array.isArray(filter.$or) ? filter.$or : []),
      {
        "location.city": {
          $regex: city.trim(),
          $options: "i",
        },
      },
      {
        "jobs.location.city": {
          $regex: city.trim(),
          $options: "i",
        },
      },
    ];
  }

  // ---------------------------------------------------
  // District
  // ---------------------------------------------------

  if (district?.trim()) {
    filter.$or = [
      ...(Array.isArray(filter.$or) ? filter.$or : []),
      {
        "location.district": {
          $regex: district.trim(),
          $options: "i",
        },
      },
      {
        "jobs.location.district": {
          $regex: district.trim(),
          $options: "i",
        },
      },
    ];
  }

  // ---------------------------------------------------
  // Count
  // ---------------------------------------------------

  const total = await collection.countDocuments(filter);

  // ---------------------------------------------------
  // Fetch
  // ---------------------------------------------------

  const jobs = await collection
    .find(filter)
    .sort({
      featuredUntil: -1,
      boostedUntil: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(safeLimit)
    .toArray();

  // ---------------------------------------------------
  // Pagination
  // ---------------------------------------------------

  const totalPages = Math.ceil(total / safeLimit);

  return {
    jobs,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}
// =====================================================
// Delete Job
// =====================================================

export async function deleteJob(id: string, employerId: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();

  return collection.deleteOne({
    _id: new ObjectId(id),
    employerId,
  });
}

// =====================================================
// UPDATE JOB
// =====================================================

export async function updateJob(
  id: string,
  employerId: string,
  jobData: Partial<Job>,
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();

  const result = await collection.updateOne(
    {
      _id: new ObjectId(id),
      employerId,
    },
    {
      $set: {
        ...jobData,
        updatedAt: new Date(),
      },
    },
  );

  return result;
}

// =====================================================
// BOOST JOB
//
// Professional Boost Rules:
//
// PREMIUM SELLER
//
// Monthly:
//   10 free Boost Ads
//
// Quarterly:
//   30 free Boost Ads
//
// Yearly:
//   120 free Boost Ads
//
// Free Boost Duration:
//   7 days
//
// Premium quota exhausted:
//   ₹19 / 7 days
//
// NORMAL SELLER
//   No free quota
//   ₹29 / 7 days
//
// Payment flow is NOT connected yet.
// When payment is required, this function only
// returns payment information.
// =====================================================

export async function boostJob(jobId: string, employerId: string) {
  const collection = await getCollection();

  const now = new Date();

  // ===================================================
  // Validate Job ID
  // ===================================================

  if (!ObjectId.isValid(jobId)) {
    return {
      success: false,
      reason: "INVALID_JOB_ID",
    };
  }

  // ===================================================
  // Validate Employer ID
  // ===================================================

  if (!ObjectId.isValid(employerId)) {
    return {
      success: false,
      reason: "INVALID_EMPLOYER_ID",
    };
  }

  // ===================================================
  // Find Job
  // ===================================================

  const job = await collection.findOne({
    _id: new ObjectId(jobId),
    employerId,
  });

  // ===================================================
  // Job Not Found
  // ===================================================

  if (!job) {
    return {
      success: false,
      reason: "JOB_NOT_FOUND",
    };
  }

  // ===================================================
  // Job Must Be Active
  // ===================================================

  if (job.status !== "active") {
    return {
      success: false,
      reason: "JOB_NOT_ACTIVE",
    };
  }

  // ===================================================
  // Existing Active Boost Check
  //
  // Job uses timestamp-based promotion state.
  // ===================================================

  const existingBoostedUntil = job.boostedUntil
    ? new Date(job.boostedUntil)
    : null;

  const existingBoostActive =
    existingBoostedUntil !== null &&
    existingBoostedUntil.getTime() > now.getTime();

  // ===================================================
  // Prevent Duplicate Active Boost
  // ===================================================

  if (existingBoostActive) {
    return {
      success: false,
      reason: "ALREADY_BOOSTED",
      boostedUntil: existingBoostedUntil,
    };
  }

  // ===================================================
  // Database
  // ===================================================

  const client = await clientPromise;

  const db = client.db(DATABASE_NAME);

  const users = db.collection("users");

  // ===================================================
  // Find Employer / Seller Account
  // ===================================================

  const employer = await users.findOne(
    {
      _id: new ObjectId(employerId),
    },
    {
      projection: {
        premiumSeller: 1,
      },
    },
  );

  // ===================================================
  // Employer Not Found
  // ===================================================

  if (!employer) {
    return {
      success: false,
      reason: "EMPLOYER_NOT_FOUND",
    };
  }

  // ===================================================
  // Default Payment Information
  //
  // Normal Employer:
  // ₹29 / 7 days
  // ===================================================

  let isPremiumSeller = false;

  let boostAdsLimit = 0;

  let boostAdsUsed = 0;

  let boostAdsRemaining = 0;

  let paymentRequired = false;

  let price = 29;

  const currency = "INR";

  const durationDays = 7;

  // ===================================================
  // Premium Seller
  // ===================================================

  const premiumSeller = employer.premiumSeller;

  if (premiumSeller) {
    const premiumExpiresAt = premiumSeller.expiresAt
      ? new Date(premiumSeller.expiresAt)
      : null;

    const premiumActive =
      premiumSeller.active === true &&
      premiumExpiresAt !== null &&
      premiumExpiresAt.getTime() > now.getTime();

    // =================================================
    // Active Premium Seller
    // =================================================

    if (premiumActive) {
      isPremiumSeller = true;

      // ===============================================
      // Determine Boost Limit
      // ===============================================

      boostAdsLimit = Number(premiumSeller.boostAdsLimit ?? 0);

      // ===============================================
      // Backward Compatibility
      // ===============================================

      if (boostAdsLimit <= 0) {
        if (premiumSeller.plan === "monthly") {
          boostAdsLimit = 10;
        } else if (premiumSeller.plan === "quarterly") {
          boostAdsLimit = 30;
        } else if (premiumSeller.plan === "yearly") {
          boostAdsLimit = 120;
        } else {
          return {
            success: false,
            reason: "INVALID_PREMIUM_PLAN",
          };
        }

        await users.updateOne(
          {
            _id: new ObjectId(employerId),
          },
          {
            $set: {
              "premiumSeller.boostAdsLimit": boostAdsLimit,

              "premiumSeller.boostAdsUsed": Number(
                premiumSeller.boostAdsUsed ?? 0,
              ),

              "premiumSeller.updatedAt": now,
            },
          },
        );
      }

      // ===============================================
      // Used Count
      // ===============================================

      boostAdsUsed = Math.max(0, Number(premiumSeller.boostAdsUsed ?? 0));

      // ===============================================
      // Remaining
      // ===============================================

      boostAdsRemaining = Math.max(0, boostAdsLimit - boostAdsUsed);

      // ===============================================
      // Premium Quota Exhausted
      //
      // ₹19 / 7 days
      // ===============================================

      if (boostAdsUsed >= boostAdsLimit) {
        paymentRequired = true;

        price = 19;
      }
    } else {
      // ===============================================
      // Premium Exists But Is Expired / Inactive
      //
      // Treat as normal paid seller.
      //
      // ₹29 / 7 days
      // ===============================================

      isPremiumSeller = false;

      boostAdsLimit = 0;

      boostAdsUsed = 0;

      boostAdsRemaining = 0;

      paymentRequired = true;

      price = 29;
    }
  } else {
    // =================================================
    // Normal Seller
    //
    // No Premium
    //
    // ₹29 / 7 days
    // =================================================

    paymentRequired = true;

    price = 29;
  }

  // ===================================================
  // Payment Required
  //
  // Payment flow is not connected yet.
  //
  // DO NOT activate the Job.
  // Return payment information only.
  // ===================================================

  if (paymentRequired) {
    return {
      success: false,

      reason: "BOOST_PAYMENT_REQUIRED",

      paymentRequired: true,

      paymentType: "BOOST_JOB",

      price,

      currency,

      durationDays,

      isPremiumSeller,

      boostAdsLimit,

      boostAdsUsed,

      boostAdsRemaining,
    };
  }

  // ===================================================
  // Free Premium Boost
  //
  // Duration = 7 days
  // ===================================================

  const boostedUntil = new Date(now);

  boostedUntil.setDate(boostedUntil.getDate() + durationDays);

  // ===================================================
  // Activate Boost
  //
  // Prevent simultaneous duplicate activation.
  // ===================================================

  const jobUpdateResult = await collection.updateOne(
    {
      _id: new ObjectId(jobId),

      employerId,

      status: "active",

      $or: [
        {
          boostedUntil: {
            $lte: now,
          },
        },

        {
          boostedUntil: {
            $exists: false,
          },
        },
      ],
    },
    {
      $set: {
        boostedAt: now,

        boostedUntil,

        updatedAt: now,
      },
    },
  );

  // ===================================================
  // Job Update Failed
  // ===================================================

  if (jobUpdateResult.modifiedCount === 0) {
    return {
      success: false,
      reason: "BOOST_UPDATE_FAILED",
    };
  }

  // ===================================================
  // Consume One Premium Free Boost
  //
  // Atomic $inc + $lt
  // ===================================================

  const quotaResult = await users.updateOne(
    {
      _id: new ObjectId(employerId),

      "premiumSeller.active": true,

      "premiumSeller.expiresAt": {
        $gt: now,
      },

      "premiumSeller.boostAdsUsed": {
        $lt: boostAdsLimit,
      },
    },
    {
      $inc: {
        "premiumSeller.boostAdsUsed": 1,
      },

      $set: {
        "premiumSeller.updatedAt": new Date(),
      },
    },
  );

  // ===================================================
  // Quota Update Failed
  //
  // Roll back this exact Boost activation.
  // ===================================================

  if (quotaResult.modifiedCount === 0) {
    await collection.updateOne(
      {
        _id: new ObjectId(jobId),

        employerId,

        boostedAt: now,

        boostedUntil,
      },
      {
        $unset: {
          boostedAt: "",

          boostedUntil: "",
        },

        $set: {
          updatedAt: new Date(),
        },
      },
    );

    return {
      success: false,
      reason: "BOOST_QUOTA_UPDATE_FAILED",
    };
  }

  // ===================================================
  // Calculate Remaining Quota
  // ===================================================

  const boostAdsUsedAfter = boostAdsUsed + 1;

  const boostAdsRemainingAfter = Math.max(0, boostAdsLimit - boostAdsUsedAfter);

  // ===================================================
  // Success
  // ===================================================

  return {
    success: true,

    paymentRequired: false,

    paymentType: "BOOST_JOB",

    price: 0,

    currency,

    durationDays,

    isPremiumSeller,

    boostAdsLimit,

    boostAdsUsed: boostAdsUsedAfter,

    boostAdsRemaining: boostAdsRemainingAfter,

    boostedAt: now,

    boostedUntil,

    message: "Job boosted successfully.",
  };
}

// =====================================================
// FEATURE JOB
//
// Professional Feature Rules:
//
// Premium Seller:
//
// Monthly:
//   3 free Featured Ads
//
// Quarterly:
//   9 free Featured Ads
//
// Yearly:
//   36 free Featured Ads
//
// Free Featured Duration:
//   14 days
//
// Free quota exhausted:
//   ₹29 / 14 days
//
// Premium Seller is required.
//
// Payment flow is NOT connected yet.
// =====================================================

export async function featureJob(jobId: string, employerId: string) {
  const collection = await getCollection();

  const now = new Date();

  // ===================================================
  // Validate Job ID
  // ===================================================

  if (!ObjectId.isValid(jobId)) {
    return {
      success: false,
      reason: "INVALID_JOB_ID",
    };
  }

  // ===================================================
  // Validate Employer ID
  // ===================================================

  if (!ObjectId.isValid(employerId)) {
    return {
      success: false,
      reason: "INVALID_EMPLOYER_ID",
    };
  }

  // ===================================================
  // Find Job
  // ===================================================

  const job = await collection.findOne({
    _id: new ObjectId(jobId),
    employerId,
  });

  // ===================================================
  // Job Not Found
  // ===================================================

  if (!job) {
    return {
      success: false,
      reason: "JOB_NOT_FOUND",
    };
  }

  // ===================================================
  // Job Must Be Active
  // ===================================================

  if (job.status !== "active") {
    return {
      success: false,
      reason: "JOB_NOT_ACTIVE",
    };
  }

  // ===================================================
  // Database
  // ===================================================

  const client = await clientPromise;

  const db = client.db(DATABASE_NAME);

  const users = db.collection("users");

  // ===================================================
  // Find Employer
  // ===================================================

  const employer = await users.findOne(
    {
      _id: new ObjectId(employerId),
    },
    {
      projection: {
        premiumSeller: 1,
      },
    },
  );

  // ===================================================
  // Employer Not Found
  // ===================================================

  if (!employer) {
    return {
      success: false,
      reason: "EMPLOYER_NOT_FOUND",
    };
  }

  // ===================================================
  // Premium Seller Required
  // ===================================================

  const premiumSeller = employer.premiumSeller;

  if (!premiumSeller) {
    return {
      success: false,
      reason: "PREMIUM_REQUIRED",
    };
  }

  // ===================================================
  // Premium Must Be Active
  // ===================================================

  if (premiumSeller.active !== true) {
    return {
      success: false,
      reason: "PREMIUM_NOT_ACTIVE",
    };
  }

  // ===================================================
  // Premium Must Not Be Expired
  // ===================================================

  const premiumExpiresAt = premiumSeller.expiresAt
    ? new Date(premiumSeller.expiresAt)
    : null;

  if (premiumExpiresAt && premiumExpiresAt.getTime() <= now.getTime()) {
    return {
      success: false,
      reason: "PREMIUM_EXPIRED",
    };
  }

  // ===================================================
  // Feature Ads Must Be Enabled
  // ===================================================

  if (premiumSeller.featuredAds !== true) {
    return {
      success: false,
      reason: "FEATURED_ADS_NOT_ENABLED",
    };
  }

  // ===================================================
  // Featured Quota
  //
  // Monthly   -> 3
  // Quarterly -> 9
  // Yearly    -> 36
  //
  // Duration = 14 days
  // ===================================================

  const plan = premiumSeller.plan;

  let featuredAdsLimit = Number(premiumSeller.featuredAdsLimit ?? 0);

  const featuredAdsUsed = Math.max(
    0,
    Number(premiumSeller.featuredAdsUsed ?? 0),
  );

  // ===================================================
  // Backward Compatibility
  // ===================================================

  if (featuredAdsLimit <= 0) {
    if (plan === "monthly") {
      featuredAdsLimit = 3;
    } else if (plan === "quarterly") {
      featuredAdsLimit = 9;
    } else if (plan === "yearly") {
      featuredAdsLimit = 36;
    } else {
      return {
        success: false,
        reason: "INVALID_PREMIUM_PLAN",
      };
    }

    await users.updateOne(
      {
        _id: new ObjectId(employerId),
      },
      {
        $set: {
          "premiumSeller.featuredAdsLimit": featuredAdsLimit,

          "premiumSeller.featuredAdsUsed": featuredAdsUsed,

          "premiumSeller.updatedAt": now,
        },
      },
    );
  }

  // ===================================================
  // Existing Active Featured Check
  // ===================================================

  const existingFeaturedUntil = job.featuredUntil
    ? new Date(job.featuredUntil)
    : null;

  const existingFeaturedActive =
    existingFeaturedUntil !== null &&
    existingFeaturedUntil.getTime() > now.getTime();

  // ===================================================
  // Prevent Duplicate Active Feature
  // ===================================================

  if (existingFeaturedActive) {
    return {
      success: false,

      reason: "ALREADY_FEATURED",

      featuredUntil: existingFeaturedUntil,
    };
  }

  // ===================================================
  // Free Quota Exhausted
  //
  // Paid Feature:
  // ₹29 / 14 days
  // ===================================================

  if (featuredAdsUsed >= featuredAdsLimit) {
    return {
      success: false,

      reason: "FEATURED_QUOTA_EXHAUSTED",

      paymentRequired: true,

      paymentType: "FEATURED_JOB",

      price: 29,

      currency: "INR",

      durationDays: 14,

      featuredAdsLimit,

      featuredAdsUsed,

      featuredAdsRemaining: 0,
    };
  }

  // ===================================================
  // Featured Duration
  //
  // Free Premium Featured = 14 days
  // ===================================================

  const featuredUntil = new Date(now);

  featuredUntil.setDate(featuredUntil.getDate() + 14);

  // ===================================================
  // Activate Featured Job
  //
  // Prevent simultaneous duplicate
  // activation.
  // ===================================================

  const jobUpdateResult = await collection.updateOne(
    {
      _id: new ObjectId(jobId),

      employerId,

      status: "active",

      $or: [
        {
          featuredUntil: {
            $lte: now,
          },
        },

        {
          featuredUntil: {
            $exists: false,
          },
        },
      ],
    },
    {
      $set: {
        featuredAt: now,

        featuredUntil,

        updatedAt: now,
      },
    },
  );

  // ===================================================
  // Job Update Failed
  // ===================================================

  if (jobUpdateResult.modifiedCount === 0) {
    return {
      success: false,
      reason: "FEATURE_UPDATE_FAILED",
    };
  }

  // ===================================================
  // Consume One Free Featured Quota
  //
  // Atomic $inc + $lt
  // ===================================================

  const quotaResult = await users.updateOne(
    {
      _id: new ObjectId(employerId),

      "premiumSeller.active": true,

      "premiumSeller.featuredAds": true,

      "premiumSeller.expiresAt": {
        $gt: now,
      },

      "premiumSeller.featuredAdsUsed": {
        $lt: featuredAdsLimit,
      },
    },
    {
      $inc: {
        "premiumSeller.featuredAdsUsed": 1,
      },

      $set: {
        "premiumSeller.updatedAt": new Date(),
      },
    },
  );

  // ===================================================
  // Quota Update Failed
  //
  // Roll back this exact Featured activation.
  // ===================================================

  if (quotaResult.modifiedCount === 0) {
    await collection.updateOne(
      {
        _id: new ObjectId(jobId),

        employerId,

        featuredAt: now,

        featuredUntil,
      },
      {
        $unset: {
          featuredAt: "",

          featuredUntil: "",
        },

        $set: {
          updatedAt: new Date(),
        },
      },
    );

    return {
      success: false,

      reason: "FEATURED_QUOTA_UPDATE_FAILED",
    };
  }

  // ===================================================
  // Calculate Remaining Quota
  // ===================================================

  const featuredAdsUsedAfter = featuredAdsUsed + 1;

  const featuredAdsRemaining = Math.max(
    0,
    featuredAdsLimit - featuredAdsUsedAfter,
  );

  // ===================================================
  // Success
  // ===================================================

  return {
    success: true,

    paymentRequired: false,

    paymentType: "FEATURED_JOB",

    price: 0,

    currency: "INR",

    durationDays: 14,

    featuredAt: now,

    featuredUntil,

    featuredAdsLimit,

    featuredAdsUsed: featuredAdsUsedAfter,

    featuredAdsRemaining,

    message: "Job featured successfully.",
  };
}

// =====================================================
// ACTIVATE PAID BOOST JOB
// =====================================================
//
// Called only AFTER successful Razorpay payment.
//
// Paid Boost:
// - Normal Seller: ₹29 / 7 days
// - Premium quota exhausted: ₹19 / 7 days
//
// Payment verification remains responsible for
// confirming that payment was actually successful.
// =====================================================

export async function activatePaidBoostJob(
  jobId: string,
  employerId: string,
  paymentId: string,
) {
  const collection = await getCollection();

  const now = new Date();

  // ---------------------------------------------------
  // Validate IDs
  // ---------------------------------------------------

  if (!ObjectId.isValid(jobId)) {
    return {
      success: false,
      reason: "INVALID_JOB_ID",
    };
  }

  if (!ObjectId.isValid(employerId)) {
    return {
      success: false,
      reason: "INVALID_EMPLOYER_ID",
    };
  }

  // ---------------------------------------------------
  // Find Job
  // ---------------------------------------------------

  const job = await collection.findOne({
    _id: new ObjectId(jobId),
    employerId,
  });

  if (!job) {
    return {
      success: false,
      reason: "JOB_NOT_FOUND",
    };
  }

  // ---------------------------------------------------
  // Active Job Required
  // ---------------------------------------------------

  if (job.status !== "active") {
    return {
      success: false,
      reason: "JOB_NOT_ACTIVE",
    };
  }

  // ---------------------------------------------------
  // Already Active Boost
  // ---------------------------------------------------

  const existingBoostedUntil = job.boostedUntil
    ? new Date(job.boostedUntil)
    : null;

  if (existingBoostedUntil && existingBoostedUntil.getTime() > now.getTime()) {
    return {
      success: true,
      alreadyProcessed: true,
      boostedAt: job.boostedAt,
      boostedUntil: existingBoostedUntil,
    };
  }

  // ---------------------------------------------------
  // Duration
  // ---------------------------------------------------

  const boostedUntil = new Date(now);

  boostedUntil.setDate(boostedUntil.getDate() + 7);

  // ---------------------------------------------------
  // Activate Paid Boost
  // ---------------------------------------------------

  const result = await collection.updateOne(
    {
      _id: new ObjectId(jobId),

      employerId,

      status: "active",

      $or: [
        {
          boostedUntil: {
            $lte: now,
          },
        },
        {
          boostedUntil: {
            $exists: false,
          },
        },
      ],
    },
    {
      $set: {
        boostedAt: now,

        boostedUntil,

        updatedAt: now,
      },
    },
  );

  if (result.modifiedCount === 0) {
    return {
      success: false,
      reason: "BOOST_UPDATE_FAILED",
    };
  }

  return {
    success: true,

    paymentId,

    paymentRequired: false,

    durationDays: 7,

    price: null,

    currency: "INR",

    boostedAt: now,

    boostedUntil,

    message: "Job boosted successfully.",
  };
}

// =====================================================
// ACTIVATE PAID FEATURED JOB
// =====================================================
//
// Called only AFTER successful Razorpay payment.
//
// Paid Featured:
// ₹29 / 14 days
//
// Premium Seller is already required by featureJob().
// =====================================================

export async function activatePaidFeaturedJob(
  jobId: string,
  employerId: string,
  paymentId: string,
) {
  const collection = await getCollection();

  const now = new Date();

  // ---------------------------------------------------
  // Validate IDs
  // ---------------------------------------------------

  if (!ObjectId.isValid(jobId)) {
    return {
      success: false,
      reason: "INVALID_JOB_ID",
    };
  }

  if (!ObjectId.isValid(employerId)) {
    return {
      success: false,
      reason: "INVALID_EMPLOYER_ID",
    };
  }

  // ---------------------------------------------------
  // Find Job
  // ---------------------------------------------------

  const job = await collection.findOne({
    _id: new ObjectId(jobId),
    employerId,
  });

  if (!job) {
    return {
      success: false,
      reason: "JOB_NOT_FOUND",
    };
  }

  // ---------------------------------------------------
  // Active Job Required
  // ---------------------------------------------------

  if (job.status !== "active") {
    return {
      success: false,
      reason: "JOB_NOT_ACTIVE",
    };
  }

  // ---------------------------------------------------
  // Already Active Feature
  // ---------------------------------------------------

  const existingFeaturedUntil = job.featuredUntil
    ? new Date(job.featuredUntil)
    : null;

  if (
    existingFeaturedUntil &&
    existingFeaturedUntil.getTime() > now.getTime()
  ) {
    return {
      success: true,

      alreadyProcessed: true,

      featuredAt: job.featuredAt,

      featuredUntil: existingFeaturedUntil,
    };
  }

  // ---------------------------------------------------
  // Duration
  // ---------------------------------------------------

  const featuredUntil = new Date(now);

  featuredUntil.setDate(featuredUntil.getDate() + 14);

  // ---------------------------------------------------
  // Activate Paid Feature
  // ---------------------------------------------------

  const result = await collection.updateOne(
    {
      _id: new ObjectId(jobId),

      employerId,

      status: "active",

      $or: [
        {
          featuredUntil: {
            $lte: now,
          },
        },
        {
          featuredUntil: {
            $exists: false,
          },
        },
      ],
    },
    {
      $set: {
        featuredAt: now,

        featuredUntil,

        updatedAt: now,
      },
    },
  );

  if (result.modifiedCount === 0) {
    return {
      success: false,
      reason: "FEATURE_UPDATE_FAILED",
    };
  }

  return {
    success: true,

    paymentId,

    paymentRequired: false,

    durationDays: 14,

    price: 29,

    currency: "INR",

    featuredAt: now,

    featuredUntil,

    message: "Job featured successfully.",
  };
}
