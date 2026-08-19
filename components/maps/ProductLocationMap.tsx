"use client";

import dynamic from "next/dynamic";

const Map = dynamic<Props>(
  () => import("./ProductMap"),
  {
    ssr: false,
    loading: () => (
      <div
        className="
          flex
          h-[350px]
          w-full
          animate-pulse
          items-center
          justify-center
          rounded-3xl
          bg-slate-200
          dark:bg-slate-800
        "
      >
        Loading Map...
      </div>
    ),
  }
);

interface Props {
  latitude: number;
  longitude: number;
}

export default function ProductLocationMap({
  latitude,
  longitude,
}: Props) {
  return (
    <Map
      latitude={latitude}
      longitude={longitude}
    />
  );
}