"use client";

import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  RefreshCw,
  Smartphone,
} from "lucide-react";

import { QRCodeSVG } from "qrcode.react";

import { useEffect, useState } from "react";

// =====================================================
// Props
// =====================================================

interface LocationVerificationCardProps {
  verified: boolean;
}

// =====================================================
// Component
// =====================================================

export default function LocationVerificationCard({
  verified,
}: LocationVerificationCardProps) {
  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(false);

  const [mobileUrl, setMobileUrl] =
    useState("");

  const [expiresAt, setExpiresAt] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  // ===================================================
  // Create Verification Session
  // ===================================================

  async function startVerification() {
    try {
      setLoading(true);

      setError("");
      setMessage("");
      setCopied(false);

      const response =
        await fetch(
          "/api/location-verification/session",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to start location verification.",
        );
      }

      setMobileUrl(
        data.mobileUrl,
      );

      setExpiresAt(
        data.expiresAt,
      );

      setMessage(
        "Scan the QR code with your mobile phone and allow precise location access.",
      );
    } catch (error) {
      console.error(
        "START LOCATION VERIFICATION ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to start location verification.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // Copy Mobile URL
  // ===================================================

  async function copyUrl() {
    if (!mobileUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        mobileUrl,
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "COPY LOCATION URL ERROR:",
        error,
      );

      setError(
        "Unable to copy the verification link.",
      );
    }
  }

  // ===================================================
  // Check Verification Status
  // ===================================================

  async function checkStatus() {
    if (!mobileUrl) {
      return;
    }

    try {
      setChecking(true);

      setError("");

      const url =
        new URL(mobileUrl);

      const token =
        url.pathname
          .split("/")
          .filter(Boolean)
          .pop();

      if (!token) {
        throw new Error(
          "Invalid verification token.",
        );
      }

      const response =
        await fetch(
          `/api/location-verification/status?token=${encodeURIComponent(
            token,
          )}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to check verification status.",
        );
      }

      // =================================================
      // Verified
      // =================================================

      if (
        data.status ===
        "verified"
      ) {
        setMessage(
          "Your location has been verified successfully.",
        );

        setMobileUrl("");

        window.location.reload();

        return;
      }

      // =================================================
      // Expired
      // =================================================

      if (
        data.status ===
        "expired"
      ) {
        setError(
          "This verification session has expired. Please start again.",
        );

        setMobileUrl("");

        return;
      }

      // =================================================
      // Still Pending
      // =================================================

      setMessage(
        "Location verification is waiting for mobile confirmation.",
      );
    } catch (error) {
      console.error(
        "LOCATION STATUS CHECK ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to check location verification status.",
      );
    } finally {
      setChecking(false);
    }
  }

  // ===================================================
  // Automatic Status Polling
  // ===================================================

  useEffect(() => {
    if (!mobileUrl) {
      return;
    }

    const interval =
      setInterval(() => {
        checkStatus();
      }, 5000);

    return () => {
      clearInterval(
        interval,
      );
    };
  }, [mobileUrl]);

  // ===================================================
  // Already Verified
  // ===================================================

  if (verified) {
    return (
      <section className="rounded-3xl border border-green-200 bg-white p-6 shadow-sm dark:border-green-900 dark:bg-slate-900">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
              <CheckCircle2
                size={24}
              />
            </div>

            <div>

              <h2 className="font-bold text-slate-900 dark:text-white">
                Location Verification
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your mobile GPS location has been successfully verified.
              </p>

            </div>

          </div>

          <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-100 px-5 py-3 text-sm font-bold text-green-700 dark:bg-green-950 dark:text-green-300">

            <CheckCircle2
              size={18}
            />

            Verified

          </span>

        </div>

      </section>
    );
  }

  // ===================================================
  // Normal State
  // ===================================================

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

      {/* =================================================
          Header
      ================================================= */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            <MapPin
              size={24}
            />
          </div>

          <div>

            <h2 className="font-bold text-slate-900 dark:text-white">
              Location Verification
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Verify your current location using your mobile phone GPS.
            </p>

          </div>

        </div>

        {!mobileUrl && (
          <button
            type="button"
            onClick={
              startVerification
            }
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Starting...
              </>
            ) : (
              <>
                <MapPin
                  size={18}
                />

                Verify Location
              </>
            )}
          </button>
        )}

      </div>

      {/* =================================================
          Error
      ================================================= */}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* =================================================
          Message
      ================================================= */}

      {message && (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
          {message}
        </div>
      )}

      {/* =================================================
          QR + Mobile Verification
      ================================================= */}

      {mobileUrl && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/60">

          <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-center">

            {/* =================================================
                QR CODE
            ================================================= */}

            <div className="flex flex-col items-center">

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600">

                <QRCodeSVG
                  value={mobileUrl}
                  size={190}
                  level="M"
                  includeMargin
                />

              </div>

              <p className="mt-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                Scan this QR code
                <br />
                with your mobile phone
              </p>

            </div>

            {/* =================================================
                MOBILE INSTRUCTIONS
            ================================================= */}

            <div className="min-w-0">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1565d8] dark:bg-blue-950 dark:text-blue-300">

                  <Smartphone
                    size={22}
                  />

                </div>

                <div>

                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Verify using your mobile phone
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Scan the QR code, open the verification page,
                    enable precise location and allow GPS permission.
                  </p>

                </div>

              </div>

              {/* =================================================
                  URL
              ================================================= */}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                <input
                  type="text"
                  value={mobileUrl}
                  readOnly
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
                />

                <button
                  type="button"
                  onClick={
                    copyUrl
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Copy
                    size={17}
                  />

                  {copied
                    ? "Copied"
                    : "Copy Link"}
                </button>

              </div>

              {/* =================================================
                  OPEN LINK
              ================================================= */}

              <a
                href={mobileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1565d8] hover:underline"
              >
                <ExternalLink
                  size={16}
                />

                Open verification link
              </a>

              {/* =================================================
                  EXPIRY
              ================================================= */}

              {expiresAt && (
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  This verification link expires in 5 minutes.
                </p>
              )}

              {/* =================================================
                  CHECK STATUS
              ================================================= */}

              <button
                type="button"
                onClick={
                  checkStatus
                }
                disabled={checking}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1565d8] px-5 py-3 text-sm font-bold text-[#1565d8] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-blue-950/30"
              >
                {checking ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw
                      size={18}
                    />

                    Check Verification Status
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}