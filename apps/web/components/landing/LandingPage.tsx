"use client";

import {
    AlertCircle,
    BarChart3,
    Calendar,
    CheckSquare,
    FileText,
    Gamepad2,
    Globe,
    Lock,
    LogIn,
    Package,
    Palette,
    Shield,
    Star,
    Users,
    Zap
} from "lucide-react";
import Link from "next/link";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <Gamepad2 className="h-8 w-8 text-primary" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                ReplayHub
                            </h1>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        <Star className="h-4 w-4" />
                        <span>Multi-tenant Esports Operations Platform</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        Manage Your Esports
                        <br />
                        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Organization Effortlessly
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        ReplayHub is the all-in-one platform designed for esports organizations to manage teams,
                        events, rosters, inventory, and operations with complete tenant isolation and custom branding.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/login">
                            <button className="group relative inline-flex items-center justify-center gap-3 px-12 py-6 text-xl font-semibold text-white bg-gradient-to-r from-primary to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                                <LogIn className="h-6 w-6" />
                                <span>Login to ReplayHub</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 px-4 bg-muted/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Comprehensive tools to run your esports organization like a pro
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature Cards */}
                        <FeatureCard
                            icon={<Users className="h-8 w-8" />}
                            title="Roster Management"
                            description="Manage teams, players, lineups, achievements, and availability all in one place. Track performance and organize your competitive roster."
                        />
                        <FeatureCard
                            icon={<Calendar className="h-8 w-8" />}
                            title="Event Planning"
                            description="Create and manage tournaments, scrims, and events. Integrated calendar view keeps your entire organization synchronized."
                        />
                        <FeatureCard
                            icon={<Gamepad2 className="h-8 w-8" />}
                            title="Game Log"
                            description="Track every match, scrim, and practice session. Record scores, players, and detailed notes for post-game analysis."
                        />
                        <FeatureCard
                            icon={<FileText className="h-8 w-8" />}
                            title="Runsheets"
                            description="Create detailed runsheets for events with tasks, timings, and responsibilities. Keep your production team coordinated."
                        />
                        <FeatureCard
                            icon={<CheckSquare className="h-8 w-8" />}
                            title="Checklists"
                            description="Pre-event, during-event, and post-event checklists ensure nothing gets forgotten. Templates save time for recurring events."
                        />
                        <FeatureCard
                            icon={<Package className="h-8 w-8" />}
                            title="Inventory System"
                            description="Track equipment, peripherals, and assets. Monitor quantities, locations, and assignments with full audit trails."
                        />
                        <FeatureCard
                            icon={<AlertCircle className="h-8 w-8" />}
                            title="Incident Reporting"
                            description="Document and track incidents, issues, and resolutions. Maintain accountability with detailed incident logs."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-8 w-8" />}
                            title="Analytics Dashboard"
                            description="Get insights into your organization's performance, event metrics, and resource utilization at a glance."
                        />
                        <FeatureCard
                            icon={<Palette className="h-8 w-8" />}
                            title="Custom Branding"
                            description="Complete white-label support with custom logos, colors, and themes. Make the platform truly yours."
                        />
                    </div>
                </div>
            </section>

            {/* Security & Architecture */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Built for Scale & Security</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Enterprise-grade architecture with complete tenant isolation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <TechCard
                            icon={<Lock className="h-8 w-8" />}
                            title="Row-Level Security"
                            description="PostgreSQL RLS ensures complete data isolation between organizations."
                        />
                        <TechCard
                            icon={<Shield className="h-8 w-8" />}
                            title="RBAC Permissions"
                            description="Casbin-style role-based access control with granular permissions."
                        />
                        <TechCard
                            icon={<Zap className="h-8 w-8" />}
                            title="High Performance"
                            description="Redis caching and optimized queries for lightning-fast responses."
                        />
                        <TechCard
                            icon={<Globe className="h-8 w-8" />}
                            title="Multi-Tenant"
                            description="Isolated tenants with shared infrastructure for maximum efficiency."
                        />
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-20 px-4 bg-muted/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Modern Technology Stack</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Built with cutting-edge technologies for reliability and performance
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <TechBadge name="NestJS" description="Backend Framework" />
                        <TechBadge name="Next.js 14" description="Frontend Framework" />
                        <TechBadge name="PostgreSQL" description="Database" />
                        <TechBadge name="Redis" description="Cache & Queue" />
                        <TechBadge name="TypeScript" description="Type Safety" />
                        <TechBadge name="Docker" description="Containerization" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-12 text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">
                            Professional Esports Operations Management
                        </h2>
                        <p className="text-xl opacity-90 max-w-2xl mx-auto">
                            Streamline your esports organization with comprehensive tools for roster management,
                            event planning, inventory tracking, and more.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-card py-12 px-4">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Gamepad2 className="h-6 w-6 text-primary" />
                                <h3 className="font-bold text-lg">ReplayHub</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The ultimate esports operations platform for teams and organizations.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Platform Features</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>Roster Management</li>
                                <li>Event Planning & Calendar</li>
                                <li>Game Log & Match Tracking</li>
                                <li>Inventory & Asset Management</li>
                                <li>Custom Branding & Themes</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} ReplayHub. All rights reserved.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Developed by <span className="font-medium text-foreground">Charlie McKeon</span> | Hosted by{" "}
                            <a
                                href="https://mckeonwebsolutions.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-foreground hover:text-primary underline"
                            >
                                McKeon Web Solutions
                            </a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-shadow">
            <div className="text-primary mb-4">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

function TechCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="bg-card p-6 rounded-xl border text-center">
            <div className="text-primary mb-3 flex justify-center">{icon}</div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function TechBadge({ name, description }: { name: string; description: string }) {
    return (
        <div className="bg-card p-4 rounded-lg border text-center">
            <h4 className="font-semibold text-lg mb-1">{name}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
