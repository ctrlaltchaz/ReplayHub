import { useApiQuery } from "../../lib/api/query";
import type { Event, EventsQueryParams } from "./types";

function normalizeDateParam(value: string, endOfDay: boolean) {
  // If already a full datetime, leave it alone
  if (!value || value.includes("T")) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString();
}

export function useEventsList(slug: string, params: EventsQueryParams = {}) {
  const searchParams = new URLSearchParams();

  // Add non-empty params to search string
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "from") {
      const normalized = normalizeDateParam(String(value), false);
      searchParams.set(key, normalized);
      return;
    }
    if (key === "to") {
      const normalized = normalizeDateParam(String(value), true);
      searchParams.set(key, normalized);
      return;
    }
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  const path = `/org/${slug}/events${queryString ? `?${queryString}` : ""}`;

  return useApiQuery<Event[]>(path, {
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    apiOptions: {
      credentials: "include",
      slug: slug,
    },
  });
}
