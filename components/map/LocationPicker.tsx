"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import {
  useEffect,
  useMemo,
} from "react";

import {
  Expand,
  LocateFixed,
} from "lucide-react";

// =====================================================
// Props
// =====================================================

interface LocationPickerProps {
  latitude: number;

  longitude: number;

  onLocationChange: (
    latitude: number,
    longitude: number,
  ) => void;
}

// =====================================================
// Product Marker
// =====================================================

const productIcon =
  L.divIcon({
    className:
      "dealup-product-marker",

    html: `
      <div
        style="
          width:46px;
          height:46px;
          border-radius:50%;
          background:#1565d8;
          border:4px solid white;
          box-shadow:0 5px 18px rgba(0,0,0,.28);
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-size:21px;
        "
      >
        📦
      </div>
    `,

    iconSize: [
      46,
      46,
    ],

    iconAnchor: [
      23,
      23,
    ],

    popupAnchor: [
      0,
      -25,
    ],
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
      !Number.isFinite(
        latitude,
      ) ||
      !Number.isFinite(
        longitude,
      )
    ) {
      return;
    }

    map.setView(
      [
        latitude,
        longitude,
      ],
      map.getZoom() < 10
        ? 15
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
// Main Component
// =====================================================

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
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
      const event =
        new CustomEvent(
          "dealup-center-product",
        );

      window.dispatchEvent(
        event,
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
        center={
          productPosition
        }
        zoom={15}
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
            Map Center
        ================================================= */}

        <MapCenterController
          latitude={
            safeLatitude
          }
          longitude={
            safeLongitude
          }
        />

        {/* =================================================
            Map Click
        ================================================= */}

        <MapClickHandler
          onLocationChange={
            onLocationChange
          }
        />

        {/* =================================================
            Product Marker
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
            <div className="min-w-[210px]">
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
                Drag the marker or click
                anywhere on the map to
                choose the exact place
                where the product is
                located.
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* =================================================
          MAP CONTROLS
      ================================================= */}

      <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
        {/* ===============================================
            Fullscreen
        =============================================== */}

        <button
          type="button"
          onClick={
            handleFullscreen
          }
          title="Open fullscreen map"
          aria-label="Open fullscreen map"
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-slate-700
            shadow-lg
            transition
            hover:bg-slate-50
          "
        >
          <Expand
            size={20}
          />
        </button>

        {/* ===============================================
            Center Product
        =============================================== */}

        <button
          type="button"
          onClick={
            handleCenterProduct
          }
          title="Center product location"
          aria-label="Center product location"
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-[#1565d8]
            shadow-lg
            transition
            hover:bg-blue-50
          "
        >
          <LocateFixed
            size={20}
          />
        </button>
      </div>

      {/* =================================================
          Map Instruction
      ================================================= */}

      <div className="absolute bottom-4 left-4 z-[1000] max-w-[290px]">
        <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            📍 Select Product Location
          </p>

          <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            Click the map or drag the
            marker to fine-tune the
            product location.
          </p>
        </div>
      </div>
    </div>
  );
}