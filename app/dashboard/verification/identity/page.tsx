"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

import {
  ArrowLeft,
  ShieldCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function IdentityVerificationPage() {
  // =====================================================
  // State
  // =====================================================

  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // =====================================================
  // File Selection
  // =====================================================

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setMessage("");

    const file = event.target.files?.[0];

    if (!file) {
      setDocumentFile(null);
      return;
    }

    // ===================================================
    // Allowed File Types
    // ===================================================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, WEBP or PDF file.");

      event.target.value = "";
      setDocumentFile(null);

      return;
    }

    // ===================================================
    // Maximum File Size
    // ===================================================

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setError("Aadhaar document must be 5 MB or smaller.");

      event.target.value = "";
      setDocumentFile(null);

      return;
    }

    // ===================================================
    // Valid File
    // ===================================================

    setDocumentFile(file);
  }

  // =====================================================
  // Submit
  // =====================================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    // ===================================================
    // File Required
    // ===================================================

    if (!documentFile) {
      setError("Please upload your Aadhaar document.");

      return;
    }

    try {
      setSubmitting(true);

      // =================================================
      // Form Data
      // =================================================

      const formData = new FormData();

      formData.append("documentType", "aadhaar");

      formData.append("document", documentFile);

      // =================================================
      // API
      // =================================================

      const response = await fetch("/api/verification/identity", {
        method: "PUT",
        body: formData,
      });

      // =================================================
      // Read Response
      // =================================================

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error(
          "The identity verification server returned an unexpected response. Please check the server terminal.",
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to submit identity verification.",
        );
      }

      // =================================================
      // Success
      // =================================================

      setMessage(
        "Your Aadhaar verification has been submitted successfully and is now under review.",
      );

      setDocumentFile(null);

      // =================================================
      // Reset File Input
      // =================================================

      const input = document.getElementById(
        "identityDocument",
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }
    } catch (error) {
      console.error("IDENTITY VERIFICATION SUBMISSION ERROR:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to submit identity verification. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl">
        {/* =================================================
            Back
        ================================================= */}

        <Link
          href="/dashboard/verification"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-[#1565d8]
            hover:underline
          "
        >
          <ArrowLeft size={16} />
          Back to Seller Verification
        </Link>

        {/* =================================================
            Main Card
        ================================================= */}

        <div
          className="
            mt-6
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-7
            shadow-sm
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          {/* =================================================
              Header
          ================================================= */}

          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-blue-100
                text-[#1565d8]
                dark:bg-blue-950
                dark:text-blue-300
              "
            >
              <ShieldCheck size={28} />
            </div>

            <div>
              <h1
                className="
                  text-2xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Identity Verification
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Verify your identity to become eligible for the Verified Seller
                badge.
              </p>
            </div>
          </div>

          {/* =================================================
              Security Notice
          ================================================= */}

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-blue-200
              bg-blue-50
              p-4
              dark:border-blue-900
              dark:bg-blue-950/30
            "
          >
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="
                  mt-0.5
                  shrink-0
                  text-blue-600
                  dark:text-blue-400
                "
              />

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-blue-900
                    dark:text-blue-200
                  "
                >
                  Aadhaar verification
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-blue-700
                    dark:text-blue-300
                  "
                >
                  Your Aadhaar submission will be reviewed by DealUp before your
                  identity becomes verified.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              Form
          ================================================= */}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* =================================================
                Aadhaar
            ================================================= */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Identity Document
              </label>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-4
                  dark:border-slate-700
                  dark:bg-slate-800
                "
              >
                <FileText size={22} className="text-[#1565d8]" />

                <div>
                  <p
                    className="
                      font-semibold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Aadhaar Card
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Aadhaar is currently the only supported identity document.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                Upload
            ================================================= */}

            <div>
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Upload Aadhaar Card
              </label>

              <label
                htmlFor="identityDocument"
                className="
                  flex
                  min-h-44
                  cursor-pointer
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border-2
                  border-dashed
                  border-slate-300
                  bg-slate-50
                  px-6
                  py-8
                  text-center
                  transition
                  hover:border-[#1565d8]
                  hover:bg-blue-50
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:hover:border-blue-500
                  dark:hover:bg-blue-950/30
                "
              >
                {documentFile ? (
                  <>
                    <CheckCircle2 size={38} className="text-green-600" />

                    <p
                      className="
                        mt-3
                        max-w-full
                        truncate
                        text-sm
                        font-bold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      {documentFile.name}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    <p
                      className="
                        mt-3
                        text-xs
                        font-semibold
                        text-[#1565d8]
                      "
                    >
                      Click to choose another file
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={38} className="text-slate-400" />

                    <p
                      className="
                        mt-3
                        text-sm
                        font-bold
                        text-slate-700
                        dark:text-slate-200
                      "
                    >
                      Upload your Aadhaar Card
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      JPG, PNG, WEBP or PDF
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                      "
                    >
                      Maximum file size: 5 MB
                    </p>
                  </>
                )}

                <input
                  id="identityDocument"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* =================================================
                Error
            ================================================= */}

            {error && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  p-4
                  dark:border-red-900
                  dark:bg-red-950/30
                "
              >
                <div className="flex gap-3">
                  <AlertTriangle
                    size={20}
                    className="
                      shrink-0
                      text-red-600
                      dark:text-red-400
                    "
                  />

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-red-700
                      dark:text-red-300
                    "
                  >
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                Success
            ================================================= */}

            {message && (
              <div
                className="
                  rounded-2xl
                  border
                  border-green-200
                  bg-green-50
                  p-4
                  dark:border-green-900
                  dark:bg-green-950/30
                "
              >
                <div className="flex gap-3">
                  <CheckCircle2
                    size={20}
                    className="
                      shrink-0
                      text-green-600
                      dark:text-green-400
                    "
                  />

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-green-700
                      dark:text-green-300
                    "
                  >
                    {message}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                Submit
            ================================================= */}

            <button
              type="submit"
              disabled={submitting || !documentFile}
              className="
                flex
                min-h-13
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#1565d8]
                px-6
                py-4
                text-sm
                font-bold
                text-white
                transition
                hover:bg-[#0f52ba]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submitting ? (
                <>
                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white
                      border-t-transparent
                    "
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Submit Aadhaar Verification
                </>
              )}
            </button>
          </form>
        </div>

        {/* =================================================
            Requirements
        ================================================= */}

        <div
          className="
            mt-6
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-slate-500" />

            <h2
              className="
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Before submitting
            </h2>
          </div>

          <ul
            className="
              mt-4
              space-y-2
              text-sm
              leading-6
              text-slate-500
              dark:text-slate-400
            "
          >
            <li>• Upload your own Aadhaar document.</li>

            <li>• Make sure the document is clear and readable.</li>

            <li>• Make sure the required document is visible.</li>

            <li>• Do not upload another person's Aadhaar.</li>

            <li>• Maximum file size is 5 MB.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
