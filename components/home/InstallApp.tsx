"use client";

import { useEffect, useState, type ReactNode } from "react";

import Container from "@/components/ui/Container";

import {
  Smartphone,
  Download,
  Bell,
  Wifi,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;

  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function InstallApp() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);

  // =========================================================
  // PWA SETUP
  // =========================================================

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "DealUp Service Worker registered:",
            registration.scope,
          );
        })
        .catch((error) => {
          console.error(
            "DealUp Service Worker registration failed:",
            error,
          );
        });
    }

    // Check if already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;

      const iosStandalone =
        (
          window.navigator as Navigator & {
            standalone?: boolean;
          }
        ).standalone === true;

      if (standalone || iosStandalone) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Browser install prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent,
      );
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    // App installed
    const handleAppInstalled = () => {
      console.log("DealUp PWA installed");

      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener(
      "appinstalled",
      handleAppInstalled,
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled,
      );
    };
  }, []);

  // =========================================================
  // INSTALL APP
  // =========================================================

  const handleInstall = async () => {
    if (!installPrompt) {
      alert(
        "DealUp is not ready to install yet. Please open DealUp in Chrome and make sure the PWA setup is enabled.",
      );

      return;
    }

    try {
      await installPrompt.prompt();

      const choice =
        await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        console.log(
          "DealUp installation accepted",
        );

        setIsInstalled(true);
      } else {
        console.log(
          "DealUp installation dismissed",
        );
      }

      setInstallPrompt(null);
    } catch (error) {
      console.error(
        "DealUp installation error:",
        error,
      );
    }
  };

  // =========================================================
  // LEARN MORE
  // =========================================================

  const handleLearnMore = () => {
    const installSection =
      document.getElementById(
        "install-app-features",
      );

    installSection?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <section
      id="install-app-info"
      className="
        relative
        overflow-hidden
        bg-slate-50
        py-14
        transition-colors
        duration-300

        dark:bg-[#0D162A]

        sm:py-16
        lg:py-20
        xl:py-24
      "
    >
      <Container>
        <div
          className="
            grid
            items-center
            gap-10

            lg:grid-cols-[1fr_0.95fr]
            lg:gap-14

            xl:gap-20
          "
        >
          {/* =================================================
              LEFT CONTENT
          ================================================== */}

          <div
            className="
              min-w-0
              text-center

              lg:text-left
            "
          >
            {/* =================================================
                BADGE
            ================================================== */}

            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-200
                bg-blue-50
                px-3.5
                py-2
                text-xs
                font-bold
                text-[#1565d8]
                shadow-sm

                dark:border-blue-400/20
                dark:bg-blue-500/10
                dark:text-blue-300

                sm:px-4
                sm:text-sm
              "
            >
              <span aria-hidden="true">
                📱
              </span>

              Progressive Web App
            </span>

            {/* =================================================
                HEADING
            ================================================== */}

            <h2
              className="
                mx-auto
                mt-6
                max-w-2xl
                text-[2.65rem]
                font-black
                leading-[1.02]
                tracking-[-0.045em]
                text-slate-950

                sm:mt-7
                sm:text-5xl

                lg:mx-0
                lg:text-6xl

                xl:text-[4.25rem]

                dark:text-white
              "
            >
              Install DealUp

              <span
                className="
                  mt-1
                  block
                  bg-gradient-to-r
                  from-[#1565d8]
                  via-slate-500
                  to-[#e3a62f]
                  bg-clip-text
                  text-transparent

                  dark:from-[#3b8cff]
                  dark:via-slate-300
                  dark:to-[#f5b84b]
                "
              >
                On Your Phone
              </span>
            </h2>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <p
              className="
                mx-auto
                mt-5
                max-w-xl
                text-sm
                leading-6
                text-slate-600

                sm:text-base
                sm:leading-7

                lg:mx-0
                lg:mt-6
                lg:text-lg
                lg:leading-8

                dark:text-slate-300
              "
            >
              Install DealUp directly from your browser and enjoy
              a fast, app-like experience without visiting the Play
              Store.
            </p>

            {/* =================================================
                BUTTONS
            ================================================== */}

            <div
              className="
                mx-auto
                mt-7
                flex
                w-full
                max-w-md
                gap-3

                sm:mt-8
                sm:gap-4

                lg:mx-0
                lg:max-w-none
              "
            >
              {/* =================================================
                  INSTALL BUTTON
              ================================================== */}

              {!isInstalled ? (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="
                    inline-flex
                    min-w-0
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#1565d8]
                    px-3
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-blue-500/20
                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:bg-[#0f52ba]
                    hover:shadow-xl

                    active:scale-95

                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#1565d8]/40
                    focus:ring-offset-2

                    sm:px-6
                    sm:py-3.5
                    sm:text-base

                    lg:flex-none
                    lg:px-7
                  "
                >
                  <Download className="h-4 w-4 shrink-0" />

                  <span className="whitespace-nowrap">
                    Install App
                  </span>
                </button>
              ) : (
                <div
                  className="
                    inline-flex
                    min-w-0
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-600
                    px-3
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-emerald-500/20

                    sm:px-6
                    sm:py-3.5
                    sm:text-base

                    lg:flex-none
                    lg:px-7
                  "
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />

                  <span className="whitespace-nowrap">
                    App Installed
                  </span>
                </div>
              )}

              {/* =================================================
                  LEARN MORE
              ================================================== */}

              <button
                type="button"
                onClick={handleLearnMore}
                className="
                  inline-flex
                  min-w-0
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-[#1565d8]
                  bg-white
                  px-3
                  py-3
                  text-sm
                  font-bold
                  text-[#1565d8]
                  shadow-sm
                  transition-all
                  duration-300

                  hover:-translate-y-0.5
                  hover:bg-blue-50
                  hover:shadow-md

                  active:scale-95

                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#1565d8]/30
                  focus:ring-offset-2

                  sm:px-6
                  sm:py-3.5
                  sm:text-base

                  lg:flex-none
                  lg:px-7

                  dark:border-blue-400/50
                  dark:bg-white/5
                  dark:text-blue-300
                  dark:hover:bg-blue-500/10
                "
              >
                <span className="whitespace-nowrap">
                  Learn More
                </span>

                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>

            {/* =================================================
                INSTALLATION HINT
            ================================================== */}

            {!isInstalled && !installPrompt && (
              <div
                className="
                  mx-auto
                  mt-5
                  max-w-xl
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-left
                  text-xs
                  leading-5
                  text-slate-600
                  shadow-sm

                  sm:text-sm

                  lg:mx-0

                  dark:border-white/10
                  dark:bg-white/5
                  dark:text-slate-400
                "
              >
                <span className="mr-1">
                  💡
                </span>

                If the Install App button does not work, open
                DealUp in Chrome and wait for a moment. Once the
                PWA setup is complete, the browser will show the
                install option.
              </div>
            )}
          </div>

          {/* =================================================
              RIGHT FEATURE CARD
          ================================================== */}

          <div
            id="install-app-features"
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border
              border-slate-200
              bg-white
              p-4
              shadow-[0_20px_55px_rgba(15,23,42,0.10)]
              transition-all
              duration-300

              hover:-translate-y-1
              hover:shadow-[0_25px_65px_rgba(21,101,216,0.14)]

              dark:border-white/10
              dark:bg-[#0b1426]
              dark:shadow-[0_20px_55px_rgba(0,0,0,0.28)]

              sm:rounded-[30px]
              sm:p-5

              lg:p-7
            "
          >
            <div className="relative">
              {/* =================================================
                  FEATURE 1
              ================================================== */}

              <FeatureItem
                icon={
                  <Smartphone className="h-5 w-5" />
                }
                title="App-like Experience"
                description="Works like a native mobile app."
              />

              {/* =================================================
                  FEATURE 2
              ================================================== */}

              <FeatureItem
                icon={
                  <Bell className="h-5 w-5" />
                }
                title="Push Notifications"
                description="Never miss new products and messages."
              />

              {/* =================================================
                  FEATURE 3
              ================================================== */}

              <FeatureItem
                icon={
                  <Wifi className="h-5 w-5" />
                }
                title="Fast Performance"
                description="Optimized for speed and offline support."
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ============================================================
   FEATURE ITEM
============================================================ */

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        group
        flex
        items-center
        gap-3
        rounded-2xl
        px-2
        py-4
        transition-all
        duration-300

        hover:bg-slate-50

        dark:hover:bg-white/5

        sm:gap-4
        sm:px-3
        sm:py-4.5
      "
    >
      {/* Icon */}
      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-blue-50
          text-[#1565d8]
          transition-all
          duration-300

          group-hover:scale-105
          group-hover:bg-blue-100

          dark:bg-blue-500/10
          dark:text-blue-400
          dark:group-hover:bg-blue-500/15

          sm:h-12
          sm:w-12
        "
      >
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <h3
          className="
            text-sm
            font-bold
            text-slate-900

            sm:text-[15px]

            dark:text-white
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-0.5
            text-xs
            leading-5
            text-slate-500

            sm:text-sm

            dark:text-slate-400
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}