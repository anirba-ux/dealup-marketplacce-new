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




/* =========================================================
   SEARCH JOBS
========================================================= */

export interface SearchJobsOptions {
  query?: string;
  category?: string;
  city?: string;
  district?: string;
  page?: number;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

type JobCoordinates = {
  lat: number;
  lng: number;
};

type JobWithDistance = Job & {
  _distanceKm: number;
};

/* =========================================================
   Approximate city-centre coordinates
========================================================= */

const JOB_SEARCH_CITY_COORDINATES: Record<
  string,
  JobCoordinates
> = {
  bansberia: {
    lat: 22.9707,
    lng: 88.4003,
  },
  chinsurah: {
    lat: 22.8992,
    lng: 88.3921,
  },
  "hugli-chuchura": {
    lat: 22.8992,
    lng: 88.3921,
  },
  "hooghly-chinsurah": {
    lat: 22.8992,
    lng: 88.3921,
  },
};

/* =========================================================
   Search helpers
========================================================= */

function escapeSearchRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCity(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

function readJobCoordinates(
  value: unknown,
): JobCoordinates | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const coordinates = value as Record<string, unknown>;

  const rawLat = coordinates.lat ?? coordinates.latitude;
  const rawLng =
    coordinates.lng ??
    coordinates.lon ??
    coordinates.longitude;

  if (
    rawLat === undefined ||
    rawLat === null ||
    rawLng === undefined ||
    rawLng === null
  ) {
    return null;
  }

  const lat = Number(rawLat);
  const lng = Number(rawLng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return { lat, lng };
}

function getJobCoordinates(
  job: unknown,
): JobCoordinates | null {
  if (!job || typeof job !== "object") {
    return null;
  }

  const document = job as {
    location?: {
      coordinates?: unknown;
    };
    jobs?: Array<{
      location?: {
        coordinates?: unknown;
      };
    }>;
  };

  // First, use the main listing's coordinates.
  const mainCoordinates = readJobCoordinates(
    document.location?.coordinates,
  );

  if (mainCoordinates) {
    return mainCoordinates;
  }

  // Multiple-job listings may store coordinates per position.
  for (const position of document.jobs ?? []) {
    const coordinates = readJobCoordinates(
      position.location?.coordinates,
    );

    if (coordinates) {
      return coordinates;
    }
  }

  return null;
}

function calculateDistanceKm(
  from: JobCoordinates,
  to: JobCoordinates,
): number {
  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const latDifference = toRadians(to.lat - from.lat);
  const lngDifference = toRadians(to.lng - from.lng);

  const a =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(lngDifference / 2) ** 2;

  const safeA = Math.min(1, Math.max(0, a));

  return (
    6371 *
    2 *
    Math.atan2(
      Math.sqrt(safeA),
      Math.sqrt(1 - safeA),
    )
  );
}

function getCityCoordinates(
  city: string,
  lat?: number,
  lng?: number,
): JobCoordinates | null {
  // Explicit coordinates take priority over city-centre coordinates.
  if (
    lat !== undefined &&
    lng !== undefined &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ) {
    return { lat, lng };
  }

  return (
    JOB_SEARCH_CITY_COORDINATES[normalizeCity(city)] ??
    null
  );
}

function getDateTimestamp(value: unknown): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(
    value as string | number | Date,
  ).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function isDateActive(value: unknown, now: number): boolean {
  return getDateTimestamp(value) > now;
}

/* =========================================================
   Search jobs with exact-city priority and nearby fallback
========================================================= */

export async function searchJobsPage(
  options: SearchJobsOptions = {},
) {
  const collection = await getCollection();

  const {
    query,
    category,
    city,
    district,
    page = 1,
    limit = 20,
    lat,
    lng,
    radius = 10,
  } = options;

  const safePage = Math.max(1, Math.floor(Number(page) || 1));

  const safeLimit = Math.min(
    50,
    Math.max(1, Math.floor(Number(limit) || 20)),
  );

  const safeRadius = Math.min(
    100,
    Math.max(1, Number(radius) || 10),
  );

  const skip = (safePage - 1) * safeLimit;

  /* -------------------------------------------------------
     STEP 1: Common filters
  ------------------------------------------------------- */

  const conditions: Record<string, unknown>[] = [
    { status: "active" },
  ];

  if (query?.trim()) {
    const queryRegex = {
      $regex: escapeSearchRegex(query.trim()),
      $options: "i",
    };

    conditions.push({
      $or: [
        { "jobs.title": queryRegex },
        { "jobs.category": queryRegex },
        { "jobs.subcategory": queryRegex },
        { "jobs.description": queryRegex },
        { "employer.companyName": queryRegex },
        { employerName: queryRegex },
      ],
    });
  }

  if (
    category?.trim() &&
    category.trim().toLowerCase() !== "jobs"
  ) {
    conditions.push({
      "jobs.category": {
        $regex: escapeSearchRegex(category.trim()),
        $options: "i",
      },
    });
  }

  if (district?.trim()) {
    const districtRegex = {
      $regex: escapeSearchRegex(district.trim()),
      $options: "i",
    };

    conditions.push({
      $or: [
        { "location.district": districtRegex },
        { "jobs.location.district": districtRegex },
      ],
    });
  }

  const baseFilter: Record<string, unknown> =
    conditions.length === 1
      ? conditions[0]
      : { $and: conditions };

  const now = Date.now();

  /* -------------------------------------------------------
     STEP 2: No city selected
     Return normal search results.
  ------------------------------------------------------- */

  if (!city?.trim()) {
    const total = await collection.countDocuments(baseFilter);

    const jobs = await collection
      .find(baseFilter)
      .sort({
        featuredUntil: -1,
        boostedUntil: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(safeLimit)
      .toArray();

    const totalPages = Math.ceil(total / safeLimit);

    return {
      jobs,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
      isNearbyFallback: false,
      searchRadiusKm: null,
    };
  }

  /* -------------------------------------------------------
     STEP 3: Exact-city search first
  ------------------------------------------------------- */

  const cityRegex = {
    $regex: `^${escapeSearchRegex(city.trim())}$`,
    $options: "i",
  };

  const exactCityFilter = {
    $and: [
      baseFilter,
      {
        $or: [
          { "location.city": cityRegex },
          { "jobs.location.city": cityRegex },
        ],
      },
    ],
  };

  const exactTotal =
    await collection.countDocuments(exactCityFilter);

  // If the selected city has jobs, do not mix in nearby jobs.
  if (exactTotal > 0) {
    const jobs = await collection
      .find(exactCityFilter)
      .sort({
        featuredUntil: -1,
        boostedUntil: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(safeLimit)
      .toArray();

    const totalPages = Math.ceil(exactTotal / safeLimit);

    return {
      jobs,
      total: exactTotal,
      page: safePage,
      limit: safeLimit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
      isNearbyFallback: false,
      searchRadiusKm: null,
    };
  }

  /* -------------------------------------------------------
     STEP 4: No exact-city jobs — find nearby jobs
  ------------------------------------------------------- */

  const origin = getCityCoordinates(city, lat, lng);

  // Do not invent distances if the city coordinates are unknown.
  if (!origin) {
    return {
      jobs: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      isNearbyFallback: false,
      searchRadiusKm: null,
    };
  }

  // Apply active status, query, category and district filters first.
  const candidates = await collection
    .find(baseFilter)
    .toArray();

  const nearbyJobs: JobWithDistance[] = candidates.flatMap(
    (job): JobWithDistance[] => {
      const coordinates = getJobCoordinates(job);

      if (!coordinates) {
        return [];
      }

      const distanceKm = calculateDistanceKm(
        origin,
        coordinates,
      );

      if (distanceKm > safeRadius) {
        return [];
      }

      return [
        {
          ...job,
          _distanceKm: Math.round(distanceKm * 10) / 10,
        },
      ];
    },
  );

  /* -------------------------------------------------------
     STEP 5: Sort by distance
     Promotion status breaks distance ties.
  ------------------------------------------------------- */

  nearbyJobs.sort((a, b) => {
    if (a._distanceKm !== b._distanceKm) {
      return a._distanceKm - b._distanceKm;
    }

    const aFeatured = isDateActive(a.featuredUntil, now);
    const bFeatured = isDateActive(b.featuredUntil, now);

    if (aFeatured !== bFeatured) {
      return Number(bFeatured) - Number(aFeatured);
    }

    const aBoosted = isDateActive(a.boostedUntil, now);
    const bBoosted = isDateActive(b.boostedUntil, now);

    if (aBoosted !== bBoosted) {
      return Number(bBoosted) - Number(aBoosted);
    }

    return (
      getDateTimestamp(b.createdAt) -
      getDateTimestamp(a.createdAt)
    );
  });

  /* -------------------------------------------------------
     STEP 6: Pagination
  ------------------------------------------------------- */

  const total = nearbyJobs.length;
  const jobs = nearbyJobs.slice(skip, skip + safeLimit);
  const totalPages = Math.ceil(total / safeLimit);

  return {
    jobs,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
    isNearbyFallback: true,
    searchRadiusKm: safeRadius,
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
