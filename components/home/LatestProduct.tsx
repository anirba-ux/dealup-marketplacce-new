import Link from "next/link";

import { WithId } from "mongodb";

import Container from "@/components/ui/Container";
import ProductCard from "@/components/card/ProductCard";

import { Product } from "@/lib/models/product";

interface ProductWithSellerVerification extends WithId<Product> {
  sellerIsPhoneVerified?: boolean;

  sellerVerificationStatus?: string;

  sellerBadge?:
    | {
        label?: string;
        name?: string;
        type?: string;
      }
    | string
    | null;
}

interface Props {
  products: ProductWithSellerVerification[];
}

export default function LatestProducts({ products }: Props) {
  return (
    <section className="bg-white dark:bg-slate-900 py-20">
      <Container>
        {/* Header */}

        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
              Latest Products
            </h2>

            <p className="mt-3 text-slate-600">
              Freshly listed products from nearby sellers.
            </p>
          </div>

          <Link
            href="/products"
            className="rounded-xl border border-[#1565d8] px-5 py-2 font-semibold text-[#1565d8] transition-all duration-300 hover:bg-[#1565d8] hover:text-white"
          >
            View All
          </Link>
        </div>

        {/* Empty State */}

        {products.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
            <h3 className="text-2xl font-bold text-slate-700">
              No Products Found
            </h3>

            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Publish your first product to see it here.
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id.toString()}
                id={product._id.toString()}
                slug={product.slug}
                title={product.title}
                price={product.price}
                image={product.thumbnail}
                location={product.location.city}
                condition={product.condition}
                seller={product.sellerName}
                sellerIsPhoneVerified={product.sellerIsPhoneVerified}
                sellerVerificationStatus={product.sellerVerificationStatus}
                sellerBadge={product.sellerBadge}
                isFeatured={product.isFeatured}
                isPremium={product.isPremium}
                isBoosted={product.isBoosted}
                createdAt={product.createdAt}
                views={product.views}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
