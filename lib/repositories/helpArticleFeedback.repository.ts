import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

import type {
  HelpArticleFeedback,
  HelpArticleFeedbackValue,
} from "@/lib/models/helpArticleFeedback";

// =====================================================
// Database
// =====================================================

async function getCollection() {
  const client = await clientPromise;

  const db = client.db("dealup");

  return db.collection<HelpArticleFeedback>(
    "helpArticleFeedback",
  );
}

// =====================================================
// Create / Update Feedback
// =====================================================

export async function upsertHelpArticleFeedback(
  articleSlug: string,
  userId: string,
  feedback: HelpArticleFeedbackValue,
  comment?: string | null,
) {
  const collection =
    await getCollection();

  if (!ObjectId.isValid(userId)) {
    throw new Error(
      "Invalid user ID.",
    );
  }

  const cleanSlug =
    articleSlug.trim();

  if (!cleanSlug) {
    throw new Error(
      "Article slug is required.",
    );
  }

  const now = new Date();

  const userObjectId =
    new ObjectId(userId);

  const result =
    await collection.findOneAndUpdate(
      {
        articleSlug: cleanSlug,
        userId: userObjectId,
      },
      {
        $set: {
          feedback,
          comment:
            comment?.trim()
              ? comment.trim()
              : null,
          updatedAt: now,
        },
        $setOnInsert: {
          articleSlug: cleanSlug,
          userId: userObjectId,
          createdAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

  return result;
}

// =====================================================
// Find User Feedback
// =====================================================

export async function findUserHelpArticleFeedback(
  articleSlug: string,
  userId: string,
) {
  const collection =
    await getCollection();

  if (!ObjectId.isValid(userId)) {
    return null;
  }

  return collection.findOne({
    articleSlug:
      articleSlug.trim(),
    userId:
      new ObjectId(userId),
  });
}

// =====================================================
// Count Feedback
// =====================================================

export async function getHelpArticleFeedbackStats(
  articleSlug: string,
) {
  const collection =
    await getCollection();

  const cleanSlug =
    articleSlug.trim();

  const [
    helpful,
    notHelpful,
  ] = await Promise.all([
    collection.countDocuments({
      articleSlug: cleanSlug,
      feedback: "helpful",
    }),

    collection.countDocuments({
      articleSlug: cleanSlug,
      feedback: "not_helpful",
    }),
  ]);

  return {
    helpful,
    notHelpful,
    total:
      helpful + notHelpful,
  };
}

// =====================================================
// Admin — Get All Help Article Feedback
// =====================================================

export async function findAllHelpArticleFeedback(
  limit = 100,
) {
  const collection =
    await getCollection();

  const safeLimit = Math.min(
    Math.max(limit, 1),
    500,
  );

  const feedback = await collection
    .aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $limit: safeLimit,
      },

      // -----------------------------------------------
      // User information
      // -----------------------------------------------

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },

      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      // -----------------------------------------------
      // Safe admin response
      // -----------------------------------------------

      {
        $project: {
          _id: 1,
          articleSlug: 1,
          feedback: 1,
          comment: 1,
          createdAt: 1,
          updatedAt: 1,

          userId: 1,

          userName: {
            $ifNull: [
              "$user.name",
              "Unknown user",
            ],
          },

          userEmail: {
            $ifNull: [
              "$user.email",
              "",
            ],
          },
        },
      },
    ])
    .toArray();

  return feedback;
}