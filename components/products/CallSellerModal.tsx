"use client";

import { useEffect } from "react";
import { Phone, Copy, X } from "lucide-react";

interface CallSellerModalProps {
  open: boolean;
  onClose: () => void;
  sellerName: string;
  phoneNumber: string;
}

export default function CallSellerModal({
  open,
  onClose,
  sellerName,
  phoneNumber,
}: CallSellerModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!open) return null;

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      alert("✅ Phone number copied.");
    } catch {
      alert("❌ Failed to copy phone number.");
    }
  };

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-[9999]

        flex
        items-center
        justify-center

        bg-black/50
        backdrop-blur-sm

        p-4
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full
          max-w-md

          rounded-3xl

          bg-white
          dark:bg-slate-900

          p-8

          shadow-2xl

          animate-in
          fade-in
          zoom-in-95
          duration-300
        "
      >
        {/* Close */}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="
              rounded-full
              p-2

              transition

              hover:bg-slate-100
              dark:hover:bg-slate-800
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* Icon */}

        <div className="flex justify-center">
          <div
            className="
              flex
              h-20
              w-20

              items-center
              justify-center

              rounded-full

              bg-green-100

              text-green-600
            "
          >
            <Phone size={34} />
          </div>
        </div>

        {/* Heading */}

        <h2 className="mt-6 text-center text-2xl font-bold">
          Call Seller
        </h2>

        <p className="mt-2 text-center text-slate-500">
          {sellerName}
        </p>

        {/* Phone */}

        <div
          className="
            mt-8

            rounded-2xl

            border

            border-slate-200

            bg-slate-50

            p-5

            text-center

            dark:border-slate-700
            dark:bg-slate-800
          "
        >
          <p className="text-sm text-slate-500">
            Seller Phone Number
          </p>

          <h3 className="mt-2 text-3xl font-bold tracking-wider">
            {phoneNumber}
          </h3>
        </div>

        {/* Buttons */}

        <div className="mt-8 space-y-3">

          {/* Copy */}

          <button
            onClick={copyNumber}
            className="
              flex
              h-12
              w-full

              items-center
              justify-center
              gap-2

              rounded-xl

              border

              border-slate-300

              font-semibold

              transition-all
              duration-300

              hover:bg-slate-100

              dark:border-slate-700
              dark:hover:bg-slate-800
            "
          >
            <Copy size={18} />

            Copy Number
          </button>

          {/* Call */}

          <a
            href={`tel:${phoneNumber}`}
            className="
              flex
              h-12
              w-full

              items-center
              justify-center
              gap-2

              rounded-xl

              bg-green-600

              font-semibold

              text-white

              transition-all
              duration-300

              hover:bg-green-700
            "
          >
            <Phone size={18} />

            Call Now
          </a>

          {/* Close */}

          <button
            onClick={onClose}
            className="
              flex
              h-12
              w-full

              items-center
              justify-center

              rounded-xl

              bg-slate-200

              font-semibold

              transition-all
              duration-300

              hover:bg-slate-300

              dark:bg-slate-700
              dark:hover:bg-slate-600
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}