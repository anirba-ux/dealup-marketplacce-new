import { NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  findAllHelpArticleFeedback,
  getHelpArticleFeedbackStats,
} from "@/lib/repositories/helpArticleFeedback.repository";

// =====================================================
// GET — Admin Help Article Feedback
// =====================================================

export async function GET() {
  try {
    // -------------------------------------------------
    // Authentication
    // -------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        {
          status: 401,
        },
      );
    }

    // -------------------------------------------------
    // Admin authorization
    // -------------------------------------------------

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    // -------------------------------------------------
    // Feedback
    // -------------------------------------------------

    const feedback =
      await findAllHelpArticleFeedback(100);

    // -------------------------------------------------
    // Overall statistics
    // -------------------------------------------------

    const helpful = feedback.filter(
      (item) =>
        item.feedback === "helpful",
    ).length;

    const notHelpful = feedback.filter(
      (item) =>
        item.feedback === "not_helpful",
    ).length;

    const total = feedback.length;

    const helpfulRate =
      total > 0
        ? Math.round(
            (helpful / total) * 100,
          )
        : 0;

    // -------------------------------------------------
    // Article-wise statistics
    // -------------------------------------------------

    const articleStatsMap =
      new Map<
        string,
        {
          articleSlug: string;
          helpful: number;
          notHelpful: number;
          total: number;
        }
      >();

    for (const item of feedback) {
      const existing =
        articleStatsMap.get(
          item.articleSlug,
        );

      if (existing) {
        existing.total += 1;

        if (
          item.feedback ===
          "helpful"
        ) {
          existing.helpful += 1;
        } else {
          existing.notHelpful += 1;
        }

        continue;
      }

      articleStatsMap.set(
        item.articleSlug,
        {
          articleSlug:
            item.articleSlug,
          helpful:
            item.feedback ===
            "helpful"
              ? 1
              : 0,
          notHelpful:
            item.feedback ===
            "not_helpful"
              ? 1
              : 0,
          total: 1,
        },
      );
    }

    const articleStats =
      Array.from(
        articleStatsMap.values(),
      )
        .map((item) => ({
          ...item,
          helpfulRate:
            item.total > 0
              ? Math.round(
                  (item.helpful /
                    item.total) *
                    100,
                )
              : 0,
        }))
        .sort(
          (a, b) =>
            b.total - a.total,
        );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return NextResponse.json({
      success: true,

      stats: {
        helpful,
        notHelpful,
        total,
        helpfulRate,
      },

      articleStats,

      feedback,
    });
  } catch (error) {
    console.error(
      "[ADMIN HELP FEEDBACK GET ERROR]",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load Help Center feedback.",
      },
      {
        status: 500,
      },
    );
  }
}