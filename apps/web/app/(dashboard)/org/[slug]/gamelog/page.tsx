"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { usePageTitle } from "@/lib/hooks/usePageTitle";
import type { Match, MatchesQueryParams } from "@/types/gamelog";
import { format, parseISO } from "date-fns";
import {
  Award,
  Download,
  Edit,
  FileText,
  Filter,
  Loader2,
  Plus,
  Search,
  Trophy,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useMatchesList } from "./hooks/useMatchesList";

const GAMES = [
  { value: "Valorant", label: "Valorant", logo: "/logos/valorant.svg" },
  { value: "League of Legends", label: "League of Legends", logo: "/logos/lol.svg" },
  { value: "Counter-Strike 2", label: "Counter-Strike 2", logo: "/logos/cs2.svg" },
  { value: "Dota 2", label: "Dota 2", logo: "/logos/dota2.svg" },
  { value: "Overwatch", label: "Overwatch", logo: "/logos/overwatch.svg" },
  { value: "Rocket League", label: "Rocket League", logo: "/logos/rocketleague.svg" },
  { value: "Apex Legends", label: "Apex Legends", logo: "/logos/apex.svg" },
];

export default function GamelogPage() {
  usePageTitle("Game Log");
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { hasPermission } = useAuth();

  const [filters, setFilters] = useState<MatchesQueryParams>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [hasSelectedTeamManually, setHasSelectedTeamManually] = useState(false);

  const canManage = hasPermission("gamelog.manage");
  const canView = hasPermission("gamelog.view");

  const { data, isLoading, error } = useMatchesList(slug, filters);
  const filtersWithoutTeam = useMemo<MatchesQueryParams>(() => {
    const { teamId, ...rest } = filters;
    return { ...rest, page: 1, limit: 100 };
  }, [filters]);
  const { data: teamsData } = useMatchesList(slug, filtersWithoutTeam);

  const teams = useMemo(() => {
    const list = teamsData?.matches || data?.matches || [];
    const map = new Map<string, { id: string; name: string; game?: string; count: number }>();

    list.forEach((match) => {
      if (match.team?.id) {
        const existing = map.get(match.team.id);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(match.team.id, {
            id: match.team.id,
            name: match.team.name,
            game: match.team.game,
            count: 1,
          });
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [teamsData?.matches, data?.matches]);

  // Sync selected team with filters/data
  useEffect(() => {
    if (filters.teamId) {
      setSelectedTeamId(filters.teamId);
      return;
    }
    if (!hasSelectedTeamManually) {
      setSelectedTeamId(null);
    }
  }, [filters.teamId, hasSelectedTeamManually]);

  const handleFilterChange = (key: keyof MatchesQueryParams, value: string) => {
    if (!value || value === "all") {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const filteredMatches =
    data?.matches?.filter((match) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        match.opponent.toLowerCase().includes(query) ||
        match.tournament?.toLowerCase().includes(query) ||
        match.stage?.toLowerCase().includes(query) ||
        match.team?.name.toLowerCase().includes(query)
      );
    }) || [];

  const matchesForSelectedTeam = selectedTeamId
    ? filteredMatches.filter((m) => m.team?.id === selectedTeamId)
    : filteredMatches;

  const selectedTeam = selectedTeamId ? teams.find((t) => t.id === selectedTeamId) : null;

  const getResultBadge = (result: string) => {
    const colors = {
      win: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      loss: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      draw: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[result as keyof typeof colors] || colors.draw;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  if (!canView) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to view the game log.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Game Log
            </h1>
            <p className="text-muted-foreground">
              Track match results, player statistics, and performance analytics
            </p>
          </div>
          {canManage && (
            <Button onClick={() => router.push(`/org/${slug}/gamelog/create`)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Match
            </Button>
          )}
        </div>

        {/* Team Cards */}
        {teams.length > 0 && (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            <Card
              className={`border-2 cursor-pointer ${!selectedTeamId ? "border-primary" : "border-transparent"}`}
              onClick={() => {
                setHasSelectedTeamManually(true);
                setSelectedTeamId(null);
                handleFilterChange("teamId", "all");
              }}
            >
              <CardContent className="py-1 px-3 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">All Teams</p>
                  <p className="text-base font-semibold">
                    {teamsData?.total ?? data?.total ?? data?.matches?.length ?? 0} matches
                  </p>
                </div>
                <Badge variant="secondary">Show All</Badge>
              </CardContent>
            </Card>
            {teams.map((team) => {
              const teamMatches =
                (teamsData?.matches || data?.matches || []).filter((m) => m.team?.id === team.id) ||
                [];
              const lastMatch = teamMatches[0];
              const logo = team.game ? GAMES.find((g) => g.value === team.game)?.logo : undefined;
              return (
                <Card
                  key={team.id}
                  className={`cursor-pointer border-2 ${selectedTeamId === team.id ? "border-primary" : "border-transparent"}`}
                  onClick={() => {
                    setHasSelectedTeamManually(true);
                    setSelectedTeamId(team.id);
                    handleFilterChange("teamId", team.id);
                  }}
                >
                  <CardContent className="py-1 px-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {logo ? (
                          <Image
                            src={logo}
                            alt={team.game || team.name}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        ) : (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">
                            {team.name?.[0]?.toUpperCase() || "T"}
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-sm">{team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {team.game || "Unknown game"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {team.count} logged
                      </Badge>
                    </div>
                    {lastMatch && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Last: {lastMatch.opponent}</p>
                        {lastMatch.startedAt && (
                          <p>{format(parseISO(lastMatch.startedAt), "MMM dd, yyyy")}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>

              {/* Result Filter */}
              <Select
                value={filters.result || "all"}
                onValueChange={(value) => handleFilterChange("result", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="win">Wins</SelectItem>
                  <SelectItem value="loss">Losses</SelectItem>
                  <SelectItem value="draw">Draws</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(Object.keys(filters).length > 0 || searchQuery) && (
                <Button variant="outline" onClick={handleClearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Info */}
        {selectedTeam && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {selectedTeam.name}
              </CardTitle>
              <CardDescription>
                {selectedTeam.game || "Game"} • {matchesForSelectedTeam.length} logged match(es)
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Matches List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Failed to load matches</p>
            </CardContent>
          </Card>
        ) : matchesForSelectedTeam && matchesForSelectedTeam.length > 0 ? (
          <div className="grid gap-3">
            {matchesForSelectedTeam.map((match: Match) => (
              <Card
                key={match.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/org/${slug}/gamelog/${match.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base">
                          {match.team?.name && (
                            <span className="text-muted-foreground">{match.team.name} </span>
                          )}
                          vs {match.opponent}
                        </h3>
                        {match.result && (
                          <Badge variant="secondary" className={getResultBadge(match.result)}>
                            {match.result.toUpperCase()}
                          </Badge>
                        )}
                        <Badge variant="secondary" className={getStatusBadge(match.status)}>
                          {match.status}
                        </Badge>
                      </div>{" "}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {match.score && (
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Score: {match.score}
                          </span>
                        )}
                        {match.tournament && (
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {match.tournament}
                          </span>
                        )}
                        {match.startedAt && (
                          <span>{format(parseISO(match.startedAt), "MMM dd, yyyy")}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/org/${slug}/gamelog/${match.id}/edit`);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                      {match.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `http://localhost:3001/api/org/${slug}/gamelog/matches/${match.id}/report.pdf`,
                              "_blank"
                            );
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold">No matches found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || Object.keys(filters).length > 0
                    ? "Try adjusting your filters"
                    : "Start logging matches to track your team's performance"}
                </p>
              </div>
              {canManage && !searchQuery && Object.keys(filters).length === 0 && (
                <Button onClick={() => router.push(`/org/${slug}/gamelog/create`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Match
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={!data || data.page === 1}
              onClick={() => handleFilterChange("page", String((data?.page || 1) - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!data || data.page === data.totalPages}
              onClick={() => handleFilterChange("page", String((data?.page || 1) + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
