"use client";

import { useEffect, useState } from "react";

import { CheckCircle2, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";

interface HelpArticleFeedbackProps {
  articleSlug: string;
}

type FeedbackValue = "helpful" | "not_helpful";

interface FeedbackResponse {
  success?: boolean;
  message?: string;
  feedback?: {
    value?: FeedbackValue;
    comment?: string | null;
  } | null;
  stats?: {
    helpful: number;
    notHelpful: number;
    total: number;
  };
}

export default function HelpArticleFeedback({
  articleSlug,
}: HelpArticleFeedbackProps) {
  const [selectedFeedback, setSelectedFeedback] =
    useState<FeedbackValue | null>(null);

  const [comment, setComment] = useState("");

  const [showCommentBox, setShowCommentBox] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // =====================================================
  // Load Existing Feedback
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadFeedback() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/help/feedback?articleSlug=${encodeURIComponent(
            articleSlug,
          )}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const data: FeedbackResponse =
          await response.json();

        if (
          cancelled ||
          !response.ok ||
          !data.success
        ) {
          return;
        }

        if (data.feedback?.value) {
          setSelectedFeedback(
            data.feedback.value,
          );

          setComment(
            data.feedback.comment ?? "",
          );

          if (
            data.feedback.value ===
            "not_helpful"
          ) {
            setShowCommentBox(true);
          }
        }
      } catch {
        // Feedback loading failure should not
        // break the Help article.

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFeedback();

    return () => {
      cancelled = true;
    };
  }, [articleSlug]);

  // =====================================================
  // Submit Feedback
  // =====================================================

  async function submitFeedback(
    value: FeedbackValue,
  ) {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (
        value === "not_helpful" &&
        !showCommentBox
      ) {
        setSelectedFeedback(value);
        setShowCommentBox(true);
        setSubmitting(false);
        return;
      }

      const response = await fetch(
        "/api/help/feedback",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            articleSlug,
            feedback: value,
            comment:
              value === "not_helpful"
                ? comment.trim() || null
                : null,
          }),
        },
      );

      const data: FeedbackResponse =
        await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          setErrorMessage(
            "Please sign in to submit feedback.",
          );
        } else {
          setErrorMessage(
            data.message ??
              "Unable to submit feedback.",
          );
        }

        return;
      }

      setSelectedFeedback(value);

      if (value === "helpful") {
        setShowCommentBox(false);
        setComment("");
      }

      setSuccessMessage(
        "Thanks for your feedback!",
      );
    } catch {
      setErrorMessage(
        "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2
            size={16}
            className="animate-spin"
          />

          Loading feedback...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7 dark:border-slate-800 dark:bg-slate-950">
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Was this article helpful?
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your feedback helps us improve the DealUp
          Help Center.
        </p>

        {/* ============================================
            Buttons
        ============================================ */}

        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            disabled={submitting}
            onClick={() =>
              submitFeedback("helpful")
            }
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition ${
              selectedFeedback === "helpful"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
            }`}
          >
            {submitting &&
            selectedFeedback !==
              "helpful" ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <ThumbsUp size={17} />
            )}

            Yes
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() =>
              submitFeedback("not_helpful")
            }
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition ${
              selectedFeedback === "not_helpful"
                ? "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950/30 dark:text-rose-400"
                : "border-slate-200 bg-white text-slate-700 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-400"
            }`}
          >
            <ThumbsDown size={17} />

            No
          </button>
        </div>

        {/* ============================================
            Not Helpful Comment
        ============================================ */}

        {showCommentBox && (
          <div className="mx-auto mt-6 max-w-xl text-left">
            <label
              htmlFor="help-feedback-comment"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              How can we improve this article?
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <textarea
              id="help-feedback-comment"
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              maxLength={1000}
              rows={4}
              placeholder="Tell us what was missing or unclear..."
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1565d8] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950"
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-400">
                {comment.length}/1000
              </span>

              <button
                type="button"
                disabled={submitting}
                onClick={() =>
                  submitFeedback(
                    "not_helpful",
                  )
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 text-sm font-semibold text-white transition hover:bg-[#0d47a1] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    Sending...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================
            Success
        ============================================ */}

        {successMessage && (
          <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={17} />

            {successMessage}
          </div>
        )}

        {/* ============================================
            Error
        ============================================ */}

        {errorMessage && (
          <p className="mt-5 text-sm font-medium text-rose-600 dark:text-rose-400">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}