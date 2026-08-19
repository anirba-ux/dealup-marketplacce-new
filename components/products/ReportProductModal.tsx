"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { X, Flag } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;

  productId: string;
  sellerId: string;
  reportedBy: string;
}

export default function ReportProductModal({
  open,
  onClose,
  productId,
  sellerId,
  reportedBy,
}: Props) {
  const [reason, setReason] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!open) return null;

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

bg-black/60
backdrop-blur-md

px-4
py-6

overflow-hidden

animate-in
fade-in
duration-300
"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
relative

w-full
max-w-lg

sm:max-w-xl

lg:max-w-2xl

max-h-[90vh]

overflow-hidden

rounded-3xl

border
border-slate-200

bg-white

shadow-[0_25px_80px_rgba(0,0,0,0.18)]

dark:border-slate-700
dark:bg-slate-900

animate-in
zoom-in-95
duration-300
"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <Flag size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Report Product
              </h2>

              <p className="text-sm text-slate-500">
                Help us keep DealUp safe.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}

        <div
          className="
    space-y-6
    p-6

    max-h-[60vh]
    overflow-y-auto
  "
        >
          {/* Reason */}

          <div>
            <label className="mb-3 block text-sm font-semibold">
              Why are you reporting this product?
            </label>

            <div className="space-y-3">
              {[
                ["spam", "Spam or misleading"],
                ["fake", "Fake product"],
                ["duplicate", "Duplicate listing"],
                ["wrong_category", "Wrong category"],
                ["scam", "Scam or fraud"],
                ["sold", "Already sold"],
                ["other", "Other"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="
flex
cursor-pointer
items-center
gap-3

rounded-xl

border

border-slate-200

p-3

transition

border-slate-200

bg-white

hover:border-[#1565d8]

hover:bg-blue-50

dark:border-slate-700

dark:bg-slate-800

dark:hover:border-blue-500

dark:hover:bg-slate-700

dark:border-slate-700
dark:hover:bg-slate-800
"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={value}
                    checked={reason === value}
                    onChange={(e) => setReason(e.target.value)}
                  />

                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Message */}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Additional Details (Optional)
            </label>

            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={300}
              placeholder="Tell us more..."
              className="
w-full

rounded-xl

border

border-slate-300

p-4

outline-none

transition

focus:border-[#1565d8]

dark:border-slate-700
dark:bg-slate-800
"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {message.length}/300
            </p>
          </div>
          {/* Footer */}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
        rounded-xl
        border
        border-slate-300
        px-5
        py-3

        font-semibold

        transition

        hover:bg-slate-100

        disabled:opacity-50

        dark:border-slate-700
        dark:hover:bg-slate-800
      "
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!reason || loading}
              onClick={async () => {
                try {
                  setLoading(true);

                  const response = await fetch("/api/report", {
                    method: "POST",

                    headers: {
                      "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                      productId,
                      sellerId,
                      reportedBy,
                      reason,
                      message,
                    }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.message);
                  }

                  toast.success("Report submitted successfully.", {
                    description: "Thanks for helping keep DealUp safe.",
                  });

                  setReason("");
                  setMessage("");

                  onClose();
                } catch (error) {
                  console.error(error);

                  toast.error("Failed to submit report.", {
                    description: "Please try again.",
                  });
                } finally {
                  setLoading(false);
                }
              }}
              className="
        rounded-xl

        bg-red-600

        px-5
        py-3

        font-semibold

        text-white

        transition

        hover:bg-red-700

        disabled:cursor-not-allowed
        disabled:opacity-50
      "
            >
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
