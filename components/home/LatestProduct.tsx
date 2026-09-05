import Link from "next/link";

import { ArrowRight, Clock3, PackageOpen } from "lucide-react";
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
        badge?: string;
      }
    | string
    | null;

  sellerPremiumSeller?: boolean;
  sellerPremiumBadge?: boolean;
}

interface Props {
  products: ProductWithSellerVerification[];
}

export default function LatestProducts({ products }: Props) {
  return (
    <section
      className="
        bg-white
        py-10
        dark:bg-slate-950
        sm:py-12
        lg:py-14
      "
    >
      <Container>
        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            mb-6
            flex
            flex-col
            gap-4
            sm:mb-8
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          {/* =================================================
              TITLE
          ================================================== */}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-50
                  text-[#1565d8]
                  dark:bg-blue-950/40
                  dark:text-blue-400
                "
              >
                <Clock3 size={17} />
              </div>

              <span
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#1565d8]
                  dark:text-blue-400
                "
              >
                Fresh Listings
              </span>
            </div>

            <h2
              className="
                text-2xl
                font-bold
                tracking-tight
                text-slate-900
                dark:text-white
                sm:text-3xl
                lg:text-4xl
              "
            >
              Latest Products
            </h2>

            <p
              className="
                mt-1
                max-w-xl
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
                sm:text-base
              "
            >
              Discover the newest products recently listed by sellers.
            </p>
          </div>

          {/* =================================================
              VIEW ALL
          ================================================== */}

          <Link
            href="/products"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-[#1565d8]
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-[#1565d8]
              shadow-sm
              transition-all
              duration-200
              ease-out
              hover:-translate-y-0.5
              hover:bg-[#1565d8]
              hover:text-white
              hover:shadow-md
              active:translate-y-0
              dark:bg-slate-900
              dark:text-blue-400
              dark:hover:bg-[#1565d8]
              dark:hover:text-white
            "
          >
            View All

            <ArrowRight
              size={16}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-0.5
              "
            />
          </Link>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {products.length === 0 && (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-slate-50
              px-5
              py-12
              text-center
              dark:border-slate-700
              dark:bg-slate-900/60
              sm:py-16
            "
          >
            <div
              className="
                mx-auto
                mb-4
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-blue-50
                text-[#1565d8]
                dark:bg-blue-950/40
                dark:text-blue-400
              "
            >
              <PackageOpen size={25} />
            </div>

            <h3
              className="
                text-lg
                font-semibold
                text-slate-800
                dark:text-slate-100
              "
            >
              No Latest Products
            </h3>

            <p
              className="
                mx-auto
                mt-1
                max-w-md
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              There are no recently listed products available right now.
            </p>
          </div>
        )}

        {/* =================================================
            PRODUCTS
        ================================================== */}

        {products.length > 0 && (
          <>
            <div
              className="
                flex
                gap-3
                overflow-x-auto
                overscroll-x-contain
                pb-4

                [scrollbar-width:none]
                [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden

                sm:grid
                sm:grid-cols-2
                sm:gap-5
                sm:overflow-visible
                sm:pb-0

                lg:grid-cols-4
                lg:gap-6
              "
            >
              {products.map((product) => (
                <div
                  key={product._id.toString()}
                  className="
                    w-[78vw]
                    min-w-[78vw]
                    shrink-0

                    sm:w-auto
                    sm:min-w-0
                  "
                >
                  <ProductCard
                    id={product._id.toString()}
                    slug={product.slug}
                    title={product.title}
                    price={product.price}
                    image={product.thumbnail}
                    location={product.location?.city ?? "Unknown"}
                    condition={product.condition ?? "Used"}
                    seller={product.sellerName}
                    sellerIsPhoneVerified={
                      product.sellerIsPhoneVerified ?? false
                    }
                    sellerVerificationStatus={
                      product.sellerVerificationStatus
                    }
                    sellerBadge={product.sellerBadge}
                    sellerPremiumSeller={
                      product.sellerPremiumSeller ?? false
                    }
                    sellerPremiumBadge={
                      product.sellerPremiumBadge ?? false
                    }
                    isFeatured={product.isFeatured ?? false}
                    isPremium={product.isPremium ?? false}
                    isBoosted={product.isBoosted ?? false}
                    createdAt={
                      product.createdAt ?? new Date()
                    }
                    views={product.views ?? 0}
                  />
                </div>
              ))}
            </div>

            {/* =================================================
                MOBILE SWIPE HINT
            ================================================== */}

            {products.length > 1 && (
              <div
                className="
                  mt-1
                  flex
                  items-center
                  justify-center
                  gap-2
                  sm:hidden
                "
              >
                <span
                  className="
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[#1565d8]
                  "
                />

                <span
                  className="
                    text-[11px]
                    font-medium
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  Swipe to explore more
                </span>

                <ArrowRight
                  size={13}
                  className="
                    text-slate-400
                    dark:text-slate-500
                  "
                />
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}