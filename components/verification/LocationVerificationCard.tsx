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

import { useEffect, useRef, useState } from "react";

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
  // ===================================================
  // State
  // ===================================================

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(false);

  const [mobileUrl, setMobileUrl] =
    useState("");

  const [token, setToken] =
    useState("");

  const [expiresAt, setExpiresAt] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  const [mobileVerificationStarted, setMobileVerificationStarted] =
    useState(false);

  const [mobileLocationCaptured, setMobileLocationCaptured] =
    useState(false);

  const pollingRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  // ===================================================
  // Detect Mobile Device
  // ===================================================

  useEffect(() => {
    if (
      typeof window === "undefined"
    ) {
      return;
    }

    const mobile =
      /Android|iPhone|iPad|iPod|Mobile/i.test(
        navigator.userAgent,
      );

    setIsMobile(mobile);
  }, []);

  // ===================================================
  // Cleanup Polling
  // ===================================================

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(
          pollingRef.current,
        );
      }
    };
  }, []);

  // ===================================================
  // Extract Token From URL
  // ===================================================

  function extractToken(
    url: string,
  ): string {
    try {
      const parsed =
        new URL(url);

      const parts =
        parsed.pathname
          .split("/")
          .filter(Boolean);

      return (
        parts[parts.length - 1] ||
        ""
      );
    } catch {
      return "";
    }
  }

  // ===================================================
  // Create Verification Session
  // ===================================================

  async function createVerificationSession() {
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

    return data;
  }

  // ===================================================
  // Start Desktop Verification
  // ===================================================

  async function startDesktopVerification() {
    try {
      setLoading(true);

      setError("");

      setMessage("");

      setCopied(false);

      setMobileLocationCaptured(
        false,
      );

      const data =
        await createVerificationSession();

      const newToken =
        String(
          data.token ||
            extractToken(
              data.mobileUrl,
            ),
        );

      setToken(newToken);

      setMobileUrl(
        data.mobileUrl,
      );

      setExpiresAt(
        data.expiresAt,
      );

      setMessage(
        "Scan the QR code with your mobile phone. Make sure the mobile is logged into the same DealUp account.",
      );
    } catch (error) {
      console.error(
        "START DESKTOP LOCATION VERIFICATION ERROR:",
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
  // Start Mobile Verification
  //
  // IMPORTANT:
  // No QR code is generated here.
  // ===================================================

  async function startMobileVerification() {
    try {
      setLoading(true);

      setError("");

      setMessage("");

      setMobileVerificationStarted(
        true,
      );

      const data =
        await createVerificationSession();

      const newToken =
        String(
          data.token ||
            extractToken(
              data.mobileUrl,
            ),
        );

      if (!newToken) {
        throw new Error(
          "Verification token was not generated.",
        );
      }

      setToken(newToken);

      setExpiresAt(
        data.expiresAt,
      );

      setMessage(
        "Getting your precise mobile GPS location...",
      );

      // =================================================
      // Browser GPS
      // =================================================

      if (
        !navigator.geolocation
      ) {
        throw new Error(
          "GPS is not supported by this browser.",
        );
      }

      navigator.geolocation.getCurrentPosition(
        async (
          position,
        ) => {
          try {
            const latitude =
              position.coords
                .latitude;

            const longitude =
              position.coords
                .longitude;

            const accuracy =
              position.coords
                .accuracy;

            setMessage(
              "GPS location received. Verifying your location...",
            );

            const response =
              await fetch(
                "/api/location-verification/mobile",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify(
                    {
                      token:
                        newToken,

                      latitude,

                      longitude,

                      accuracy,
                    },
                  ),
                },
              );

            const result =
              await response.json();

            if (
              !response.ok ||
              !result.success
            ) {
              throw new Error(
                result?.message ||
                  "Mobile location verification failed.",
              );
            }

            setMobileLocationCaptured(
              true,
            );

            setMessage(
              `Mobile GPS location verified successfully.

GPS accuracy: ${Math.round(
                accuracy,
              )} metres.`,
            );

            // =================================================
            // IMPORTANT
            //
            // Location is now complete.
            // Selfie verification can continue separately.
            // =================================================

            if (
              result.verification
                ?.selfieVerified ===
              true
            ) {
              setMessage(
                "Mobile location and selfie verification are complete.",
              );
            }
          } catch (error) {
            console.error(
              "MOBILE DIRECT LOCATION ERROR:",
              error,
            );

            setError(
              error instanceof Error
                ? error.message
                : "Mobile location verification failed.",
            );
          } finally {
            setLoading(false);
          }
        },

        (gpsError) => {
          console.error(
            "DIRECT MOBILE GPS ERROR:",
            gpsError,
          );

          setLoading(false);

          if (
            gpsError.code ===
            gpsError.PERMISSION_DENIED
          ) {
            setError(
              "Please allow precise location permission and try again.",
            );
          } else if (
            gpsError.code ===
            gpsError.POSITION_UNAVAILABLE
          ) {
            setError(
              "Your mobile could not determine an accurate GPS location.",
            );
          } else if (
            gpsError.code ===
            gpsError.TIMEOUT
          ) {
            setError(
              "GPS request timed out. Please try again.",
            );
          } else {
            setError(
              "Unable to get your mobile GPS location.",
            );
          }
        },

        {
          enableHighAccuracy:
            true,

          timeout:
            30000,

          maximumAge:
            0,
        },
      );
    } catch (error) {
      console.error(
        "START MOBILE LOCATION VERIFICATION ERROR:",
        error,
      );

      setLoading(false);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to start mobile location verification.",
      );
    }
  }

  // ===================================================
  // Start Verification
  //
  // Desktop → QR
  // Mobile → Direct GPS
  // ===================================================

  async function startVerification() {
    if (isMobile) {
      await startMobileVerification();

      return;
    }

    await startDesktopVerification();
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
  // Check Desktop Verification Status
  // ===================================================

  async function checkStatus() {
    if (!token) {
      return;
    }

    try {
      setChecking(true);

      setError("");

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
      // Fully Verified
      // =================================================

      if (
        data.status ===
        "verified"
      ) {
        setMessage(
          "Your mobile location has been verified successfully.",
        );

        if (
          pollingRef.current
        ) {
          clearInterval(
            pollingRef.current,
          );

          pollingRef.current =
            null;
        }

        setMobileUrl("");

        setToken("");

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

        if (
          pollingRef.current
        ) {
          clearInterval(
            pollingRef.current,
          );

          pollingRef.current =
            null;
        }

        setMobileUrl("");

        setToken("");

        return;
      }

      // =================================================
      // Location Completed
      // =================================================

      if (
        data.locationVerified ===
        true
      ) {
        setMobileLocationCaptured(
          true,
        );

        setMessage(
          data.selfieVerified ===
            true
            ? "Location and selfie verification are complete."
            : "Mobile location verified. Waiting for selfie verification.",
        );

        return;
      }

      // =================================================
      // Pending
      // =================================================

      setMessage(
        "Waiting for mobile verification...",
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
  // Automatic Desktop Polling
  // ===================================================

  useEffect(() => {
    if (
      isMobile ||
      !token
    ) {
      return;
    }

    if (
      pollingRef.current
    ) {
      clearInterval(
        pollingRef.current,
      );
    }

    pollingRef.current =
      setInterval(() => {
        checkStatus();
      }, 3000);

    return () => {
      if (
        pollingRef.current
      ) {
        clearInterval(
          pollingRef.current,
        );

        pollingRef.current =
          null;
      }
    };
  }, [
    token,
    isMobile,
  ]);

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
                Your mobile GPS location
                has been successfully
                verified.
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
  // Main
  // ===================================================

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* =================================================
          Header
      ================================================= */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            <MapPin size={24} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Location Verification
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {isMobile
                ? "Verify your current location directly using your mobile GPS."
                : "Verify your current location using your mobile phone GPS."}
            </p>
          </div>
        </div>

        {!token && (
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

                {isMobile
                  ? "Verify My Location"
                  : "Verify Location"}
              </>
            )}
          </button>
        )}
      </div>

      {/* =================================================
          Mobile Direct Mode
      ================================================= */}

      {isMobile &&
        mobileVerificationStarted && (
          <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1565d8] dark:bg-blue-950 dark:text-blue-300">
                {mobileLocationCaptured ? (
                  <CheckCircle2
                    size={22}
                  />
                ) : (
                  <Smartphone
                    size={22}
                  />
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Mobile Location
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {mobileLocationCaptured
                    ? "Your precise mobile GPS location has been successfully captured."
                    : "Please keep precise location enabled while DealUp verifies your GPS position."}
                </p>
              </div>
            </div>

            {loading &&
              !mobileLocationCaptured && (
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-blue-700 dark:bg-slate-900 dark:text-blue-300">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Getting precise
                  GPS location...
                </div>
              )}

            {mobileLocationCaptured && (
              <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
                <CheckCircle2
                  size={18}
                  className="mr-2 inline"
                />

                Location verified successfully.
              </div>
            )}
          </div>
        )}

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
          DESKTOP QR
          Only rendered on desktop
      ================================================= */}

      {!isMobile &&
        mobileUrl && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/60">
            <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-center">
              {/* =================================================
                  QR CODE
              ================================================= */}

              <div className="flex flex-col items-center">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600">
                  <QRCodeSVG
                    value={
                      mobileUrl
                    }
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
                      Scan the QR code,
                      open the verification
                      page and allow precise
                      GPS location.
                    </p>

                    <p className="mt-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
                      Important: log in to the
                      same DealUp account on
                      your mobile.
                    </p>
                  </div>
                </div>

                {/* =================================================
                    URL
                ================================================= */}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={
                      mobileUrl
                    }
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
                  href={
                    mobileUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1565d8] hover:underline"
                >
                  <ExternalLink
                    size={16}
                  />

                  Open verification
                  link
                </a>

                {/* =================================================
                    EXPIRY
                ================================================= */}

                {expiresAt && (
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    This verification
                    link expires in 5
                    minutes.
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
                  disabled={
                    checking
                  }
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

                      Check Verification
                      Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =================================================
          Desktop Waiting State
      ================================================= */}

      {!isMobile &&
        token &&
        !mobileUrl &&
        !verified && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
            <Loader2
              size={18}
              className="mr-2 inline animate-spin"
            />

            Waiting for mobile
            verification...
          </div>
        )}
    </section>
  );
}