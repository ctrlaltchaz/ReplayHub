"use client";

import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useBadgeCounts } from "@/hooks/useBadgeCounts";
import { useQuickLinks } from "@/hooks/useQuickLinks";
import { ADMIN_NAV, adminPath, ORG_NAV } from "@/lib/paths/org";
import { hasPermission, isGlobalAdmin, PERMISSIONS } from "@/lib/permissions/utils";
import { cn } from "@/lib/utils";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ExternalLink as ExternalLinkIcon,
    Link2,
    Palette,
    Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";

interface SidebarProps {
    slug?: string;
    className?: string;
    mobileMenuOpen?: boolean;
    onMobileMenuClose?: () => void;
}

// Icon mapping for nav items
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    overview: require("lucide-react").LayoutDashboard,
    profile: require("lucide-react").User,
    events: require("lucide-react").Calendar,
    calendar: require("lucide-react").Calendar,
    rosters: require("lucide-react").Users,
    gamelog: require("lucide-react").FileText,
    "player-stats": require("lucide-react").BarChart3,
    runsheets: require("lucide-react").FileText,
    checklists: require("lucide-react").CheckSquare,
    inventory: require("lucide-react").Package,
    assets: require("lucide-react").Package2,
    incidents: require("lucide-react").AlertTriangle,
    reports: require("lucide-react").BarChart3,
    settings: require("lucide-react").Settings,
    admin: require("lucide-react").Settings,
    // Admin navigation icons
    "control-center": require("lucide-react").Shield,
    organisations: require("lucide-react").Building,
    "global-users": require("lucide-react").Users,
    audit: require("lucide-react").FileText,
    // Quick Links icons
    Link2: require("lucide-react").Link2,
    ExternalLink: require("lucide-react").ExternalLink,
    Home: require("lucide-react").Home,
    FileText: require("lucide-react").FileText,
    Users: require("lucide-react").Users,
    Calendar: require("lucide-react").Calendar,
    Settings: require("lucide-react").Settings,
    BarChart3: require("lucide-react").BarChart3,
    MessageSquare: require("lucide-react").MessageSquare,
    BookOpen: require("lucide-react").BookOpen,
    Video: require("lucide-react").Video,
    Image: require("lucide-react").Image,
    Globe: require("lucide-react").Globe,
    Mail: require("lucide-react").Mail,
    Phone: require("lucide-react").Phone,
    MapPin: require("lucide-react").MapPin,
    Star: require("lucide-react").Star,
    Heart: require("lucide-react").Heart,
    Shield: require("lucide-react").Shield,
    Zap: require("lucide-react").Zap,
};

export function Sidebar({ slug, className, mobileMenuOpen = false, onMobileMenuClose }: SidebarProps) {
    // Load collapse state from localStorage
    const [isCollapsed, setIsCollapsed] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed');
            return saved === 'true';
        }
        return false;
    });

    // Track which submenus are open
    const [openSubmenus, setOpenSubmenus] = React.useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-open-submenus');
            return saved ? new Set(JSON.parse(saved)) : new Set(['rosters']); // Default rosters open
        }
        return new Set(['rosters']);
    });

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { globalUser, permissions, isLoadingOrg, isPermissionsReady } = useAuth();
    const { counts, isLoading: countsLoading } = useBadgeCounts(slug);
    const { data: quickLinks, isLoading: quickLinksLoading } = useQuickLinks(slug);

    // Store last visited org in localStorage
    React.useEffect(() => {
        if (slug && typeof window !== 'undefined') {
            localStorage.setItem('lastOrgSlug', slug);
            // Try to get org name from the page or fetch it
            // For now, we'll just store the slug
        }
    }, [slug]);

    // Persist collapse state to localStorage
    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar-collapsed', String(newState));
        }
    };

    // Toggle submenu open/closed
    const toggleSubmenu = (key: string) => {
        setOpenSubmenus(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem('sidebar-open-submenus', JSON.stringify(Array.from(newSet)));
            }
            return newSet;
        });
    };

    // Detect if we're on admin pages
    const isAdminPage = pathname?.startsWith('/admin');

    // Helper to check if user has required permissions (using centralized utility)
    const checkPermission = (required?: string | string[]): boolean => {
        return hasPermission(permissions, required);
    };

    // Helper to get badge count for a navigation item
    const getBadgeCount = (itemKey: string): number => {
        if (countsLoading || !slug) return 0;

        switch (itemKey) {
            case 'incidents':
                return counts.incidents;
            case 'events':
                return counts.events;
            case 'checklists':
                return counts.checklists;
            default:
                return 0;
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onMobileMenuClose}
                />
            )}

            {/* Desktop sidebar */}
            <div
                data-sidebar="true"
                className={cn(
                    "hidden lg:flex flex-col border-r bg-card text-card-foreground transition-all duration-300 shadow-modern",
                    isCollapsed ? "w-20" : "w-72",
                    className
                )}
            >
                {/* Collapse toggle */}
                <div className="flex items-center justify-end p-4 border-b">
                    <Button
                        variant="ghost"
                        size="default"
                        onClick={toggleCollapse}
                        className="h-10 w-10 p-0 hover:bg-accent"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto space-y-2 p-4">
                    {globalUser && !slug ? (
                        /* Global Context - Simplified Navigation */
                        <>
                            {/* Back to Org Button */}
                            {typeof window !== 'undefined' && localStorage.getItem('lastOrgSlug') && (
                                <Link
                                    href={`/org/${localStorage.getItem('lastOrgSlug')}`}
                                    className={cn(
                                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-all duration-200",
                                        "font-medium hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        "font-montserrat bg-muted",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                    title={isCollapsed ? "Back to Organization" : undefined}
                                >
                                    <iconMap.overview className="h-5 w-5 shrink-0" />
                                    {!isCollapsed && (
                                        <span className="truncate font-medium font-montserrat">
                                            Back to {localStorage.getItem('lastOrgName') || 'Organization'}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* Feedback Link */}
                            <Link
                                href="/feedback"
                                className={cn(
                                    "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                    "hover:bg-primary hover:text-primary-foreground hover:shadow-sm",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    "font-montserrat",
                                    pathname?.startsWith("/feedback") && "bg-primary text-primary-foreground shadow-modern font-semibold",
                                    isCollapsed && "justify-center px-3"
                                )}
                                title={isCollapsed ? "Bug Reports & Suggestions" : undefined}
                            >
                                <iconMap.MessageSquare className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span className="truncate font-medium font-montserrat">Feedback</span>}
                            </Link>

                            {/* Control Center for Admins */}
                            {isGlobalAdmin(globalUser) && (
                                <>
                                    <div className={cn(
                                        "border-t pt-4 mt-4",
                                        isCollapsed && "border-t-0 pt-0 mt-0"
                                    )}>
                                        {!isCollapsed && (
                                            <div className="px-4 py-2 text-sm font-bold text-muted-foreground uppercase tracking-wider font-montserrat">
                                                Global Admin
                                            </div>
                                        )}
                                        <Link
                                            href={adminPath.controlCenter()}
                                            className={cn(
                                                "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                                "hover:bg-primary hover:text-primary-foreground hover:shadow-sm",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                "font-montserrat",
                                                pathname?.startsWith(adminPath.controlCenter()) && "bg-primary text-primary-foreground shadow-modern font-semibold",
                                                isCollapsed && "justify-center px-3"
                                            )}
                                            title={isCollapsed ? "Admin Control Center" : undefined}
                                        >
                                            <Shield className="h-5 w-5 shrink-0" />
                                            {!isCollapsed && <span className="truncate font-medium font-montserrat">Control Center</span>}
                                        </Link>
                                    </div>
                                </>
                            )}
                        </>
                    ) : isAdminPage ? (
                        /* Admin Navigation */
                        ADMIN_NAV.map((item) => {
                            // For admin pages, we assume global admin has access to all admin navigation
                            const href = item.href();
                            const isActive = pathname === href || pathname?.startsWith(href + '/');
                            const Icon = iconMap[item.key] || iconMap.overview;

                            return (
                                <Link
                                    key={item.key}
                                    href={href}
                                    className={cn(
                                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-all duration-200",
                                        "font-medium hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        "font-montserrat", // Ensure Montserrat font
                                        isActive && "bg-primary text-primary-foreground shadow-modern font-semibold",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {!isCollapsed && <span className="truncate font-medium font-montserrat">{item.label}</span>}
                                </Link>
                            );
                        })
                    ) : (
                        /* Organization Navigation */
                        <>
                            {/* Show loading skeleton while org permissions are loading */}
                            {slug && !isPermissionsReady ? (
                                <div className="space-y-2 px-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-10 bg-gray-700/50 rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                ORG_NAV.filter(item => item.key !== 'settings').map((item) => {
                                    // Check permission - no special handling needed since we wait for loading to complete
                                    const hasAccess = checkPermission(item.required);

                                    // Debug logging
                                    if (['runsheets', 'checklists', 'inventory', 'assets', 'overview', 'events', 'rosters'].includes(item.key)) {
                                        console.log(`[Sidebar] ${item.key}:`, {
                                            required: item.required,
                                            hasAccess,
                                            isLoadingOrg,
                                            isPermissionsReady,
                                            permissionsLength: permissions.length,
                                            firstFewPermissions: permissions.slice(0, 3)
                                        });
                                    }

                                    if (!hasAccess) {
                                        return null; // Hide item if user lacks permission
                                    }

                                    const href = slug ? item.href(slug) : '#';
                                    // Check if current page is this route or a child route
                                    const isActive = pathname === href || pathname?.startsWith(href + '/');
                                    // Check if any child is active by comparing pathname + search params
                                    const hasActiveChild = item.children?.some(child => {
                                        const childHref = slug ? child.href(slug) : '#';
                                        // pathname includes the path, we need to check if we're on the rosters page
                                        return pathname?.startsWith('/org/' + slug + '/rosters') &&
                                            (childHref.includes('?tab=') || pathname === childHref);
                                    });
                                    const Icon = iconMap[item.key] || iconMap.overview;
                                    const badgeCount = getBadgeCount(item.key);
                                    const isSubmenuOpen = openSubmenus.has(item.key);
                                    const hasChildren = item.children && item.children.length > 0;

                                    return (
                                        <div key={item.key}>
                                            {hasChildren ? (
                                                // Item with submenu - make entire row clickable for toggle
                                                <button
                                                    onClick={() => toggleSubmenu(item.key)}
                                                    className={cn(
                                                        "w-full flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-all duration-200",
                                                        "font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                        "font-montserrat text-left",
                                                        (isActive || hasActiveChild)
                                                            ? "bg-primary text-primary-foreground shadow-modern font-semibold hover:bg-primary/90"
                                                            : "hover:bg-primary hover:text-primary-foreground hover:shadow-sm",
                                                        isCollapsed && "justify-center px-3"
                                                    )}
                                                    title={isCollapsed ? item.label : undefined}
                                                >
                                                    <Icon className="h-5 w-5 shrink-0" />
                                                    {!isCollapsed && (
                                                        <>
                                                            <span className="flex-1 truncate font-medium font-montserrat">{item.label}</span>
                                                            <ChevronDown className={cn(
                                                                "h-4 w-4 shrink-0 transition-transform duration-200",
                                                                isSubmenuOpen && "transform rotate-180"
                                                            )} />
                                                        </>
                                                    )}
                                                    {!isCollapsed && badgeCount > 0 && (
                                                        <Badge variant="destructive">
                                                            {badgeCount > 99 ? '99+' : badgeCount}
                                                        </Badge>
                                                    )}
                                                </button>
                                            ) : (
                                                // Regular link item without submenu
                                                <Link
                                                    href={href}
                                                    className={cn(
                                                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-all duration-200",
                                                        "font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                        "font-montserrat",
                                                        isActive
                                                            ? "bg-primary text-primary-foreground shadow-modern font-semibold hover:bg-primary/90"
                                                            : "hover:bg-primary hover:text-primary-foreground hover:shadow-sm",
                                                        isCollapsed && "justify-center px-3"
                                                    )}
                                                    aria-current={isActive ? "page" : undefined}
                                                    title={isCollapsed ? item.label : undefined}
                                                >
                                                    <Icon className="h-5 w-5 shrink-0" />
                                                    {!isCollapsed && (
                                                        <span className="flex-1 truncate font-medium font-montserrat">{item.label}</span>
                                                    )}
                                                    {!isCollapsed && badgeCount > 0 && (
                                                        <Badge variant="destructive" className="ml-auto">
                                                            {badgeCount > 99 ? '99+' : badgeCount}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            )}

                                            {/* Submenu items */}
                                            {!isCollapsed && item.children && isSubmenuOpen && (
                                                <div className="ml-9 mt-1 space-y-1">
                                                    {item.children.map((child) => {
                                                        const childHasAccess = checkPermission(child.required);
                                                        if (!childHasAccess) return null;

                                                        const childHref = slug ? child.href(slug) : '#';
                                                        // Check if this child tab is active by comparing pathname and query params
                                                        const childIsActive = pathname?.startsWith('/org/' + slug + '/rosters') &&
                                                            childHref.includes('?tab=') &&
                                                            childHref.includes(searchParams?.get('tab') || '');

                                                        return (
                                                            <Link
                                                                key={child.key}
                                                                href={childHref}
                                                                className={cn(
                                                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                                    "font-montserrat",
                                                                    childIsActive
                                                                        ? "bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80"
                                                                        : "hover:bg-secondary hover:text-secondary-foreground"
                                                                )}
                                                                aria-current={childIsActive ? "page" : undefined}
                                                            >
                                                                <span className="truncate">{child.label}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}

                            {/* Quick Links Section - Organization custom links */}
                            {slug && quickLinks && quickLinks.length > 0 && (
                                <div>
                                    <button
                                        onClick={() => toggleSubmenu('quick-links')}
                                        className={cn(
                                            "w-full flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-all duration-200",
                                            "font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                            "font-montserrat text-left",
                                            "hover:bg-primary hover:text-primary-foreground hover:shadow-sm",
                                            isCollapsed && "justify-center px-3"
                                        )}
                                        title={isCollapsed ? "Quick Links" : undefined}
                                    >
                                        <Link2 className="h-5 w-5 shrink-0" />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 truncate font-medium font-montserrat">Quick Links</span>
                                                <ChevronDown className={cn(
                                                    "h-4 w-4 shrink-0 transition-transform duration-200",
                                                    openSubmenus.has('quick-links') && "transform rotate-180"
                                                )} />
                                            </>
                                        )}
                                    </button>

                                    {/* Quick Links submenu items */}
                                    {!isCollapsed && openSubmenus.has('quick-links') && (
                                        <div className="ml-9 mt-1 space-y-1">
                                            {quickLinks.map((link, index) => {
                                                const IconComponent = link.icon && iconMap[link.icon as keyof typeof iconMap]
                                                    ? iconMap[link.icon as keyof typeof iconMap]
                                                    : Link2;

                                                const isExternal = link.url.startsWith('http://') || link.url.startsWith('https://');
                                                const linkContent = (
                                                    <>
                                                        <IconComponent className="h-4 w-4 shrink-0" />
                                                        <span className="truncate">{link.label}</span>
                                                        {isExternal && link.openInNewTab && (
                                                            <ExternalLinkIcon className="h-3 w-3 shrink-0 ml-auto opacity-60" />
                                                        )}
                                                    </>
                                                );

                                                const linkClassName = cn(
                                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                    "font-montserrat hover:bg-secondary hover:text-secondary-foreground"
                                                );

                                                if (isExternal) {
                                                    return (
                                                        <a
                                                            key={`quick-link-${index}`}
                                                            href={link.url}
                                                            target={link.openInNewTab ? "_blank" : "_self"}
                                                            rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                                                            className={linkClassName}
                                                        >
                                                            {linkContent}
                                                        </a>
                                                    );
                                                } else {
                                                    return (
                                                        <Link
                                                            key={`quick-link-${index}`}
                                                            href={link.url}
                                                            className={linkClassName}
                                                        >
                                                            {linkContent}
                                                        </Link>
                                                    );
                                                }
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Settings - Render last */}
                            {(() => {
                                const settingsItem = ORG_NAV.find(item => item.key === 'settings');
                                if (!settingsItem) return null;

                                const isStillLoading = slug && permissions.length === 0;
                                const hasAccess = (isLoadingOrg || isStillLoading) ? true : checkPermission(settingsItem.required);

                                if (!hasAccess) return null;

                                const href = slug ? settingsItem.href(slug) : '#';
                                const isActive = pathname === href || pathname?.startsWith(href + '/');
                                const Icon = iconMap[settingsItem.key] || iconMap.overview;

                                return (
                                    <Link
                                        href={href}
                                        className={cn(
                                            "flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-all duration-200",
                                            "font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                            "font-montserrat",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-modern font-semibold hover:bg-primary/90"
                                                : "hover:bg-primary hover:text-primary-foreground hover:shadow-sm",
                                            isCollapsed && "justify-center px-3"
                                        )}
                                        aria-current={isActive ? "page" : undefined}
                                        title={isCollapsed ? settingsItem.label : undefined}
                                    >
                                        <Icon className="h-5 w-5 shrink-0" />
                                        {!isCollapsed && (
                                            <span className="flex-1 truncate font-medium font-montserrat">{settingsItem.label}</span>
                                        )}
                                    </Link>
                                );
                            })()}
                        </>
                    )}

                    {/* Feedback Section - Available in org context */}
                    {globalUser && slug && (
                        <>
                            <div className={cn(
                                "border-t pt-4 mt-4",
                                isCollapsed && "border-t-0 pt-0 mt-0"
                            )}>
                                <Link
                                    href="/feedback"
                                    className={cn(
                                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                        "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        pathname?.startsWith("/feedback") && "bg-primary text-primary-foreground shadow-modern",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                    title={isCollapsed ? "Bug Reports & Suggestions" : undefined}
                                >
                                    <iconMap.MessageSquare className="h-5 w-5 shrink-0" />
                                    {!isCollapsed && <span className="truncate font-medium">Feedback</span>}
                                </Link>
                            </div>
                        </>
                    )}
                </nav>

                {/* Theme Customizer - Only for organization admins */}
                {slug && checkPermission(PERMISSIONS.ORG_SETTINGS_MANAGE) && (
                    <div className="border-t p-4">
                        <ThemeCustomizer
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="default"
                                    className={cn(
                                        "w-full flex items-center gap-4 justify-start px-4 py-3 text-base font-medium hover:bg-accent",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                    title={isCollapsed ? "Customize Theme" : undefined}
                                >
                                    <Palette className="h-5 w-5 shrink-0" />
                                    {!isCollapsed && <span className="truncate font-medium">Customize Theme</span>}
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>

            {/* Mobile sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-card text-card-foreground border-r shadow-modern transform transition-transform duration-300 lg:hidden flex flex-col",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Mobile sidebar content - same as desktop but always expanded */}
                <div className="flex-1 overflow-y-auto p-4">
                    <nav className="space-y-2">
                        {isAdminPage ? (
                            /* Admin Navigation */
                            ADMIN_NAV.map((item) => {
                                const href = item.href();
                                const isActive = pathname === href || pathname?.startsWith(href + '/');
                                const Icon = iconMap[item.key] || iconMap.overview;
                                return (
                                    <Link
                                        key={item.key}
                                        href={href}
                                        onClick={onMobileMenuClose}
                                        className={cn(
                                            "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                            "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                            "font-montserrat",
                                            isActive && "bg-primary text-primary-foreground shadow-modern font-semibold"
                                        )}
                                    >
                                        <Icon className="h-5 w-5 shrink-0" />
                                        <span className="truncate font-medium font-montserrat">{item.label}</span>
                                    </Link>
                                );
                            })
                        ) : (
                            /* Organization Navigation */
                            <>
                                {ORG_NAV.filter(item => item.key !== 'settings').map((item) => {
                                    // If we have a slug but no permissions loaded yet, treat as loading
                                    const isStillLoading = slug && permissions.length === 0;
                                    // While loading org user, show all items
                                    const hasAccess = (isLoadingOrg || isStillLoading) ? true : checkPermission(item.required);

                                    if (!hasAccess) {
                                        return null; // Hide item if user lacks permission
                                    }

                                    const href = slug ? item.href(slug) : '#';
                                    // Check if current page is this route or a child route
                                    const isActive = pathname === href || pathname?.startsWith(href + '/');
                                    // Check if any child is active by comparing pathname + search params
                                    const hasActiveChild = item.children?.some(child => {
                                        const childHref = slug ? child.href(slug) : '#';
                                        return pathname?.startsWith('/org/' + slug + '/rosters') &&
                                            (childHref.includes('?tab=') || pathname === childHref);
                                    });
                                    const Icon = iconMap[item.key] || iconMap.overview;
                                    const badgeCount = getBadgeCount(item.key);
                                    const isSubmenuOpen = openSubmenus.has(item.key);
                                    const hasChildren = item.children && item.children.length > 0;

                                    return (
                                        <div key={item.key}>
                                            {hasChildren ? (
                                                // Item with submenu - make entire row clickable for toggle
                                                <button
                                                    onClick={() => toggleSubmenu(item.key)}
                                                    className={cn(
                                                        "w-full flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                        "font-montserrat text-left",
                                                        (isActive || hasActiveChild)
                                                            ? "bg-primary text-primary-foreground shadow-modern font-semibold hover:bg-primary/90"
                                                            : "hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
                                                    )}
                                                >
                                                    <Icon className="h-5 w-5 shrink-0" />
                                                    <span className="flex-1 truncate font-medium font-montserrat">{item.label}</span>
                                                    {badgeCount > 0 && (
                                                        <Badge variant="destructive">
                                                            {badgeCount > 99 ? '99+' : badgeCount}
                                                        </Badge>
                                                    )}
                                                    <ChevronDown className={cn(
                                                        "h-4 w-4 shrink-0 transition-transform duration-200",
                                                        isSubmenuOpen && "transform rotate-180"
                                                    )} />
                                                </button>
                                            ) : (
                                                // Regular link item without submenu
                                                <Link
                                                    href={href}
                                                    onClick={onMobileMenuClose}
                                                    className={cn(
                                                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                        "font-montserrat",
                                                        isActive
                                                            ? "bg-primary text-primary-foreground shadow-modern font-semibold hover:bg-primary/90"
                                                            : "hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
                                                    )}
                                                >
                                                    <Icon className="h-5 w-5 shrink-0" />
                                                    <span className="flex-1 truncate font-medium font-montserrat">{item.label}</span>
                                                    {badgeCount > 0 && (
                                                        <Badge variant="destructive" className="ml-auto">
                                                            {badgeCount > 99 ? '99+' : badgeCount}
                                                        </Badge>
                                                    )}
                                                </Link>
                                            )}

                                            {/* Mobile submenu items */}
                                            {item.children && isSubmenuOpen && (
                                                <div className="ml-9 mt-1 space-y-1">
                                                    {item.children.map((child) => {
                                                        const childHasAccess = (isLoadingOrg || isStillLoading) ? true : checkPermission(child.required);
                                                        if (!childHasAccess) return null;

                                                        const childHref = slug ? child.href(slug) : '#';
                                                        // Check if this child tab is active by comparing pathname and query params
                                                        const childIsActive = pathname?.startsWith('/org/' + slug + '/rosters') &&
                                                            childHref.includes('?tab=') &&
                                                            childHref.includes(searchParams?.get('tab') || '');

                                                        return (
                                                            <Link
                                                                key={child.key}
                                                                href={childHref}
                                                                onClick={onMobileMenuClose}
                                                                className={cn(
                                                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                                    "font-montserrat",
                                                                    childIsActive
                                                                        ? "bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80"
                                                                        : "hover:bg-secondary hover:text-secondary-foreground"
                                                                )}
                                                            >
                                                                <span className="truncate">{child.label}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Quick Links Section - Mobile */}
                                {slug && quickLinks && quickLinks.length > 0 && (
                                    <div>
                                        <button
                                            onClick={() => toggleSubmenu('quick-links')}
                                            className={cn(
                                                "w-full flex items-center gap-4 rounded-xl px-4 py-3 text-base transition-all duration-200",
                                                "font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                "font-montserrat text-left",
                                                "hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
                                            )}
                                        >
                                            <Link2 className="h-5 w-5 shrink-0" />
                                            <span className="flex-1 truncate font-medium font-montserrat">Quick Links</span>
                                            <ChevronDown className={cn(
                                                "h-4 w-4 shrink-0 transition-transform duration-200",
                                                openSubmenus.has('quick-links') && "transform rotate-180"
                                            )} />
                                        </button>

                                        {/* Mobile submenu items */}
                                        {openSubmenus.has('quick-links') && (
                                            <div className="ml-9 mt-1 space-y-1">
                                                {quickLinks.map((link, index) => {
                                                    const IconComponent = link.icon && iconMap[link.icon as keyof typeof iconMap]
                                                        ? iconMap[link.icon as keyof typeof iconMap]
                                                        : Link2;

                                                    const isExternal = link.url.startsWith('http://') || link.url.startsWith('https://');
                                                    const linkContent = (
                                                        <>
                                                            <IconComponent className="h-4 w-4 shrink-0" />
                                                            <span className="truncate">{link.label}</span>
                                                            {isExternal && link.openInNewTab && (
                                                                <ExternalLinkIcon className="h-3 w-3 shrink-0 ml-auto opacity-60" />
                                                            )}
                                                        </>
                                                    );

                                                    const linkClassName = cn(
                                                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                        "font-montserrat hover:bg-secondary hover:text-secondary-foreground"
                                                    );

                                                    if (isExternal) {
                                                        return (
                                                            <a
                                                                key={`quick-link-mobile-${index}`}
                                                                href={link.url}
                                                                target={link.openInNewTab ? "_blank" : "_self"}
                                                                rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                                                                onClick={onMobileMenuClose}
                                                                className={linkClassName}
                                                            >
                                                                {linkContent}
                                                            </a>
                                                        );
                                                    } else {
                                                        return (
                                                            <Link
                                                                key={`quick-link-mobile-${index}`}
                                                                href={link.url}
                                                                onClick={onMobileMenuClose}
                                                                className={linkClassName}
                                                            >
                                                                {linkContent}
                                                            </Link>
                                                        );
                                                    }
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Settings - Render last (Mobile) */}
                                {(() => {
                                    const settingsItem = ORG_NAV.find(item => item.key === 'settings');
                                    if (!settingsItem) return null;

                                    const isStillLoading = slug && permissions.length === 0;
                                    const hasAccess = (isLoadingOrg || isStillLoading) ? true : checkPermission(settingsItem.required);

                                    if (!hasAccess) return null;

                                    const href = slug ? settingsItem.href(slug) : '#';
                                    const isActive = pathname === href || pathname?.startsWith(href + '/');
                                    const Icon = iconMap[settingsItem.key] || iconMap.overview;

                                    return (
                                        <Link
                                            href={href}
                                            onClick={onMobileMenuClose}
                                            className={cn(
                                                "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                                "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                "font-montserrat",
                                                isActive && "bg-primary text-primary-foreground shadow-modern font-semibold"
                                            )}
                                        >
                                            <Icon className="h-5 w-5 shrink-0" />
                                            <span className="truncate font-medium font-montserrat">{settingsItem.label}</span>
                                        </Link>
                                    );
                                })()}
                            </>
                        )}

                        {/* Feedback Section - Mobile */}
                        {globalUser && (
                            <div className="border-t pt-4 mt-4">
                                <Link
                                    href="/feedback"
                                    onClick={onMobileMenuClose}
                                    className={cn(
                                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                        "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        pathname?.startsWith("/feedback") && "bg-primary text-primary-foreground shadow-modern"
                                    )}
                                >
                                    <iconMap.MessageSquare className="h-5 w-5 shrink-0" />
                                    <span className="truncate font-medium">Feedback</span>
                                </Link>
                            </div>
                        )}

                        {/* Global Admin Section - Mobile */}
                        {isGlobalAdmin(globalUser) && !slug && (
                            <div className="border-t pt-4 mt-4">
                                <div className="px-4 py-2 text-sm font-bold text-muted-foreground uppercase tracking-wider font-montserrat">
                                    Global Admin
                                </div>
                                <Link
                                    href={adminPath.controlCenter()}
                                    onClick={onMobileMenuClose}
                                    className={cn(
                                        "flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200",
                                        "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        pathname?.startsWith("/admin") && "bg-primary text-primary-foreground shadow-modern"
                                    )}
                                >
                                    <Shield className="h-5 w-5 shrink-0" />
                                    <span className="truncate font-medium">Control Center</span>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>

                {/* Theme Customizer - Mobile */}
                {slug && checkPermission(PERMISSIONS.ORG_SETTINGS_MANAGE) && (
                    <div className="border-t p-4">
                        <ThemeCustomizer
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="default"
                                    className="w-full flex items-center gap-4 justify-start px-4 py-3 text-base font-medium hover:bg-accent"
                                >
                                    <Palette className="h-5 w-5 shrink-0" />
                                    <span className="truncate font-medium">Customize Theme</span>
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>
        </>
    );
}
