"use client";

import { apiGet, apiPost } from "@/lib/api/client";
import { getServerUrl } from "@/lib/api/config";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface QuickLoginPromptProps {
  onSuccess: (user: any) => void;
  onBack: () => void;
  onNotAvailable?: () => void;
}

export function QuickLoginPrompt({ onSuccess, onBack, onNotAvailable }: QuickLoginPromptProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    email: string;
    name: string;
    avatar?: string | null;
  } | null>(null);
  const [checking, setChecking] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    checkQuickLoginAvailable();
  }, []);

  const getStoredEmail = () => {
    return localStorage.getItem("replayhub_quick_login_email");
  };

  const checkQuickLoginAvailable = async () => {
    const email = getStoredEmail();
    if (!email) {
      setChecking(false);
      onNotAvailable?.();
      return;
    }

    try {
      const result = (await apiGet(
        `/global/auth/quick-login/check?email=${encodeURIComponent(email)}`
      )) as { available?: boolean; user?: any };
      if (result.available && result.user) {
        console.log("Quick login user info:", result.user);
        console.log("Avatar path:", result.user.avatar);
        console.log("Server URL:", getServerUrl());
        console.log(
          "Full avatar URL:",
          result.user.avatar ? `${getServerUrl()}${result.user.avatar}` : "No avatar"
        );
        setUserInfo(result.user);
      } else {
        // Quick login not available for this user
        onNotAvailable?.();
      }
    } catch (err) {
      console.error("Failed to check quick login", err);
      onNotAvailable?.();
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin.length < 4) {
      setError("Please enter your PIN");
      return;
    }

    const email = getStoredEmail();
    if (!email) {
      setError("Email not found");
      return;
    }

    setIsLoading(true);

    try {
      const result = (await apiPost("/global/auth/quick-login/verify", {
        pin,
        email,
      })) as { user?: any };

      onSuccess(result.user);
    } catch (err: any) {
      setError(err.message || "Invalid PIN");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setPin(numericValue);
    setError("");
  };

  if (checking) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Checking quick login...</p>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        {userInfo.avatar && !avatarError ? (
          <div className="inline-block w-16 h-16 rounded-full mb-4 overflow-hidden ring-4 ring-[#2ef6fc]/20">
            <img
              src={`${getServerUrl()}${userInfo.avatar}`}
              alt={userInfo.name || "User"}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Failed to load avatar from:", `${getServerUrl()}${userInfo.avatar}`);
                setAvatarError(true);
              }}
            />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-full mb-4">
            <span className="text-2xl font-bold text-white">
              {userInfo.name?.charAt(0).toUpperCase() || userInfo.email.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <p className="text-lg font-semibold text-gray-900">
          {userInfo.name} ({userInfo.email})
        </p>
        <p className="text-sm text-gray-500 mt-1">Enter your PIN to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pin" className="sr-only">
            PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => handlePinInput(e.target.value)}
            className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ef6fc] focus:border-transparent"
            placeholder="••••"
            autoFocus
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || pin.length < 4}
          className="w-full px-4 py-3 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] text-white font-semibold rounded-lg hover:from-[#1ac4cf] hover:to-[#2ef6fc] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Unlock"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Sign in with password
      </button>
    </div>
  );
}
