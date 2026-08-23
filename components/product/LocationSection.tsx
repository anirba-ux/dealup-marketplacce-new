"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import dynamic from "next/dynamic";

import {
  CheckCircle2,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Smartphone,
  QrCode,
  X,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

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
// Mobile Session Response
// =====================================================

interface MobileSession {
  token: string;
  mobileUrl: string;
  expiresAt: string;
}

// =====================================================
// Mobile Location
// =====================================================

interface MobileLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
}

// =====================================================
// Defaults
// =====================================================

const DEFAULT_LATITUDE = 22.9765;
const DEFAULT_LONGITUDE = 88.4011;

// =====================================================
// Indian States
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
// Coordinate Validation
// =====================================================

function isValidCoordinate(
  latitude: number,
  longitude: number,
) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

// =====================================================
// Device Detection
// =====================================================

function detectMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(
    navigator.userAgent,
  );
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
  // Existing Coordinates
  // ===================================================

  const initialLatitude = Number(
    getValues("latitude"),
  );

  const initialLongitude = Number(
    getValues("longitude"),
  );

  const hasExistingLocation =
    isValidCoordinate(
      initialLatitude,
      initialLongitude,
    );

  // ===================================================
  // Product Coordinates
  // ===================================================

  const [latitude, setLatitude] =
    useState<number>(
      hasExistingLocation
        ? initialLatitude
        : DEFAULT_LATITUDE,
    );

  const [longitude, setLongitude] =
    useState<number>(
      hasExistingLocation
        ? initialLongitude
        : DEFAULT_LONGITUDE,
    );

  // ===================================================
  // Device
  // ===================================================

  const [mobileDevice, setMobileDevice] =
    useState(false);

  // ===================================================
  // GPS Status
  // ===================================================

  const [locationStatus, setLocationStatus] =
    useState<
      "idle" | "detecting" | "success" | "error"
    >("idle");

  const [locationError, setLocationError] =
    useState("");

  // ===================================================
  // Address Status
  // ===================================================

  const [addressLoading, setAddressLoading] =
    useState(false);

  const [addressError, setAddressError] =
    useState("");

  // ===================================================
  // Location Confirmation
  // ===================================================

  const [locationConfirmed, setLocationConfirmed] =
    useState(hasExistingLocation);

  // ===================================================
  // Location Source
  // ===================================================

  const [locationSource, setLocationSource] =
    useState<
      | "none"
      | "device"
      | "mobile"
      | "address"
      | "map"
    >(
      hasExistingLocation
        ? "map"
        : "none",
    );

  // ===================================================
  // Mobile QR Session
  // ===================================================

  const [mobileSession, setMobileSession] =
    useState<MobileSession | null>(null);

  const [mobileSessionLoading, setMobileSessionLoading] =
    useState(false);

  const [mobileSessionError, setMobileSessionError] =
    useState("");

  const [mobileConnected, setMobileConnected] =
    useState(false);

  const [mobileLocation, setMobileLocation] =
    useState<MobileLocation | null>(null);

  const pollingRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null,
    );

  // ===================================================
  // Last Geocoded Address
  // ===================================================

  const lastGeocodedAddress =
    useRef("");

  // ===================================================
  // Watched Address
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
  // Detect Mobile
  // ===================================================

  useEffect(() => {
    setMobileDevice(
      detectMobileDevice(),
    );
  }, []);

  // ===================================================
  // Sync Coordinates From Form
  // ===================================================

  useEffect(() => {
    const lat = Number(
      watch("latitude"),
    );

    const lng = Number(
      watch("longitude"),
    );

    if (
      isValidCoordinate(
        lat,
        lng,
      )
    ) {
      setLatitude(lat);
      setLongitude(lng);
      setLocationConfirmed(true);
    }
  }, [watch]);

  // ===================================================
  // Save Coordinates
  // ===================================================

  const saveCoordinates =
    useCallback(
      (
        lat: number,
        lng: number,
      ) => {
        if (
          !isValidCoordinate(
            lat,
            lng,
          )
        ) {
          return false;
        }

        setLatitude(lat);
        setLongitude(lng);

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

        setLocationConfirmed(true);

        return true;
      },
      [setValue],
    );

  // ===================================================
  // Reverse Geocode
  // ===================================================

  const reverseGeocode =
    useCallback(
      async (
        lat: number,
        lng: number,
      ) => {
        if (
          !isValidCoordinate(
            lat,
            lng,
          )
        ) {
          return false;
        }

        try {
          setAddressLoading(true);
          setAddressError("");

          const response =
            await fetch(
              `/api/geocode?mode=reverse&lat=${encodeURIComponent(
                lat,
              )}&lng=${encodeURIComponent(
                lng,
              )}`,
              {
                cache: "no-store",
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
                "Unable to identify this location.",
            );
          }

          const address =
            data.address ?? {};

          const state =
            address.state ?? "";

          const district =
            address.state_district ??
            address.county ??
            address.district ??
            "";

          const city =
            address.city ??
            address.town ??
            address.municipality ??
            address.village ??
            "";

          const pincode =
            address.postcode ?? "";

          const road =
            address.road ??
            address.neighbourhood ??
            address.suburb ??
            "";

          setValue(
            "state",
            state,
            {
              shouldDirty: true,
              shouldValidate: true,
            },
          );

          setValue(
            "district",
            district,
            {
              shouldDirty: true,
              shouldValidate: true,
            },
          );

          setValue(
            "city",
            city,
            {
              shouldDirty: true,
              shouldValidate: true,
            },
          );

          setValue(
            "pincode",
            pincode,
            {
              shouldDirty: true,
              shouldValidate: true,
            },
          );

          setValue(
            "address",
            road ||
              data.displayName ||
              "",
            {
              shouldDirty: true,
              shouldValidate: true,
            },
          );

          setLocationConfirmed(true);

          return true;
        } catch (error) {
          console.error(
            "REVERSE GEOCODING ERROR:",
            error,
          );

          setAddressError(
            error instanceof Error
              ? error.message
              : "Unable to identify this location.",
          );

          return false;
        } finally {
          setAddressLoading(false);
        }
      },
      [setValue],
    );

  // ===================================================
  // Product Location Changed
  // ===================================================

  const handleProductLocationChange =
    useCallback(
      async (
        lat: number,
        lng: number,
        source:
          | "device"
          | "mobile"
          | "map"
          | "address",
      ) => {
        const saved =
          saveCoordinates(
            lat,
            lng,
          );

        if (!saved) {
          return;
        }

        setLocationSource(
          source,
        );

        setAddressError("");

        await reverseGeocode(
          lat,
          lng,
        );
      },
      [
        saveCoordinates,
        reverseGeocode,
      ],
    );

  // ===================================================
  // Map Location
  // ===================================================

  const handleMapLocationChange =
    useCallback(
      (
        lat: number,
        lng: number,
      ) => {
        void handleProductLocationChange(
          lat,
          lng,
          "map",
        );
      },
      [
        handleProductLocationChange,
      ],
    );

  // ===================================================
  // Address → Map
  // ===================================================

  const findAddressOnMap =
    useCallback(
      async () => {
        const query = [
          watchedAddress,
          watchedCity,
          watchedDistrict,
          watchedState,
          watchedPincode,
          "India",
        ]
          .map(
            (value) =>
              String(
                value ?? "",
              ).trim(),
          )
          .filter(Boolean)
          .join(", ");

        if (!query) {
          setAddressError(
            "Please enter the product address first.",
          );

          return;
        }

        if (
          query ===
          lastGeocodedAddress.current
        ) {
          return;
        }

        try {
          setAddressLoading(true);
          setAddressError("");

          const response =
            await fetch(
              `/api/geocode?mode=search&q=${encodeURIComponent(
                query,
              )}`,
              {
                cache: "no-store",
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
                "Unable to find this address.",
            );
          }

          const lat =
            Number(
              data.latitude,
            );

          const lng =
            Number(
              data.longitude,
            );

          if (
            !isValidCoordinate(
              lat,
              lng,
            )
          ) {
            throw new Error(
              "The address returned an invalid map location.",
            );
          }

          saveCoordinates(
            lat,
            lng,
          );

          setLocationSource(
            "address",
          );

          setLocationConfirmed(
            true,
          );

          lastGeocodedAddress.current =
            query;
        } catch (error) {
          console.error(
            "ADDRESS GEOCODING ERROR:",
            error,
          );

          setAddressError(
            error instanceof Error
              ? error.message
              : "Unable to find this address.",
          );
        } finally {
          setAddressLoading(false);
        }
      },
      [
        watchedAddress,
        watchedCity,
        watchedDistrict,
        watchedState,
        watchedPincode,
        saveCoordinates,
      ],
    );

  // ===================================================
  // Direct Mobile / Desktop GPS
  // ===================================================

  const useCurrentLocation =
    useCallback(() => {
      if (
        typeof navigator ===
          "undefined" ||
        !navigator.geolocation
      ) {
        setLocationStatus(
          "error",
        );

        setLocationError(
          "Your device does not support location services.",
        );

        return;
      }

      setLocationStatus(
        "detecting",
      );

      setLocationError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat =
            position.coords.latitude;

          const lng =
            position.coords.longitude;

          if (
            !isValidCoordinate(
              lat,
              lng,
            )
          ) {
            setLocationStatus(
              "error",
            );

            setLocationError(
              "Your device returned an invalid location.",
            );

            return;
          }

          setLocationStatus(
            "success",
          );

          void handleProductLocationChange(
            lat,
            lng,
            "device",
          );
        },
        (error) => {
          console.error(
            "PRODUCT LOCATION ERROR:",
            error,
          );

          setLocationStatus(
            "error",
          );

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            setLocationError(
              "Location permission was denied. Please allow location access and try again.",
            );
          } else if (
            error.code ===
            error.TIMEOUT
          ) {
            setLocationError(
              "Location detection timed out. Please try again.",
            );
          } else {
            setLocationError(
              "Unable to detect your current location.",
            );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        },
      );
    }, [
      handleProductLocationChange,
    ]);

  // ===================================================
  // Stop Polling
  // ===================================================

  const stopMobilePolling =
    useCallback(() => {
      if (
        pollingRef.current
      ) {
        clearInterval(
          pollingRef.current,
        );

        pollingRef.current =
          null;
      }
    }, []);

  // ===================================================
  // Cancel Mobile Session
  // ===================================================

  const cancelMobileSession =
    useCallback(
      async () => {
        if (
          !mobileSession?.token
        ) {
          return;
        }

        try {
          await fetch(
            `/api/product-location/mobile-session?token=${encodeURIComponent(
              mobileSession.token,
            )}`,
            {
              method: "DELETE",
            },
          );
        } catch (error) {
          console.error(
            "CANCEL MOBILE LOCATION SESSION ERROR:",
            error,
          );
        }

        stopMobilePolling();

        setMobileSession(null);
        setMobileConnected(false);
        setMobileLocation(null);
      },
      [
        mobileSession,
        stopMobilePolling,
      ],
    );

  // ===================================================
  // Poll Mobile Session
  // ===================================================

  const pollMobileSession =
    useCallback(
      (
        token: string,
      ) => {
        stopMobilePolling();

        const check =
          async () => {
            try {
              const response =
                await fetch(
                  `/api/product-location/mobile-session?token=${encodeURIComponent(
                    token,
                  )}`,
                  {
                    cache: "no-store",
                  },
                );

              const data =
                await response.json();

              if (
                !response.ok
              ) {
                if (
                  response.status ===
                  410
                ) {
                  stopMobilePolling();

                  setMobileSessionError(
                    "The mobile location session has expired. Please generate a new QR code.",
                  );
                }

                return;
              }

              if (
                data.status ===
                "completed" &&
                data.mobileLocation
              ) {
                const location =
                  data.mobileLocation;

                const lat =
                  Number(
                    location.latitude,
                  );

                const lng =
                  Number(
                    location.longitude,
                  );

                const accuracy =
                  Number(
                    location.accuracy,
                  );

                if (
                  isValidCoordinate(
                    lat,
                    lng,
                  )
                ) {
                  stopMobilePolling();

                  setMobileConnected(
                    true,
                  );

                  setMobileLocation({
                    latitude: lat,
                    longitude: lng,
                    accuracy:
                      Number.isFinite(
                        accuracy,
                      )
                        ? accuracy
                        : 0,
                    capturedAt:
                      location.capturedAt ??
                      new Date().toISOString(),
                  });

                  setLocationStatus(
                    "success",
                  );

                  setLocationSource(
                    "mobile",
                  );

                  setLocationError("");

                  await handleProductLocationChange(
                    lat,
                    lng,
                    "mobile",
                  );
                }
              }

              if (
                data.status ===
                "expired"
              ) {
                stopMobilePolling();

                setMobileSessionError(
                  "The mobile location session has expired.",
                );
              }

              if (
                data.status ===
                "cancelled"
              ) {
                stopMobilePolling();

                setMobileSessionError(
                  "The mobile location session was cancelled.",
                );
              }
            } catch (error) {
              console.error(
                "MOBILE LOCATION POLLING ERROR:",
                error,
              );
            }
          };

        void check();

        pollingRef.current =
          setInterval(
            () => {
              void check();
            },
            2500,
          );
      },
      [
        handleProductLocationChange,
        stopMobilePolling,
      ],
    );

  // ===================================================
  // Create Mobile QR Session
  // ===================================================

  const createMobileSession =
    useCallback(
      async () => {
        try {
          setMobileSessionLoading(
            true,
          );

          setMobileSessionError("");

          stopMobilePolling();

          const response =
            await fetch(
              "/api/product-location/mobile-session",
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
            !data?.success ||
            !data?.token ||
            !data?.mobileUrl
          ) {
            throw new Error(
              data?.message ??
                "Unable to create mobile location session.",
            );
          }

          setMobileSession({
            token: data.token,
            mobileUrl:
              data.mobileUrl,
            expiresAt:
              data.expiresAt,
          });

          setMobileConnected(
            false,
          );

          setMobileLocation(
            null,
          );

          pollMobileSession(
            data.token,
          );
        } catch (error) {
          console.error(
            "CREATE MOBILE LOCATION SESSION ERROR:",
            error,
          );

          setMobileSessionError(
            error instanceof Error
              ? error.message
              : "Unable to create mobile location session.",
          );
        } finally {
          setMobileSessionLoading(
            false,
          );
        }
      },
      [
        pollMobileSession,
        stopMobilePolling,
      ],
    );

  // ===================================================
  // Cleanup
  // ===================================================

  useEffect(() => {
    return () => {
      stopMobilePolling();
    };
  }, [
    stopMobilePolling,
  ]);

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
          Set the actual place where your product
          is physically located.
        </p>
      </div>

      {/* =================================================
          Seller Instruction
      ================================================= */}

      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
            <MapPin size={24} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">
              Publish From the Actual Product Location
            </h3>

            <p className="mt-2 text-sm leading-6 text-blue-800 dark:text-blue-300">
              Whenever possible, publish this product
              from the place where the product is
              physically located.
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-700 dark:text-blue-400">
              This helps buyers reach the product
              more accurately using maps and navigation.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          Location Method
      ================================================= */}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Confirm Product Location
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choose the most accurate way to confirm
            where your product is physically located.
          </p>
        </div>

        {/* =================================================
            Mobile Device
        ================================================= */}

        {mobileDevice ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">

            <div className="flex items-start gap-3">

              <Smartphone
                size={22}
                className="mt-0.5 text-green-600"
              />

              <div>
                <h4 className="font-bold text-green-800 dark:text-green-300">
                  You are using a mobile device
                </h4>

                <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
                  For the best accuracy, allow location
                  access and confirm the product location
                  while you are physically there.
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={
                locationStatus ===
                "detecting"
              }
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1565d8] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {locationStatus ===
              "detecting" ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Detecting...
                </>
              ) : (
                <>
                  <Navigation size={18} />
                  Use My Live Location
                </>
              )}
            </button>

          </div>
        ) : (
          <>
            {/* =================================================
                Desktop
            ================================================= */}

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">

              <div className="flex items-start gap-3">

                <Smartphone
                  size={22}
                  className="mt-0.5 text-amber-600"
                />

                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-300">
                    For the most accurate location,
                    use your phone
                  </h4>

                  <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-400">
                    Desktop GPS can be less accurate.
                    If you are physically at the product
                    location, scan the QR code with your
                    phone and use your phone&apos;s GPS.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={
                  createMobileSession
                }
                disabled={
                  mobileSessionLoading
                }
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1565d8] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mobileSessionLoading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Preparing QR...
                  </>
                ) : (
                  <>
                    <QrCode size={18} />
                    Use My Phone for Accurate GPS
                  </>
                )}
              </button>

            </div>

            {/* =================================================
                QR Session
            ================================================= */}

            {mobileSession && (
              <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      Scan with your phone
                    </h4>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Open your phone camera and scan
                      this QR code.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      cancelMobileSession
                    }
                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-red-600 dark:hover:bg-slate-900"
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>

                </div>

                <div className="mt-6 flex flex-col items-center">

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
                    <QRCodeSVG
                      value={
                        mobileSession.mobileUrl
                      }
                      size={240}
                      level="H"
                      includeMargin
                    />
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#1565d8]">

                    {!mobileConnected ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Waiting for your phone...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={17}
                          className="text-green-600"
                        />
                        Phone connected
                      </>
                    )}

                  </div>

                  <p className="mt-3 max-w-md text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Keep this page open while your phone
                    detects the product location.
                  </p>

                </div>

              </div>
            )}

            {/* =================================================
                Mobile Connected
            ================================================= */}

            {mobileConnected &&
              mobileLocation && (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">

                  <div className="flex items-start gap-3">

                    <ShieldCheck
                      size={22}
                      className="mt-0.5 text-green-600"
                    />

                    <div className="flex-1">

                      <h4 className="font-bold text-green-800 dark:text-green-300">
                        Mobile GPS received successfully
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
                        Your phone&apos;s live GPS has
                        replaced the previous product
                        location.
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">

                        <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                          <p className="text-xs text-slate-500">
                            Latitude
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {mobileLocation.latitude.toFixed(
                              6,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                          <p className="text-xs text-slate-500">
                            Longitude
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            {mobileLocation.longitude.toFixed(
                              6,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                          <p className="text-xs text-slate-500">
                            GPS Accuracy
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            ±{" "}
                            {Math.round(
                              mobileLocation.accuracy,
                            )}{" "}
                            m
                          </p>
                        </div>

                      </div>

                    </div>
                  </div>

                </div>
              )}

          </>
        )}

        {/* =================================================
            Desktop GPS Fallback
        ================================================= */}

        {!mobileDevice && (
          <div className="mt-5">

            <div className="mb-3 text-center text-xs font-medium text-slate-400">
              Or use desktop GPS as a fallback
            </div>

            <button
              type="button"
              onClick={
                useCurrentLocation
              }
              disabled={
                locationStatus ===
                "detecting"
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {locationStatus ===
              "detecting" ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Detecting...
                </>
              ) : (
                <>
                  <Navigation size={18} />
                  Try Desktop GPS
                </>
              )}
            </button>

          </div>
        )}

      </div>

      {/* =================================================
          GPS Success
      ================================================= */}

      {locationStatus ===
        "success" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">

          <div className="flex items-start gap-3">

            <CheckCircle2
              size={22}
              className="mt-0.5 text-green-600"
            />

            <div>

              <h3 className="font-bold text-green-800 dark:text-green-300">
                Product location confirmed
              </h3>

              <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
                The latest verified product location
                is now being used for the map and
                buyer navigation.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          GPS Error
      ================================================= */}

      {locationError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">

          <p className="font-semibold text-red-800 dark:text-red-300">
            Location unavailable
          </p>

          <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-400">
            {locationError}
          </p>

        </div>
      )}

      {/* =================================================
          Address
      ================================================= */}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">

        <div className="mb-6">

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Product Address
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter the product address manually,
            then use &quot;Find on Map&quot; to locate it.
          </p>

        </div>

        <div className="space-y-5">

          {/* Country */}

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

          {/* State */}

          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
              State
            </label>

            <select
              {...register("state")}
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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
                {errors.state.message}
              </p>
            )}
          </div>

          {/* District */}

          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
              District
            </label>

            <input
              {...register("district")}
              placeholder="e.g. Hooghly"
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            {errors.district && (
              <p className="mt-2 text-sm text-red-500">
                {errors.district.message}
              </p>
            )}
          </div>

          {/* City */}

          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
              City / Town
            </label>

            <input
              {...register("city")}
              placeholder="e.g. Bansberia"
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            {errors.city && (
              <p className="mt-2 text-sm text-red-500">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* Pincode */}

          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
              Pincode
            </label>

            <input
              {...register("pincode")}
              placeholder="712502"
              inputMode="numeric"
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            {errors.pincode && (
              <p className="mt-2 text-sm text-red-500">
                {errors.pincode.message}
              </p>
            )}
          </div>

          {/* Full Address */}

          <div>
            <label className="mb-2 block font-medium text-slate-700 dark:text-slate-300">
              Full Address
            </label>

            <textarea
              rows={4}
              {...register("address")}
              placeholder="House / building / road / locality..."
              className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 outline-none focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            {errors.address && (
              <p className="mt-2 text-sm text-red-500">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Find On Map */}

          <div className="flex justify-end">

            <button
              type="button"
              onClick={
                findAddressOnMap
              }
              disabled={
                addressLoading
              }
              className="inline-flex items-center gap-2 rounded-2xl border border-[#1565d8] bg-white px-5 py-3 font-semibold text-[#1565d8] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              {addressLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Finding...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Find on Map
                </>
              )}
            </button>

          </div>

          {addressError && (
            <p className="text-sm font-medium text-red-600">
              {addressError}
            </p>
          )}

        </div>
      </div>

      {/* =================================================
          Map
      ================================================= */}

      <div className="space-y-4">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Product Location on Map
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              This pin represents the location buyers
              will use for navigation.
            </p>
          </div>

          {locationConfirmed && (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-600">
              <CheckCircle2 size={18} />
              Location confirmed
            </span>
          )}

        </div>

        <div className="relative h-[480px] w-full overflow-hidden rounded-3xl border border-slate-300 bg-slate-200 shadow-sm dark:border-slate-700 md:h-[560px]">

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={
              handleMapLocationChange
            }
          />

        </div>

      </div>

      {/* =================================================
          Coordinates
      ================================================= */}

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">

        <h3 className="font-semibold text-slate-900 dark:text-white">
          Confirmed Product Coordinates
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
          These coordinates belong to the product
          location and will be used for buyer navigation.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Latitude
            </label>

            <input
              readOnly
              value={latitude.toFixed(6)}
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">
              Longitude
            </label>

            <input
              readOnly
              value={longitude.toFixed(6)}
              className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

        </div>

        {/* Source */}

        <div className="mt-5 rounded-2xl bg-white p-4 dark:bg-slate-900">

          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Location source
          </p>

          <p className="mt-1 font-semibold capitalize text-slate-800 dark:text-slate-200">

            {locationSource ===
            "device"
              ? "Live device GPS"
              : locationSource ===
                  "mobile"
                ? "Mobile phone GPS"
                : locationSource ===
                    "address"
                  ? "Manual address search"
                  : locationSource ===
                      "map"
                    ? "Map selection"
                    : "Not selected"}

          </p>

        </div>

      </div>

      {/* =================================================
          Hidden Coordinates
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
          Your seller verification location is kept
          separate from the product location. Buyers
          will see the product location you confirm here,
          not your private verification coordinates.
        </p>

      </div>

    </section>
  );
}