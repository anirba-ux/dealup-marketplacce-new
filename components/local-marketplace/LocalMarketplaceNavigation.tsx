"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LocalMarketplaceNavigation() {
  const router = useRouter();

  return (
    <div className="absolute left-0 right-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/10 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/10 sm:text-sm"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}