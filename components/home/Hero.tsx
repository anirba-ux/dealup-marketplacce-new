import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-16 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 lg:py-20">
      <Container>
        <div className="grid min-h-[650px] items-center gap-20 lg:grid-cols-[1fr_1fr]">
          {/* Left Side */}
          <div className="max-w-2xl">
            {/* Badge */}
            <span className="inline-flex items-center rounded-full border border-[#cfe0ff] bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              🚀 Trusted Local Marketplace
            </span>

            {/* Heading */}
            <h1 className="mt-8 max-w-xl text-6xl font-extrabold leading-tight text-slate-900 dark:text-white lg:text-7xl">
              Buy & Sell <span className="text-[#1565d8]">Anything</span>
              <br />
              Near You
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-lg text-xl leading-9 text-slate-600 dark:text-slate-300">
              Discover trusted local deals, connect with nearby buyers and
              sellers, and trade safely with confidence using DealUp.
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-4">
              {/* Start Selling */}
              <Link
                href="/sell"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#1565d8]
                  px-10
                  py-4
                  font-semibold
                  text-white
                  shadow-lg
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#0f52ba]
                  hover:shadow-xl
                  active:scale-95
                "
              >
                Start Selling
              </Link>

              {/* Browse Products */}
              <Link
                href="/search"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-10
                  py-4
                  font-semibold
                  text-slate-700
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#1565d8]
                  hover:text-[#1565d8]
                  hover:shadow-md
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-200
                  dark:hover:border-[#1976F3]
                  dark:hover:text-[#1976F3]
                "
              >
                Browse Products
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 flex gap-12">
              <div>
                <h3 className="text-4xl font-bold text-[#1565d8]">10K+</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Products
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-bold text-[#1565d8]">5K+</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Sellers
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-bold text-[#1565d8]">50+</h3>
                <p className="text-slate-500 dark:text-slate-400">Cities</p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/50 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

              <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl" />

              <Image
                src="/images/hero.png"
                alt="DealUp Marketplace"
                width={900}
                height={700}
                priority
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}