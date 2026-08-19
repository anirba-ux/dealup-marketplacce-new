"use client";

import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import { useEffect, useMemo } from "react";

import {
  Expand,
  LocateFixed,
  Smartphone,
} from "lucide-react";

// =====================================================
// Props
// =====================================================

interface LocationPickerProps {
  latitude: number;
  longitude: number;

  liveLatitude?: number | null;
  liveLongitude?: number | null;
  liveAccuracy?: number | null;

  onLocationChange: (
    latitude: number,
    longitude: number,
  ) => void;

  onMobileVerificationRequired?: () => void;
}

// =====================================================
// Product Marker
// =====================================================

const productIcon = L.divIcon({
  className: "dealup-product-marker",

  html: `
    <div
      style="
        width:42px;
        height:42px;
        border-radius:50%;
        background:#1565d8;
        border:4px solid white;
        box-shadow:0 4px 14px rgba(0,0,0,.3);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:20px;
      "
    >
      📦
    </div>
  `,

  iconSize: [42, 42],

  iconAnchor: [21, 21],

  popupAnchor: [0, -24],
});

// =====================================================
// Live GPS Marker
// =====================================================

const liveLocationIcon =
  L.divIcon({
    className:
      "dealup-live-location-marker",

    html: `
      <div
        style="
          position:relative;
          width:30px;
          height:30px;
        "
      >
        <div
          style="
            position:absolute;
            inset:-8px;
            border-radius:50%;
            background:rgba(34,197,94,.20);
          "
        ></div>

        <div
          style="
            position:absolute;
            inset:4px;
            border-radius:50%;
            background:#16a34a;
            border:4px solid white;
            box-shadow:0 3px 12px rgba(0,0,0,.3);
          "
        ></div>
      </div>
    `,

    iconSize: [30, 30],

    iconAnchor: [15, 15],

    popupAnchor: [0, -15],
  });

// =====================================================
// Map Center Controller
// =====================================================

interface MapCenterControllerProps {
  latitude: number;
  longitude: number;
}

function MapCenterController({
  latitude,
  longitude,
}: MapCenterControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    map.setView(
      [latitude, longitude],
      map.getZoom() < 10
        ? 14
        : map.getZoom(),
      {
        animate: true,
      },
    );
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
}

// =====================================================
// Map Click Handler
// =====================================================

interface MapClickHandlerProps {
  onLocationChange: (
    latitude: number,
    longitude: number,
  ) => void;
}

function MapClickHandler({
  onLocationChange,
}: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      onLocationChange(
        event.latlng.lat,
        event.latlng.lng,
      );
    },
  });

  return null;
}

// =====================================================
// Map Control Component
// =====================================================

interface MapControlProps {
  latitude: number;
  longitude: number;

  liveLatitude?: number | null;
  liveLongitude?: number | null;
}

function MapControl({
  latitude,
  longitude,
  liveLatitude,
  liveLongitude,
}: MapControlProps) {
  const map = useMap();

  // ================================================
  // Center Product
  // ================================================

  useEffect(() => {
    const handleProductCenter =
      () => {
        map.setView(
          [latitude, longitude],
          15,
          {
            animate: true,
          },
        );
      };

    window.addEventListener(
      "dealup-center-product",
      handleProductCenter,
    );

    return () => {
      window.removeEventListener(
        "dealup-center-product",
        handleProductCenter,
      );
    };
  }, [
    map,
    latitude,
    longitude,
  ]);

  // ================================================
  // Center Live Location
  // ================================================

  useEffect(() => {
    const handleLiveCenter =
      () => {
        if (
          liveLatitude ===
            null ||
          liveLatitude ===
            undefined ||
          liveLongitude ===
            null ||
          liveLongitude ===
            undefined
        ) {
          return;
        }

        map.setView(
          [
            liveLatitude,
            liveLongitude,
          ],
          15,
          {
            animate: true,
          },
        );
      };

    window.addEventListener(
      "dealup-center-live-location",
      handleLiveCenter,
    );

    return () => {
      window.removeEventListener(
        "dealup-center-live-location",
        handleLiveCenter,
      );
    };
  }, [
    map,
    liveLatitude,
    liveLongitude,
  ]);

  return null;
}

// =====================================================
// Main Location Picker
// =====================================================

export default function LocationPicker({
  latitude,
  longitude,
  liveLatitude = null,
  liveLongitude = null,
  liveAccuracy = null,
  onLocationChange,
  onMobileVerificationRequired,
}: LocationPickerProps) {
  // ===================================================
  // Safe Coordinates
  // ===================================================

  const safeLatitude =
    Number.isFinite(latitude)
      ? latitude
      : 22.9765;

  const safeLongitude =
    Number.isFinite(longitude)
      ? longitude
      : 88.4011;

  // ===================================================
  // Product Position
  // ===================================================

  const productPosition =
    useMemo<
      [number, number]
    >(
      () => [
        safeLatitude,
        safeLongitude,
      ],
      [
        safeLatitude,
        safeLongitude,
      ],
    );

  // ===================================================
  // Live Position
  // ===================================================

  const livePosition =
    liveLatitude !== null &&
    liveLongitude !== null &&
    Number.isFinite(
      liveLatitude,
    ) &&
    Number.isFinite(
      liveLongitude,
    )
      ? ([
          liveLatitude,
          liveLongitude,
        ] as [
          number,
          number,
        ])
      : null;

  // ===================================================
  // Fullscreen
  // ===================================================

  const handleFullscreen =
    () => {
      const element =
        document.getElementById(
          "dealup-location-map",
        );

      if (!element) {
        return;
      }

      if (
        document.fullscreenElement
      ) {
        void document.exitFullscreen();

        return;
      }

      void element.requestFullscreen();
    };

  // ===================================================
  // Center Product
  // ===================================================

  const handleCenterProduct =
    () => {
      window.dispatchEvent(
        new CustomEvent(
          "dealup-center-product",
        ),
      );
    };

  // ===================================================
  // Center Live GPS
  // ===================================================

  const handleCenterLive =
    () => {
      if (!livePosition) {
        return;
      }

      window.dispatchEvent(
        new CustomEvent(
          "dealup-center-live-location",
        ),
      );
    };

  // ===================================================
  // Render
  // ===================================================

  return (
    <div
      id="dealup-location-map"
      className="relative h-full w-full"
    >

      {/* =================================================
          MAP
      ================================================= */}

      <MapContainer
        center={productPosition}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >

        {/* =================================================
            OpenStreetMap
        ================================================= */}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* =================================================
            Map Controllers
        ================================================= */}

        <MapCenterController
          latitude={
            safeLatitude
          }
          longitude={
            safeLongitude
          }
        />

        <MapControl
          latitude={
            safeLatitude
          }
          longitude={
            safeLongitude
          }
          liveLatitude={
            liveLatitude
          }
          liveLongitude={
            liveLongitude
          }
        />

        {/* =================================================
            Click Map
        ================================================= */}

        <MapClickHandler
          onLocationChange={
            onLocationChange
          }
        />

        {/* =================================================
            PRODUCT MARKER
        ================================================= */}

        <Marker
          position={
            productPosition
          }
          icon={
            productIcon
          }
          draggable={true}
          eventHandlers={{
            dragend(event) {
              const marker =
                event.target;

              const position =
                marker.getLatLng();

              onLocationChange(
                position.lat,
                position.lng,
              );
            },
          }}
        >

          <Popup>

            <div className="min-w-[190px]">

              <p className="font-bold text-slate-900">
                📦 Product Location
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Latitude:{" "}
                {safeLatitude.toFixed(
                  6,
                )}
              </p>

              <p className="text-xs text-slate-500">
                Longitude:{" "}
                {safeLongitude.toFixed(
                  6,
                )}
              </p>

              <p className="mt-3 text-xs leading-5 text-slate-600">
                Drag this marker or click
                anywhere on the map to select
                the product location.
              </p>

            </div>

          </Popup>

        </Marker>

        {/* =================================================
            LIVE SELLER GPS
        ================================================= */}

        {livePosition && (
          <>
            {/* GPS Accuracy Circle */}

            <Circle
              center={
                livePosition
              }
              radius={
                liveAccuracy &&
                liveAccuracy > 0
                  ? liveAccuracy
                  : 20
              }
              pathOptions={{
                color:
                  "#16a34a",

                fillColor:
                  "#22c55e",

                fillOpacity:
                  0.12,

                weight: 2,
              }}
            />

            {/* Live Marker */}

            <Marker
              position={
                livePosition
              }
              icon={
                liveLocationIcon
              }
            >

              <Popup>

                <div className="min-w-[190px]">

                  <p className="font-bold text-green-700">
                    📍 Your Live Location
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Latitude:{" "}
                    {liveLatitude?.toFixed(
                      6,
                    )}
                  </p>

                  <p className="text-xs text-slate-500">
                    Longitude:{" "}
                    {liveLongitude?.toFixed(
                      6,
                    )}
                  </p>

                  {liveAccuracy !==
                    null &&
                    liveAccuracy >
                      0 && (
                      <p className="mt-3 text-xs font-semibold text-green-700">
                        GPS Accuracy:{" "}
                        {Math.round(
                          liveAccuracy,
                        )}{" "}
                        metres
                      </p>
                    )}

                </div>

              </Popup>

            </Marker>
          </>
        )}

      </MapContainer>

      {/* =================================================
          MAP CONTROLS
      ================================================= */}

      <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">

        {/* Fullscreen */}

        <button
          type="button"
          onClick={
            handleFullscreen
          }
          title="Fullscreen Map"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg transition hover:bg-slate-50"
        >
          <Expand
            size={20}
          />
        </button>

        {/* Product */}

        <button
          type="button"
          onClick={
            handleCenterProduct
          }
          title="Product Location"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#1565d8] shadow-lg transition hover:bg-blue-50"
        >
          <LocateFixed
            size={20}
          />
        </button>

        {/* Live */}

        {livePosition && (
          <button
            type="button"
            onClick={
              handleCenterLive
            }
            title="My Live Location"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-200 bg-white text-green-600 shadow-lg transition hover:bg-green-50"
          >
            <LocateFixed
              size={20}
            />
          </button>
        )}

      </div>

      {/* =================================================
          LEGEND
      ================================================= */}

      <div className="absolute bottom-4 left-4 z-[1000]">

        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">

          <div className="flex items-center gap-4">

            {/* Product */}

            <div className="flex items-center gap-2">

              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                📦
              </span>

              <div>

                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Product
                </p>

                <p className="text-[11px] text-slate-500">
                  Selected location
                </p>

              </div>

            </div>

            {/* Live GPS */}

            {livePosition && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4 dark:border-slate-700">

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  📍
                </span>

                <div>

                  <p className="text-xs font-semibold text-green-700">
                    Live GPS
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Seller device
                  </p>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* =================================================
          MOBILE VERIFICATION
      ================================================= */}

      {onMobileVerificationRequired && (
        <div className="absolute bottom-4 right-4 z-[1000]">

          <button
            type="button"
            onClick={
              onMobileVerificationRequired
            }
            className="flex items-center gap-2 rounded-2xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-[#0f52ba] hover:shadow-2xl"
          >

            <Smartphone
              size={18}
            />

            Verify with Mobile

          </button>

        </div>
      )}

    </div>
  );
}