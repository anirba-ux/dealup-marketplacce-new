"use client";

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";

import { useSearchParams } from "next/navigation";

// =====================================================
// Types
// =====================================================

type PageStatus =
  | "checking"
  | "ready"
  | "locating"
  | "sending"
  | "success"
  | "error"
  | "expired";

// =====================================================
// Constants
// =====================================================

const MAX_GPS_ACCURACY = 100;

// =====================================================
// Mobile Product Location Page
// =====================================================

export default function ProductLocationMobilePage() {
  const searchParams =
    useSearchParams();

  // ===================================================
  // Token
  //
  // Convert nullable URL value into a guaranteed
  // string immediately.
  // ===================================================

  const tokenParam =
    searchParams.get(
      "token",
    );

  const token =
    tokenParam ?? "";

  // ===================================================
  // State
  // ===================================================

  const [
    pageStatus,
    setPageStatus,
  ] = useState<PageStatus>(
    "checking",
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    gpsAccuracy,
    setGpsAccuracy,
  ] = useState<
    number | null
  >(null);

  // ===================================================
  // Check Product Location Session
  // ===================================================

  useEffect(() => {
    // -------------------------------------------------
    // No Token
    // -------------------------------------------------

    if (!token) {
      setPageStatus(
        "error",
      );

      setErrorMessage(
        "This location link is invalid or incomplete.",
      );

      return;
    }

    let cancelled =
      false;

    async function checkSession() {
      try {
        const response =
          await fetch(
            `/api/product-location/mobile-session?token=${encodeURIComponent(
              token,
            )}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            },
          );

        const data =
          (await response.json()) as {
            success?: boolean;

            valid?: boolean;

            status?: string;

            message?: string;
          };

        if (cancelled) {
          return;
        }

        // ---------------------------------------------
        // Expired
        // ---------------------------------------------

        if (
          response.status ===
          410
        ) {
          setPageStatus(
            "expired",
          );

          setErrorMessage(
            data.message ??
              "This location session has expired.",
          );

          return;
        }

        // ---------------------------------------------
        // Invalid
        // ---------------------------------------------

        if (
          !response.ok ||
          !data.valid
        ) {
          setPageStatus(
            "error",
          );

          setErrorMessage(
            data.message ??
              "This location session is not available.",
          );

          return;
        }

        // ---------------------------------------------
        // Already Completed
        // ---------------------------------------------

        if (
          data.status ===
          "completed"
        ) {
          setPageStatus(
            "success",
          );

          return;
        }

        // ---------------------------------------------
        // Cancelled
        // ---------------------------------------------

        if (
          data.status ===
          "cancelled"
        ) {
          setPageStatus(
            "error",
          );

          setErrorMessage(
            "This location session has been cancelled.",
          );

          return;
        }

        // ---------------------------------------------
        // Ready
        // ---------------------------------------------

        setPageStatus(
          "ready",
        );
      } catch (error) {
        console.error(
          "CHECK PRODUCT LOCATION SESSION ERROR:",
          error,
        );

        if (!cancelled) {
          setPageStatus(
            "error",
          );

          setErrorMessage(
            "Unable to connect to DealUp. Please try again.",
          );
        }
      }
    }

    void checkSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // ===================================================
  // Capture Mobile GPS
  // ===================================================

  const handleGetLocation =
    () => {
      // -------------------------------------------------
      // Token
      // -------------------------------------------------

      if (!token) {
        setPageStatus(
          "error",
        );

        setErrorMessage(
          "This location link is invalid.",
        );

        return;
      }

      // -------------------------------------------------
      // Browser Support
      // -------------------------------------------------

      if (
        typeof navigator ===
          "undefined" ||
        !navigator.geolocation
      ) {
        setPageStatus(
          "error",
        );

        setErrorMessage(
          "Your mobile browser does not support location services.",
        );

        return;
      }

      // -------------------------------------------------
      // Start GPS
      // -------------------------------------------------

      setPageStatus(
        "locating",
      );

      setErrorMessage("");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
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

            // ===========================================
            // Accuracy
            // ===========================================

            setGpsAccuracy(
              accuracy,
            );

            if (
              !Number.isFinite(
                accuracy,
              ) ||
              accuracy <= 0
            ) {
              setPageStatus(
                "error",
              );

              setErrorMessage(
                "Your phone could not determine GPS accuracy. Please try again.",
              );

              return;
            }

            // ===========================================
            // Accuracy Limit
            // ===========================================

            if (
              accuracy >
              MAX_GPS_ACCURACY
            ) {
              setPageStatus(
                "error",
              );

              setErrorMessage(
                `Your current GPS accuracy is about ${Math.round(
                  accuracy,
                )} metres. Please move to an open area and try again.`,
              );

              return;
            }

            // ===========================================
            // Send To Server
            // ===========================================

            setPageStatus(
              "sending",
            );

            const response =
              await fetch(
                "/api/product-location/mobile",
                {
                  method:
                    "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body:
                    JSON.stringify({
                      token,

                      latitude,

                      longitude,

                      accuracy,
                    }),
                },
              );

            const data =
              (await response.json()) as {
                success?: boolean;

                message?: string;
              };

            // =========================================
            // Expired
            // =========================================

            if (
              response.status ===
              410
            ) {
              setPageStatus(
                "expired",
              );

              setErrorMessage(
                data.message ??
                  "This location session has expired.",
              );

              return;
            }

            // =========================================
            // Failed
            // =========================================

            if (
              !response.ok ||
              !data.success
            ) {
              throw new Error(
                data.message ??
                  "Unable to send your location.",
              );
            }

            // =========================================
            // Success
            // =========================================

            setPageStatus(
              "success",
            );
          } catch (error) {
            console.error(
              "SEND PRODUCT LOCATION ERROR:",
              error,
            );

            setPageStatus(
              "error",
            );

            setErrorMessage(
              error instanceof Error
                ? error.message
                : "Unable to send your location.",
            );
          }
        },
        (error) => {
          console.error(
            "MOBILE GPS ERROR:",
            error,
          );

          setPageStatus(
            "error",
          );

          // ===========================================
          // Permission Denied
          // ===========================================

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            setErrorMessage(
              "Location permission was denied. Please allow location access in your browser settings and try again.",
            );

            return;
          }

          // ===========================================
          // Location Unavailable
          // ===========================================

          if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {
            setErrorMessage(
              "Your phone could not determine the current location. Please turn on Location/GPS and try again.",
            );

            return;
          }

          // ===========================================
          // Timeout
          // ===========================================

          if (
            error.code ===
            error.TIMEOUT
          ) {
            setErrorMessage(
              "GPS detection timed out. Please move to an open area and try again.",
            );

            return;
          }

          // ===========================================
          // Unknown
          // ===========================================

          setErrorMessage(
            "Unable to detect your current location.",
          );
        },
        {
          enableHighAccuracy:
            true,

          timeout:
            20000,

          maximumAge:
            0,
        },
      );
    };

  // ===================================================
  // Invalid Token
  // ===================================================

  if (!token) {
    return (
      <MobileLayout>
        <ErrorState
          title="Invalid Location Link"
          message="This QR/location link does not contain a valid session."
        />
      </MobileLayout>
    );
  }

  // ===================================================
  // Checking
  // ===================================================

  if (
    pageStatus ===
    "checking"
  ) {
    return (
      <MobileLayout>
        <LoadingState
          title="Checking location session..."
          message="Please wait while we securely connect your phone to the product page."
        />
      </MobileLayout>
    );
  }

  // ===================================================
  // Ready
  // ===================================================

  if (
    pageStatus ===
    "ready"
  ) {
    return (
      <MobileLayout>
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-[#1565d8]">
            <MapPin
              size={38}
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Set Product Location
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your desktop is waiting for the actual
            product location from this phone.
          </p>
        </div>

        {/* Information */}

        <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-3">
            <ShieldCheck
              size={22}
              className="mt-0.5 shrink-0 text-[#1565d8]"
            />

            <div>
              <p className="font-semibold text-blue-900">
                Product location only
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                This does not verify your seller identity
                and does not perform selfie verification.
              </p>
            </div>
          </div>
        </div>

        {/* GPS Button */}

        <button
          type="button"
          onClick={
            handleGetLocation
          }
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1565d8] px-6 py-4 text-base font-bold text-white shadow-lg transition active:scale-[0.98] hover:bg-[#0f52ba]"
        >
          <Navigation
            size={21}
          />

          Use My Current Location
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Please press this button while you are
          physically at the place where the product is
          located.
        </p>
      </MobileLayout>
    );
  }

  // ===================================================
  // Locating
  // ===================================================

  if (
    pageStatus ===
    "locating"
  ) {
    return (
      <MobileLayout>
        <LoadingState
          title="Detecting your location..."
          message="Keep your phone still for a few seconds while GPS determines your position."
        />
      </MobileLayout>
    );
  }

  // ===================================================
  // Sending
  // ===================================================

  if (
    pageStatus ===
    "sending"
  ) {
    return (
      <MobileLayout>
        <LoadingState
          title="Sending location..."
          message="Securely sending your product coordinates to your desktop."
        />

        {gpsAccuracy !==
          null && (
          <p className="mt-4 text-center text-xs text-slate-500">
            GPS accuracy: approximately{" "}
            {Math.round(
              gpsAccuracy,
            )}
            m
          </p>
        )}
      </MobileLayout>
    );
  }

  // ===================================================
  // Success
  // ===================================================

  if (
    pageStatus ===
    "success"
  ) {
    return (
      <MobileLayout>
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2
              size={44}
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Location Sent Successfully
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your phone&apos;s GPS location has been sent
            securely to the DealUp product publishing page.
          </p>
        </div>

        {gpsAccuracy !==
          null && (
          <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              GPS Accuracy
            </p>

            <p className="mt-2 text-2xl font-bold text-green-700">
              ~
              {Math.round(
                gpsAccuracy,
              )}
              m
            </p>
          </div>
        )}

        <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-center">
          <p className="text-sm font-semibold text-slate-700">
            You can return to your computer now.
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            The product location will be updated
            automatically on the desktop page.
          </p>
        </div>
      </MobileLayout>
    );
  }

  // ===================================================
  // Expired
  // ===================================================

  if (
    pageStatus ===
    "expired"
  ) {
    return (
      <MobileLayout>
        <ErrorState
          title="Session Expired"
          message={
            errorMessage ||
            "This QR code has expired. Please generate a new QR code from the desktop page."
          }
        />
      </MobileLayout>
    );
  }

  // ===================================================
  // Error
  // ===================================================

  return (
    <MobileLayout>
      <ErrorState
        title="Location Unavailable"
        message={
          errorMessage ||
          "We could not complete the location request."
        }
        retry={() => {
          window.location.reload();
        }}
      />
    </MobileLayout>
  );
}

// =====================================================
// Mobile Layout
// =====================================================

function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-md">
        {/* Brand */}

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1565d8] text-white shadow-lg">
            <Smartphone
              size={24}
            />
          </div>

          <p className="mt-3 text-sm font-bold text-[#1565d8]">
            DealUp Marketplace
          </p>
        </div>

        {/* Main Card */}

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
          {children}
        </div>

        {/* Footer */}

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure Product Location
        </p>
      </div>
    </main>
  );
}

// =====================================================
// Loading State
// =====================================================

function LoadingState({
  title = "Checking location session...",
  message = "Please wait a moment.",
}: {
  title?: string;

  message?: string;
}) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-[#1565d8]">
        <Loader2
          size={36}
          className="animate-spin"
        />
      </div>

      <h1 className="mt-6 text-xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {message}
      </p>
    </div>
  );
}

// =====================================================
// Error State
// =====================================================

function ErrorState({
  title,
  message,
  retry,
}: {
  title: string;

  message: string;

  retry?: () => void;
}) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
        <XCircle
          size={42}
        />
      </div>

      <h1 className="mt-6 text-xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {message}
      </p>

      {retry && (
        <button
          type="button"
          onClick={
            retry
          }
          className="mt-6 rounded-2xl bg-[#1565d8] px-6 py-3 font-semibold text-white"
        >
          Try Again
        </button>
      )}
    </div>
  );
}