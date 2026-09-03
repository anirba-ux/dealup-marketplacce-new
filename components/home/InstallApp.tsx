"use client";

import { useEffect, useState } from "react";

import Container from "@/components/ui/Container";

import {
  Smartphone,
  Download,
  Bell,
  Wifi,
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

  const [isInstalled, setIsInstalled] =
    useState(false);

  // =======================================================
  // PWA Setup
  // =======================================================

  useEffect(() => {
    // -------------------------------------------------------
    // Register Service Worker
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // Check whether DealUp is already installed
    // -------------------------------------------------------

    const checkInstalled = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;

      const iosStandalone =
        (window.navigator as Navigator & {
          standalone?: boolean;
        }).standalone === true;

      if (standalone || iosStandalone) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // -------------------------------------------------------
    // Browser Install Prompt
    // -------------------------------------------------------

    const handleBeforeInstallPrompt = (
      event: Event,
    ) => {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent,
      );
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    // -------------------------------------------------------
    // App Installed
    // -------------------------------------------------------

    const handleAppInstalled = () => {
      console.log("DealUp PWA installed");

      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener(
      "appinstalled",
      handleAppInstalled,
    );

    // -------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------

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

  // =======================================================
  // Install App
  // =======================================================

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

  // =======================================================
  // Learn More
  // =======================================================

  const handleLearnMore = () => {
    const installSection =
      document.getElementById(
        "install-app-info",
      );

    installSection?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // =======================================================
  // UI
  // =======================================================

  return (
    <section
      id="install-app-info"
      className="bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20"
    >
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* =================================================
              Left Content
          ================================================= */}

          <div>
            {/* Badge */}

            <span className="inline-flex rounded-full bg-[#1565d8]/10 px-5 py-2 text-sm font-semibold text-[#1565d8]">
              📱 Progressive Web App
            </span>

            {/* Heading */}

            <h2 className="mt-6 text-5xl font-bold text-slate-900 dark:text-white">
              Install DealUp
              <br />
              On Your Phone
            </h2>

            {/* Description */}

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Install DealUp directly from your browser
              and enjoy a fast, app-like experience
              without visiting the Play Store.
            </p>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap gap-4">
              {/* =================================================
                  Install Button
              ================================================= */}

              {!isInstalled ? (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="flex items-center gap-2 rounded-xl bg-[#1565d8] px-8 py-4 font-semibold text-white transition hover:bg-[#0f52ba]"
                >
                  <Download size={20} />

                  Install App
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white">
                  <Download size={20} />

                  App Installed
                </div>
              )}

              {/* =================================================
                  Learn More Button
              ================================================= */}

              <button
                type="button"
                onClick={handleLearnMore}
                className="rounded-xl border border-[#1565d8] px-8 py-4 font-semibold text-[#1565d8] transition hover:bg-[#1565d8] hover:text-white"
              >
                Learn More
              </button>
            </div>

            {/* =================================================
                Installation Information
            ================================================= */}

            {!isInstalled && !installPrompt && (
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                💡 যদি Install App button কাজ না করে,
                তাহলে Chrome browser-এ DealUp খুলে কিছুক্ষণ
                অপেক্ষা করুন। PWA setup সম্পূর্ণ হলে browser
                install option দেখাবে।
              </p>
            )}
          </div>

          {/* =================================================
              Right Content
          ================================================= */}

          <div className="rounded-[32px] bg-white p-8 shadow-xl dark:bg-slate-900">
            <div className="space-y-6">
              {/* =================================================
                  App-like Experience
              ================================================= */}

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#1565d8]/10 p-4">
                  <Smartphone
                    className="text-[#1565d8]"
                    size={24}
                  />
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

              {/* =================================================
                  Push Notifications
              ================================================= */}

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#1565d8]/10 p-4">
                  <Bell
                    className="text-[#1565d8]"
                    size={24}
                  />
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

              {/* =================================================
                  Fast Performance
              ================================================= */}

              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#1565d8]/10 p-4">
                  <Wifi
                    className="text-[#1565d8]"
                    size={24}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Fast Performance
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400">
                    Optimized for speed and offline
                    support.
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