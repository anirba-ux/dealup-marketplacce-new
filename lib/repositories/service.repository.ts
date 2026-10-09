
import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";
import type { Service } from "@/lib/models/service";

// =====================================================
// Database Configuration
// =====================================================

const DATABASE_NAME = "dealup";
const COLLECTION_NAME = "services";

// =====================================================
// Collection
// =====================================================

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(DATABASE_NAME);

  return db.collection<Service>(COLLECTION_NAME);
}

// =====================================================
// Create Service
// =====================================================

export async function createService(service: Service) {
  const collection = await getCollection();

  return collection.insertOne(service);
}

// =====================================================
// Find Service By ID
// =====================================================

export async function findServiceById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();

  return collection.findOne({
    _id: new ObjectId(id),
  });
}

// =====================================================
// Find Service By Slug
// =====================================================

export async function findServiceBySlug(slug: string) {
  const collection = await getCollection();

  return collection.findOne({
    slug,
    status: "active",
  });
}

// =====================================================
// Find Services By Seller
// =====================================================

export async function findServicesBySeller(sellerId: string) {
  const collection = await getCollection();

  return collection
    .find({ sellerId })
    .sort({ createdAt: -1 })
    .toArray();
}

// =====================================================
// Find Active Services
// =====================================================

export async function findActiveServices(limit = 20) {
  const collection = await getCollection();

  const safeLimit = Math.min(
    50,
    Math.max(1, Math.floor(Number(limit) || 20)),
  );

  return collection
    .find({ status: "active" })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .toArray();
}


// =====================================================
// Find Homepage Services & Local Businesses
// =====================================================

export async function findHomepageServicesAndBusinesses(
  limit = 4,
) {
  const collection = await getCollection();

  const safeLimit = Math.min(
    8,
    Math.max(1, Math.floor(Number(limit) || 4)),
  );

  const now = new Date();

  const homepageFilter = {
    status: "active" as const,
    $or: [
      { isFeatured: { $ne: true } },
      { featuredUntil: { $exists: false } },
      { featuredUntil: { $gte: now } },
    ],
  };

  const [services, businesses] = await Promise.all([
    collection
      .find({
        ...homepageFilter,
        listingType: "service",
      })
      .sort({
        isFeatured: -1,
        isBoosted: -1,
        createdAt: -1,
      })
      .limit(safeLimit)
      .toArray(),

    collection
      .find({
        ...homepageFilter,
        listingType: "business",
      })
      .sort({
        isFeatured: -1,
        isBoosted: -1,
        createdAt: -1,
      })
      .limit(safeLimit)
      .toArray(),
  ]);

  return {
    services,
    businesses,
  };
}


// =====================================================
// Find Featured Services
// =====================================================

export async function findFeaturedServices(limit = 20) {
  const collection = await getCollection();

  const safeLimit = Math.min(
    50,
    Math.max(1, Math.floor(Number(limit) || 20)),
  );

  return collection
    .find({
      status: "active",
      isFeatured: true,
    })
    .sort({
      featuredAt: -1,
      createdAt: -1,
    })
    .limit(safeLimit)
    .toArray();
}

// =====================================================
// Find Boosted Services
// =====================================================

export async function findBoostedServices(limit = 20) {
  const collection = await getCollection();
  const now = new Date();

  const safeLimit = Math.min(
    50,
    Math.max(1, Math.floor(Number(limit) || 20)),
  );

  return collection
    .find({
      status: "active",
      isBoosted: true,
      $or: [
        { boostedUntil: { $exists: false } },
        { boostedUntil: { $gte: now } },
      ],
    })
    .sort({
      boostedAt: -1,
      createdAt: -1,
    })
    .limit(safeLimit)
    .toArray();
}

// =====================================================
// Search Services Options
// =====================================================

export interface SearchServicesOptions {
  query?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  district?: string;

  listingType?: "service" | "business";

  serviceMode?:
    | "at_business"
    | "home_visit"
    | "both"
    | "remote";

  page?: number;
  limit?: number;
}

// =====================================================
// Search Services Page
// =====================================================

export async function searchServicesPage(
  options: SearchServicesOptions = {},
) {
  const collection = await getCollection();

  const {
    query,
    category,
    subcategory,
    city,
    district,
    listingType,
    serviceMode,
    page = 1,
    limit = 20,
  } = options;

  const safePage = Math.max(1, Math.floor(Number(page) || 1));

  const safeLimit = Math.min(
    50,
    Math.max(1, Math.floor(Number(limit) || 20)),
  );

  const skip = (safePage - 1) * safeLimit;

  const filter: Record<string, unknown> = {
    status: "active",
  };

  // Keyword
  if (query?.trim()) {
    const searchRegex = {
      $regex: query.trim(),
      $options: "i",
    };

    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
      { subcategory: searchRegex },
      { businessName: searchRegex },
      { servicesOffered: searchRegex },
      { serviceAreas: searchRegex },
    ];
  }

  // Category
  if (category?.trim()) {
    filter.category = category.trim();
  }

  // Subcategory
  if (subcategory?.trim()) {
    filter.subcategory = subcategory.trim();
  }

  // City
  if (city?.trim()) {
    filter["location.city"] = city.trim();
  }

  // District
  if (district?.trim()) {
    filter["location.district"] = district.trim();
  }

  // Listing Type
  if (listingType) {
    filter.listingType = listingType;
  }

  // Service Mode
  if (serviceMode) {
    filter.serviceMode = serviceMode;
  }

  const [items, total] = await Promise.all([
    collection
      .find(filter)
      .sort({
        isFeatured: -1,
        isBoosted: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(safeLimit)
      .toArray(),

    collection.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

// =====================================================
// Update Service
// =====================================================

export async function updateService(
  id: string,
  sellerId: string,
  serviceData: Partial<Service>,
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();

  return collection.updateOne(
    {
      _id: new ObjectId(id),
      sellerId,
    },
    {
      $set: {
        ...serviceData,
        updatedAt: new Date(),
      },
    },
  );
}

// =====================================================
// Delete Service
// =====================================================

export async function deleteService(
  id: string,
  sellerId: string,
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();

  return collection.deleteOne({
    _id: new ObjectId(id),
    sellerId,
  });
}


/* =====================================================
   Activate Paid Boost Service
   Price is validated by the payment API.
   Duration: 7 days
===================================================== */

export async function activatePaidBoostService(
  serviceId: string,
  sellerId: string,
  paymentId: string,
) {
  if (
    !ObjectId.isValid(serviceId) ||
    !sellerId.trim() ||
    !paymentId.trim()
  ) {
    return {
      success: false,
      reason: "INVALID_INPUT",
    } as const;
  }

  const collection = await getCollection();
  const now = new Date();
  const boostedUntil = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000,
  );

  const result = await collection.updateOne(
    {
      _id: new ObjectId(serviceId),
      sellerId,
      status: "active",
      $or: [
        { isBoosted: { $ne: true } },
        { boostedUntil: { $lt: now } },
      ],
    },
    {
      $set: {
        isBoosted: true,
        boostedAt: now,
        boostedUntil,
        updatedAt: now,
      },
    },
  );

  if (result.modifiedCount !== 1) {
    return {
      success: false,
      reason: "NOT_ELIGIBLE_OR_ALREADY_BOOSTED",
    } as const;
  }

  return {
    success: true,
    serviceId,
    paymentId,
    boostedAt: now,
    boostedUntil,
  } as const;
}

/* =====================================================
   Activate Paid Featured Service
   Duration: 14 days

   IMPORTANT:
   Verify Premium Seller eligibility in the payment
   verification API before calling this function.
===================================================== */

export async function activatePaidFeaturedService(
  serviceId: string,
  sellerId: string,
  paymentId: string,
) {
  if (
    !ObjectId.isValid(serviceId) ||
    !sellerId.trim() ||
    !paymentId.trim()
  ) {
    return {
      success: false,
      reason: "INVALID_INPUT",
    } as const;
  }

  const collection = await getCollection();
  const now = new Date();
  const featuredUntil = new Date(
    now.getTime() + 14 * 24 * 60 * 60 * 1000,
  );

  const result = await collection.updateOne(
    {
      _id: new ObjectId(serviceId),
      sellerId,
      status: "active",
      $or: [
        { isFeatured: { $ne: true } },
        { featuredUntil: { $lt: now } },
      ],
    },
    {
      $set: {
        isFeatured: true,
        featuredAt: now,
        featuredUntil,
        updatedAt: now,
      },
    },
  );

  if (result.modifiedCount !== 1) {
    return {
      success: false,
      reason: "NOT_ELIGIBLE_OR_ALREADY_FEATURED",
    } as const;
  }

  return {
    success: true,
    serviceId,
    paymentId,
    featuredAt: now,
    featuredUntil,
  } as const;
}

