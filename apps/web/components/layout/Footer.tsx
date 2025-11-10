"use client";

import packageJson from "../../../../package.json";

export function Footer() {
    const currentYear = new Date().getFullYear();
    const appVersion = packageJson.version;

    return (
        <footer className="border-t bg-card mt-auto">
            <div className="container mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Left side - Copyright and Developer info */}
                    <div className="text-sm text-muted-foreground text-center md:text-left">
                        <p>© {currentYear} ReplayHub. All rights reserved.</p>
                        <p className="mt-1">
                            Developed by <span className="font-medium text-foreground">Charlie McKeon</span>
                        </p>
                        <p className="mt-1 text-xs opacity-70">v{appVersion}</p>
                    </div>

                    {/* Right side - Links and Hosted by */}
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm">
                        <div className="flex gap-4">
                            <a
                                href="https://replayhub.app/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="https://replayhub.app/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="https://replayhub.app/support"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Support
                            </a>
                        </div>
                        <div className="text-muted-foreground">
                            Hosted by{" "}
                            <a
                                href="https://mckeonwebsolutions.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-foreground hover:text-primary transition-colors underline"
                            >
                                McKeon Web Solutions
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
