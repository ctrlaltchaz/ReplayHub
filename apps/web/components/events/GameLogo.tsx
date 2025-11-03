"use client";

import { Gamepad2 } from "lucide-react";
import Image from "next/image";

interface GameLogoProps {
    gameName?: string | null;
    size?: "sm" | "md" | "lg";
    showName?: boolean;
}

// Mapping of game names to local logo files
const gameLogos: Record<string, string> = {
    "valorant": "/logos/valorant.svg",
    "league of legends": "/logos/lol.svg",
    "lol": "/logos/lol.svg",
    "counter-strike 2": "/logos/cs2.svg",
    "cs2": "/logos/cs2.svg",
    "cs:go": "/logos/cs2.svg",
    "csgo": "/logos/cs2.svg",
    "dota 2": "/logos/dota2.svg",
    "rocket league": "/logos/rocketleague.svg",
    "overwatch 2": "/logos/overwatch.svg",
    "overwatch": "/logos/overwatch.svg",
    "apex legends": "/logos/apex.svg",
    "apex": "/logos/apex.svg",
};

const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
};

export function GameLogo({ gameName, size = "sm", showName = true }: GameLogoProps) {
    if (!gameName) {
        return showName ? (
            <div className="flex items-center text-sm text-muted-foreground">
                <Gamepad2 className={`${sizeClasses[size]} mr-2`} />
                <span>No game</span>
            </div>
        ) : (
            <Gamepad2 className={`${sizeClasses[size]} text-muted-foreground`} />
        );
    }

    const normalizedName = gameName.toLowerCase().trim();
    const logoPath = gameLogos[normalizedName];

    if (logoPath) {
        return (
            <div className="flex items-center gap-2">
                <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
                    <Image
                        src={logoPath}
                        alt={`${gameName} logo`}
                        width={size === "sm" ? 20 : size === "md" ? 24 : 32}
                        height={size === "sm" ? 20 : size === "md" ? 24 : 32}
                        className="object-contain"
                    />
                </div>
                {showName && <span className="line-clamp-1 text-sm">{gameName}</span>}
            </div>
        );
    }

    // Fallback to gamepad icon
    return (
        <div className="flex items-center gap-2 text-sm">
            <Gamepad2 className={`${sizeClasses[size]} text-muted-foreground flex-shrink-0`} />
            {showName && <span className="line-clamp-1">{gameName}</span>}
        </div>
    );
}
