"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import dynamic from "next/dynamic";

import { QRCodeSVG } from "qrcode.react";

// =====================================================
// Location Picker
// =====================================================

const LocationPicker = dynamic(
  () => import("@/components/map/LocationPicker"),
  {
    ssr: false,
  },
);

// =====================================================
// Props
// =====================================================

interface Props {
  register: any;
  errors: any;
  setValue: any;
  getValues: any;
  watch: any;

  mode?: "create" | "edit";
}

// =====================================================
// Location Verification
// =====================================================

type LocationVerificationStatus =
  | "unknown"
  | "nearby"
  | "different"
  | "far";

// =====================================================
// Default Location
// =====================================================

const DEFAULT_LATITUDE = 22.9765;
const DEFAULT_LONGITUDE = 88.4011;

// =====================================================
// States
// =====================================================

const states = [
  "West Bengal",
  "Bihar",
  "Jharkhand",
  "Odisha",
  "Assam",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
];

// =====================================================
// Distance
// =====================================================

function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
  const earthRadius = 6371;

  const latitudeDifference =
    ((latitude2 - latitude1) * Math.PI) /
    180;

  const longitudeDifference =
    ((longitude2 - longitude1) * Math.PI) /
    180;

  const a =
    Math.sin(latitudeDifference / 2) **
      2 +
    Math.cos(
      (latitude1 * Math.PI) / 180,
    ) *
      Math.cos(
        (latitude2 * Math.PI) / 180,
      ) *
      Math.sin(
        longitudeDifference / 2,
      ) **
        2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadius * c;
}

// =====================================================
// Verification Status
// =====================================================

function getLocationVerificationStatus(
  distanceKm: number | null,
): LocationVerificationStatus {
  if (distanceKm === null) {
    return "unknown";
  }

  if (distanceKm <= 5) {
    return "nearby";
  }

  if (distanceKm <= 25) {
    return "different";
  }

  return "far";
}

// =====================================================
// Main Component
// =====================================================

export default function LocationSection({
  register,
  errors,
  setValue,
  getValues,
  watch,
  mode = "create",
}: Props) {
  // ===================================================
  // Existing Product Coordinates
  // ===================================================

  const initialLatitude =
    Number(getValues("latitude"));

  const initialLongitude =
    Number(getValues("longitude"));

  const hasExistingProductLocation =
    Number.isFinite(
      initialLatitude,
    ) &&
    Number.isFinite(
      initialLongitude,
    ) &&
    initialLatitude !== 0 &&
    initialLongitude !== 0;

  // ===================================================
  // Product Location
  // ===================================================

  const [
    latitude,
    setLatitude,
  ] = useState<number>(
    hasExistingProductLocation
      ? initialLatitude
      : DEFAULT_LATITUDE,
  );

  const [
    longitude,
    setLongitude,
  ] = useState<number>(
    hasExistingProductLocation
      ? initialLongitude
      : DEFAULT_LONGITUDE,
  );

  // ===================================================
  // Seller Live GPS
  // ===================================================

  const [
    liveLatitude,
    setLiveLatitude,
  ] = useState<number | null>(
    null,
  );

  const [
    liveLongitude,
    setLiveLongitude,
  ] = useState<number | null>(
    null,
  );

  const [
    locationAccuracy,
    setLocationAccuracy,
  ] = useState<number | null>(
    null,
  );

  // ===================================================
  // GPS Status
  // ===================================================

  const [
    locationStatus,
    setLocationStatus,
  ] = useState<
    | "idle"
    | "requesting"
    | "success"
    | "error"
  >("idle");

  // ===================================================
  // Address / Map Confirmation
  // ===================================================

  const [
    locationMismatch,
    setLocationMismatch,
  ] = useState(false);

  // ===================================================
  // Address Snapshot
  // ===================================================

  const initialAddressLoaded =
    useRef(false);

  const [
    initialAddressSnapshot,
    setInitialAddressSnapshot,
  ] = useState("");

  // ===================================================
  // Mobile Verification
  // ===================================================

  const [
    mobileVerification,
    setMobileVerification,
  ] = useState<{
    token: string;
    mobileUrl: string;
  } | null>(null);

  const [
    mobileVerificationLoading,
    setMobileVerificationLoading,
  ] = useState(false);

  // ===================================================
  // Watch Product Coordinates
  // ===================================================

  const watchedLatitude =
    watch("latitude");

  const watchedLongitude =
    watch("longitude");

  // ===================================================
  // Watch Address Fields
  // ===================================================

  const watchedState =
    watch("state");

  const watchedDistrict =
    watch("district");

  const watchedCity =
    watch("city");

  const watchedPincode =
    watch("pincode");

  const watchedAddress =
    watch("address");

  // ===================================================
  // Keep Product Coordinates Synced
  // ===================================================

  useEffect(() => {
    const lat =
      Number(watchedLatitude);

    const lng =
      Number(watchedLongitude);

    if (
      Number.isFinite(lat) &&
      lat !== 0
    ) {
      setLatitude(lat);
    }

    if (
      Number.isFinite(lng) &&
      lng !== 0
    ) {
      setLongitude(lng);
    }
  }, [
    watchedLatitude,
    watchedLongitude,
  ]);

  // ===================================================
  // Initial Address Snapshot
  // ===================================================

  useEffect(() => {
    if (
      initialAddressLoaded.current
    ) {
      return;
    }

    const snapshot = [
      watchedState,
      watchedDistrict,
      watchedCity,
      watchedPincode,
      watchedAddress,
    ]
      .map((value) =>
        String(value ?? "")
          .trim()
          .toLowerCase(),
      )
      .join("|");

    setInitialAddressSnapshot(
      snapshot,
    );

    initialAddressLoaded.current =
      true;
  }, [
    watchedState,
    watchedDistrict,
    watchedCity,
    watchedPincode,
    watchedAddress,
  ]);

  // ===================================================
  // Detect Manual Address Change
  // ===================================================

  useEffect(() => {
    if (
      !initialAddressLoaded.current
    ) {
      return;
    }

    const currentSnapshot = [
      watchedState,
      watchedDistrict,
      watchedCity,
      watchedPincode,
      watchedAddress,
    ]
      .map((value) =>
        String(value ?? "")
          .trim()
          .toLowerCase(),
      )
      .join("|");

    if (
      currentSnapshot !==
      initialAddressSnapshot
    ) {
      setLocationMismatch(true);
    }
  }, [
    watchedState,
    watchedDistrict,
    watchedCity,
    watchedPincode,
    watchedAddress,
    initialAddressSnapshot,
  ]);

  // ===================================================
  // Product Map Selection
  // ===================================================

  const handleProductLocationChange =
    useCallback(
      (
        lat: number,
        lng: number,
      ) => {
        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng)
        ) {
          return;
        }

        // Product coordinates

        setLatitude(lat);
        setLongitude(lng);

        // React Hook Form

        setValue(
          "latitude",
          lat,
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );

        setValue(
          "longitude",
          lng,
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );

        // Map confirmed

        setLocationMismatch(
          false,
        );

        // Update address snapshot

        const currentSnapshot = [
          watchedState,
          watchedDistrict,
          watchedCity,
          watchedPincode,
          watchedAddress,
        ]
          .map((value) =>
            String(value ?? "")
              .trim()
              .toLowerCase(),
          )
          .join("|");

        setInitialAddressSnapshot(
          currentSnapshot,
        );
      },
      [
        setValue,
        watchedState,
        watchedDistrict,
        watchedCity,
        watchedPincode,
        watchedAddress,
      ],
    );

  // ===================================================
  // Create Mobile Verification Session
  // ===================================================

  const startMobileVerification =
    useCallback(async () => {
      try {
        setMobileVerificationLoading(
          true,
        );

        const response =
          await fetch(
            "/api/location-verification/session",
            {
              method: "POST",
              cache: "no-store",
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ??
              "Unable to create mobile verification.",
          );
        }

        if (
          !data?.token ||
          !data?.mobileUrl
        ) {
          throw new Error(
            "Invalid verification session response.",
          );
        }

        setMobileVerification({
          token: data.token,
          mobileUrl:
            data.mobileUrl,
        });
      } catch (error) {
        console.error(
          "MOBILE VERIFICATION ERROR:",
          error,
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to start mobile verification.",
        );
      } finally {
        setMobileVerificationLoading(
          false,
        );
      }
    }, []);

  // ===================================================
  // Check Mobile Verification Status
  // ===================================================

  useEffect(() => {
    if (
      !mobileVerification?.token
    ) {
      return;
    }

    let stopped = false;

    const checkStatus =
      async () => {
        try {
          const response =
            await fetch(
              `/api/location-verification/status?token=${encodeURIComponent(
                mobileVerification.token,
              )}`,
              {
                cache:
                  "no-store",
              },
            );

          const data =
            await response.json();

          if (
            stopped ||
            !response.ok
          ) {
            return;
          }

          // =========================================
          // Mobile verified
          // =========================================

          if (
            data.status ===
            "verified"
          ) {
            const mobileLocation =
              data.mobileLocation;

            if (
              mobileLocation &&
              Number.isFinite(
                Number(
                  mobileLocation.latitude,
                ),
              ) &&
              Number.isFinite(
                Number(
                  mobileLocation.longitude,
                ),
              )
            ) {
              setLiveLatitude(
                Number(
                  mobileLocation.latitude,
                ),
              );

              setLiveLongitude(
                Number(
                  mobileLocation.longitude,
                ),
              );

              setLocationAccuracy(
                Number(
                  mobileLocation.accuracy,
                ),
              );

              setLocationStatus(
                "success",
              );
            }

            setMobileVerification(
              null,
            );

            return;
          }

          // =========================================
          // Expired
          // =========================================

          if (
            data.status ===
            "expired"
          ) {
            setMobileVerification(
              null,
            );

            alert(
              "Mobile verification session expired. Please generate a new QR code.",
            );
          }
        } catch (error) {
          console.error(
            "MOBILE STATUS CHECK ERROR:",
            error,
          );
        }
      };

    void checkStatus();

    const interval =
      window.setInterval(
        checkStatus,
        2000,
      );

    return () => {
      stopped = true;

      window.clearInterval(
        interval,
      );
    };
  }, [
    mobileVerification,
  ]);

  // ===================================================
  // Seller Live GPS
  // ===================================================

  const detectLiveLocation =
    useCallback(() => {
      if (
        typeof navigator ===
          "undefined" ||
        !navigator.geolocation
      ) {
        setLocationStatus(
          "error",
        );

        return;
      }

      // Close old QR

      setMobileVerification(
        null,
      );

      setLocationStatus(
        "requesting",
      );

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat =
            position.coords
              .latitude;

          const lng =
            position.coords
              .longitude;

          const accuracy =
            position.coords
              .accuracy;

          if (
            !Number.isFinite(
              lat,
            ) ||
            !Number.isFinite(
              lng,
            )
          ) {
            setLocationStatus(
              "error",
            );

            return;
          }

          // =========================================
          // Save live GPS
          // =========================================

          setLiveLatitude(
            lat,
          );

          setLiveLongitude(
            lng,
          );

          setLocationAccuracy(
            accuracy,
          );

          // =========================================
          // New product
          //
          // If product doesn't have a location,
          // use live GPS as initial location.
          // =========================================

          if (
            mode === "create" &&
            !hasExistingProductLocation
          ) {
            handleProductLocationChange(
              lat,
              lng,
            );
          }

          setLocationStatus(
            "success",
          );

          // =========================================
          // Desktop GPS is inaccurate
          //
          // Instead of alert:
          // show QR option.
          // =========================================

          if (
            accuracy > 1000
          ) {
            console.warn(
              "DESKTOP GPS ACCURACY TOO LOW:",
              accuracy,
            );

            setLocationStatus(
              "success",
            );
          }
        },

        (error) => {
          console.error(
            "LIVE LOCATION ERROR:",
            error,
          );

          setLocationStatus(
            "error",
          );
        },

        {
          enableHighAccuracy:
            true,

          timeout:
            15000,

          maximumAge:
            0,
        },
      );
    }, [
      mode,
      hasExistingProductLocation,
      handleProductLocationChange,
    ]);

  // ===================================================
  // Automatically Detect Seller GPS
  // ===================================================

  useEffect(() => {
    detectLiveLocation();
  }, [
    detectLiveLocation,
  ]);

  // ===================================================
  // Seller → Product Distance
  // ===================================================

  const locationDistance =
    liveLatitude !== null &&
    liveLongitude !== null
      ? calculateDistance(
          latitude,
          longitude,
          liveLatitude,
          liveLongitude,
        )
      : null;

  // ===================================================
  // Verification Status
  // ===================================================

  const locationVerification =
    getLocationVerificationStatus(
      locationDistance,
    );

  // ===================================================
  // Render
  // ===================================================

  return (
    <section className="space-y-8">

      {/* =================================================
          Header
      ================================================= */}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Product Location
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Tell buyers where your product is currently located.
        </p>
      </div>

      {/* =================================================
          GPS Requesting
      ================================================= */}

      {locationStatus ===
        "requesting" && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/30">

          <div className="flex items-start gap-3">

            <div className="animate-pulse text-2xl">
              📍
            </div>

            <div>

              <h3 className="font-bold text-blue-800 dark:text-blue-300">
                Detecting your live location
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-700 dark:text-blue-400">
                DealUp is checking your device GPS for seller verification.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          GPS Success
      ================================================= */}

      {locationStatus ===
        "success" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">

          <div className="flex items-start gap-3">

            <div className="text-2xl">
              📍
            </div>

            <div className="flex-1">

              <h3 className="font-bold text-green-800 dark:text-green-300">
                Live location detected
              </h3>

              <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
                Your live GPS is being used as a seller verification signal.
              </p>

              {locationAccuracy !==
                null && (
                <p className="mt-2 text-sm font-semibold text-green-800 dark:text-green-300">
                  GPS accuracy:{" "}
                  {Math.round(
                    locationAccuracy,
                  )}{" "}
                  metres
                </p>
              )}

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          Desktop GPS Low Accuracy
      ================================================= */}

      {locationAccuracy !==
        null &&
        locationAccuracy >
          1000 && (
          <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-950/30">

            <div className="flex flex-col gap-6 md:flex-row md:items-center">

              {/* LEFT */}

              <div className="flex-1">

                <div className="flex items-start gap-3">

                  <div className="text-3xl">
                    💻
                  </div>

                  <div>

                    <h3 className="font-bold text-orange-900 dark:text-orange-300">
                      Desktop GPS is not accurate enough
                    </h3>

                    <p className="mt-1 text-sm text-orange-800 dark:text-orange-400">
                      Current accuracy:{" "}
                      <strong>
                        {Math.round(
                          locationAccuracy,
                        )}{" "}
                        metres
                      </strong>
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-sm leading-6 text-orange-800 dark:text-orange-400">
                  For better seller verification,
                  use your mobile phone GPS.
                  Scan the QR code with your
                  mobile and allow precise
                  location access.
                </p>

                {!mobileVerification && (
                  <button
                    type="button"
                    onClick={
                      startMobileVerification
                    }
                    disabled={
                      mobileVerificationLoading
                    }
                    className="mt-5 rounded-2xl bg-[#1565d8] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {mobileVerificationLoading
                      ? "Creating QR..."
                      : "📱 Verify Using Mobile"}
                  </button>
                )}

              </div>

              {/* QR */}

              {mobileVerification && (
                <div className="flex shrink-0 flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900">

                  <QRCodeSVG
                    value={
                      mobileVerification.mobileUrl
                    }
                    size={220}
                    level="M"
                    includeMargin
                  />

                  <p className="mt-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Scan with your mobile
                  </p>

                  <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                    Waiting for mobile GPS...
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                    Waiting for verification
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      {/* =================================================
          GPS Error
      ================================================= */}

      {locationStatus ===
        "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="font-bold text-red-800 dark:text-red-300">
                Location access required
              </h3>

              <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-400">
                Please allow device location access so DealUp can perform seller verification.
              </p>

            </div>

            <button
              type="button"
              onClick={
                detectLiveLocation
              }
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>

        </div>
      )}

      {/* =================================================
          Country
      ================================================= */}

      <div>

        <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
          Country
        </label>

        <input
          readOnly
          value="India"
          className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

      </div>

      {/* =================================================
          State
      ================================================= */}

      <div>

        <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
          State
        </label>

        <select
          {...register("state")}
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >

          <option value="">
            Select State
          </option>

          {states.map(
            (state) => (
              <option
                key={state}
                value={state}
              >
                {state}
              </option>
            ),
          )}

        </select>

        {errors.state && (
          <p className="mt-2 text-sm text-red-500">
            {
              errors.state
                .message
            }
          </p>
        )}

      </div>

      {/* =================================================
          District
      ================================================= */}

      <div>

        <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
          District
        </label>

        <input
          {...register(
            "district",
          )}
          placeholder="e.g. Hooghly"
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        {errors.district && (
          <p className="mt-2 text-sm text-red-500">
            {
              errors
                .district
                .message
            }
          </p>
        )}

      </div>

      {/* =================================================
          City
      ================================================= */}

      <div>

        <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
          City / Town
        </label>

        <input
          {...register(
            "city",
          )}
          placeholder="e.g. Chuchura"
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        {errors.city && (
          <p className="mt-2 text-sm text-red-500">
            {
              errors.city
                .message
            }
          </p>
        )}

      </div>

      {/* =================================================
          Pincode
      ================================================= */}

      <div>

        <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
          Pincode
        </label>

        <input
          {...register(
            "pincode",
          )}
          placeholder="712502"
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        {errors.pincode && (
          <p className="mt-2 text-sm text-red-500">
            {
              errors
                .pincode
                .message
            }
          </p>
        )}

      </div>

      {/* =================================================
          Address
      ================================================= */}

      <div>

        <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
          Full Address
        </label>

        <textarea
          rows={4}
          {...register(
            "address",
          )}
          placeholder="Enter complete address..."
          className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        {errors.address && (
          <p className="mt-2 text-sm text-red-500">
            {
              errors
                .address
                .message
            }
          </p>
        )}

      </div>

      {/* =================================================
          Refresh Live GPS
      ================================================= */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={
            detectLiveLocation
          }
          disabled={
            locationStatus ===
            "requesting"
          }
          className="rounded-2xl bg-[#1565d8] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locationStatus ===
          "requesting"
            ? "📍 Detecting..."
            : "📍 Refresh Live Location"}
        </button>

      </div>

      {/* =================================================
          Address / Map Mismatch
      ================================================= */}

      {locationMismatch && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-950/30">

          <div className="flex items-start gap-3">

            <div className="text-2xl">
              ⚠️
            </div>

            <div>

              <h3 className="font-bold text-amber-900 dark:text-amber-300">
                Location mismatch
              </h3>

              <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-400">
                Your product address has changed,
                but the map location has not been
                confirmed for this address.
              </p>

              <p className="mt-2 text-sm font-semibold text-amber-900 dark:text-amber-300">
                Please select the correct product
                location on the map before continuing.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          Seller → Product Distance
      ================================================= */}

      {locationDistance !==
        null && (
        <div
          className={`rounded-2xl border p-5 ${
            locationVerification ===
            "nearby"
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
              : locationVerification ===
                  "different"
                ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30"
          }`}
        >

          {locationVerification ===
            "nearby" && (
            <>
              <h3 className="font-bold text-green-800 dark:text-green-300">
                ✓ Product location is nearby
              </h3>

              <p className="mt-2 text-sm leading-6 text-green-700 dark:text-green-400">
                Your current device location is approximately{" "}
                <strong>
                  {locationDistance.toFixed(
                    1,
                  )}{" "}
                  km
                </strong>{" "}
                from the product location.
              </p>
            </>
          )}

          {locationVerification ===
            "different" && (
            <>
              <h3 className="font-bold text-amber-800 dark:text-amber-300">
                ⚠️ Product location differs
              </h3>

              <p className="mt-2 text-sm leading-6 text-amber-700 dark:text-amber-400">
                Your current device location is approximately{" "}
                <strong>
                  {locationDistance.toFixed(
                    1,
                  )}{" "}
                  km
                </strong>{" "}
                from the product location.
              </p>

              <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
                This is allowed. A seller may be listing a product stored at another location.
              </p>
            </>
          )}

          {locationVerification ===
            "far" && (
            <>
              <h3 className="font-bold text-orange-800 dark:text-orange-300">
                ⚠️ Significant location difference
              </h3>

              <p className="mt-2 text-sm leading-6 text-orange-700 dark:text-orange-400">
                Your current device location is approximately{" "}
                <strong>
                  {locationDistance.toFixed(
                    1,
                  )}{" "}
                  km
                </strong>{" "}
                from the product location.
              </p>

              <p className="mt-2 text-sm text-orange-800 dark:text-orange-300">
                DealUp may use this difference as one signal in its seller trust and risk system.
              </p>
            </>
          )}

        </div>
      )}

      {/* =================================================
          Product Location Map
      ================================================= */}

      <div className="space-y-3">

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <label className="block font-medium text-slate-700 dark:text-slate-300">
              Product Location on Map
            </label>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select where the product is actually located.
            </p>

          </div>

          {locationMismatch && (
            <span className="font-semibold text-amber-600">
              ⚠️ Map confirmation required
            </span>
          )}

        </div>

        <div className="relative h-[480px] w-full overflow-hidden rounded-3xl border border-slate-300 bg-slate-200 shadow-sm dark:border-slate-700 md:h-[560px] lg:h-[620px]">

          <LocationPicker
            latitude={
              latitude
            }
            longitude={
              longitude
            }
            liveLatitude={
              liveLatitude
            }
            liveLongitude={
              liveLongitude
            }
            liveAccuracy={
              locationAccuracy
            }
            onLocationChange={
              handleProductLocationChange
            }
            onMobileVerificationRequired={
              startMobileVerification
            }
          />

        </div>

      </div>

      {/* =================================================
          Product Coordinates
      ================================================= */}

      <div>

        <div className="mb-3">

          <h3 className="font-semibold text-slate-900 dark:text-white">
            Product Location Coordinates
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            These coordinates belong to the product listing,
            not your live device location.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
              Latitude
            </label>

            <input
              readOnly
              value={latitude.toFixed(
                6,
              )}
              className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

          </div>

          <div>

            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
              Longitude
            </label>

            <input
              readOnly
              value={longitude.toFixed(
                6,
              )}
              className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

          </div>

        </div>

      </div>

      {/* =================================================
          Seller Live GPS
      ================================================= */}

      {liveLatitude !==
        null &&
        liveLongitude !==
          null && (
          <div>

            <div className="mb-3">

              <h3 className="font-semibold text-slate-900 dark:text-white">
                Seller Live GPS
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your current device location.
                This is used only for verification.
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>

                <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
                  Live Latitude
                </label>

                <input
                  readOnly
                  value={liveLatitude.toFixed(
                    6,
                  )}
                  className="h-14 w-full rounded-2xl border border-green-200 bg-green-50 px-4 text-slate-900 dark:border-green-800 dark:bg-green-950/30 dark:text-white"
                />

              </div>

              <div>

                <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
                  Live Longitude
                </label>

                <input
                  readOnly
                  value={liveLongitude.toFixed(
                    6,
                  )}
                  className="h-14 w-full rounded-2xl border border-green-200 bg-green-50 px-4 text-slate-900 dark:border-green-800 dark:bg-green-950/30 dark:text-white"
                />

              </div>

            </div>

          </div>
        )}

      {/* =================================================
          Hidden Product Coordinates
      ================================================= */}

      <input
        type="hidden"
        {...register(
          "latitude",
        )}
      />

      <input
        type="hidden"
        {...register(
          "longitude",
        )}
      />

      {/* =================================================
          Privacy
      ================================================= */}

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">

        <h3 className="text-lg font-semibold text-[#1565d8]">
          🔒 Location Privacy
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Your exact live device location
          will not be shown publicly to buyers.
          DealUp uses your live GPS only as a
          verification signal. The product
          location is stored separately.
        </p>

      </div>

    </section>
  );
}