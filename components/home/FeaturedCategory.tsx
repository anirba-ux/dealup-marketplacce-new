import Container from "@/components/ui/Container";
import Link from "next/link";
import {
  Smartphone,
  Car,
  Bike,
  Laptop,
  Home,
  Shirt,
  Briefcase,
  Wrench,
} from "lucide-react";

const categories = [
  {
    title: "Mobiles",
    slug: "mobiles",
    icon: Smartphone,
  },
  {
    title: "Cars",
    slug: "cars",
    icon: Car,
  },
  {
    title: "Bikes",
    slug: "bikes",
    icon: Bike,
  },
  {
    title: "Electronics",
    slug: "electronics",
    icon: Laptop,
  },
  {
    title: "Property",
    slug: "property",
    icon: Home,
  },
  {
    title: "Fashion",
    slug: "fashion",
    icon: Shirt,
  },
  {
    title: "Jobs",
    slug: "jobs",
    icon: Briefcase,
  },
  {
    title: "Services",
    slug: "services",
    icon: Wrench,
  },
];

export default function FeaturedCategories() {
  return (
    <section className="bg-white dark:bg-slate-900 py-20">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white dark:text-white">
            Browse Categories
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Find everything you need from trusted local sellers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.title}
                href={`/search?category=${category.slug}`}
                className="group flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#1565d8] hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="rounded-xl bg-blue-50 p-3 transition group-hover:bg-[#1565d8]">
                  <Icon
                    size={30}
                    className="text-[#1565d8] transition group-hover:text-white"
                  />
                </div>

                <h3 className="text-lg font-semibold text-slate-800">
                  {category.title}
                </h3>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
