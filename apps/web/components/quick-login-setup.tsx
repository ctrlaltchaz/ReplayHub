"use client";

import { apiPost } from "@/lib/api/client";
import { AlertCircle, Check, Lock, Smartphone, X } from "lucide-react";
import { useState } from "react";

interface QuickLoginSetupProps {
  isEnabled: boolean;
  onUpdate: () => void;
  userEmail: string;
}

export function QuickLoginSetup({ isEnabled, onUpdate, userEmail }: QuickLoginSetupProps) {
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4-6 digits");
      return;
    }

    if (!/^[0-9]+$/.test(pin)) {
      setError("PIN must contain only numbers");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    setIsLoading(true);

    try {
      // Store email for quick login on all devices
      localStorage.setItem("replayhub_quick_login_email", userEmail);

      await apiPost("/global/auth/quick-login/setup", {
        pin,
        currentPassword,
        deviceId: "all-devices", // Backend ignores this now
      });

      setSuccess("Quick login PIN enabled on all your devices!");
      setPin("");
      setConfirmPin("");
      setCurrentPassword("");
      setShowSetup(false);
      setTimeout(() => {
        onUpdate();
      }, 1000);
    } catch (err: any) {
      console.error("Quick login setup error:", err);
      setError(err.message || "Failed to setup PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisablePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }

    setIsLoading(true);

    try {
      await apiPost("/global/auth/quick-login/disable", {
        currentPassword,
      });

      // Remove email from storage
      localStorage.removeItem("replayhub_quick_login_email");

      setSuccess("Quick login PIN disabled on all devices!");
      setCurrentPassword("");
      setShowDisable(false);
      setTimeout(() => {
        onUpdate();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to disable PIN");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Quick Login PIN</h3>
            <p className="text-sm text-gray-600">Login faster with a PIN on this device</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEnabled ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
              <Check className="w-4 h-4" />
              Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded">
              <X className="w-4 h-4" />
              Disabled
            </span>
          )}
        </div>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!showSetup && !showDisable && (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            {isEnabled
              ? "Quick login is currently enabled on this device. You can use your PIN to log in quickly."
              : "Enable quick login to use a PIN instead of your password on this device."}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Security Note:</strong> Quick login is device-specific. Your PIN will only
                work on this browser/device for added security.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEnabled ? (
              <button
                onClick={() => setShowDisable(true)}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Disable PIN
              </button>
            ) : (
              <button
                onClick={() => setShowSetup(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] text-white rounded-lg hover:from-[#1ac4cf] hover:to-[#2ef6fc] transition-all shadow-md text-sm font-medium"
              >
                Enable Quick Login
              </button>
            )}
          </div>
        </div>
      )}

      {showSetup && (
        <form onSubmit={handleSetupPin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Create PIN (4-6 digits)
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ef6fc] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ef6fc] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password (for verification)
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ef6fc] focus:border-transparent"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#2ef6fc] to-[#1ac4cf] text-white rounded-lg hover:from-[#1ac4cf] hover:to-[#2ef6fc] transition-all shadow-md font-medium disabled:opacity-50"
            >
              {isLoading ? "Setting up..." : "Enable PIN"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSetup(false);
                setPin("");
                setConfirmPin("");
                setCurrentPassword("");
                setError("");
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {showDisable && (
        <form onSubmit={handleDisablePin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password (for verification)
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ef6fc] focus:border-transparent"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? "Disabling..." : "Disable PIN"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDisable(false);
                setCurrentPassword("");
                setError("");
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
