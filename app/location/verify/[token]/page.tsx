"use client";

import {
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

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
  ] = useState<
    | "idle"
    | "requesting"
    | "success"
    | "error"
  >("idle");

  const [
    message,
    setMessage,
  ] = useState("");

  async function verifyLocation() {
    if (!token) {
      setStatus("error");

      setMessage(
        "Invalid verification link.",
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
      "requesting",
    );

    setMessage(
      "Getting your precise mobile GPS location...",
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
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

          if (!response.ok) {
            throw new Error(
              data?.message ??
                "Location verification failed.",
            );
          }

          setStatus(
            "success",
          );

          setMessage(
            `Location verified successfully.

GPS accuracy: ${Math.round(
              accuracy,
            )} metres.

You can now return to your desktop.`,
          );
        } catch (error) {
          console.error(
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 dark:bg-slate-950">

      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl dark:bg-blue-950">
          📍
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
          DealUp Location Verification
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Your desktop is requesting
          your mobile GPS location for
          seller verification.
        </p>

        {status ===
          "idle" && (
          <button
            type="button"
            onClick={
              verifyLocation
            }
            className="mt-8 w-full rounded-2xl bg-[#1565d8] px-6 py-4 font-semibold text-white transition hover:bg-[#0f52ba]"
          >
            📍 Verify My Mobile Location
          </button>
        )}

        {status ===
          "requesting" && (
          <div className="mt-8 rounded-2xl bg-blue-50 p-5 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            <div className="animate-pulse text-3xl">
              📡
            </div>

            <p className="mt-3 text-sm font-semibold">
              Getting precise GPS...
            </p>
          </div>
        )}

        {status ===
          "success" && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300">
            <div className="text-4xl">
              ✅
            </div>

            <p className="mt-3 whitespace-pre-line text-sm font-semibold">
              {message}
            </p>
          </div>
        )}

        {status ===
          "error" && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
            <div className="text-3xl">
              ⚠️
            </div>

            <p className="mt-3 text-sm font-semibold">
              {message}
            </p>

            <button
              type="button"
              onClick={
                verifyLocation
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