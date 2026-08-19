"use client";

import { MapPinned, Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  latitude: number;
  longitude: number;
  address: string;
}

export default function ProductLocationActions({
  latitude,
  longitude,
  address,
}: Props) {
  const handleDirections = () => {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);

      toast.success("Address copied successfully.");
    } catch {
      toast.error("Failed to copy address.");
    }
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        onClick={handleDirections}
        className="
          flex
          h-12
          items-center
          justify-center
          gap-2

          rounded-xl

          bg-[#1565d8]

          font-semibold

          text-white

          transition-all
          duration-300

          hover:bg-[#0e55bb]
          hover:scale-[1.02]

          active:scale-95
        "
      >
        <MapPinned size={18} />

        Get Directions
      </button>

      <button
        onClick={copyAddress}
        className="
          flex
          h-12
          items-center
          justify-center
          gap-2

          rounded-xl

          border

          border-slate-300

          bg-white

          font-semibold

          text-slate-700

          transition-all
          duration-300

          hover:bg-slate-100
          hover:scale-[1.02]

          active:scale-95

          dark:border-slate-700
          dark:bg-slate-900
          dark:text-white
          dark:hover:bg-slate-800
        "
      >
        <Copy size={18} />

        Copy Address
      </button>
    </div>
  );
}