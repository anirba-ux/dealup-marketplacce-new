import Image from "next/image";
import Link from "next/link";

import { findActiveProductsBySeller } from "@/lib/repositories/product.repository";

interface SellerMoreAdsProps {
  sellerId: string;
  currentProductId: string;
}

export default async function SellerMoreAds({
  sellerId,
  currentProductId,
}: SellerMoreAdsProps) {
  const products = await findActiveProductsBySeller(
    sellerId,
    currentProductId,
    3,
  );

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">
        📦 More Ads from this Seller
      </h2>

      {products.length === 0 ? (
        <p className="text-sm text-slate-500">
          No other active ads.
        </p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Link
              key={product._id!.toString()}
              href={`/products/${product.slug}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-[#1565d8] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg object-cover"
              />

              <div className="flex-1">
                <h3 className="line-clamp-1 font-semibold text-slate-900 dark:text-white">
                  {product.title}
                </h3>

                <p className="mt-1 text-sm font-bold text-[#1565d8]">
                  ₹ {product.price.toLocaleString("en-IN")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}