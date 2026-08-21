"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { QRCodeSVG } from "qrcode.react";

import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  Copy,
  ExternalLink,
  FileCheck2,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

// =====================================================
// TYPES
// =====================================================

type LocationSession = {
  token: string;
  mobileUrl: string;
  expiresAt: string;
};

type LocationStatus =
  | "idle"
  | "creating"
  | "waiting"
  | "verified"
  | "expired"
  | "error";

type VerificationProgress = {
  phone: boolean;
  identity: boolean;
  selfie: boolean;
  location: boolean;
};

type SessionStatusResponse = {
  success?: boolean;
  valid?: boolean;
  authenticated?: boolean;
  status?: string;

  selfieVerified?: boolean;
  locationVerified?: boolean;

  expiresAt?: string;
  verifiedAt?: string | null;

  mobileLocation?: {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    method?: string;
    capturedAt?: string;
  } | null;

  message?: string;
};

// =====================================================
// PAGE
// =====================================================

export default function VerificationPage() {
  // ===================================================
  // LOCATION / MOBILE SESSION
  // ===================================================

  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  const [locationSession, setLocationSession] =
    useState<LocationSession | null>(null);

  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  const [locationError, setLocationError] = useState("");

  const [copied, setCopied] = useState(false);

  const [creatingSession, setCreatingSession] = useState(false);

  // ===================================================
  // GENERAL
  // ===================================================

  const [message, setMessage] = useState("");

  // ===================================================
  // VERIFICATION PROGRESS
  // ===================================================

  const [progress, setProgress] = useState<VerificationProgress>({
    phone: true,
    identity: false,
    selfie: false,
    location: false,
  });

  const completedSteps = Object.values(progress).filter(Boolean).length;

  const progressPercent = completedSteps * 25;

  // ===================================================
  // CREATE MOBILE VERIFICATION SESSION
  //
  // ONE SESSION = SELFIE + LOCATION
  // ===================================================

  async function createMobileVerificationSession() {
    try {
      setCreatingSession(true);

      setLocationStatus("creating");

      setLocationError("");

      setMessage("");

      setCopied(false);

      setLocationAccuracy(null);

      // ===============================================
      // Create secure session
      // ===============================================

      const response = await fetch("/api/location-verification/session", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Unable to create mobile verification session.",
        );
      }

      // ===============================================
      // Validate response
      // ===============================================

      if (!data.token || !data.mobileUrl || !data.expiresAt) {
        throw new Error("Verification session response is incomplete.");
      }

      // ===============================================
      // Save session
      // ===============================================

      setLocationSession({
        token: String(data.token),

        mobileUrl: String(data.mobileUrl),

        expiresAt: String(data.expiresAt),
      });

      setLocationStatus("waiting");

      setMessage(
        "Scan the QR code with your mobile phone. Your mobile will complete both Live Selfie and GPS verification.",
      );
    } catch (error) {
      console.error("CREATE MOBILE VERIFICATION SESSION ERROR:", error);

      setLocationStatus("error");

      setLocationError(
        error instanceof Error
          ? error.message
          : "Unable to create mobile verification session.",
      );
    } finally {
      setCreatingSession(false);
    }
  }

  // ===================================================
  // POLL MOBILE VERIFICATION STATUS
  //
  // Desktop automatically watches the same session.
  // ===================================================

  useEffect(() => {
    if (locationStatus !== "waiting" || !locationSession?.token) {
      return;
    }

    const token = locationSession.token;

    let cancelled = false;

    async function checkMobileVerification() {
      try {
        // =============================================
        // Check authenticated mobile session state
        // =============================================

        const response = await fetch(
          `/api/location-verification/mobile-session?token=${encodeURIComponent(
            token,
          )}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = (await response.json()) as SessionStatusResponse;

        if (cancelled) {
          return;
        }

        // =============================================
        // Expired
        // =============================================

        if (response.status === 410 || data?.status === "expired") {
          setLocationStatus("expired");

          setLocationError(
            "This mobile verification session has expired. Please create a new session.",
          );

          return;
        }

        // =============================================
        // Wrong account / authentication problem
        // =============================================

        if (response.status === 401 || response.status === 403) {
          setLocationError(
            data?.message ||
              "Please make sure your mobile is logged into the same DealUp account.",
          );

          return;
        }

        if (!response.ok || !data?.valid) {
          return;
        }

        // =============================================
        // SELFIE
        // =============================================

        if (data.selfieVerified === true) {
          setProgress((previous) => ({
            ...previous,
            selfie: true,
          }));
        }

        // =============================================
        // LOCATION
        // =============================================

        if (data.locationVerified === true) {
          setProgress((previous) => ({
            ...previous,
            location: true,
          }));

          // ===========================================
          // Get GPS accuracy
          // ===========================================

          if (typeof data.mobileLocation?.accuracy === "number") {
            setLocationAccuracy(data.mobileLocation.accuracy);
          }

          // ===========================================
          // Complete
          // ===========================================

          setLocationStatus("verified");

          setMessage(
            "Your Live Selfie and mobile GPS location have both been verified successfully.",
          );

          return;
        }

        // =============================================
        // Selfie complete but location pending
        // =============================================

        if (data.selfieVerified === true && data.locationVerified === false) {
          setMessage(
            "Live Selfie verified successfully. Your mobile is now completing GPS verification.",
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("MOBILE VERIFICATION STATUS ERROR:", error);
      }
    }

    // First check immediately
    checkMobileVerification();

    // Then every 2.5 seconds
    const interval = window.setInterval(checkMobileVerification, 2500);

    return () => {
      cancelled = true;

      window.clearInterval(interval);
    };
  }, [locationStatus, locationSession]);

  // ===================================================
  // COPY MOBILE URL
  // ===================================================

  async function copyMobileUrl() {
    if (!locationSession?.mobileUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(locationSession.mobileUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("COPY MOBILE URL ERROR:", error);

      setLocationError(
        "Unable to copy the verification link. Please copy it manually.",
      );
    }
  }

  // ===================================================
  // RESET MOBILE VERIFICATION
  // ===================================================

  function resetMobileVerification() {
    setLocationSession(null);

    setLocationStatus("idle");

    setLocationAccuracy(null);

    setLocationError("");

    setCopied(false);

    setMessage("");
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* =================================================
            BACK
        ================================================= */}

        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ChevronLeft size={18} />
          Back to Dashboard
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#1565d8] to-[#2878ed] p-8 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck size={30} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">Seller Verification</h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Complete the verification steps below to become a trusted DealUp
                Verified Seller.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Verification Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complete all required verification steps.
              </p>
            </div>

            <div className="text-sm font-bold text-[#1565d8]">
              {progressPercent}%
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#1565d8] transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>

          <div className="mt-3 text-xs font-medium text-slate-500">
            {completedSteps} of 4 verification steps completed
          </div>
        </div>

        {/* =================================================
            PHONE
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <CheckCircle2 size={25} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Phone Verification
                </h2>

                {progress.phone && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Completed
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Your phone number is already verified.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            IDENTITY
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1565d8]">
              <FileCheck2 size={25} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Identity Verification
                </h2>

                {progress.identity ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Completed
                  </span>
                ) : (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    Required
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Submit your identity document securely for DealUp admin review.
              </p>

              <Link
                href="/dashboard/verification/identity"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f52ba]"
              >
                <FileCheck2 size={17} />
                Open Identity Verification
                <ExternalLink size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            LIVE SELFIE
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <Camera size={25} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Live Selfie Verification
                </h2>

                {progress.selfie && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Verified
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Your live selfie will be captured securely using your mobile
                phone.
              </p>
            </div>
          </div>

          {/* =================================================
              SELFIE WAITING
          ================================================= */}

          {!progress.selfie && locationStatus === "idle" && (
            <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Smartphone size={21} />
                </div>

                <div>
                  <h3 className="font-bold text-purple-900">
                    Verify your selfie using mobile
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-purple-700">
                    Your desktop camera will not be used. Scan one secure QR
                    code with your mobile phone and complete the live selfie
                    there.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              SELFIE VERIFIED
          ================================================= */}

          {progress.selfie && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">
              <CheckCircle2 size={23} className="shrink-0 text-green-600" />

              <div>
                <p className="text-sm font-bold text-green-800">
                  Live Selfie Verified
                </p>

                <p className="mt-1 text-xs text-green-700">
                  Your mobile selfie was successfully verified.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            MOBILE VERIFICATION
            SELFIE + GPS IN ONE SESSION
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <MapPin size={25} />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  Mobile Selfie & Location Verification
                </h2>

                {progress.location && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Completed
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Use your mobile phone to securely complete both your live selfie
                and precise GPS location.
              </p>
            </div>
          </div>

          {/* =================================================
              START
          ================================================= */}

          {locationStatus === "idle" && (
            <div className="mt-6">
              <button
                type="button"
                onClick={createMobileVerificationSession}
                disabled={creatingSession}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-4 font-semibold text-white transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingSession ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating secure session...
                  </>
                ) : (
                  <>
                    <Smartphone size={20} />
                    Verify Selfie & Location on Mobile
                  </>
                )}
              </button>
            </div>
          )}

          {/* =================================================
              CREATING
          ================================================= */}

          {locationStatus === "creating" && (
            <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-blue-50 p-5 text-sm font-semibold text-blue-700">
              <Loader2 size={20} className="animate-spin" />
              Creating secure mobile verification session...
            </div>
          )}

          {/* =================================================
              QR / WAITING
          ================================================= */}

          {locationStatus === "waiting" && locationSession && (
            <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-5">
              <div className="grid gap-8 md:grid-cols-[240px_1fr] md:items-center">
                {/* =================================================
                      QR CODE
                  ================================================= */}

                <div className="flex flex-col items-center">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md">
                    <QRCodeSVG
                      value={locationSession.mobileUrl}
                      size={210}
                      level="H"
                      includeMargin
                    />
                  </div>

                  <p className="mt-4 text-center text-sm font-bold text-slate-700">
                    Scan with your mobile phone
                  </p>

                  <p className="mt-1 text-center text-xs text-slate-500">
                    One QR code completes
                    <br />
                    selfie + GPS verification
                  </p>
                </div>

                {/* =================================================
                      INSTRUCTIONS
                  ================================================= */}

                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1565d8]">
                      <Smartphone size={22} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Continue on your mobile
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Scan this QR code using your mobile camera. The mobile
                        page will guide you through Live Selfie first and then
                        precise GPS verification.
                      </p>

                      <p className="mt-2 text-xs font-bold text-orange-600">
                        Important: log in to the same DealUp account on your
                        mobile.
                      </p>
                    </div>
                  </div>

                  {/* =================================================
                        STEP INDICATORS
                    ================================================= */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div
                      className={`rounded-xl border p-4 ${
                        progress.selfie
                          ? "border-green-200 bg-green-50"
                          : "border-purple-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {progress.selfie ? (
                          <CheckCircle2 size={19} className="text-green-600" />
                        ) : (
                          <Camera size={19} className="text-purple-600" />
                        )}

                        <span className="text-sm font-bold text-slate-800">
                          Live Selfie
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {progress.selfie
                          ? "Verified successfully"
                          : "Waiting for mobile selfie"}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-4 ${
                        progress.location
                          ? "border-green-200 bg-green-50"
                          : "border-orange-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {progress.location ? (
                          <CheckCircle2 size={19} className="text-green-600" />
                        ) : (
                          <MapPin size={19} className="text-orange-600" />
                        )}

                        <span className="text-sm font-bold text-slate-800">
                          Mobile GPS
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {progress.location
                          ? "Verified successfully"
                          : progress.selfie
                            ? "Waiting for GPS"
                            : "Starts after selfie"}
                      </p>
                    </div>
                  </div>

                  {/* =================================================
                        MOBILE URL
                    ================================================= */}

                  <div className="mt-5 rounded-xl border border-blue-200 bg-white p-3">
                    <p className="break-all text-xs font-medium text-slate-600">
                      {locationSession.mobileUrl}
                    </p>
                  </div>

                  {/* =================================================
                        ACTIONS
                    ================================================= */}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={copyMobileUrl}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f52ba]"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 size={17} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={17} />
                          Copy Mobile Link
                        </>
                      )}
                    </button>

                    <a
                      href={locationSession.mobileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLink size={17} />
                      Open Link
                    </a>
                  </div>

                  {/* =================================================
                        WAITING STATUS
                    ================================================= */}

                  <div className="mt-5 flex items-start gap-3 rounded-xl bg-white p-4">
                    <Loader2
                      size={20}
                      className="mt-0.5 shrink-0 animate-spin text-[#1565d8]"
                    />

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {progress.selfie
                          ? "Selfie verified — waiting for mobile GPS..."
                          : "Waiting for mobile verification..."}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Keep this desktop page open. It will automatically
                        update when your mobile verification is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              VERIFIED
          ================================================= */}

          {locationStatus === "verified" && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={27} className="shrink-0 text-green-600" />

                <div>
                  <h3 className="font-bold text-green-800">
                    Mobile Verification Completed
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-green-700">
                    Your Live Selfie and mobile GPS location have both been
                    successfully verified.
                  </p>

                  {locationAccuracy !== null && (
                    <p className="mt-2 text-xs font-semibold text-green-700">
                      GPS accuracy: {Math.round(locationAccuracy)} metres
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              EXPIRED
          ================================================= */}

          {locationStatus === "expired" && (
            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <p className="text-sm font-semibold text-orange-700">
                {locationError}
              </p>

              <button
                type="button"
                onClick={resetMobileVerification}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                <RefreshCw size={17} />
                Create New Session
              </button>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {locationStatus === "error" && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-semibold leading-6 text-red-700">
                {locationError}
              </p>

              <button
                type="button"
                onClick={resetMobileVerification}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          )}
        </section>

        {/* =================================================
            GENERAL MESSAGE
        ================================================= */}

        {message && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center text-sm font-semibold leading-6 text-blue-700">
            {message}
          </div>
        )}

        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#1565d8]" size={22} />

            <div>
              <h3 className="font-bold text-slate-900">
                Why does DealUp require verification?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Verified sellers help buyers identify trustworthy marketplace
                members. Your identity, live selfie and mobile location are used
                for seller verification and admin review.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <FileCheck2 size={18} className="text-[#1565d8]" />

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Identity
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <Camera size={18} className="text-purple-600" />

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Live Selfie
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <MapPin size={18} className="text-orange-600" />

                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Mobile GPS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
