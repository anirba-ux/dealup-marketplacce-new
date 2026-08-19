import Container from "@/components/ui/Container";
import {
  Smartphone,
  Download,
  Bell,
  Wifi,
} from "lucide-react";

export default function InstallApp() {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          
          {/* Left */}
          <div>
            <span className="inline-flex rounded-full bg-[#1565d8]/10 px-5 py-2 text-sm font-semibold text-[#1565d8]">
              📱 Progressive Web App
            </span>

            <h2 className="mt-6 text-5xl font-bold text-slate-900 dark:text-white dark:text-white">
              Install DealUp
              <br />
              On Your Phone
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Install DealUp directly from your browser and enjoy a fast,
              app-like experience without visiting the Play Store.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-xl bg-[#1565d8] px-8 py-4 font-semibold text-white transition hover:bg-[#0f52ba]">
                <Download size={20} />
                Install App
              </button>

              <button className="rounded-xl border border-[#1565d8] px-8 py-4 font-semibold text-[#1565d8] transition hover:bg-[#1565d8] hover:text-white">
                Learn More
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="rounded-[32px] bg-white dark:bg-slate-900 p-8 shadow-xl">
            <div className="space-y-6">

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#1565d8]/10 p-4">
                  <Smartphone className="text-[#1565d8]" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    App-like Experience
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400">
                    Works like a native mobile app.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#1565d8]/10 p-4">
                  <Bell className="text-[#1565d8]" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Push Notifications
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400">
                    Never miss new products and messages.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#1565d8]/10 p-4">
                  <Wifi className="text-[#1565d8]" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Fast Performance
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400">
                    Optimized for speed and offline support.
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