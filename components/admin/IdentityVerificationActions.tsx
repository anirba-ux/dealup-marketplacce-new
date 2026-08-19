"use client";

import { useState } from "react";

interface Props {
  submissionId: string;
  status: string;
}

export default function IdentityVerificationActions({
  submissionId,
  status,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [showRejectBox, setShowRejectBox] =
    useState(false);

  const [reason, setReason] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ===================================================
  // Review Identity
  // ===================================================

  async function reviewIdentity(
    action: "approve" | "reject",
  ) {
    setLoading(true);

    setMessage("");
    setError("");

    try {
      if (
        action === "reject" &&
        !reason.trim()
      ) {
        setError(
          "Please enter a rejection reason.",
        );

        setLoading(false);

        return;
      }

      const response =
        await fetch(
          "/api/admin/verification/identity",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              submissionId,

              action,

              reason:
                action ===
                "reject"
                  ? reason.trim()
                  : "",
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to review identity.",
        );
      }

      setMessage(
        action ===
          "approve"
          ? "Identity verification approved successfully."
          : "Identity verification rejected successfully.",
      );

      setShowRejectBox(
        false,
      );

      setReason("");

      // Refresh server component
      // so the latest MongoDB status appears.
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // Already Reviewed
  // ===================================================

  if (
    status === "approved"
  ) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/20">
        <p className="font-semibold text-green-700 dark:text-green-400">
          ✓ Identity verification
          approved.
        </p>

        <p className="mt-1 text-sm text-green-600 dark:text-green-500">
          This Aadhaar submission has
          already been approved.
        </p>
      </div>
    );
  }

  if (
    status === "rejected"
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20">
        <p className="font-semibold text-red-700 dark:text-red-400">
          ✕ Identity verification
          rejected.
        </p>

        <p className="mt-1 text-sm text-red-600 dark:text-red-500">
          The seller can submit a new
          Aadhaar verification request.
        </p>
      </div>
    );
  }

  if (
    status !== "pending"
  ) {
    return null;
  }

  // ===================================================
  // Pending Review
  // ===================================================

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">

      <div className="flex flex-wrap gap-3">

        {/* Approve */}

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            reviewIdentity(
              "approve",
            )
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
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Processing..."
            : "✓ Approve Identity"}
        </button>

        {/* Reject */}

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setShowRejectBox(
              (value) => !value,
            )
          }
          className="
            rounded-xl
            bg-red-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-red-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          ✕ Reject Identity
        </button>

      </div>

      {/* Reject Box */}

      {showRejectBox && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20">

          <label
            htmlFor="identity-rejection-reason"
            className="text-sm font-semibold text-red-800 dark:text-red-300"
          >
            Rejection Reason
          </label>

          <textarea
            id="identity-rejection-reason"
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value,
              )
            }
            placeholder="Explain why the Aadhaar verification is being rejected..."
            rows={4}
            className="
              mt-3
              w-full
              rounded-xl
              border
              border-red-200
              bg-white
              p-3
              text-sm
              text-slate-900
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-200
              dark:border-red-900
              dark:bg-slate-900
              dark:text-white
            "
          />

          {error && (
            <p className="mt-2 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                reviewIdentity(
                  "reject",
                )
              }
              className="
                rounded-xl
                bg-red-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                hover:bg-red-700
                disabled:opacity-50
              "
            >
              {loading
                ? "Rejecting..."
                : "Confirm Rejection"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setShowRejectBox(
                  false,
                );

                setReason("");

                setError("");
              }}
              className="
                rounded-xl
                border
                border-slate-300
                bg-white
                px-5
                py-3
                text-sm
                font-semibold
                text-slate-700
                hover:bg-slate-100
                dark:border-slate-600
                dark:bg-slate-800
                dark:text-slate-200
              "
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* Success */}

      {message && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 dark:bg-green-950/20 dark:text-green-400">
          {message}
        </div>
      )}

    </div>
  );
}