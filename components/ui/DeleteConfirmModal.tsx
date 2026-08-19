"use client";

import { useState } from "react";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;

  title?: string;
  description?: string;
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Delete Conversation",
  description = "Are you sure you want to remove this conversation? This won't permanently delete your messages. The conversation will automatically reappear if a new message is sent.",
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleDelete() {
    try {
      setLoading(true);

      await onConfirm();

      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={loading ? undefined : onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900">

          <div className="border-b border-slate-200 p-6 dark:border-slate-700">
            <h2 className="text-lg font-semibold">
              {title}
            </h2>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex justify-end gap-3 p-6">

            <button
              disabled={loading}
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>

          </div>
        </div>
      </div>
    </>
  );
}