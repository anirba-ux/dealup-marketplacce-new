"use client";

import { useEffect, useState } from "react";

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function useCurrentLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");

      setLoading(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLoading(false);
      },

      () => {
        setError("Unable to get your location.");

        setLoading(false);
      },
    );
  }, []);

  return {
    location,
    loading,
    error,
  };
}