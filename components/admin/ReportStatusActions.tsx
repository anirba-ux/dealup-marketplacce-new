"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReportStatusActionsProps {
  reportId: string;
  currentStatus:
    | "pending"
    | "reviewing"
    | "resolved"
    | "rejected";
}

export default function ReportStatusActions({
  reportId,
  currentStatus,
}: ReportStatusActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function updateStatus(
    status:
      | "pending"
      | "reviewing"
      | "resolved"
      | "rejected",
  ) {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/reports/${reportId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to update report status.",
        );
      }

      toast.success(
        "Report status updated.",
        {
          description:
            `Status changed to ${status}.`,
        },
      );

      router.refresh();
    } catch (error) {
      console.error(
        "REPORT STATUS UPDATE ERROR:",
        error,
      );

      toast.error(
        "Failed to update report.",
        {
          description:
            error instanceof Error
              ? error.message
              : "Please try again.",
        },
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // Already Resolved / Rejected
  // =====================================================

  if (
    currentStatus === "resolved" ||
    currentStatus === "rejected"
  ) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        This report has already been{" "}
        <strong>
          {currentStatus}
        </strong>
        .
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* =================================================
          Reviewing
      ================================================= */}

      {currentStatus !== "reviewing" && (
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            updateStatus("reviewing")
          }
          className="
            rounded-xl
            bg-blue-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition

            hover:bg-blue-700
            hover:scale-[1.02]

            active:scale-95

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Updating..."
            : "🔎 Mark as Reviewing"}
        </button>
      )}

      {/* =================================================
          Resolve
      ================================================= */}

      <button
        type="button"
        disabled={loading}
        onClick={() =>
          updateStatus("resolved")
        }
        className="
          rounded-xl
          bg-green-600
          px-5
          py-3
          text-sm
          font-semibold
          text-white
          transition

          hover:bg-green-700
          hover:scale-[1.02]

          active:scale-95

          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading
          ? "Updating..."
          : "✓ Resolve Report"}
      </button>

      {/* =================================================
          Reject
      ================================================= */}

      <button
        type="button"
        disabled={loading}
        onClick={() =>
          updateStatus("rejected")
        }
        className="
          rounded-xl
          bg-slate-600
          px-5
          py-3
          text-sm
          font-semibold
          text-white
          transition

          hover:bg-slate-700
          hover:scale-[1.02]

          active:scale-95

          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading
          ? "Updating..."
          : "✕ Reject Report"}
      </button>
    </div>
  );
}