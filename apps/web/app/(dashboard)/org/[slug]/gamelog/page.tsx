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
import { Award, Download, FileText, Filter, Loader2, Plus, Search, Trophy, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMatchesList } from "./hooks/useMatchesList";

export default function GamelogPage() {
    usePageTitle('Game Log');
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const { hasPermission } = useAuth();

    const [filters, setFilters] = useState<MatchesQueryParams>({});
    const [searchQuery, setSearchQuery] = useState("");

    const canManage = hasPermission("gamelog.manage");
    const canView = hasPermission("gamelog.view");

    const { data, isLoading, error } = useMatchesList(slug, filters);

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

    const filteredMatches = data?.matches?.filter((match) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            match.opponent.toLowerCase().includes(query) ||
            match.tournament?.toLowerCase().includes(query) ||
            match.stage?.toLowerCase().includes(query) ||
            match.team?.name.toLowerCase().includes(query)
        );
    }) || [];

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
                        <CardDescription>
                            You don't have permission to view the game log.
                        </CardDescription>
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
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    className="w-full"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

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
                ) : filteredMatches && filteredMatches.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredMatches.map((match: Match) => (
                            <Card
                                key={match.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => router.push(`/org/${slug}/gamelog/${match.id}`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-lg">
                                                {match.team?.name && (
                                                    <span className="text-muted-foreground">{match.team.name} </span>
                                                )}
                                                vs {match.opponent}
                                            </h3>
                                            {match.result && (
                                                <Badge
                                                    variant="secondary"
                                                    className={getResultBadge(match.result)}
                                                >
                                                    {match.result.toUpperCase()}
                                                </Badge>
                                            )}
                                            <Badge
                                                variant="secondary"
                                                className={getStatusBadge(match.status)}
                                            >
                                                {match.status}
                                            </Badge>
                                        </div>                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                {match.score && (
                                                    <span className="flex items-center gap-1">
                                                        <Trophy className="h-4 w-4" />
                                                        Score: {match.score}
                                                    </span>
                                                )}
                                                {match.tournament && (
                                                    <span className="flex items-center gap-1">
                                                        <Award className="h-4 w-4" />
                                                        {match.tournament}
                                                    </span>
                                                )}
                                                {match.startedAt && (
                                                    <span>
                                                        {format(parseISO(match.startedAt), "MMM dd, yyyy")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
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
