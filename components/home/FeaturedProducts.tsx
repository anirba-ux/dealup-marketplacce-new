import ProductCard from "@/components/card/ProductCard";
import Container from "@/components/ui/Container";

interface FeaturedProductsProps {
  products: any[];
}

export default function FeaturedProducts({
  products,
}: FeaturedProductsProps) {
  return (
    <section className="bg-slate-50 py-20">
      <Container>
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-slate-600">
              Featured Products
            </h2>

            <p className="mt-3 text-slate-600">
              Discover trending products from trusted sellers.
            </p>
          </div>

          <button className="rounded-lg border border-[#1565d8] px-5 py-2 text-[#1565d8] transition hover:bg-[#1565d8] hover:text-white">
            View All
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id.toString()}
              id={product._id.toString()}
              slug={product.slug}
              title={product.title}
              price={product.price}
              location={product.location?.city ?? ""}
              image={product.thumbnail}
              seller={product.sellerName}
              sellerIsPhoneVerified={product.sellerIsPhoneVerified}
              condition={product.condition}
              createdAt={product.createdAt}
              isFeatured={product.isFeatured}
              isPremium={product.isPremium}
              isBoosted={product.isBoosted}
              views={product.views}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}