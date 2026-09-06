import Image from "next/image";
import Link from "next/link";
import {
  UserPen,
  ShieldCheck,
  MapPin,
  Globe,
  BadgeCheck,
} from "lucide-react";

interface DashboardHeroProps {
  user: any;
}

export default function DashboardHero({
  user,
}: DashboardHeroProps) {
  const isVerified = user.isVerified === true;

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-gradient-to-br
        from-[#0A3D91]
        via-[#1257C9]
        to-[#2A7FFF]
        px-4
        py-5
        text-white
        shadow-[0_18px_50px_rgba(0,0,0,0.25)]
        sm:rounded-3xl
        sm:px-6
        sm:py-7
        lg:px-8
        lg:py-9
      "
    >
      {/* Background Glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-56
          w-56
          rounded-full
          bg-cyan-300/10
          blur-3xl
          sm:h-72
          sm:w-72
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -left-20
          h-56
          w-56
          rounded-full
          bg-white/10
          blur-3xl
          sm:h-72
          sm:w-72
        "
      />

      <div
        className="
          relative
          z-10
          flex
          flex-col
          gap-6
          sm:gap-8
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* =====================================================
            LEFT CONTENT
        ====================================================== */}

        <div className="min-w-0 flex-1">
          <p
            className="
              text-xs
              font-medium
              text-blue-100
              sm:text-sm
              lg:text-base
            "
          >
            Welcome Back 👋
          </p>

          <h1
            className="
              mt-1.5
              break-words
              text-2xl
              font-extrabold
              leading-tight
              tracking-tight
              sm:mt-2
              sm:text-3xl
              lg:text-5xl
            "
          >
            {user.name || "DealUp User"}
          </h1>

          <p
            className="
              mt-2.5
              max-w-xl
              text-xs
              leading-5
              text-blue-100
              sm:mt-3
              sm:text-sm
              sm:leading-6
              lg:mt-4
              lg:text-lg
              lg:leading-8
            "
          >
            Manage your products, messages, wishlist and marketplace
            activities from one powerful dashboard.
          </p>

          {/* ===================================================
              USER BADGES
          ==================================================== */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
              sm:mt-5
              sm:gap-2.5
            "
          >
            {/* Account Type */}

            <div
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-white/15
                bg-white/10
                px-2.5
                py-1.5
                backdrop-blur-md
                sm:px-3.5
                sm:py-2
              "
            >
              <BadgeCheck size={14} />

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                  sm:text-[11px]
                "
              >
                {user.role ?? "Buyer"}
              </span>
            </div>

            {/* Language */}

            <div
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-white/15
                bg-white/10
                px-2.5
                py-1.5
                backdrop-blur-md
                sm:px-3.5
                sm:py-2
              "
            >
              <Globe size={14} />

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                  sm:text-[11px]
                "
              >
                {user.language ?? "EN"}
              </span>
            </div>

            {/* Verification */}

            <div
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-white/15
                bg-white/10
                px-2.5
                py-1.5
                backdrop-blur-md
                sm:px-3.5
                sm:py-2
              "
            >
              {isVerified ? (
                <>
                  <BadgeCheck
                    size={14}
                    className="text-green-300"
                  />

                  <span className="text-[9px] font-bold sm:text-[11px]">
                    Verified
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck
                    size={14}
                    className="text-orange-300"
                  />

                  <span className="text-[9px] font-bold sm:text-[11px]">
                    Not Verified
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT PROFILE
        ====================================================== */}

        <div
          className="
            flex
            shrink-0
            flex-col
            items-center
            lg:min-w-[190px]
            lg:items-end
          "
        >
          {/* Profile Image */}

          <div
            className="
              relative
              h-20
              w-20
              overflow-hidden
              rounded-full
              border-[3px]
              border-white
              bg-white/10
              shadow-xl
              sm:h-24
              sm:w-24
              sm:border-4
              lg:h-32
              lg:w-32
            "
          >
            <Image
              src={
                user.image ||
                "/images/default-avatar.png"
              }
              alt={user.name || "DealUp User"}
              fill
              sizes="128px"
              className="object-cover"
              priority
            />
          </div>

          {/* Edit Profile */}

          <Link
            href="/dashboard/profile"
            className="
              mt-3
              inline-flex
              items-center
              justify-center
              gap-1.5
              rounded-xl
              bg-white
              px-4
              py-2
              text-xs
              font-bold
              text-[#1565d8]
              shadow-md
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-lg
              active:scale-95
              sm:mt-4
              sm:px-5
              sm:py-2.5
              sm:text-sm
            "
          >
            <UserPen size={15} />
            Edit Profile
          </Link>

          {/* Trust Information */}

          <div
            className="
              mt-3
              flex
              flex-col
              items-center
              gap-1.5
              text-[11px]
              text-blue-100
              sm:mt-4
              sm:gap-2
              sm:text-xs
              lg:items-end
              lg:text-sm
            "
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck
                size={15}
                className="text-green-300"
              />

              <span>Trusted DealUp Member</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin
                size={15}
                className="text-orange-300"
              />

              <span>
                {user.address?.city || "Location not added"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}