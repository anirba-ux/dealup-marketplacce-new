import Container from "@/components/ui/Container";
import {
  ShieldCheck,
  BadgeCheck,
  MapPin,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Safe & Secure",
    description:
      "Trade confidently with secure listings and trusted users.",
    icon: ShieldCheck,
  },
  {
    title: "Verified Sellers",
    description:
      "Connect only with verified and genuine local sellers.",
    icon: BadgeCheck,
  },
  {
    title: "Local Marketplace",
    description:
      "Buy and sell products easily within your nearby cities.",
    icon: MapPin,
  },
  {
    title: "Sell Faster",
    description:
      "Reach more buyers and sell your products quickly.",
    icon: Zap,
  },
];

export default function WhyChooseDealUp() {
  return (
    <section className="bg-slate-50 py-24">
      <Container>

        {/* Heading */}

        <div className="mb-16 text-center">

          <span className="inline-flex rounded-full bg-[#1565d8]/10 px-5 py-2 text-sm font-semibold text-[#1565d8]">
            ⭐ Why Choose Us
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900 dark:text-white">
            Why Choose DealUp?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            DealUp makes local buying and selling simple, secure and
            faster with powerful features designed for everyone.
          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {features.map((feature) => {

            const Icon = feature.icon;

            return (

              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-[#1565d8] hover:shadow-[0_20px_50px_rgba(21,101,216,0.15)]"
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1565d8]/10 transition-all duration-300 group-hover:bg-[#1565d8]">

                  <Icon
                    size={30}
                    className="text-[#1565d8] transition-all duration-300 group-hover:scale-110 group-hover:text-white"
                  />

                </div>

                <h3 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {feature.description}
                </p>

              </div>

            );

          })}

        </div>

      </Container>
    </section>
  );
}