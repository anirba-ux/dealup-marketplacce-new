import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  upsertHelpArticleFeedback,
  findUserHelpArticleFeedback,
  getHelpArticleFeedbackStats,
} from "@/lib/repositories/helpArticleFeedback.repository";

import type { HelpArticleFeedbackValue } from "@/lib/models/helpArticleFeedback";

// =====================================================
// POST
// Submit / Update Help Article Feedback
// =====================================================

export async function POST(
  request: NextRequest,
) {
  try {
    // -------------------------------------------------
    // Authentication
    // -------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please sign in to submit feedback.",
        },
        { status: 401 },
      );
    }

    // -------------------------------------------------
    // Request Body
    // -------------------------------------------------

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const data = body as {
      articleSlug?: unknown;
      feedback?: unknown;
      comment?: unknown;
    };

    // -------------------------------------------------
    // Article Slug
    // -------------------------------------------------

    const articleSlug =
      typeof data.articleSlug === "string"
        ? data.articleSlug.trim()
        : "";

    if (!articleSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Article slug is required.",
        },
        { status: 400 },
      );
    }

    // -------------------------------------------------
    // Feedback
    // -------------------------------------------------

    const feedback =
      typeof data.feedback === "string"
        ? data.feedback.trim()
        : "";

    if (
      feedback !== "helpful" &&
      feedback !== "not_helpful"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid feedback value.",
        },
        { status: 400 },
      );
    }

    // -------------------------------------------------
    // Comment
    // -------------------------------------------------

    let comment: string | null = null;

    if (
      typeof data.comment === "string"
    ) {
      comment = data.comment.trim();

      if (comment.length > 1000) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Comment cannot exceed 1000 characters.",
          },
          { status: 400 },
        );
      }
    }

    // -------------------------------------------------
    // Save Feedback
    // -------------------------------------------------

    const savedFeedback =
      await upsertHelpArticleFeedback(
        articleSlug,
        session.user.id,
        feedback as HelpArticleFeedbackValue,
        comment,
      );

    // -------------------------------------------------
    // Updated Stats
    // -------------------------------------------------

    const stats =
      await getHelpArticleFeedbackStats(
        articleSlug,
      );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for your feedback.",
        feedback: {
          articleSlug:
            savedFeedback?.articleSlug ??
            articleSlug,
          value:
            savedFeedback?.feedback ??
            feedback,
          comment:
            savedFeedback?.comment ??
            comment,
        },
        stats,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "HELP ARTICLE FEEDBACK POST ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save feedback.",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// GET
// Get Current User Feedback + Article Stats
// =====================================================

export async function GET(
  request: NextRequest,
) {
  try {
    // -------------------------------------------------
    // Authentication
    // -------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please sign in.",
        },
        { status: 401 },
      );
    }

    // -------------------------------------------------
    // Article Slug
    // -------------------------------------------------

    const articleSlug =
      request.nextUrl.searchParams
        .get("articleSlug")
        ?.trim() ?? "";

    if (!articleSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Article slug is required.",
        },
        { status: 400 },
      );
    }

    // -------------------------------------------------
    // Fetch User Feedback + Stats
    // -------------------------------------------------

    const [
      userFeedback,
      stats,
    ] = await Promise.all([
      findUserHelpArticleFeedback(
        articleSlug,
        session.user.id,
      ),

      getHelpArticleFeedbackStats(
        articleSlug,
      ),
    ]);

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        feedback: userFeedback
          ? {
              value:
                userFeedback.feedback,
              comment:
                userFeedback.comment ??
                null,
            }
          : null,

        stats,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "HELP ARTICLE FEEDBACK GET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load feedback.",
      },
      { status: 500 },
    );
  }
}