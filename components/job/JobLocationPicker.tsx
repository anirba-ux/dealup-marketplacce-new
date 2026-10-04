"use client";

import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

interface JobLocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (
    latitude: number,
    longitude: number,
  ) => void;
}

// =====================================================
// Marker Icon
// =====================================================

const jobMarkerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

  iconSize: [25, 41],

  iconAnchor: [12, 41],

  popupAnchor: [1, -34],

  shadowSize: [41, 41],
});

// =====================================================
// Default Map Center
// =====================================================

const DEFAULT_LATITUDE =
  22.9876;

const DEFAULT_LONGITUDE =
  88.3966;

// =====================================================
// Map Controller
// =====================================================

function MapController({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  const validCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  if (validCoordinates) {
    const currentCenter =
      map.getCenter();

    const difference =
      Math.abs(
        currentCenter.lat -
          latitude,
      ) +
      Math.abs(
        currentCenter.lng -
          longitude,
      );

    if (difference > 0.00001) {
      map.setView(
        [latitude, longitude],
        Math.max(
          map.getZoom(),
          14,
        ),
        {
          animate: true,
        },
      );
    }
  }

  return null;
}

// =====================================================
// Map Click Handler
// =====================================================

function LocationClickHandler({
  onLocationChange,
}: {
  onLocationChange: (
    latitude: number,
    longitude: number,
  ) => void;
}) {
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
// Component
// =====================================================

export default function JobLocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: JobLocationPickerProps) {
  const hasValidLocation =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  const center: [
    number,
    number,
  ] = hasValidLocation
    ? [latitude, longitude]
    : [
        DEFAULT_LATITUDE,
        DEFAULT_LONGITUDE,
      ];

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl">

      <MapContainer
        center={center}
        zoom={
          hasValidLocation
            ? 15
            : 10
        }
        scrollWheelZoom={true}
        className="h-full w-full"
      >

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationClickHandler
          onLocationChange={
            onLocationChange
          }
        />

        <MapController
          latitude={latitude}
          longitude={longitude}
        />

        {hasValidLocation && (
          <Marker
            position={[
              latitude,
              longitude,
            ]}
            icon={
              jobMarkerIcon
            }
            draggable={true}
            eventHandlers={{
              dragend: (
                event,
              ) => {
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
          />
        )}

      </MapContainer>

    </div>
  );
}