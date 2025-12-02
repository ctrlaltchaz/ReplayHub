"use client";

import { X } from "lucide-react";
import { Montserrat } from "next/font/google";
import { useEffect, useState } from "react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isInStandaloneMode = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(isInStandaloneMode());

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect Safari on iOS
    const safari =
      iOS &&
      /Safari/i.test(navigator.userAgent) &&
      !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);
    setIsSafari(safari);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    const dismissedDate = dismissed ? new Date(dismissed) : null;
    const daysSinceDismissed = dismissedDate
      ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    // Show prompt if not in standalone, not dismissed, or dismissed >7 days ago
    if (!isInStandaloneMode() && daysSinceDismissed > 7) {
      if (iOS) {
        // Show iOS instructions immediately
        setShowPrompt(true);
      } else {
        // For Android/Desktop, wait for beforeinstallprompt event
        const handler = (e: Event) => {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
          window.removeEventListener("beforeinstallprompt", handler);
        };
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString());
    setShowPrompt(false);
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom duration-300 ${montserrat.className}`}
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] rounded-xl blur-lg opacity-50"></div>

        {/* Card */}
        <div className="relative bg-white rounded-xl shadow-2xl border border-gray-100 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] rounded-xl blur opacity-75"></div>
                <div className="relative bg-white p-2 rounded-xl shadow-lg">
                  <img
                    src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png"
                    alt="ReplayHub"
                    className="h-8 w-8 object-contain"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Install ReplayHub</h3>
                <p className="text-sm text-gray-600">Add to your home screen</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isIOS && !isSafari ? (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800 font-medium mb-1">⚠️ Safari Required</p>
                <p className="text-sm text-amber-700">
                  To install ReplayHub, please open this page in Safari browser.
                </p>
              </div>
              <p className="text-xs text-gray-600">
                Copy this URL and paste it in Safari, or tap the share button and select "Open in
                Safari"
              </p>
            </div>
          ) : isIOS ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">Install this app on your iPhone:</p>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">1.</span>
                  <span>
                    Tap the{" "}
                    <span className="inline-flex items-center mx-1 align-middle">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                        <circle cx="3" cy="8" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="13" cy="8" r="1.5" />
                      </svg>
                    </span>
                    <strong>three dots (•••)</strong> at the bottom right
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">2.</span>
                  <span>
                    Tap{" "}
                    <span className="inline-flex items-center mx-1 align-middle">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 50 50">
                        <path d="M 25 2 C 24.744125 2 24.488281 2.0976562 24.292969 2.2929688 L 14.292969 12.292969 C 13.902969 12.682969 13.902969 13.317031 14.292969 13.707031 C 14.682969 14.097031 15.317031 14.097031 15.707031 13.707031 L 24 5.4140625 L 24 38 C 24 38.552 24.448 39 25 39 C 25.552 39 26 38.552 26 38 L 26 5.4140625 L 34.292969 13.707031 C 34.682969 14.097031 35.317031 14.097031 35.707031 13.707031 C 36.097031 13.317031 36.097031 12.682969 35.707031 12.292969 L 25.707031 2.2929688 C 25.511719 2.0976562 25.255875 2 25 2 z M 8 21 C 6.895 21 6 21.895 6 23 L 6 45 C 6 46.105 6.895 47 8 47 L 42 47 C 43.105 47 44 46.105 44 45 L 44 23 C 44 21.895 43.105 21 42 21 L 33 21 C 32.448 21 32 21.448 32 22 C 32 22.552 32.448 23 33 23 L 42 23 L 42 45 L 8 45 L 8 23 L 17 23 C 17.552 23 18 22.552 18 22 C 18 21.448 17.552 21 17 21 L 8 21 z" />
                      </svg>
                    </span>
                    <strong>"Share"</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">3.</span>
                  <span>
                    Scroll down and tap{" "}
                    <span className="inline-flex items-center mx-1 align-middle">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                    </span>
                    <strong>"Add to Home Screen"</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">4.</span>
                  <span>
                    Tap <strong>"Add"</strong> in the top right corner
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Get quick access to ReplayHub from your home screen. Works offline!
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] hover:from-[#1ac4cf] hover:to-[#2ef6fc] text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Install App
              </button>
            </div>
          )}

          <button
            onClick={handleDismiss}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors py-1"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
