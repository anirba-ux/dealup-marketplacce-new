"use client";

import { useState } from "react";
import { Phone, Copy, X, User } from "lucide-react";

interface ContactDialogProps {
  name?: string;
  phone?: string;
  image?: string;
}

export default function ContactDialog({
  name,
  phone,
  image,
}: ContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    if (!phone) return;

    await navigator.clipboard.writeText(phone);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <>
      {/* Phone Icon */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Phone size={18} />
      </button>

      {open && (
        <>
          {/* Background */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />

          {/* Dialog */}
          <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            {/* Avatar */}
            <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-slate-200">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600">
                  <User size={30} />
                </div>
              )}
            </div>

            {/* Name */}
            <h2 className="mt-4 text-center text-xl font-bold">
              {name || "Unknown User"}
            </h2>

            {/* Phone */}
            <p className="mt-2 text-center text-slate-500">
              {phone || "No phone number"}
            </p>

            {/* Buttons */}
            <div className="mt-6 space-y-3">
              <a
                href={phone ? `tel:${phone}` : "#"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
              >
                <Phone size={18} />
                Call
              </a>

              <button
                onClick={copyNumber}
                disabled={!phone}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Copy size={18} />
                {copied ? "Copied!" : "Copy Number"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
