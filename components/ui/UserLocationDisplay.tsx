"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

type LocationData = {
  city: string;
  district: string;
  state: string;
};

type Props = {
  variant?: "desktop" | "mobile";
};

type GeocodeResponse = {
  success?: boolean;
  address?: {
    city?: string;
    town?: string;
    municipality?: string;
    village?: string;
    state_district?: string;
    county?: string;
    district?: string;
    state?: string;
  };
  displayName?: string;
};

export default function UserLocationDisplay({
  variant = "desktop",
}: Props) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLocation() {
      try {
        // =========================================
        // 1. FIRST — PROFILE LOCATION
        // =========================================

        const profileRes = await fetch("/api/profile", {
          cache: "no-store",
        });

        const profileData = await profileRes.json();

        if (profileData.success) {
          const address = profileData.user?.address;

          const city = address?.city?.trim() || "";
          const district = address?.district?.trim() || "";
          const state = address?.state?.trim() || "";

          // Profile location has priority
          if (city && district) {
            if (!cancelled) {
              setLocation({
                city,
                district,
                state,
              });

              setLoading(false);
            }

            return;
          }
        }

        // =========================================
        // 2. FALLBACK — CURRENT GPS LOCATION
        // =========================================

        if (!navigator.geolocation) {
          if (!cancelled) {
            setLoading(false);
          }

          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;

              const response = await fetch(
                `/api/geocode?mode=reverse&lat=${latitude}&lng=${longitude}`,
                {
                  cache: "no-store",
                },
              );

              const data: GeocodeResponse = await response.json();

              const address = data.address;

              const city =
                address?.city ||
                address?.town ||
                address?.municipality ||
                address?.village ||
                "";

              const district =
                address?.state_district ||
                address?.county ||
                address?.district ||
                "";

              const state = address?.state || "";

              if (!cancelled && city) {
                setLocation({
                  city,
                  district,
                  state,
                });
              }
            } catch (error) {
              console.error(
                "CURRENT LOCATION GEOCODE ERROR:",
                error,
              );
            } finally {
              if (!cancelled) {
                setLoading(false);
              }
            }
          },
          (error) => {
            console.warn("CURRENT LOCATION ERROR:", error);

            if (!cancelled) {
              setLoading(false);
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 5 * 60 * 1000,
          },
        );
      } catch (error) {
        console.error("USER LOCATION ERROR:", error);

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================
  // MOBILE
  // =========================================

  if (variant === "mobile") {
    if (loading) {
      return (
        <div className="flex w-[72px] flex-col items-center justify-center">
          <MapPin
            size={18}
            strokeWidth={2}
            className="text-slate-600 dark:text-slate-300"
          />

          <span className="mt-0.5 text-center text-[8px] font-medium leading-[9px] text-slate-500 dark:text-slate-400">
            Locating...
          </span>
        </div>
      );
    }

    if (!location?.city) {
      return (
        <div className="flex w-[72px] flex-col items-center justify-center">
          <MapPin
            size={18}
            strokeWidth={2}
            className="text-slate-600 dark:text-slate-300"
          />

          <span className="mt-0.5 text-center text-[8px] font-medium leading-[9px] text-slate-500 dark:text-slate-400">
            Location
          </span>
        </div>
      );
    }

    return (
      <div className="flex w-[72px] flex-col items-center justify-center">
        {/* Location Icon */}
        <MapPin
          size={18}
          strokeWidth={2}
          className="shrink-0 text-[#1565d8]"
        />

        {/* City */}
        <span className="mt-0.5 max-w-full truncate text-center text-[9px] font-semibold leading-[10px] text-slate-700 dark:text-slate-200">
          {location.city},
        </span>

        {/* District */}
        {location.district && (
          <span className="max-w-full truncate text-center text-[9px] font-medium leading-[10px] text-slate-500 dark:text-slate-400">
            {location.district}
          </span>
        )}
      </div>
    );
  }

  // =========================================
  // DESKTOP
  // =========================================

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <MapPin
          size={15}
          strokeWidth={2}
          className="shrink-0 text-[#1565d8]"
        />

        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Locating...
        </span>
      </div>
    );
  }

  if (!location?.city) {
    return (
      <div className="flex items-center gap-2">
        <MapPin
          size={15}
          strokeWidth={2}
          className="shrink-0 text-[#1565d8]"
        />

        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Location unavailable
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MapPin
        size={15}
        strokeWidth={2}
        className="shrink-0 text-[#1565d8]"
      />

      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
          {location.city},
        </span>

        {location.district && (
          <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {location.district}
          </span>
        )}
      </div>
    </div>
  );
}