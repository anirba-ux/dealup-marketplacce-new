"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";

import LiveSelfieCapture from "@/components/verification/LiveSelfieCapture";

type PageStatus =
  | "checking"
  | "ready"
  | "selfie"
  | "uploading-selfie"
  | "location"
  | "requesting-location"
  | "success"
  | "error";

interface SessionData {
  success: boolean;
  valid: boolean;
  status?: string;
  selfieVerified?: boolean;
  locationVerified?: boolean;
  expiresAt?: string;
  verifiedAt?: string | null;
  message?: string;
}

export default function MobileLocationVerifyPage() {
  const params =
    useParams<{
      token: string;
    }>();

  const token =
    params?.token;

  const [
    status,
    setStatus,
  ] =
    useState<PageStatus>(
      "checking",
    );

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    sessionData,
    setSessionData,
  ] =
    useState<SessionData | null>(
      null,
    );

  // =================================================
  // Validate Mobile Session
  // =================================================

  const checkSession =
    useCallback(
      async () => {
        if (!token) {
          setStatus("error");

          setMessage(
            "Invalid verification link.",
          );

          return;
        }

        try {
          setStatus("checking");

          const response =
            await fetch(
              `/api/location-verification/mobile-session?token=${encodeURIComponent(
                token,
              )}`,
              {
                method: "GET",

                cache: "no-store",
              },
            );

          const data =
            (await response.json()) as SessionData;

          if (
            !response.ok ||
            !data.valid
          ) {
            throw new Error(
              data.message ??
                "This verification session is invalid or expired.",
            );
          }

          setSessionData(
            data,
          );

          // Already complete
          if (
            data.selfieVerified &&
            data.locationVerified
          ) {
            setStatus(
              "success",
            );

            setMessage(
              "Seller verification has already been completed.",
            );

            return;
          }

          // Selfie already done
          if (
            data.selfieVerified
          ) {
            setStatus(
              "location",
            );

            setMessage(
              "Live selfie is complete. Now verify your mobile GPS location.",
            );

            return;
          }

          // Start selfie
          setStatus(
            "ready",
          );

          setMessage(
            "Please complete your live selfie verification.",
          );
        } catch (error) {
          console.error(
            "MOBILE SESSION CHECK ERROR:",
            error,
          );

          setStatus(
            "error",
          );

          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to validate verification session.",
          );
        }
      },
      [token],
    );

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // =================================================
  // Start Selfie
  // =================================================

  function startSelfie() {
    setStatus(
      "selfie",
    );

    setMessage(
      "Follow the instructions and complete your live selfie.",
    );
  }

  // =================================================
  // Selfie Captured
  // =================================================

  async function handleSelfieCapture(
    imageData: string,
  ) {
    if (!token) {
      setStatus("error");

      setMessage(
        "Invalid verification token.",
      );

      return;
    }

    try {
      setStatus(
        "uploading-selfie",
      );

      setMessage(
        "Uploading your live selfie securely...",
      );

      // =============================================
      // Convert Data URL → File
      // =============================================

      const response =
        await fetch(
          imageData,
        );

      const blob =
        await response.blob();

      const file =
        new File(
          [
            blob,
          ],
          "live-selfie.jpg",
          {
            type:
              blob.type ||
              "image/jpeg",
          },
        );

      // =============================================
      // Upload to Cloudinary
      // =============================================

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      formData.append(
        "type",
        "verification",
      );

      const uploadResponse =
        await fetch(
          "/api/upload",
          {
            method: "POST",
            body: formData,
          },
        );

      const uploadData =
        await uploadResponse.json();

      if (
        !uploadResponse.ok ||
        !uploadData?.success ||
        !uploadData?.image?.url ||
        !uploadData?.image?.publicId
      ) {
        throw new Error(
          uploadData?.message ??
            "Selfie upload failed.",
        );
      }

      // =============================================
      // Submit Selfie Verification
      // =============================================

      setMessage(
        "Finalizing your live selfie verification...",
      );

      const verificationResponse =
        await fetch(
          "/api/location-verification/selfie",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              token,

              imageUrl:
                uploadData.image.url,

              publicId:
                uploadData.image.publicId,
            }),
          },
        );

      const verificationData =
        await verificationResponse.json();

      if (
        !verificationResponse.ok ||
        !verificationData?.success
      ) {
        throw new Error(
          verificationData?.message ??
            "Selfie verification failed.",
        );
      }

      // =============================================
      // Selfie Complete
      // =============================================

      setSessionData(
        (
          previous,
        ) => ({
          ...(previous ?? {
            success: true,
            valid: true,
          }),

          selfieVerified:
            true,

          locationVerified:
            previous?.locationVerified ??
            false,
        }),
      );

      setStatus(
        "location",
      );

      setMessage(
        "Live selfie verified successfully. Now verify your mobile GPS location.",
      );
    } catch (error) {
      console.error(
        "SELFIE VERIFICATION ERROR:",
        error,
      );

      setStatus(
        "error",
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Live selfie verification failed.",
      );
    }
  }

  // =================================================
  // Mobile GPS Verification
  // =================================================

  function verifyLocation() {
    if (!token) {
      setStatus("error");

      setMessage(
        "Invalid verification token.",
      );

      return;
    }

    if (
      !navigator.geolocation
    ) {
      setStatus("error");

      setMessage(
        "GPS is not supported by this browser.",
      );

      return;
    }

    setStatus(
      "requesting-location",
    );

    setMessage(
      "Getting your precise mobile GPS location...",
    );

    navigator.geolocation.getCurrentPosition(
      async (
        position,
      ) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const accuracy =
            position.coords.accuracy;

          const response =
            await fetch(
              "/api/location-verification/mobile",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  token,

                  latitude,

                  longitude,

                  accuracy,
                }),
              },
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data?.success
          ) {
            throw new Error(
              data?.message ??
                "Location verification failed.",
            );
          }

          setSessionData(
            (
              previous,
            ) => ({
              ...(previous ?? {
                success: true,
                valid: true,
              }),

              selfieVerified:
                previous?.selfieVerified ??
                true,

              locationVerified:
                true,

              status:
                data.status ??
                "verified",

              verifiedAt:
                data.verifiedAt ??
                null,
            }),
          );

          setStatus(
            "success",
          );

          setMessage(
            `Your mobile location has been verified successfully.

GPS accuracy: ${Math.round(
              accuracy,
            )} metres.

Your seller verification data has been submitted.`,
          );
        } catch (error) {
          console.error(
            "GPS VERIFICATION ERROR:",
            error,
          );

          setStatus(
            "error",
          );

          setMessage(
            error instanceof Error
              ? error.message
              : "Location verification failed.",
          );
        }
      },

      (error) => {
        console.error(
          "MOBILE GPS ERROR:",
          error,
        );

        setStatus(
          "error",
        );

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          setMessage(
            "Please allow precise location permission and try again.",
          );
        } else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          setMessage(
            "Your mobile could not determine an accurate GPS location.",
          );
        } else if (
          error.code ===
          error.TIMEOUT
        ) {
          setMessage(
            "GPS request timed out. Please try again.",
          );
        } else {
          setMessage(
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
  }

  // =================================================
  // Render
  // =================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">

        {/* Header */}

        <div className="text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl dark:bg-blue-950">
            📍
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            DealUp Seller Verification
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Complete your live selfie and
            mobile GPS verification securely.
          </p>

        </div>

        {/* Checking */}

        {status ===
          "checking" && (
          <div className="mt-8 rounded-2xl bg-blue-50 p-5 text-center text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">

            <div className="animate-pulse text-3xl">
              🔐
            </div>

            <p className="mt-3 text-sm font-semibold">
              Checking verification session...
            </p>

          </div>
        )}

        {/* Ready */}

        {status ===
          "ready" && (
          <div className="mt-8">

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40">

              <h2 className="font-bold text-blue-900 dark:text-blue-200">
                Step 1 — Live Selfie
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-700 dark:text-blue-300">
                Your front camera will be used
                to capture a live selfie.
              </p>

            </div>

            <button
              type="button"
              onClick={
                startSelfie
              }
              className="mt-6 w-full rounded-2xl bg-[#1565d8] px-6 py-4 font-semibold text-white transition hover:bg-[#0f52ba]"
            >
              Start Live Selfie
            </button>

          </div>
        )}

        {/* Selfie */}

        {status ===
          "selfie" && (
          <div className="mt-6">

            <LiveSelfieCapture
              onCapture={
                handleSelfieCapture
              }
              onCancel={() =>
                setStatus(
                  "ready",
                )
              }
            />

          </div>
        )}

        {/* Uploading Selfie */}

        {status ===
          "uploading-selfie" && (
          <div className="mt-8 rounded-2xl bg-blue-50 p-6 text-center text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">

            <div className="animate-pulse text-3xl">
              📸
            </div>

            <p className="mt-3 text-sm font-semibold">
              {message}
            </p>

          </div>
        )}

        {/* Location */}

        {status ===
          "location" && (
          <div className="mt-8">

            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/40">

              <div className="text-3xl">
                ✅
              </div>

              <h2 className="mt-3 font-bold text-green-800 dark:text-green-200">
                Live Selfie Complete
              </h2>

              <p className="mt-2 text-sm leading-6 text-green-700 dark:text-green-300">
                Now allow precise mobile GPS
                location to complete verification.
              </p>

            </div>

            <button
              type="button"
              onClick={
                verifyLocation
              }
              className="mt-6 w-full rounded-2xl bg-[#1565d8] px-6 py-4 font-semibold text-white transition hover:bg-[#0f52ba]"
            >
              📍 Verify My Mobile Location
            </button>

          </div>
        )}

        {/* Requesting Location */}

        {status ===
          "requesting-location" && (
          <div className="mt-8 rounded-2xl bg-blue-50 p-6 text-center text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">

            <div className="animate-pulse text-3xl">
              📍
            </div>

            <p className="mt-3 text-sm font-semibold">
              {message}
            </p>

          </div>
        )}

        {/* Success */}

        {status ===
          "success" && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-center text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">

            <div className="text-5xl">
              ✅
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Verification Complete
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6">
              {message}
            </p>

            <p className="mt-5 text-xs text-green-600 dark:text-green-400">
              You can now close this page or
              return to your desktop.
            </p>

          </div>
        )}

        {/* Error */}

        {status ===
          "error" && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">

            <div className="text-4xl">
              ⚠️
            </div>

            <h2 className="mt-3 font-bold">
              Verification Problem
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6">
              {message}
            </p>

            <button
              type="button"
              onClick={
                checkSession
              }
              className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Try Again
            </button>

          </div>
        )}

      </div>
    </main>
  );
}