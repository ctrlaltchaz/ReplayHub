"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useTeamsList } from "../hooks/useTeamsList";
import { useAvailability } from "./hooks/useAvailability";

export default function AvailabilityPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { toast } = useToast();

    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [selectedTeam, setSelectedTeam] = useState<string>("all");

    // Fetch teams for filter
    const { data: teams = [] } = useTeamsList(slug);

    // Fetch availability for selected date
    const { data: availability = [], isLoading } = useAvailability(
        slug,
        selectedDate,
        selectedTeam !== "all" ? selectedTeam : undefined
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
            case "unsure":
                return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "unavailable":
                return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "available":
                return <CheckCircle2 className="h-5 w-5" />;
            case "unsure":
                return <HelpCircle className="h-5 w-5" />;
            case "unavailable":
                return <XCircle className="h-5 w-5" />;
            default:
                return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/org/${slug}/rosters`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Rosters
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Player Availability</h1>
                        <p className="text-muted-foreground">
                            Track player availability for events and matches
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>

                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-64">
                        <SelectValue placeholder="All Teams" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {teams.map((team: any) => (
                            <SelectItem key={team.id} value={team.id}>
                                {team.name} ({team.game})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Availability for {format(new Date(selectedDate), "MMMM d, yyyy")}</CardTitle>
                    <CardDescription>
                        {selectedTeam && selectedTeam !== "all"
                            ? `Showing ${teams.find((t: any) => t.id === selectedTeam)?.name} players`
                            : "Showing all players"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                            ))}
                        </div>
                    ) : availability.length === 0 ? (
                        <div className="text-center py-12">
                            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No availability data</h3>
                            <p className="text-muted-foreground">
                                Players haven't set their availability for this date yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {availability.map((record: any) => (
                                <div
                                    key={record.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${getStatusColor(record.status)}`}>
                                            {getStatusIcon(record.status)}
                                        </div>
                                        <div>
                                            <Link
                                                href={`/org/${slug}/rosters/players/${record.playerId}`}
                                                className="font-semibold hover:underline"
                                            >
                                                {record.player.gamerTag}
                                            </Link>
                                            {record.player.role && (
                                                <p className="text-sm text-muted-foreground">
                                                    {record.player.role}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}
                                            >
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                            {record.note && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {record.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium">Unsure</span>
                </div>
                <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium">Unavailable</span>
                </div>
            </div>
        </div>
    );
}
