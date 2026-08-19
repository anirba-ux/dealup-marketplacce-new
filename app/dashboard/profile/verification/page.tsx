"use client";

import { useState } from "react";

import LiveSelfieCapture from "@/components/verification/LiveSelfieCapture";

export default function VerificationPage() {
  const [selfie, setSelfie] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // =====================================
  // LOCATION STATE
  // =====================================

  const [locationLoading, setLocationLoading] = useState(false);

  const [locationVerified, setLocationVerified] = useState(false);

  const [locationAccuracy, setLocationAccuracy] =
    useState<number | null>(null);

  // =====================================
  // Submit Seller Verification
  // =====================================

  async function submitVerification() {
    if (!selfie) {
      setError(
        "Please complete the live selfie verification first.",
      );

      return;
    }

    try {
      setSubmitting(true);

      setError("");

      setMessage("");

      // =====================================
      // STEP 1
      // Convert Base64 → Blob
      // =====================================

      const response = await fetch(selfie);

      const blob = await response.blob();

      // =====================================
      // STEP 2
      // Create File
      // =====================================

      const file = new File(
        [blob],
        "live-selfie.jpg",
        {
          type: "image/jpeg",
        },
      );

      // =====================================
      // STEP 3
      // Upload Selfie to Cloudinary
      // =====================================

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "type",
        "verification",
      );

      const uploadResponse = await fetch(
        "/api/upload",
        {
          method: "POST",

          body: formData,
        },
      );

      const uploadData =
        await uploadResponse.json();

      // =====================================
      // Cloudinary Upload Failed
      // =====================================

      if (
        !uploadResponse.ok ||
        !uploadData.success ||
        !uploadData.image?.url ||
        !uploadData.image?.publicId
      ) {
        throw new Error(
          uploadData.message ||
            "Live selfie upload failed.",
        );
      }

      // =====================================
      // Cloudinary Result
      // =====================================

      const imageUrl =
        uploadData.image.url;

      const publicId =
        uploadData.image.publicId;

      console.log(
        "LIVE SELFIE CLOUDINARY:",
        {
          imageUrl,
          publicId,
        },
      );

      // =====================================
      // STEP 4
      // Submit Seller Verification
      // =====================================

      const verificationResponse =
        await fetch(
          "/api/verification/seller",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              imageUrl,
              publicId,
            }),
          },
        );

      const verificationData =
        await verificationResponse.json();

      // =====================================
      // Verification Submission Failed
      // =====================================

      if (
        !verificationResponse.ok ||
        !verificationData.success
      ) {
        throw new Error(
          verificationData.message ||
            "Seller verification submission failed.",
        );
      }

      // =====================================
      // SUCCESS
      // =====================================

      console.log(
        "SELLER VERIFICATION SUBMITTED:",
        verificationData,
      );

      setMessage(
        "Your live selfie has been submitted successfully. You can now verify your location.",
      );

      setSelfie(null);
    } catch (error) {
      console.error(
        "SELLER VERIFICATION ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Seller verification submission failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================
  // LOCATION VERIFICATION
  // =====================================

  function verifyLocation() {
    setError("");

    setMessage("");

    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by this browser.",
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const {
            latitude,
            longitude,
            accuracy,
          } = position.coords;

          console.log(
            "CURRENT LOCATION:",
            {
              latitude,
              longitude,
              accuracy,
            },
          );

          // =====================================
          // Accuracy Check
          // =====================================

          if (accuracy > 100) {
            setError(
              `Location accuracy is ${Math.round(
                accuracy,
              )} meters. Please move to an open area and try again.`,
            );

            setLocationLoading(false);

            return;
          }

          // =====================================
          // Submit Location
          // =====================================

          const response = await fetch(
            "/api/verification/location",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
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
            !data.success
          ) {
            throw new Error(
              data.message ||
                "Location verification failed.",
            );
          }

          // =====================================
          // Success
          // =====================================

          setLocationVerified(true);

          setLocationAccuracy(
            accuracy,
          );

          setMessage(
            "Your current location has been verified successfully.",
          );

          console.log(
            "LOCATION VERIFIED:",
            data,
          );
        } catch (error) {
          console.error(
            "LOCATION VERIFICATION ERROR:",
            error,
          );

          setError(
            error instanceof Error
              ? error.message
              : "Location verification failed.",
          );
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.error(
          "GEOLOCATION ERROR:",
          error,
        );

        setLocationLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(
              "Location permission was denied. Please allow location access and try again.",
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setError(
              "Your current location could not be detected. Please try again.",
            );
            break;

          case error.TIMEOUT:
            setError(
              "Location request timed out. Please try again.",
            );
            break;

          default:
            setError(
              "Unable to get your current location.",
            );
        }
      },

      {
        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0,
      },
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* =====================================
            Header
        ===================================== */}

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Seller Verification
          </h1>

          <p className="mt-2 text-slate-600">
            Complete your verification to become a
            DealUp Verified Seller.
          </p>
        </div>

        {/* =====================================
            LIVE SELFIE
        ===================================== */}

        {!selfie && !message.includes("submitted") && (
          <LiveSelfieCapture
            onCapture={(imageData) => {
              console.log(
                "LIVE SELFIE CAPTURED",
              );

              setSelfie(imageData);

              setError("");

              setMessage("");
            }}
            onCancel={() => {
              window.history.back();
            }}
          />
        )}

        {/* =====================================
            Captured Selfie Preview
        ===================================== */}

        {selfie && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">

            <div className="mb-5 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                Live Selfie Captured
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Your live selfie will be used only
                for seller verification.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src={selfie}
                alt="Captured live selfie"
                className="mx-auto aspect-[4/3] w-full object-cover"
              />
            </div>

            {/* Submit */}

            <button
              type="button"
              onClick={submitVerification}
              disabled={submitting}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#1565d8] font-semibold text-white transition hover:bg-[#0f4fae] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting Verification..."
                : "Submit for Verification"}
            </button>

            {/* Retake */}

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setSelfie(null);

                setError("");

                setMessage("");
              }}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              Retake Selfie
            </button>
          </div>
        )}

        {/* =====================================
            LOCATION VERIFICATION
        ===================================== */}

        {message.includes("submitted") && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                📍
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Verify Your Location
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Verify your current location to
                increase trust in your DealUp seller
                profile.
              </p>

              {!locationVerified ? (
                <button
                  type="button"
                  onClick={verifyLocation}
                  disabled={locationLoading}
                  className="mt-6 h-12 w-full rounded-xl bg-[#1565d8] px-5 font-semibold text-white transition hover:bg-[#0f4fae] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {locationLoading
                    ? "Detecting Your Location..."
                    : "📍 Verify My Location"}
                </button>
              ) : (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">

                  <div className="text-lg font-bold text-green-700">
                    ✓ Location Verified
                  </div>

                  {locationAccuracy !== null && (
                    <p className="mt-1 text-sm text-green-600">
                      GPS accuracy:{" "}
                      {Math.round(
                        locationAccuracy,
                      )} meters
                    </p>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

        {/* =====================================
            SUCCESS MESSAGE
        ===================================== */}

        {message && !message.includes("submitted") && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-center text-sm font-semibold text-green-700">
            ✓ {message}
          </div>
        )}

        {/* =====================================
            ERROR MESSAGE
        ===================================== */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

      </div>
    </main>
  );
}