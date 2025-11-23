"use client";

import { ORG_NAV, orgPath } from "@/lib/paths/org";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface BreadcrumbsProps {
  org?: {
    name: string;
    slug: string;
  };
}

// Get segment labels from centralized navigation config
const getSegmentLabel = (segment: string): string => {
  const navItem = ORG_NAV.find((item) => item.key === segment);
  return navItem?.label || segment.charAt(0).toUpperCase() + segment.slice(1);
};

export function Breadcrumbs({ org }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Handle null pathname
  if (!pathname || !org) {
    return null;
  }

  // Parse pathname segments
  const segments = pathname.split("/").filter(Boolean);

  // Skip if not in org context
  if (segments[0] !== "org") {
    return null;
  }

  // Build breadcrumb items
  const items: { label: string; href: string; isLast: boolean }[] = [];

  // Show only the current page breadcrumb (no org slug)
  if (segments.length > 2 && segments[2] !== "overview") {
    const pageSegment = segments[2];
    const label = getSegmentLabel(pageSegment);
    items.push({
      label,
      href: pathname,
      isLast: true,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-base text-muted-foreground">
      <Home className="h-4 w-4" />
      {items.map((item) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="h-4 w-4 mx-2" />
          {item.isLast ? (
            <span className="font-semibold text-foreground" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link href={item.href} className="hover:text-foreground transition-colors font-medium">
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
