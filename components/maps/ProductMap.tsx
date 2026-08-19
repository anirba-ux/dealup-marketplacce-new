"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";

import {
  Expand,
  LocateFixed,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import FullscreenMapModal from "./FullscreenMapModal";

import MapTooltip from "./MapTooltip";

import {
  calculateDistance,
} from "@/lib/utils/distance";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// =====================================================
// Props
// =====================================================

interface Props {
  latitude: number;
  longitude: number;
}

// =====================================================
// Marker Icons
// =====================================================

const sellerMarker =
  new L.Icon({
    iconUrl:
      "/markers/seller-location.png",

    iconSize: [40, 40],

    iconAnchor: [20, 40],

    popupAnchor: [0, -40],
  });

const buyerMarker =
  new L.Icon({
    iconUrl:
      "/markers/buyer-location.png",

    iconSize: [40, 40],

    iconAnchor: [20, 40],

    popupAnchor: [0, -40],
  });

// =====================================================
// Main Product Map
// =====================================================

export default function ProductMap({
  latitude,
  longitude,
}: Props) {
  // ===================================================
  // Validate Product Coordinates
  // ===================================================

  const validLatitude =
    Number(latitude);

  const validLongitude =
    Number(longitude);

  const hasValidCoordinates =
    Number.isFinite(
      validLatitude,
    ) &&
    Number.isFinite(
      validLongitude,
    ) &&
    validLatitude >= -90 &&
    validLatitude <= 90 &&
    validLongitude >= -180 &&
    validLongitude <= 180;

  // ===================================================
  // Debug
  // ===================================================

  useEffect(() => {
    console.log(
      "🗺️ PRODUCT MAP COORDINATES:",
      {
        latitude:
          validLatitude,

        longitude:
          validLongitude,
      },
    );
  }, [
    validLatitude,
    validLongitude,
  ]);

  // ===================================================
  // State
  // ===================================================

  const [
    fullscreenOpen,
    setFullscreenOpen,
  ] = useState(false);

  const [
    userLocation,
    setUserLocation,
  ] = useState<
    [number, number] | null
  >(null);

  const [
    distance,
    setDistance,
  ] = useState<
    number | null
  >(null);

  const [
    showFullscreenTooltip,
    setShowFullscreenTooltip,
  ] = useState(false);

  const [
    showLocationTooltip,
    setShowLocationTooltip,
  ] = useState(false);

  // ===================================================
  // Map Ref
  // ===================================================

  const mapRef =
    useRef<L.Map | null>(
      null,
    );

  // ===================================================
  // Get Buyer Current Location
  // ===================================================

  const getCurrentLocation =
    () => {
      if (
        !navigator.geolocation
      ) {
        alert(
          "Geolocation is not supported on this device.",
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const buyerLatitude =
            position.coords
              .latitude;

          const buyerLongitude =
            position.coords
              .longitude;

          setUserLocation([
            buyerLatitude,
            buyerLongitude,
          ]);

          // =============================================
          // Distance
          //
          // Product coordinates are ALWAYS used
          // as destination.
          // =============================================

          const km =
            calculateDistance(
              buyerLatitude,
              buyerLongitude,
              validLatitude,
              validLongitude,
            );

          console.log(
            "📏 Distance from buyer to product:",
            km,
          );

          setDistance(km);
        },

        () => {
          alert(
            "Unable to get your current location.",
          );
        },

        {
          enableHighAccuracy: true,

          timeout: 15000,

          maximumAge: 0,
        },
      );
    };

  // ===================================================
  // Fit Buyer + Product Location
  // ===================================================

  useEffect(() => {
    if (
      !mapRef.current ||
      !userLocation ||
      !hasValidCoordinates
    ) {
      return;
    }

    const bounds =
      L.latLngBounds([
        [
          validLatitude,
          validLongitude,
        ],

        userLocation,
      ]);

    mapRef.current.fitBounds(
      bounds,
      {
        padding: [
          60,
          60,
        ],
      },
    );
  }, [
    userLocation,
    validLatitude,
    validLongitude,
    hasValidCoordinates,
  ]);

  // ===================================================
  // Invalid Coordinates
  // ===================================================

  if (
    !hasValidCoordinates
  ) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
        <div>
          <p className="font-semibold text-red-700">
            Product location is unavailable.
          </p>

          <p className="mt-2 text-sm text-red-600">
            Valid product coordinates
            were not found.
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // Render
  // ===================================================

  return (
    <>
      <div className="relative">

        {/* =================================================
            Fullscreen Button
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            setFullscreenOpen(true)
          }
          onMouseEnter={() =>
            setShowFullscreenTooltip(
              true,
            )
          }
          onMouseLeave={() =>
            setShowFullscreenTooltip(
              false,
            )
          }
          className="
            absolute
            right-3
            top-3
            z-[1000]
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-white/95
            shadow-lg
            transition-all
            hover:bg-[#1565d8]
            hover:text-white
            dark:bg-slate-900
            dark:text-white
          "
        >
          <Expand size={18} />

          <MapTooltip
            text="Open Fullscreen Map"
            visible={
              showFullscreenTooltip
            }
          />
        </button>

        {/* =================================================
            Buyer Current Location
        ================================================= */}

        <button
          type="button"
          onClick={
            getCurrentLocation
          }
          onMouseEnter={() =>
            setShowLocationTooltip(
              true,
            )
          }
          onMouseLeave={() =>
            setShowLocationTooltip(
              false,
            )
          }
          className="
            absolute
            right-3
            top-16
            z-[9999]
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-white/95
            shadow-lg
            transition
            hover:bg-[#1565d8]
            hover:text-white
            dark:bg-slate-900
            dark:text-white
          "
        >
          <LocateFixed size={18} />

          <MapTooltip
            text="Show My Location"
            visible={
              showLocationTooltip
            }
          />
        </button>

        {/* =================================================
            Map
        ================================================= */}

        <MapContainer
          center={[
            validLatitude,
            validLongitude,
          ]}
          zoom={15}
          scrollWheelZoom
          className="h-[350px] w-full rounded-3xl"
          ref={mapRef}
        >
          {/* ===============================================
              OpenStreetMap
          =============================================== */}

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ===============================================
              PRODUCT LOCATION
              
              IMPORTANT:
              This is the ONLY destination
              used by the buyer.
          =============================================== */}

          <Marker
            position={[
              validLatitude,
              validLongitude,
            ]}
            icon={
              sellerMarker
            }
          >
            <Tooltip
              permanent
              direction="bottom"
              offset={[
                0,
                12,
              ]}
              className="!border-0 !bg-transparent !shadow-none"
            >
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                Product
              </span>
            </Tooltip>

            <Popup className="rounded-xl">
              <div className="min-w-[190px] p-1">

                <h3 className="font-bold text-slate-900">
                  📍 Product Location
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  This is the location
                  selected for this
                  product.
                </p>

                {/* =========================================
                    Navigation
                ========================================= */}

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${validLatitude},${validLongitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-3
                    inline-flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-[#1565d8]
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    !text-white
                    no-underline
                    transition
                    hover:bg-[#0e55bb]
                    hover:!text-white
                    active:scale-95
                  "
                >
                  🧭

                  <span className="!text-white">
                    Get Directions
                  </span>
                </a>

              </div>
            </Popup>
          </Marker>

          {/* ===============================================
              BUYER LOCATION
              
              This marker is ONLY the buyer's
              current position.
          =============================================== */}

          {userLocation && (
            <Marker
              position={
                userLocation
              }
              icon={
                buyerMarker
              }
            >
              <Tooltip
                permanent
                direction="bottom"
                offset={[
                  0,
                  12,
                ]}
                className="!border-0 !bg-transparent !shadow-none"
              >
                <span className="rounded-full bg-[#1565d8] px-3 py-1 text-xs font-semibold text-white">
                  You
                </span>
              </Tooltip>

              <Popup>
                📍 Your Current
                Location
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* =================================================
            Distance
        ================================================= */}

        {distance !== null && (
          <div
            className="
              absolute
              bottom-4
              left-4
              z-[1000]
              w-[240px]
              rounded-2xl
              border
              border-slate-200
              bg-white/95
              p-4
              shadow-lg
              backdrop-blur
              dark:border-slate-700
              dark:bg-slate-900/95
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Distance from your
                  location
                </p>

                <p className="mt-1 text-lg font-bold text-[#1565d8]">
                  🚶{" "}
                  {distance.toFixed(
                    2,
                  )}{" "}
                  KM Away
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDistance(
                    null,
                  );

                  setUserLocation(
                    null,
                  );
                }}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  text-slate-500
                  transition
                  hover:bg-slate-100
                  hover:text-red-600
                  dark:hover:bg-slate-800
                "
              >
                ✕
              </button>

            </div>
          </div>
        )}
      </div>

      {/* =================================================
          Fullscreen Map
      ================================================= */}

      <FullscreenMapModal
        open={
          fullscreenOpen
        }
        onClose={() =>
          setFullscreenOpen(
            false,
          )
        }
        latitude={
          validLatitude
        }
        longitude={
          validLongitude
        }
        address={`Product Location: ${validLatitude}, ${validLongitude}`}
      />
    </>
  );
}