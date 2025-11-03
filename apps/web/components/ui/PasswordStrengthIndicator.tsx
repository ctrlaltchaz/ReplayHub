"use client";

import { CheckCircle2, XCircle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const getStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        return strength;
    };

    const strength = getStrength();
    const hasMinLength = password.length >= 8;
    const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const getStrengthLabel = () => {
        if (strength === 0) return { label: "Very Weak", color: "text-red-600 dark:text-red-400" };
        if (strength <= 2) return { label: "Weak", color: "text-orange-600 dark:text-orange-400" };
        if (strength === 3) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400" };
        if (strength === 4) return { label: "Good", color: "text-blue-600 dark:text-blue-400" };
        return { label: "Strong", color: "text-green-600 dark:text-green-400" };
    };

    const getStrengthColor = () => {
        if (strength === 0) return "bg-red-500";
        if (strength <= 2) return "bg-orange-500";
        if (strength === 3) return "bg-yellow-500";
        if (strength === 4) return "bg-blue-500";
        return "bg-green-500";
    };

    const strengthInfo = getStrengthLabel();

    if (!password) return null;

    return (
        <div className="space-y-3 mt-2" role="region" aria-label="Password strength indicator">
            {/* Strength bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Password Strength</span>
                    <span className={`text-xs font-semibold ${strengthInfo.color}`} aria-live="polite">
                        {strengthInfo.label}
                    </span>
                </div>
                <div
                    className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={strength}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label={`Password strength: ${strengthInfo.label}`}
                >
                    <div
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                    />
                </div>
            </div>

            {/* Requirements checklist */}
            <div className="space-y-1.5 text-xs" role="list" aria-label="Password requirements">
                <RequirementItem
                    met={hasMinLength}
                    text="At least 8 characters"
                />
                <RequirementItem
                    met={hasUpperAndLower}
                    text="Uppercase and lowercase letters"
                />
                <RequirementItem
                    met={hasNumber}
                    text="At least one number"
                />
                <RequirementItem
                    met={hasSpecialChar}
                    text="At least one special character (!@#$%^&*)"
                />
            </div>
        </div>
    );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <div className="flex items-center gap-2" role="listitem">
            {met ? (
                <CheckCircle2
                    className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0"
                    aria-hidden="true"
                />
            ) : (
                <XCircle
                    className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600 flex-shrink-0"
                    aria-hidden="true"
                />
            )}
            <span className={met ? "text-green-700 dark:text-green-300" : "text-muted-foreground"}>
                <span className="sr-only">{met ? "Requirement met:" : "Requirement not met:"}</span>
                {text}
            </span>
        </div>
    );
}
