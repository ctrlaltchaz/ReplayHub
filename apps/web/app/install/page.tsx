"use client";

import { Check, Download, Plus, Share, Smartphone } from "lucide-react";
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

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    setIsStandalone(isInStandaloneMode());

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className={`min-h-screen w-full relative overflow-hidden ${montserrat.className}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2ef6fc] via-[#1ac4cf] to-[#fc040e]">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      <div className="absolute top-20 left-20 w-96 h-96 bg-[#2ef6fc] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-[#fc040e] rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#2ef6fc] to-[#fc040e] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                <img
                  src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png"
                  alt="ReplayHub Logo"
                  className="h-16 w-16 object-contain"
                />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Install ReplayHub</h1>
          <p className="text-xl text-white/80">Get the app experience on your device</p>
        </div>{" "}
        {/* Already Installed */}
        {isStandalone && (
          <div className="bg-white/95 backdrop-blur border border-white/20 rounded-xl p-6 mb-8 shadow-xl">
            <div className="flex items-center gap-3 text-green-600">
              <Check className="w-6 h-6" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Already Installed!</h3>
                <p className="text-gray-600">ReplayHub is running as an app</p>
              </div>
            </div>
          </div>
        )}
        {/* Success Message */}
        {installed && (
          <div className="bg-white/95 backdrop-blur border border-white/20 rounded-xl p-6 mb-8 shadow-xl animate-in slide-in-from-top">
            <div className="flex items-center gap-3 text-green-600">
              <Check className="w-6 h-6" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Successfully Installed!</h3>
                <p className="text-gray-600">Check your home screen for the ReplayHub app</p>
              </div>
            </div>
          </div>
        )}
        {/* Install Button for Android/Desktop */}
        {!isIOS && !isStandalone && deferredPrompt && (
          <div className="bg-white/95 backdrop-blur border border-white/20 rounded-xl p-8 mb-8 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-xl flex items-center justify-center shadow-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Install</h2>
                <p className="text-gray-600">One click to install</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] hover:from-[#1ac4cf] hover:to-[#2ef6fc] text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Install ReplayHub Now
            </button>
          </div>
        )}
        {/* iOS Instructions */}
        {isIOS && !isStandalone && (
          <div className="bg-white/95 backdrop-blur border border-white/20 rounded-xl p-8 mb-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Install on iPhone/iPad</h2>
                <p className="text-gray-600">Using Safari browser</p>
              </div>
            </div>

            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                  1
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">Tap the three dots (•••)</p>
                  <p className="text-gray-600">Located at the bottom right of Safari</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                  2
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">Tap "Share"</p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Share className="w-5 h-5" />
                    <span>Box with arrow pointing up</span>
                  </div>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                  3
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">
                    Scroll down and tap "Add to Home Screen"
                  </p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Plus className="w-5 h-5" />
                    <span>Plus icon option</span>
                  </div>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                  4
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">Tap "Add" to confirm</p>
                  <p className="text-gray-600">The app will appear on your home screen</p>
                </div>
              </li>
            </ol>
          </div>
        )}
        {/* Android/Desktop Instructions (fallback) */}
        {!isIOS && !isStandalone && !deferredPrompt && (
          <div className="bg-white/95 backdrop-blur border border-white/20 rounded-xl p-8 mb-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Install on Android/Desktop</h2>
                <p className="text-gray-600">Using Chrome, Edge, or Samsung Internet</p>
              </div>
            </div>

            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                  1
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">Open the browser menu</p>
                  <p className="text-gray-600">Tap the three dots (⋮) in the top right corner</p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                  2
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">
                    Look for "Install app" or "Add to Home screen"
                  </p>
                  <p className="text-gray-600">
                    Some browsers show an install icon in the address bar
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                  3
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">Tap "Install"</p>
                  <p className="text-gray-600">The app will be added to your device</p>
                </div>
              </li>
            </ol>
          </div>
        )}
        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur border border-white/20 rounded-xl p-6 shadow-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-[#fc040e] to-[#ff6b6b] rounded-lg flex items-center justify-center mb-3 shadow-md">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">App-Like Experience</h3>
            <p className="text-gray-600 text-sm">
              Runs fullscreen without browser UI for a native app feel
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur border border-white/20 rounded-xl p-6 shadow-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-lg flex items-center justify-center mb-3 shadow-md">
              <Download className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">Quick Access</h3>
            <p className="text-gray-600 text-sm">
              Launch directly from your home screen in one tap
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur border border-white/20 rounded-xl p-6 shadow-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-[#fc040e] to-[#ff6b6b] rounded-lg flex items-center justify-center mb-3 shadow-md">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-2">Works Offline</h3>
            <p className="text-gray-600 text-sm">
              Basic functionality available even without internet
            </p>
          </div>
        </div>
        {/* Back Link */}
        <div className="mt-12 text-center">
          <a href="/" className="text-white/80 hover:text-white transition-colors font-medium">
            ← Back to ReplayHub
          </a>
        </div>
      </div>
    </div>
  );
}
