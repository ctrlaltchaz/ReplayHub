"use client";

import packageJson from "../../package.json";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-card mt-auto">
            <div className="container mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Left side - Copyright and Company info */}
                    <div className="text-sm text-muted-foreground text-center md:text-left">
                        <p>© {currentYear} ReplayHub. All rights reserved.</p>
                        <p className="mt-1 text-xs">
                            ReplayHub is a trading name of McKeon Digital Ltd
                        </p>
                        <p className="mt-1 text-xs">
                            Company registered in England and Wales. Company No: 16956031
                        </p>
                        <p className="mt-1 text-xs">
                            Registered Office: 3rd Floor, 86-90 Paul Street, London, England, United Kingdom, EC2A 4NE
                        </p>
                        <p className="mt-2 text-xs opacity-70">
                            {packageJson.version}
                        </p>
                    </div>

                    {/* Right side - Links */}
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm">
                        <div className="flex gap-4">
                            <a
                                href="https://mckeon.digital/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="https://mckeon.digital/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="https://mckeon.digital/contact"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
