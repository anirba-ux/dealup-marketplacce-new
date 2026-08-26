import Image from "next/image";
import Link from "next/link";
import { UserPen, ShieldCheck, MapPin, Globe, BadgeCheck } from "lucide-react";

interface DashboardHeroProps {
  user: any;
}

export default function DashboardHero({ user }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0A3D91] via-[#1257C9] to-[#2A7FFF] p-8 text-white shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}
        <div className="max-w-2xl">
          <p className="text-blue-100 text-lg font-medium">Welcome Back 👋</p>

          <h1 className="mt-3 text-5xl font-extrabold tracking-tight">
            {user.name}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">
            Manage your products, messages, wishlist and marketplace activities
            from one powerful dashboard.
          </p>

          {/* Badges */}

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 backdrop-blur-md">
              <BadgeCheck size={18} />

              <span className="text-sm font-semibold uppercase">
                {user.role ?? "Buyer"}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 backdrop-blur-md">
              <Globe size={18} />

              <span className="text-sm font-semibold uppercase">
                {user.language ?? "EN"}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 backdrop-blur-md">
              {user.isVerified ? (
                <>
                  <BadgeCheck size={18} className="text-green-300" />

                  <span className="text-sm font-semibold">Verified</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} className="text-orange-300" />

                  <span className="text-sm font-semibold">Not Verified</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right */}

        <div className="flex flex-col items-center lg:items-end">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white/10 shadow-2xl">
            <Image
              src={user.image || "/images/default-avatar.png"}
              alt={user.name || "DealUp User"}
              fill
              sizes="128px"
              className="object-cover"
              priority
            />
          </div>

          <Link
            href="/dashboard/profile"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-[#1565d8] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <UserPen size={18} />
            Edit Profile
          </Link>

          <div className="mt-6 space-y-3 text-blue-100">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-green-300" />

              <span>Trusted DealUp Member</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-orange-300" />

              <span>{user.address?.city || "Location not added"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
