"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SellerVerificationActionsProps {
  userId: string;

  currentStatus:
    | "unverified"
    | "pending"
    | "verified"
    | "rejected"
    | "suspended";

  phoneVerified: boolean;
  identityVerified: boolean;
  selfieVerified: boolean;
  locationVerified: boolean;
}

type VerificationAction =
  | "approve"
  | "reject"
  | "suspend";

export default function SellerVerificationActions({
  userId,
  currentStatus,
  phoneVerified,
  identityVerified,
  selfieVerified,
  locationVerified,
}: SellerVerificationActionsProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [reason, setReason] =
    useState("");

  const [reasonModal, setReasonModal] =
    useState<
      "reject" | "suspend" | null
    >(null);

  // =====================================================
  // Verification Progress
  // =====================================================

  const completedChecks = [
    phoneVerified,
    identityVerified,
    selfieVerified,
    locationVerified,
  ].filter(Boolean).length;

  const totalChecks = 4;

  const progress = Math.round(
    (completedChecks / totalChecks) *
      100,
  );

  const fullyVerified =
    completedChecks === totalChecks;

  // =====================================================
  // Update Verification
  // =====================================================

  async function updateVerification(
    action: VerificationAction,
  ) {
    try {
      setLoading(true);

      const response =
        await fetch(
          `/api/admin/verification/${userId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              action,

              reason:
                action === "approve"
                  ? ""
                  : reason.trim(),
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to update seller verification.",
        );
      }

      toast.success(
        action === "approve"
          ? "Seller verified successfully."
          : "Verification updated successfully.",
        {
          description:
            data?.message,
        },
      );

      setReason("");

      setReasonModal(null);

      router.refresh();
    } catch (error) {
      console.error(
        "SELLER VERIFICATION UPDATE ERROR:",
        error,
      );

      toast.error(
        "Verification update failed.",
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
  // Already Suspended
  // =====================================================

  if (
    currentStatus ===
    "suspended"
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
          ⛔ This seller is currently
          suspended.
        </p>

        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          Seller verification actions
          are currently restricted.
        </p>
      </div>
    );
  }

  // =====================================================
  // Already Verified
  // =====================================================

  if (
    currentStatus ===
    "verified"
  ) {
    return (
      <div className="space-y-4">

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
            ✓ Seller is fully verified.
          </p>

          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            All required seller
            verification checks have
            been completed and approved.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setReasonModal(
              "suspend",
            )
          }
          className="
            rounded-xl
            bg-slate-700
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          ⛔ Suspend Seller
        </button>

        {reasonModal ===
          "suspend" &&
          renderReasonForm(
            "suspend",
          )}
      </div>
    );
  }

  // =====================================================
  // Rejected
  // =====================================================

  if (
    currentStatus ===
    "rejected"
  ) {
    return (
      <div className="space-y-4">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
            ✕ Verification was rejected.
          </p>

          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            Review the seller again when
            a new verification request is
            submitted.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setReasonModal(
              "suspend",
            )
          }
          className="
            rounded-xl
            bg-slate-700
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          ⛔ Suspend Seller
        </button>

        {reasonModal ===
          "suspend" &&
          renderReasonForm(
            "suspend",
          )}
      </div>
    );
  }

  // =====================================================
  // Pending / Unverified
  // =====================================================

  return (
    <div className="space-y-5">

      {/* =================================================
          Verification Summary
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Verification Readiness
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {completedChecks} of{" "}
              {totalChecks} checks completed
            </p>
          </div>

          <span
            className={`
              rounded-full
              px-3
              py-1
              text-xs
              font-bold
              ${
                fullyVerified
                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
              }
            `}
          >
            {progress}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-[#1565d8] transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* =================================================
            Individual Checks
        ================================================= */}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">

          <CheckItem
            label="Phone"
            verified={
              phoneVerified
            }
          />

          <CheckItem
            label="Identity"
            verified={
              identityVerified
            }
          />

          <CheckItem
            label="Live Selfie"
            verified={
              selfieVerified
            }
          />

          <CheckItem
            label="Location"
            verified={
              locationVerified
            }
          />

        </div>
      </div>

      {/* =================================================
          Admin Actions
      ================================================= */}

      <div className="flex flex-wrap gap-3">

        {/* Approve */}

        <button
          type="button"
          disabled={
            loading ||
            !fullyVerified
          }
          onClick={() =>
            updateVerification(
              "approve",
            )
          }
          title={
            !fullyVerified
              ? "All 4 verification checks must be completed first."
              : "Approve seller"
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
            ? "Updating..."
            : fullyVerified
              ? "✓ Approve Seller"
              : "✓ Approve Seller"}
        </button>

        {/* Reject */}

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setReasonModal(
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
            transition
            hover:bg-red-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          ✕ Reject Verification
        </button>

        {/* Suspend */}

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setReasonModal(
              "suspend",
            )
          }
          className="
            rounded-xl
            bg-slate-700
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          ⛔ Suspend Seller
        </button>

      </div>

      {/* =================================================
          Reason Form
      ================================================= */}

      {reasonModal &&
        renderReasonForm(
          reasonModal,
        )}
    </div>
  );

  // =====================================================
  // Reason Form
  // =====================================================

  function renderReasonForm(
    action:
      | "reject"
      | "suspend",
  ) {
    const isReject =
      action === "reject";

    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">

        <h3 className="font-bold text-slate-900 dark:text-white">
          {isReject
            ? "Reject Verification"
            : "Suspend Seller"}
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isReject
            ? "Please provide a reason for rejecting this verification request."
            : "Please provide a reason for suspending this seller."}
        </p>

        <textarea
          value={reason}
          onChange={(
            event,
          ) =>
            setReason(
              event.target.value,
            )
          }
          maxLength={500}
          rows={4}
          placeholder={
            isReject
              ? "Example: Identity documents could not be verified..."
              : "Example: Suspicious activity detected..."
          }
          className="
            mt-4
            w-full
            rounded-xl
            border
            border-slate-300
            bg-white
            p-4
            text-sm
            outline-none
            transition
            focus:border-[#1565d8]
            dark:border-slate-600
            dark:bg-slate-900
            dark:text-white
          "
        />

        <div className="mt-4 flex flex-wrap gap-3">

          <button
            type="button"
            disabled={
              loading ||
              !reason.trim()
            }
            onClick={() =>
              updateVerification(
                action,
              )
            }
            className={`
              rounded-xl
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                isReject
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-slate-700 hover:bg-slate-800"
              }
            `}
          >
            {loading
              ? "Submitting..."
              : isReject
                ? "Confirm Rejection"
                : "Confirm Suspension"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setReason("");

              setReasonModal(
                null,
              );
            }}
            className="
              rounded-xl
              border
              border-slate-300
              px-5
              py-3
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-100
              dark:border-slate-600
              dark:text-slate-200
              dark:hover:bg-slate-700
            "
          >
            Cancel
          </button>

        </div>

        <p className="mt-3 text-right text-xs text-slate-400">
          {reason.length}/500
        </p>

      </div>
    );
  }
}

// =====================================================
// Check Item
// =====================================================

function CheckItem({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 dark:bg-slate-900">

      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>

      <span
        className={
          verified
            ? "text-green-600 dark:text-green-400"
            : "text-slate-400 dark:text-slate-500"
        }
      >
        {verified
          ? "✓ Verified"
          : "○ Not Verified"}
      </span>

    </div>
  );
}