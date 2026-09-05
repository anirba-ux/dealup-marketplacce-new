import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { ArrowRight, MapPin } from "lucide-react";

const cities = [
  {
    name: "Bansberia",
    ads: "1,250 Active Listings",
    image: "/images/cities/hanseswari_temple.png",
  },
  {
    name: "Hooghly",
    ads: "3,420 Active Listings",
    image: "/images/cities/hooghly_img.png",
  },
  {
    name: "Chinsurah",
    ads: "2,180 Active Listings",
    image: "/images/cities/chuchura_img.png",
  },
  {
    name: "Tribeni",
    ads: "980 Active Listings",
    image: "/images/cities/tribeni_img.png",
  },
  {
    name: "Kalyani",
    ads: "1,760 Active Listings",
    image: "/images/cities/kalyani_img.png",
  },
  {
    name: "Kolkata",
    ads: "12,500 Active Listings",
    image: "/images/cities/kolkata_img.png",
  },
  {
    name: "Serampore",
    ads: "2,300 Active Listings",
    image: "/images/cities/sreerampur_img.jpg",
  },
  {
    name: "Chandannagar",
    ads: "1,640 Active Listings",
    image: "/images/cities/chandanagar_img.png",
  },
];

export default function PopularCities() {
  return (
    <section
      className="
        bg-gradient-to-b
        from-white
        to-slate-50
        py-10
        dark:from-slate-950
        dark:to-slate-900
        sm:py-12
        lg:py-16
      "
    >
      <Container>
        {/* =================================================
            HEADING
        ================================================== */}

        <div
          className="
            mb-8
            text-center

            sm:mb-10

            lg:mb-12
          "
        >
          {/* Label */}

          <span
            className="
              inline-flex
              rounded-full
              bg-[#1565d8]/10
              px-4
              py-1.5
              text-xs
              font-semibold
              text-[#1565d8]

              sm:px-5
              sm:py-2
              sm:text-sm

              dark:bg-blue-950/40
              dark:text-blue-400
            "
          >
            📍 Explore Local Markets
          </span>

          {/* Heading */}

          <h2
            className="
              mt-4
              text-3xl
              font-bold
              tracking-tight
              text-slate-900

              sm:mt-5
              sm:text-4xl

              lg:mt-6
              lg:text-5xl

              dark:text-white
            "
          >
            Popular Cities
          </h2>

          {/* Description */}

          <p
            className="
              mx-auto
              mt-3
              max-w-3xl
              text-sm
              leading-6
              text-slate-600

              sm:mt-4
              sm:text-base
              sm:leading-7

              lg:mt-5
              lg:text-lg
              lg:leading-8

              dark:text-slate-400
            "
          >
            Discover thousands of products from the most active
            cities near you. Buy locally, sell faster and connect
            with trusted buyers & sellers.
          </p>
        </div>

        {/* =================================================
            MOBILE / TABLET CAROUSEL
        ================================================== */}

        <div
          className="
            -mx-4
            flex
            gap-4
            overflow-x-auto
            overscroll-x-contain
            px-4
            pb-4

            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden

            sm:-mx-6
            sm:gap-5
            sm:px-6

            lg:mx-0
            lg:grid
            lg:grid-cols-4
            lg:gap-6
            lg:overflow-visible
            lg:px-0
            lg:pb-0
          "
        >
          {cities.map((city) => (
            <Link
              key={city.name}
              href={`/search?city=${encodeURIComponent(city.name)}`}
              className="
                group
                relative
                h-[300px]
                w-[78vw]
                min-w-[78vw]
                shrink-0
                overflow-hidden
                rounded-2xl
                border-2
                border-transparent
                shadow-lg
                transition-all
                duration-300
                ease-out

                hover:-translate-y-1
                hover:border-[#1565d8]
                hover:shadow-[0_15px_40px_rgba(21,101,216,0.22)]

                sm:h-[320px]
                sm:w-[300px]
                sm:min-w-[300px]
                sm:rounded-3xl

                lg:h-[340px]
                lg:w-auto
                lg:min-w-0
                lg:rounded-3xl
                lg:shadow-xl
                lg:duration-500
                lg:hover:-translate-y-2
                lg:hover:shadow-[0_20px_50px_rgba(21,101,216,0.25)]
              "
            >
              {/* =================================================
                  BACKGROUND IMAGE
              ================================================== */}

              <Image
                src={city.image}
                alt={`${city.name} marketplace`}
                fill
                sizes="
                  (max-width: 640px) 78vw,
                  (max-width: 1024px) 300px,
                  25vw
                "
                className="
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105

                  lg:group-hover:scale-110
                "
              />

              {/* =================================================
                  DARK OVERLAY
              ================================================== */}

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/85
                  via-black/40
                  to-black/10
                "
              />

              {/* =================================================
                  CONTENT
              ================================================== */}

              <div
                className="
                  absolute
                  inset-0
                  flex
                  flex-col
                  justify-end
                  p-5
                  text-white

                  sm:p-6
                "
              >
                {/* Location Icon */}

                <div
                  className="
                    mb-4
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#1565d8]/90
                    shadow-lg
                    backdrop-blur

                    sm:mb-5
                    sm:h-14
                    sm:w-14
                    sm:rounded-2xl
                  "
                >
                  <MapPin
                    size={23}
                    className="sm:h-7 sm:w-7"
                  />
                </div>

                {/* City Name */}

                <h3
                  className="
                    text-2xl
                    font-bold
                    leading-tight

                    sm:text-3xl
                  "
                >
                  {city.name}
                </h3>

                {/* Listings */}

                <p
                  className="
                    mt-1.5
                    text-sm
                    text-white/80

                    sm:mt-2
                  "
                >
                  {city.ads}
                </p>

                {/* Browse */}

                <div
                  className="
                    mt-4
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-[#f5a623]

                    sm:mt-6
                    sm:text-base
                  "
                >
                  Browse City

                  <ArrowRight
                    size={17}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1.5

                      sm:h-[18px]
                      sm:w-[18px]
                    "
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* =================================================
            MOBILE SWIPE HINT
        ================================================== */}

        {cities.length > 1 && (
          <div
            className="
              mt-1
              flex
              items-center
              justify-center
              gap-2

              sm:mt-2

              lg:hidden
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
              Swipe to explore more cities
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
      </Container>
    </section>
  );
}