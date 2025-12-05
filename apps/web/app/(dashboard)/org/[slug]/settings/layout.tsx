"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Building,
  ChevronDown,
  ClipboardList,
  Link2,
  MessageSquare,
  Settings,
  Shield,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import * as React from "react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params?.slug as string;

  const navItems = React.useMemo(
    () => [
      {
        key: "users",
        label: "Users",
        description: "Manage org members and access",
        href: `/org/${slug}/settings/users`,
        icon: Users,
      },
      {
        key: "roles",
        label: "Roles",
        description: "Permissions and role templates",
        href: `/org/${slug}/settings/roles`,
        icon: Shield,
      },
      {
        key: "invites",
        label: "Invites",
        description: "Send and track invitations",
        href: `/org/${slug}/settings/invites`,
        icon: UserPlus,
      },
      {
        key: "player-links",
        label: "Player Links",
        description: "Manage player account connections",
        href: `/org/${slug}/settings/player-links`,
        icon: UserCog,
      },
      {
        key: "organization",
        label: "Organization",
        description: "Branding and profile",
        href: `/org/${slug}/settings/organization`,
        icon: Building,
      },
      {
        key: "discord",
        label: "Discord",
        description: "Bot and webhook setup",
        href: `/org/${slug}/settings/discord`,
        icon: MessageSquare,
      },
      {
        key: "quick-links",
        label: "Quick Links",
        description: "Shortcuts for your team",
        href: `/org/${slug}/settings/quick-links`,
        icon: Link2,
      },
      {
        key: "audit-logs",
        label: "Audit Logs",
        description: "Track changes across the org",
        href: `/org/${slug}/settings/audit-logs`,
        icon: ClipboardList,
      },
    ],
    [slug]
  );

  const activeKey = React.useMemo(() => {
    const match = navItems.find((item) => pathname?.startsWith(item.href));
    return match?.key ?? "users";
  }, [navItems, pathname]);

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const activeItem = navItems.find((item) => item.key === activeKey);

  const NavigationMenu = () => (
    <nav className="p-2 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeKey === item.key;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={[
              "flex items-start gap-3 rounded-lg px-3 py-3 transition",
              isActive
                ? "bg-primary/10 text-foreground border border-primary/20 shadow-sm"
                : "hover:bg-muted text-foreground",
            ].join(" ")}
          >
            <span className="mt-0.5 text-muted-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-xs text-muted-foreground">{item.description}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="container mx-auto py-4 md:py-8 space-y-4 md:space-y-8 overflow-x-hidden px-4 md:px-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3 font-montserrat">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Manage users, roles, invitations, and organization settings
          </p>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              {activeItem && <activeItem.icon className="h-4 w-4" />}
              {activeItem?.label || "Settings"}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[350px]">
          <SheetHeader>
            <SheetTitle>Settings Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <NavigationMenu />
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block bg-card border rounded-xl shadow-sm min-w-0">
          <div className="p-4 border-b">
            <p className="text-sm font-semibold text-foreground">Settings</p>
            <p className="text-xs text-muted-foreground">Choose a section to manage</p>
          </div>
          <NavigationMenu />
        </aside>

        {/* Content Area with mobile padding */}
        <div className="min-h-[60vh] min-w-0 overflow-x-hidden">
          <div className="px-0 md:px-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
