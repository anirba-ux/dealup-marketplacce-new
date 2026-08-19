import Image from "next/image";
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
    <section className="bg-gradient-to-b from-white to-slate-50 py-20">
      <Container>
        {/* Heading */}
        <div className="mb-16 text-center">
          <span className="inline-flex rounded-full bg-[#1565d8]/10 px-5 py-2 text-sm font-semibold text-[#1565d8]">
            📍 Explore Local Markets
          </span>

          <h2 className="mt-6 text-5xl font-bold text-slate-900 dark:text-white">
            Popular Cities
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Discover thousands of products from the most active cities near you.
            Buy locally, sell faster and connect with trusted buyers & sellers.
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((city) => (
            <button
              key={city.name}
              className="group relative h-[340px] overflow-hidden rounded-3xl border-2 border-transparent shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#1565d8] hover:shadow-[0_20px_50px_rgba(21,101,216,0.25)]"
            >
              {/* Background Image */}
              <Image
                src={city.image}
                alt={city.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1565d8]/90 backdrop-blur">
                  <MapPin size={28} />
                </div>

                <h3 className="text-3xl font-bold">{city.name}</h3>

                <p className="mt-2 text-white/80">{city.ads}</p>

                <div className="mt-6 flex items-center gap-2 font-semibold text-[#f5a623]">
                  Browse City
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-2"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
