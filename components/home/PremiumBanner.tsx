import Container from "@/components/ui/Container";
import { ArrowRight, BadgeCheck, TrendingUp, Zap } from "lucide-react";

export default function PremiumBanner() {
  return (
    <section className="bg-[#f8fafc] py-20 dark:bg-slate-950">
      <Container>
        <div className="overflow-hidden rounded-[36px] bg-gradient-to-r from-[#1565d8] to-[#0f52ba] px-8 py-16 text-white shadow-2xl lg:px-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Content */}
            <div>
              <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 backdrop-blur dark:bg-white/10 dark:text-white">
                ⭐ Premium Seller
              </span>

              <h2 className="mt-6 text-4xl font-extrabold leading-tight lg:text-5xl">
                Sell Faster with
                <br />
                <span className="text-yellow-300">DealUp Premium</span>
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
                Get featured listings, reach more buyers, boost your visibility,
                and grow your sales with our Premium Seller membership.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button className="flex items-center gap-2 rounded-xl bg-[#f5a623] px-10 py-4 font-semibold text-slate-900 transition-all duration-300 hover:scale-105">
                  Upgrade Now
                  <ArrowRight size={18} />
                </button>

                <button className="rounded-xl border border-white/40 px-10 py-4 font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-[#1565d8] dark:hover:bg-slate-800 dark:hover:text-white">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Content */}
            <div className="grid gap-5">
              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/20 hover:shadow-2xl">
                <TrendingUp size={34} />
                <div>
                  <h3 className="font-semibold text-xl">Reach More Buyers</h3>

                  <p className="text-blue-100">
                    Featured listings appear at the top.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/20 hover:shadow-2xl">
                <Zap size={34} />

                <div>
                  <h3 className="font-semibold text-xl">Sell Faster</h3>

                  <p className="text-blue-100">
                    Increase visibility and receive more enquiries.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white/20 hover:shadow-2xl">
                <BadgeCheck size={34} />

                <div>
                  <h3 className="font-semibold text-xl">Premium Badge</h3>

                  <p className="text-blue-100">
                    Build trust with verified premium seller status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
