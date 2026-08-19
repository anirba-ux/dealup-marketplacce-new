"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  User,
  Package,
  BellOff,
  Bell,
  Share2,
  Trash2,
} from "lucide-react";

import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface ChatMenuProps {
  isMuted?: boolean;

  onViewProfile?: () => void;
  onViewProduct?: () => void;
  onMute?: () => void;
  onShare?: () => void;
  onDelete?: () => Promise<void> | void;
}

export default function ChatMenu({
  isMuted = false,
  onViewProfile,
  onViewProduct,
  onMute,
  onShare,
  onDelete,
}: ChatMenuProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">

            <button
              onClick={onViewProfile}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <User size={18} />
              View Seller Profile
            </button>

            <button
              onClick={onViewProduct}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Package size={18} />
              View Product
            </button>

            <button
              onClick={onMute}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMuted ? <Bell size={18} /> : <BellOff size={18} />}
              {isMuted ? "Unmute Notifications" : "Mute Notifications"}
            </button>

            <button
              onClick={onShare}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Share2 size={18} />
              Share Product
            </button>

            <hr className="border-slate-200 dark:border-slate-700" />

            <button
              onClick={() => {
                setOpen(false);
                setShowDeleteModal(true);
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 size={18} />
              Delete Chat
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await onDelete?.();
          setShowDeleteModal(false);
        }}
      />
    </>
  );
}