import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

// =====================================================
// Database
// =====================================================

const DATABASE_NAME = "dealup";

const USERS_COLLECTION = "users";

// =====================================================
// Premium Plan
// =====================================================

export type PremiumPlan =
  | "monthly"
  | "quarterly"
  | "yearly";

// =====================================================
// Premium Plan Limits
// =====================================================

export interface PremiumPlanLimits {
  featuredAdsLimit: number;

  boostAdsLimit: number;
}

// =====================================================
// Get Premium Plan Limits
// =====================================================

export function getPremiumPlanLimits(
  plan: PremiumPlan,
): PremiumPlanLimits {
  switch (plan) {
    // -----------------------------------------------
    // Monthly
    // -----------------------------------------------

    case "monthly":
      return {
        featuredAdsLimit: 3,

        boostAdsLimit: 10,
      };

    // -----------------------------------------------
    // Quarterly
    // -----------------------------------------------

    case "quarterly":
      return {
        featuredAdsLimit: 9,

        boostAdsLimit: 30,
      };

    // -----------------------------------------------
    // Yearly
    // -----------------------------------------------

    case "yearly":
      return {
        featuredAdsLimit: 36,

        boostAdsLimit: 120,
      };
  }
}

// =====================================================
// Premium Seller Status
// =====================================================

export interface PremiumSellerStatus {
  active: boolean;

  plan: PremiumPlan | null;

  startedAt: Date | null;

  expiresAt: Date | null;

  paymentId: string | null;

  orderId: string | null;

  // ===================================================
  // Premium Features
  // ===================================================

  featuredAds: boolean;

  productBoost: boolean;

  sellerAnalytics: boolean;

  premiumBadge: boolean;

  prioritySupport: boolean;

  // ===================================================
  // Premium Promotion Quota
  // ===================================================

  featuredAdsLimit: number;

  featuredAdsUsed: number;

  boostAdsLimit: number;

  boostAdsUsed: number;

  // ===================================================
  // Metadata
  // ===================================================

  updatedAt: Date | null;
}

// =====================================================
// Get Users Collection
// =====================================================

async function getUsersCollection() {
  const client = await clientPromise;

  const db = client.db(
    DATABASE_NAME,
  );

  return db.collection(
    USERS_COLLECTION,
  );
}

// =====================================================
// Empty Premium Status
// =====================================================

function getDefaultPremiumStatus():
  PremiumSellerStatus {
  return {
    active: false,

    plan: null,

    startedAt: null,

    expiresAt: null,

    paymentId: null,

    orderId: null,

    // -----------------------------------------------
    // Features
    // -----------------------------------------------

    featuredAds: false,

    productBoost: false,

    sellerAnalytics: false,

    premiumBadge: false,

    prioritySupport: false,

    // -----------------------------------------------
    // Quota
    // -----------------------------------------------

    featuredAdsLimit: 0,

    featuredAdsUsed: 0,

    boostAdsLimit: 0,

    boostAdsUsed: 0,

    // -----------------------------------------------
    // Metadata
    // -----------------------------------------------

    updatedAt: null,
  };
}

// =====================================================
// Get Premium Seller Status
// =====================================================

export async function getPremiumSellerStatus(
  userId: string,
): Promise<PremiumSellerStatus | null> {
  // ===================================================
  // Validate User ID
  // ===================================================

  if (!ObjectId.isValid(userId)) {
    return null;
  }

  // ===================================================
  // Database
  // ===================================================

  const users = await getUsersCollection();

  // ===================================================
  // Find User
  // ===================================================

  const user = await users.findOne(
    {
      _id: new ObjectId(userId),
    },
    {
      projection: {
        premiumSeller: 1,
      },
    },
  );

  // ===================================================
  // User Not Found
  // ===================================================

  if (!user) {
    return null;
  }

  // ===================================================
  // Existing Premium Data
  // ===================================================

  const premium = user.premiumSeller;

  // ===================================================
  // No Premium Data
  // ===================================================

  if (!premium) {
    return getDefaultPremiumStatus();
  }

  // ===================================================
  // Plan
  // ===================================================

  const plan =
    premium.plan === "monthly" ||
    premium.plan === "quarterly" ||
    premium.plan === "yearly"
      ? premium.plan
      : null;

  // ===================================================
  // Plan Limits
  //
  // If old database records do not have limits,
  // calculate them from the Premium plan.
  // ===================================================

  let featuredAdsLimit = Number(
    premium.featuredAdsLimit ?? 0,
  );

  let boostAdsLimit = Number(
    premium.boostAdsLimit ?? 0,
  );

  if (plan) {
    const planLimits = getPremiumPlanLimits(plan);

    if (featuredAdsLimit <= 0) {
      featuredAdsLimit =
        planLimits.featuredAdsLimit;
    }

    if (boostAdsLimit <= 0) {
      boostAdsLimit =
        planLimits.boostAdsLimit;
    }
  }

  // ===================================================
  // Used Quota
  // ===================================================

  const featuredAdsUsed = Math.max(
    0,
    Number(premium.featuredAdsUsed ?? 0),
  );

  const boostAdsUsed = Math.max(
    0,
    Number(premium.boostAdsUsed ?? 0),
  );

  // ===================================================
  // Expiry
  // ===================================================

  const expiresAt = premium.expiresAt
    ? new Date(premium.expiresAt)
    : null;

  // ===================================================
  // Check Expiry
  // ===================================================

  const isExpired =
    Boolean(
      premium.active === true &&
        expiresAt &&
        expiresAt.getTime() <= Date.now(),
    );

  // ===================================================
  // Remaining Quota
  // ===================================================

  const featuredAdsRemaining = Math.max(
    0,
    featuredAdsLimit - featuredAdsUsed,
  );

  const boostAdsRemaining = Math.max(
    0,
    boostAdsLimit - boostAdsUsed,
  );

  // ===================================================
  // Common Data
  // ===================================================

  const commonData = {
    plan,

    startedAt: premium.startedAt
      ? new Date(premium.startedAt)
      : null,

    expiresAt,

    paymentId: premium.paymentId ?? null,

    orderId: premium.orderId ?? null,

    // =================================================
    // Promotion Quota
    // =================================================

    featuredAdsLimit,

    featuredAdsUsed,

    boostAdsLimit,

    boostAdsUsed,

    // =================================================
    // Metadata
    // =================================================

    updatedAt: premium.updatedAt
      ? new Date(premium.updatedAt)
      : null,
  };

  // ===================================================
  // Expired Premium
  // ===================================================

  if (isExpired) {
    return {
      active: false,

      ...commonData,

      // -----------------------------------------------
      // Disable Premium Features
      // -----------------------------------------------

      featuredAds: false,

      productBoost: false,

      sellerAnalytics: false,

      premiumBadge: false,

      prioritySupport: false,
    };
  }

  // ===================================================
  // Active / Non-expired Premium
  // ===================================================

  return {
    active: premium.active === true,

    ...commonData,

    // -----------------------------------------------
    // Premium Features
    // -----------------------------------------------

    featuredAds:
      premium.featuredAds === true,

    productBoost:
      premium.productBoost === true,

    sellerAnalytics:
      premium.sellerAnalytics === true,

    premiumBadge:
      premium.premiumBadge === true,

    prioritySupport:
      premium.prioritySupport === true,
  };
}

// =====================================================
// Activate / Renew Premium Seller
//
// V1 / Test foundation
//
// Important business rules:
//
// 1. New Premium activation gets plan quota.
// 2. Existing active Premium is extended.
// 3. Existing remaining Premium time is preserved.
// 4. New subscription gets a fresh quota.
// 5. Unused old quota does not carry forward.
// 6. Payment integration will be added later.
// =====================================================

export async function activatePremiumSeller(
  userId: string,
  options: {
    plan: PremiumPlan;

    startedAt: Date;

    expiresAt: Date;

    paymentId?: string | null;

    orderId?: string | null;
  },
): Promise<boolean> {
  // ===================================================
  // Validate User ID
  // ===================================================

  if (
    !ObjectId.isValid(userId)
  ) {
    return false;
  }

  // ===================================================
  // Database
  // ===================================================

  const users =
    await getUsersCollection();

  // ===================================================
  // Get Plan Limits
  // ===================================================

  const limits =
    getPremiumPlanLimits(
      options.plan,
    );

  // ===================================================
  // Find Existing Premium
  // ===================================================

  const user =
    await users.findOne(
      {
        _id:
          new ObjectId(userId),
      },
      {
        projection: {
          premiumSeller: 1,
        },
      },
    );

  if (!user) {
    return false;
  }

  // ===================================================
  // Existing Premium Expiry
  // ===================================================

  const existingPremium =
    user.premiumSeller;

  const existingExpiresAt =
    existingPremium?.expiresAt
      ? new Date(
          existingPremium.expiresAt,
        )
      : null;

  // ===================================================
  // Effective Start
  //
  // If an existing Premium subscription is still active,
  // the new subscription extends from the existing expiry.
  //
  // Example:
  //
  // Existing expiry:
  // 28 Nov 2026
  //
  // Quarterly:
  // + 90 days
  //
  // New expiry:
  // 28 Feb 2027
  // ===================================================

  const existingPremiumActive =
    Boolean(
      existingPremium?.active ===
        true &&
        existingExpiresAt &&
        existingExpiresAt.getTime() >
          Date.now(),
    );

  // ===================================================
  // Calculate New Expiry
  // ===================================================

  const newExpiresAt =
    new Date(
      existingPremiumActive &&
      existingExpiresAt
        ? existingExpiresAt
        : options.startedAt,
    );

  // ===================================================
  // Plan Duration
  // ===================================================

  if (
    options.plan === "monthly"
  ) {
    newExpiresAt.setMonth(
      newExpiresAt.getMonth() +
        1,
    );
  }

  if (
    options.plan === "quarterly"
  ) {
    newExpiresAt.setMonth(
      newExpiresAt.getMonth() +
        3,
    );
  }

  if (
    options.plan === "yearly"
  ) {
    newExpiresAt.setFullYear(
      newExpiresAt.getFullYear() +
        1,
    );
  }

  // ===================================================
  // Update Premium
  // ===================================================

  const result =
    await users.updateOne(
      {
        _id:
          new ObjectId(userId),
      },
      {
        $set: {
          premiumSeller: {
            active: true,

            plan:
              options.plan,

            // The actual activation/renewal time.
            startedAt:
              options.startedAt,

            // Important:
            // Preserve existing active time and
            // extend from it.
            expiresAt:
              newExpiresAt,

            paymentId:
              options.paymentId ??
              null,

            orderId:
              options.orderId ??
              null,

            // =========================================
            // Premium Features
            // =========================================

            featuredAds: true,

            productBoost: true,

            sellerAnalytics: true,

            premiumBadge: true,

            prioritySupport: true,

            // =========================================
            // Fresh Promotion Quota
            //
            // New subscription gets new quota.
            // Old unused quota is not carried forward.
            // =========================================

            featuredAdsLimit:
              limits.featuredAdsLimit,

            featuredAdsUsed: 0,

            boostAdsLimit:
              limits.boostAdsLimit,

            boostAdsUsed: 0,

            // =========================================
            // Metadata
            // =========================================

            updatedAt:
              new Date(),
          },
        },
      },
    );

  return (
    result.matchedCount >
    0
  );
}

// =====================================================
// Deactivate Premium Seller
// =====================================================

export async function deactivatePremiumSeller(
  userId: string,
): Promise<boolean> {
  // ===================================================
  // Validate User ID
  // ===================================================

  if (
    !ObjectId.isValid(userId)
  ) {
    return false;
  }

  // ===================================================
  // Database
  // ===================================================

  const users =
    await getUsersCollection();

  // ===================================================
  // Disable Premium
  // ===================================================

  const result =
    await users.updateOne(
      {
        _id:
          new ObjectId(userId),
      },
      {
        $set: {
          "premiumSeller.active":
            false,

          "premiumSeller.featuredAds":
            false,

          "premiumSeller.productBoost":
            false,

          "premiumSeller.sellerAnalytics":
            false,

          "premiumSeller.premiumBadge":
            false,

          "premiumSeller.prioritySupport":
            false,

          "premiumSeller.updatedAt":
            new Date(),
        },
      },
    );

  return (
    result.matchedCount >
    0
  );
}