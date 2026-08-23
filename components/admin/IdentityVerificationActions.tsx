"use client";

import { useState } from "react";

import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  LockKeyhole,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

// =====================================================
// Props
// =====================================================

interface IdentityVerificationActionsProps {
  submissionId: string;

  status:
    | "approved"
    | "pending"
    | "rejected"
    | "not_submitted"
    | string;
}

// =====================================================
// Component
// =====================================================

export default function IdentityVerificationActions({
  submissionId,
  status,
}: IdentityVerificationActionsProps) {
  const [loadingAction, setLoadingAction] = useState<
    "view" | "approve" | "reject" | null
  >(null);

  const [showRejectBox, setShowRejectBox] = useState(false);

  const [reason, setReason] = useState("");

  // ===================================================
  // View Secure Identity Document
  // ===================================================

  async function handleViewDocument() {
    try {
      setLoadingAction("view");

      const response = await fetch(
        `/api/admin/identity-document/${submissionId}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to open identity document.",
        );
      }

      if (!data?.url) {
        throw new Error(
          "Secure document URL was not returned.",
        );
      }

      // Open secure Cloudinary URL
      window.open(
        data.url,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      console.error(
        "VIEW IDENTITY DOCUMENT ERROR:",
        error,
      );

      toast.error(
        "Unable to open identity document.",
        {
          description:
            error instanceof Error
              ? error.message
              : "Please try again.",
        },
      );
    } finally {
      setLoadingAction(null);
    }
  }

  // ===================================================
  // Approve Identity
  // ===================================================

  async function handleApprove() {
    const confirmed = window.confirm(
      "Have you checked the Aadhaar document carefully and confirmed that it is valid and belongs to this seller?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingAction("approve");

      // IMPORTANT:
      // Existing API expects submissionId
      // inside request body.
      const response = await fetch(
        "/api/admin/verification/identity",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            submissionId,
            action: "approve",
          }),
        },
      );

      const contentType =
        response.headers.get("content-type");

      let data: any = null;

      if (
        contentType?.includes(
          "application/json",
        )
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          text ||
            `Server returned status ${response.status}.`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to approve identity verification.",
        );
      }

      toast.success(
        "Identity verification approved.",
        {
          description:
            "The seller's identity has been successfully approved.",
        },
      );

      // Refresh admin verification page
      window.location.reload();
    } catch (error) {
      console.error(
        "APPROVE IDENTITY ERROR:",
        error,
      );

      toast.error(
        "Identity approval failed.",
        {
          description:
            error instanceof Error
              ? error.message
              : "Please try again.",
        },
      );
    } finally {
      setLoadingAction(null);
    }
  }

  // ===================================================
  // Reject Identity
  // ===================================================

  async function handleReject() {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.error(
        "Rejection reason is required.",
      );

      return;
    }

    try {
      setLoadingAction("reject");

      // IMPORTANT:
      // Existing API expects submissionId
      // inside request body.
      const response = await fetch(
        "/api/admin/verification/identity",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            submissionId,
            action: "reject",
            reason: trimmedReason,
          }),
        },
      );

      const contentType =
        response.headers.get("content-type");

      let data: any = null;

      if (
        contentType?.includes(
          "application/json",
        )
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          text ||
            `Server returned status ${response.status}.`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to reject identity verification.",
        );
      }

      toast.success(
        "Identity verification rejected.",
        {
          description:
            "The seller's identity verification has been rejected.",
        },
      );

      setReason("");
      setShowRejectBox(false);

      // Refresh admin verification page
      window.location.reload();
    } catch (error) {
      console.error(
        "REJECT IDENTITY ERROR:",
        error,
      );

      toast.error(
        "Identity rejection failed.",
        {
          description:
            error instanceof Error
              ? error.message
              : "Please try again.",
        },
      );
    } finally {
      setLoadingAction(null);
    }
  }

  // ===================================================
  // Already Approved
  // ===================================================

  if (status === "approved") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/20">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={21}
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
          />

          <div className="flex-1">
            <p className="text-sm font-bold text-green-700 dark:text-green-400">
              Identity Verified
            </p>

            <p className="mt-1 text-xs leading-5 text-green-600 dark:text-green-500">
              This seller's Aadhaar identity
              has already been approved by an
              administrator.
            </p>

            <button
              type="button"
              disabled={
                loadingAction === "view"
              }
              onClick={
                handleViewDocument
              }
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loadingAction ===
              "view" ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <ExternalLink
                  size={16}
                />
              )}

              View Secure Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // Rejected
  // ===================================================

  if (status === "rejected") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/20">
        <div className="flex items-start gap-3">
          <XCircle
            size={21}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <div className="flex-1">
            <p className="text-sm font-bold text-red-700 dark:text-red-400">
              Identity Verification Rejected
            </p>

            <p className="mt-1 text-xs leading-5 text-red-600 dark:text-red-500">
              This identity submission was
              rejected by an administrator.
            </p>

            <button
              type="button"
              disabled={
                loadingAction === "view"
              }
              onClick={
                handleViewDocument
              }
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loadingAction ===
              "view" ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <ExternalLink
                  size={16}
                />
              )}

              View Secure Document
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // Pending / Review Actions
  // ===================================================

  return (
    <div className="space-y-4">
      {/* Secure Document */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <FileText size={20} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Identity Document
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              This is a secure identity
              document. Only authorized
              administrators can view it.
            </p>

            <button
              type="button"
              disabled={
                loadingAction !== null
              }
              onClick={
                handleViewDocument
              }
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-indigo-600
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loadingAction ===
              "view" ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <LockKeyhole
                  size={16}
                />
              )}

              View Secure Document
            </button>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap gap-3">
          {/* Approve */}
          <button
            type="button"
            disabled={
              loadingAction !== null
            }
            onClick={handleApprove}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-green-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-green-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loadingAction ===
            "approve" ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <CheckCircle2
                size={17}
              />
            )}

            Approve Identity
          </button>

          {/* Reject */}
          <button
            type="button"
            disabled={
              loadingAction !== null
            }
            onClick={() =>
              setShowRejectBox(
                (prev) => !prev,
              )
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-red-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <XCircle size={17} />

            Reject Identity
          </button>
        </div>

        {/* Reject Reason */}
        {showRejectBox && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
            <label
              htmlFor="identity-rejection-reason"
              className="block text-sm font-semibold text-red-800 dark:text-red-300"
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
              placeholder="Enter the reason for rejecting this identity document..."
              rows={4}
              disabled={
                loadingAction !== null
              }
              className="
                mt-3
                w-full
                resize-none
                rounded-xl
                border
                border-red-200
                bg-white
                px-4
                py-3
                text-sm
                text-slate-800
                outline-none
                transition
                focus:border-red-400
                focus:ring-2
                focus:ring-red-100
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:border-red-800
                dark:bg-slate-900
                dark:text-slate-100
              "
            />

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  handleReject
                }
                disabled={
                  loadingAction !== null
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loadingAction ===
                "reject" ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <XCircle
                    size={17}
                  />
                )}

                Confirm Rejection
              </button>

              <button
                type="button"
                disabled={
                  loadingAction !== null
                }
                onClick={() => {
                  setReason("");
                  setShowRejectBox(
                    false,
                  );
                }}
                className="
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-slate-200
                "
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}