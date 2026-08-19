import {
  ShieldCheck,
  MapPin,
  Zap,
  Users,
  Package,
  BadgeCheck,
} from "lucide-react";

export default function AuthBanner() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#1565d8] via-[#1d4ed8] to-[#0f52ba] p-14 text-white">
      {/* Logo & Heading */}
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight">
          Deal
          <span className="text-orange-400">Up</span>
        </h1>

        <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
          Buy & Sell products safely with trusted buyers and sellers near you.
        </p>
      </div>

      {/* Features */}
      <div className="space-y-8">
        <div className="flex items-start gap-5">
          <div className="rounded-2xl bg-white p-4 shadow-lg">
            <ShieldCheck
              size={30}
              className="text-[#1565d8]"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold">
              Safe Trading
            </h3>

            <p className="mt-1 text-blue-100">
              Secure buying and selling experience.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-5">
          <div className="rounded-2xl bg-white p-4 shadow-lg">
            <Zap
              size={30}
              className="text-orange-500"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold">
              Sell Faster
            </h3>

            <p className="mt-1 text-blue-100">
              Reach thousands of local buyers quickly.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-5">
          <div className="rounded-2xl bg-white p-4 shadow-lg">
            <MapPin
              size={30}
              className="text-emerald-500"
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold">
              Local Marketplace
            </h3>

            <p className="mt-1 text-blue-100">
              Discover trusted deals in your nearby cities.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="rounded-3xl bg-white p-8 shadow-2xl">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Users
              size={28}
              className="mb-3 text-[#1565d8]"
            />

            <h2 className="text-3xl font-bold text-[#1565d8]">
              5K+
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-600">
              Sellers
            </p>
          </div>

          <div className="flex flex-col items-center">
            <Package
              size={28}
              className="mb-3 text-orange-500"
            />

            <h2 className="text-3xl font-bold text-[#1565d8]">
              25K+
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-600">
              Products
            </p>
          </div>

          <div className="flex flex-col items-center">
            <BadgeCheck
              size={28}
              className="mb-3 text-emerald-500"
            />

            <h2 className="text-3xl font-bold text-[#1565d8]">
              99%
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-600">
              Safe Deals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}