"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";

// =====================================================
// Types
// =====================================================

type CorrectionType =
  | "selfie_missing"
  | "selfie_unclear"
  | "location_incorrect"
  | "location_unavailable"
  | "identity_issue"
  | "phone_issue"
  | "other";

interface VerificationCorrectionFormProps {
  userId: string;
  currentStatus: string;
  onSuccess?: () => void;
}

// =====================================================
// Component
// =====================================================

export default function VerificationCorrectionForm({
  userId,
  currentStatus,
  onSuccess,
}: VerificationCorrectionFormProps) {
  // ===================================================
  // State
  // ===================================================

  const [correctionType, setCorrectionType] =
    useState<CorrectionType>(
      "selfie_missing",
    );

  const [reason, setReason] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // Submit
  // ===================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // =================================================
    // Validation
    // =================================================

    if (!reason.trim()) {
      setError(
        "Please enter a correction reason.",
      );

      return;
    }

    if (!message.trim()) {
      setError(
        "Please enter a message for the seller.",
      );

      return;
    }

    // =================================================
    // Loading
    // =================================================

    setLoading(true);

    try {
      // =================================================
      // API Request
      // =================================================

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
              action:
                "request_correction",

              correctionType,

              reason:
                reason.trim(),

              message:
                message.trim(),
            }),
          },
        );

      // =================================================
      // Response
      // =================================================

      const data =
        await response.json();

      // =================================================
      // API Error
      // =================================================

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to send correction request.",
        );
      }

      // =================================================
      // Success
      // =================================================

      setSuccess(
        "Correction request sent successfully.",
      );

      // =================================================
      // Clear Form
      // =================================================

      setReason("");
      setMessage("");

      // =================================================
      // Parent Callback
      // =================================================

      onSuccess?.();
    } catch (error) {
      console.error(
        "VERIFICATION CORRECTION ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the correction request.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <section
      className="
        mt-6
        rounded-3xl
        border
        border-amber-200
        bg-white
        p-6
        shadow-sm
        dark:border-amber-900
        dark:bg-slate-900
      "
    >
      {/* =================================================
          Header
      ================================================= */}

      <div className="flex items-start gap-4">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-amber-100
            text-amber-600
            dark:bg-amber-950/40
            dark:text-amber-400
          "
        >
          <AlertTriangle
            size={22}
          />
        </div>

        <div>
          <h2
            className="
              text-lg
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Request Correction
          </h2>

          <p
            className="
              mt-1
              max-w-2xl
              text-xs
              leading-5
              text-slate-500
              dark:text-slate-400
            "
          >
            If any seller verification
            information is missing,
            unclear, or incorrect,
            request the seller to correct
            it before final approval.
          </p>
        </div>
      </div>

      {/* =================================================
          Form
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        {/* =================================================
            Verification Issue
        ================================================= */}

        <div>
          <label
            htmlFor="correctionType"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
              dark:text-slate-200
            "
          >
            Verification Issue
          </label>

          <select
            id="correctionType"
            value={correctionType}
            onChange={(event) =>
              setCorrectionType(
                event.target
                  .value as CorrectionType,
              )
            }
            disabled={loading}
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              font-medium
              text-slate-800
              outline-none
              transition
              focus:border-amber-400
              focus:ring-2
              focus:ring-amber-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200
              dark:focus:ring-amber-950
            "
          >
            <option value="selfie_missing">
              Live selfie is missing
            </option>

            <option value="selfie_unclear">
              Live selfie is unclear
            </option>

            <option value="location_incorrect">
              Location appears incorrect
            </option>

            <option value="location_unavailable">
              Location information is unavailable
            </option>

            <option value="identity_issue">
              Identity document issue
            </option>

            <option value="phone_issue">
              Phone verification issue
            </option>

            <option value="other">
              Other verification issue
            </option>
          </select>
        </div>

        {/* =================================================
            Reason
        ================================================= */}

        <div>
          <label
            htmlFor="correctionReason"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
              dark:text-slate-200
            "
          >
            Reason
          </label>

          <input
            id="correctionReason"
            type="text"
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value,
              )
            }
            disabled={loading}
            maxLength={300}
            placeholder="Example: The submitted selfie is not clear enough."
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              text-slate-800
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-amber-400
              focus:ring-2
              focus:ring-amber-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200
              dark:placeholder:text-slate-500
              dark:focus:ring-amber-950
            "
          />

          <p
            className="
              mt-1
              text-right
              text-[11px]
              text-slate-400
            "
          >
            {reason.length}/300
          </p>
        </div>

        {/* =================================================
            Message
        ================================================= */}

        <div>
          <label
            htmlFor="correctionMessage"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-800
              dark:text-slate-200
            "
          >
            Message to Seller
          </label>

          <textarea
            id="correctionMessage"
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
            disabled={loading}
            maxLength={1000}
            rows={5}
            placeholder="Explain clearly what the seller needs to correct before verification can continue."
            className="
              w-full
              resize-none
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              leading-6
              text-slate-800
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-amber-400
              focus:ring-2
              focus:ring-amber-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200
              dark:placeholder:text-slate-500
              dark:focus:ring-amber-950
            "
          />

          <p
            className="
              mt-1
              text-right
              text-[11px]
              text-slate-400
            "
          >
            {message.length}/1000
          </p>
        </div>

        {/* =================================================
            Error
        ================================================= */}

        {error && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              text-red-700
              dark:border-red-900
              dark:bg-red-950/30
              dark:text-red-400
            "
          >
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>
              {error}
            </p>
          </div>
        )}

        {/* =================================================
            Success
        ================================================= */}

        {success && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-green-200
              bg-green-50
              p-4
              text-sm
              text-green-700
              dark:border-green-900
              dark:bg-green-950/30
              dark:text-green-400
            "
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>
              {success}
            </p>
          </div>
        )}

        {/* =================================================
            Submit Button
        ================================================= */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-amber-500
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-amber-600
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />

                Sending...
              </>
            ) : (
              <>
                <Send
                  size={17}
                />

                Send Correction Request
              </>
            )}
          </button>
        </div>
      </form>

      {/* =================================================
          Existing Correction Status
      ================================================= */}

      {currentStatus ===
        "action_required" && (
        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-amber-200
            bg-amber-50
            p-4
            text-xs
            leading-5
            text-amber-800
            dark:border-amber-900
            dark:bg-amber-950/30
            dark:text-amber-300
          "
        >
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-bold">
              Correction Required
            </p>

            <p className="mt-1">
              A correction request is
              currently active for this
              seller.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}