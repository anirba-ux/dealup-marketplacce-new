"use client";

import { useState } from "react";
import ReportProductModal from "@/components/products/ReportProductModal";

interface ProductActionsProps {
  product: {
    _id: string;
    sellerId: string;
    title: string;
    slug: string;
  };

  currentUserId: string;
}

export default function ProductActions({
  product,
   currentUserId,
}: ProductActionsProps) {

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const shareProduct = async () => {
    const productUrl = window.location.href;

    const shareData = {
      title: product.title,
      text: `Check out this product on DealUp:\n\n${product.title}`,
      url: productUrl,
    };

    try {
      if (navigator.share) {
        // Mobile Native Share
        await navigator.share(shareData);
      } else {
        // Desktop Copy Link
        await navigator.clipboard.writeText(productUrl);

        alert("✅ Product link copied successfully.");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const reportProduct = () => {
  setReportModalOpen(true);
};

  return (
   <>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
        Product Actions
      </h2>

      <div className="space-y-4">
        {/* Share */}

        <button
          type="button"
          onClick={shareProduct}
          className="
            flex
            h-14
            w-full
            items-center
            justify-center
            rounded-xl

            border
            border-slate-300

            bg-white

            font-semibold
            text-slate-700

            transition-all
            duration-300

            hover:scale-[1.02]
            hover:bg-slate-100

            active:scale-95

            dark:border-slate-700
            dark:bg-slate-800
            dark:text-white
            dark:hover:bg-slate-700
          "
        >
          🔗 Share Product
        </button>

        {/* Report */}

        <button
          type="button"
          onClick={reportProduct}
          className="
            flex
            h-14
            w-full
            items-center
            justify-center
            rounded-xl

            border
            border-red-300

            bg-white

            font-semibold
            text-red-600

            transition-all
            duration-300

            hover:scale-[1.02]
            hover:bg-red-50

            active:scale-95

            dark:border-red-700
            dark:bg-slate-800
            dark:hover:bg-red-900/20
          "
        >
          🚩 Report Product
        </button>
      </div>
    </div>
    
    <ReportProductModal
  open={reportModalOpen}
  onClose={() => setReportModalOpen(false)}
  productId={product._id}
  sellerId={product.sellerId}
  reportedBy={currentUserId}
/>
   </>
    
  );
}