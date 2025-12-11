"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Hash, Loader2, RotateCcw, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePlayersList } from "../../rosters/hooks/usePlayersList";
import { useTeamsList } from "../../rosters/hooks/useTeamsList";
import { getGameMaps } from "../lib/game-maps";
import { getGameStatFields } from "../lib/game-stat-fields";
import { WizardProgress } from "./WizardProgress";
import { ChoiceQuestion } from "./wizard-questions/ChoiceQuestion";
import { DateTimeQuestion } from "./wizard-questions/DateTimeQuestion";
import { MapDetailQuestion } from "./wizard-questions/MapDetailQuestion";
import { PlayerStatsQuestion } from "./wizard-questions/PlayerStatsQuestion";
import { ReviewQuestion } from "./wizard-questions/ReviewQuestion";
import { TeamSelectQuestion } from "./wizard-questions/TeamSelectQuestion";
import { TextInputQuestion } from "./wizard-questions/TextInputQuestion";

interface WizardState {
    // Step 1: Match basics
    teamId?: string;
    opponent?: string;
    startedAt?: string;
    bestOf?: number;
    showSubs?: boolean;

    // Step 2: Maps (dynamic based on bestOf)
    maps?: Array<{
        title: string;
        mapName: string;
        gameIdx: number;
        ourScore: number;
        theirScore: number;
        durationSec?: number;
    }>;

    // Step 3: Player stats (dynamic based on maps and roster)
    playerStats?: Array<{
        playerId: string;
        playerName?: string;
        mapGameId?: string;
        mapIndex?: number; // Track which map this stat belongs to
        role?: string;
        statsJson: {
            kills?: number;
            deaths?: number;
            assists?: number;
            damage?: number;
            [key: string]: any;
        };
        rating?: number;
        isMvp?: boolean;
    }>;

    // Step 4: Final details
    result?: 'win' | 'loss' | 'draw';
    score?: string;
    vodUrl?: string;
    notes?: string;
}

interface Question {
    id: string;
    type: 'team-select' | 'text' | 'date' | 'number' | 'choice' | 'map-detail' | 'player-stats' | 'review';
    title: string;
    description?: string;
    skippable?: boolean;
    context?: any;
}

interface GameLogWizardProps {
    organizationSlug: string;
    onClose: () => void;
    onBack: () => void;
    fullPage?: boolean; // Whether to render in full-page mode (no dialog wrapper)
}

const DRAFT_KEY = 'gamelog-wizard-draft';

export function GameLogWizard({ organizationSlug, onClose, onBack, fullPage = false }: GameLogWizardProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [wizardState, setWizardState] = useState<WizardState>({});
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showSubs, setShowSubs] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    // Fetch teams to get selected team's game info
    const { data: teams } = useTeamsList(organizationSlug);
    const selectedTeam = teams?.find((t) => t.id === wizardState.teamId);
    const selectedGame = selectedTeam?.game;

    // Get map pool: use team's custom maps if available, otherwise use game defaults
    const availableMaps = selectedTeam?.mapPool && selectedTeam.mapPool.length > 0
        ? selectedTeam.mapPool
        : (selectedGame ? getGameMaps(selectedGame) : []);

    // Fetch players from selected team's roster
    const { data: allTeamPlayers = [] } = usePlayersList(organizationSlug, {
        teamId: wizardState.teamId,
    });

    // Filter to only show starters unless showSubs is enabled
    const teamPlayers = showSubs
        ? allTeamPlayers
        : allTeamPlayers.filter((player: any) => {
            // Check if player is a starter on the selected team
            const teamMembership = player.teams?.find((tm: any) => tm.teamId === wizardState.teamId);
            return teamMembership?.isStarter !== false; // Show if no team membership info or if isStarter is true
        });

    // Count substitute players for the selected team
    const subsCount = allTeamPlayers.filter((player: any) => {
        const teamMembership = player.teams?.find((tm: any) => tm.teamId === wizardState.teamId);
        return teamMembership?.isStarter === false;
    }).length;

    // Initialize questions - will be dynamic based on answers
    useEffect(() => {
        const initialQuestions: Question[] = [
            { id: 'team', type: 'team-select', title: 'Which team played this match?' },
            { id: 'opponent', type: 'text', title: 'Who was the opponent?' },
            { id: 'date', type: 'date', title: 'When was the match played?' },
            { id: 'bestOf', type: 'choice', title: 'How many games were played?' },
        ];

        setQuestions(initialQuestions);
    }, []);

    // Load draft from localStorage
    useEffect(() => {
        const draft = localStorage.getItem(`${DRAFT_KEY}-${organizationSlug}`);
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setWizardState(parsed.state);
                setCurrentQuestionIndex(parsed.currentIndex);
            } catch (e) {
                console.error('Failed to load draft:', e);
            }
        }
    }, [organizationSlug]);

    // Save draft to localStorage on state change
    useEffect(() => {
        if (Object.keys(wizardState).length > 0) {
            localStorage.setItem(
                `${DRAFT_KEY}-${organizationSlug}`,
                JSON.stringify({
                    state: wizardState,
                    currentIndex: currentQuestionIndex,
                    timestamp: new Date().toISOString(),
                })
            );
        }
    }, [wizardState, currentQuestionIndex, organizationSlug]);

    // Generate dynamic questions based on answers
    useEffect(() => {
        if (wizardState.bestOf) {
            const baseQuestions = questions.slice(0, 4); // Keep first 4 questions
            const dynamicQuestions: Question[] = [];

            // Add subs question if there are substitute players on the team
            if (subsCount > 0 && wizardState.showSubs === undefined) {
                dynamicQuestions.push({
                    id: 'subs',
                    type: 'choice',
                    title: 'Did substitute players participate?',
                    description: `Your team has ${subsCount} substitute player${subsCount > 1 ? 's' : ''}`,
                });
            }

            // Initialize maps array if not exists
            if (!wizardState.maps) {
                const initialMaps = Array.from({ length: wizardState.bestOf }, (_, i) => ({
                    title: `Map ${i + 1}`,
                    mapName: "",
                    gameIdx: i + 1,
                    ourScore: 0,
                    theirScore: 0,
                }));
                setWizardState((prev) => ({ ...prev, maps: initialMaps }));
            }

            // Add map questions based on bestOf
            for (let i = 0; i < wizardState.bestOf; i++) {
                dynamicQuestions.push({
                    id: `map-${i}`,
                    type: 'map-detail',
                    title: `Round ${i + 1} - Map Details`,
                    description: 'Enter the map name and final score',
                    context: {
                        roundNumber: i + 1,
                        mapIndex: i,
                    },
                });
            }

            // Add player stats questions for each map and each player
            if (teamPlayers.length > 0 && wizardState.maps) {
                // Initialize playerStats array if not exists
                if (!wizardState.playerStats) {
                    setWizardState((prev) => ({ ...prev, playerStats: [] }));
                }

                for (let mapIdx = 0; mapIdx < wizardState.bestOf; mapIdx++) {
                    const map = wizardState.maps[mapIdx];
                    if (!map || !map.mapName) continue; // Skip if map not entered yet

                    for (let playerIdx = 0; playerIdx < teamPlayers.length; playerIdx++) {
                        const player = teamPlayers[playerIdx];
                        dynamicQuestions.push({
                            id: `stats-map${mapIdx}-player${playerIdx}`,
                            type: 'player-stats',
                            title: `Round ${mapIdx + 1} (${map.mapName}) - ${player.gamerTag}'s Stats`,
                            description: `Enter performance statistics for ${player.gamerTag}`,
                            skippable: true,
                            context: {
                                roundNumber: mapIdx + 1,
                                roundName: map.mapName,
                                mapIndex: mapIdx,
                                playerIndex: playerIdx,
                                playerId: player.id,
                                playerName: player.gamerTag,
                                playerAvatar: player.avatar,
                            },
                        });
                    }
                }
            }

            // Add final review question
            dynamicQuestions.push({
                id: 'review',
                type: 'review',
                title: 'Review and Submit',
                description: 'Review your match details before submitting',
            });

            setQuestions([...baseQuestions, ...dynamicQuestions]);
        }
    }, [wizardState.bestOf, wizardState.maps, teamPlayers.length]);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const canGoBack = currentQuestionIndex > 0;
    const canGoNext = currentQuestionIndex < totalQuestions - 1;

    // Validation logic for current question
    const isCurrentQuestionValid = () => {
        if (!currentQuestion) return false;

        // Skippable questions are always valid
        if (currentQuestion.skippable) return true;

        switch (currentQuestion.id) {
            case 'team':
                return !!wizardState.teamId;
            case 'opponent':
                return !!wizardState.opponent && wizardState.opponent.length >= 2;
            case 'date':
                return !!wizardState.startedAt;
            case 'bestOf':
                return !!wizardState.bestOf;
            case 'subs':
                return wizardState.showSubs !== undefined;
            default:
                // Check if it's a map question
                if (currentQuestion.id.startsWith('map-')) {
                    const mapIndex = currentQuestion.context?.mapIndex;
                    if (mapIndex !== undefined && wizardState.maps?.[mapIndex]) {
                        const map = wizardState.maps[mapIndex];
                        return !!map.mapName && map.mapName.length > 0;
                    }
                    return false;
                }
                // Check if it's a player stats question
                if (currentQuestion.id.startsWith('stats-')) {
                    return true; // Always valid since it's skippable
                }
                return true; // Allow skipping for other question types
        }
    };

    const handleNext = () => {
        if (canGoNext && isCurrentQuestionValid()) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (canGoBack) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey && isCurrentQuestionValid()) {
                e.preventDefault();
                if (currentQuestionIndex === totalQuestions - 1) {
                    handleSubmit();
                } else {
                    handleNext();
                }
            } else if (e.key === 'Escape') {
                handleBackToSelection();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestionIndex, totalQuestions, wizardState]);

    const handleSkip = () => {
        if (currentQuestion?.skippable) {
            handleNext();
        }
    };

    const handleSkipAllStats = () => {
        // Find the index of the first non-player-stats question after current position
        const nextNonStatsIndex = questions.findIndex(
            (q, idx) => idx > currentQuestionIndex && !q.id.startsWith('stats-')
        );

        if (nextNonStatsIndex >= 0) {
            setCurrentQuestionIndex(nextNonStatsIndex);
        } else {
            // If no more questions, go to last question
            setCurrentQuestionIndex(questions.length - 1);
        }
    };

    const handleAnswerUpdate = (questionId: string, value: any) => {
        setWizardState((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    // Auto-calculate match result and score from maps
    useEffect(() => {
        if (wizardState.maps && wizardState.maps.length > 0) {
            let wins = 0;
            let losses = 0;

            wizardState.maps.forEach((map) => {
                if (map.ourScore > map.theirScore) {
                    wins++;
                } else if (map.ourScore < map.theirScore) {
                    losses++;
                }
            });

            const result = wins > losses ? 'win' : wins < losses ? 'loss' : 'draw';
            const score = `${wins}-${losses}`;

            setWizardState((prev) => ({
                ...prev,
                result,
                score,
            }));
        }
    }, [wizardState.maps]);

    const handleSubmit = async () => {
        if (!wizardState.teamId || !wizardState.opponent || !wizardState.startedAt) {
            toast({
                title: "Missing required fields",
                description: "Please fill in team, opponent, and date before submitting.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Step 1: Create the match
            const matchResponse = await fetch(`/api/org/${organizationSlug}/gamelog/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    teamId: wizardState.teamId,
                    opponent: wizardState.opponent,
                    startedAt: wizardState.startedAt,
                    bestOf: wizardState.bestOf || 1,
                    result: wizardState.result,
                    score: wizardState.score,
                    vodUrl: wizardState.vodUrl,
                    notes: wizardState.notes,
                }),
            });

            if (!matchResponse.ok) {
                const error = await matchResponse.json();
                throw new Error(error.message || 'Failed to create match');
            }

            const match = await matchResponse.json();
            const matchId = match.id;

            // Step 2: Create maps if any
            let createdMaps: any[] = [];
            if (wizardState.maps && wizardState.maps.length > 0) {
                const mapsResponse = await fetch(
                    `/api/org/${organizationSlug}/gamelog/matches/${matchId}/maps`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            maps: wizardState.maps.map((map, idx) => ({
                                title: selectedGame || 'Match',
                                mapName: map.mapName,
                                gameIdx: idx + 1,
                                ourScore: map.ourScore || 0,
                                theirScore: map.theirScore || 0,
                                durationSec: map.durationSec,
                            })),
                        }),
                    }
                );

                if (!mapsResponse.ok) {
                    const error = await mapsResponse.json();
                    throw new Error(error.message || 'Failed to create maps');
                }

                createdMaps = await mapsResponse.json();
            }

            // Step 3: Create player stats if any
            if (wizardState.playerStats && wizardState.playerStats.length > 0) {
                console.log('📊 Wizard playerStats:', wizardState.playerStats);
                console.log(`📊 Total stats in wizard: ${wizardState.playerStats.length}`);
                console.log('🗺️ Created maps:', createdMaps);

                // Map all stats to API format (don't filter - even 0s are valid stats)
                const statsToSubmit = wizardState.playerStats
                    .map(stat => {
                        // Find the corresponding created map by mapIndex
                        const mapGameId = createdMaps[stat.mapIndex as number]?.id;
                        console.log(`Mapping stat for player ${stat.playerId}, mapIndex ${stat.mapIndex} -> mapGameId ${mapGameId}`);

                        return {
                            playerId: stat.playerId,
                            mapGameId: mapGameId,
                            role: stat.role,
                            statsJson: stat.statsJson,
                            rating: stat.rating,
                            isMvp: stat.isMvp || false,
                        };
                    });

                console.log('📤 Stats to submit:', statsToSubmit);

                if (statsToSubmit.length > 0) {
                    const statsResponse = await fetch(
                        `/api/org/${organizationSlug}/gamelog/matches/${matchId}/stats`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ stats: statsToSubmit }),
                        }
                    );

                    if (!statsResponse.ok) {
                        const error = await statsResponse.json();
                        console.error('❌ Failed to create player stats:', error);
                        console.error('Stats that failed:', statsToSubmit);
                        // Don't fail the whole submission if stats fail
                        toast({
                            title: "Warning",
                            description: "Match created but some player stats failed to save.",
                            variant: "destructive",
                        });
                    } else {
                        const createdStats = await statsResponse.json();
                        console.log('✅ Stats created successfully:', createdStats);
                    }
                } else {
                    console.log('⚠️ No stats to submit (statsToSubmit is empty)');
                }
            }

            // Success!
            toast({
                title: "Match created successfully!",
                description: "Your match has been saved as a draft.",
            });

            // Clear draft
            localStorage.removeItem(`${DRAFT_KEY}-${organizationSlug}`);

            // Close wizard
            onClose();

            // Redirect to the match detail page
            router.push(`/org/${organizationSlug}/gamelog/${matchId}`);
        } catch (error: any) {
            console.error('Failed to submit:', error);
            toast({
                title: "Submission failed",
                description: error.message || "An error occurred while creating the match.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToSelection = () => {
        const hasData = Object.keys(wizardState).length > 0;
        if (hasData) {
            const confirmed = window.confirm('You have unsaved changes. Are you sure you want to go back?');
            if (!confirmed) return;
        }

        // Clear draft
        localStorage.removeItem(`${DRAFT_KEY}-${organizationSlug}`);
        onBack();
    };

    const handleResetProgress = () => {
        // Clear localStorage
        localStorage.removeItem(`${DRAFT_KEY}-${organizationSlug}`);

        // Reset state
        setWizardState({});
        setCurrentQuestionIndex(0);
        setQuestions([
            { id: 'team', type: 'team-select', title: 'Which team played this match?' },
            { id: 'opponent', type: 'text', title: 'Who was the opponent?' },
            { id: 'date', type: 'date', title: 'When was the match played?' },
            { id: 'bestOf', type: 'choice', title: 'How many games were played?' },
        ]);

        setShowResetConfirm(false);

        toast({
            title: "Progress reset",
            description: "The wizard has been reset to the beginning.",
        });
    };

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading wizard...</p>
            </div>
        );
    }

    // Render the question content (shared between dialog and full-page modes)
    const renderQuestionContent = () => (
        <div className="space-y-6">
            <div>
                <h3 className={fullPage ? "text-2xl font-bold mb-3" : "text-xl font-semibold mb-2"}>
                    {currentQuestion.title}
                </h3>
                {currentQuestion.description && (
                    <p className="text-muted-foreground">{currentQuestion.description}</p>
                )}
            </div>

            {/* Question content rendered based on type */}
            <div className={fullPage ? "min-h-[400px]" : "min-h-[300px]"}>
                {currentQuestion.type === 'team-select' && (
                    <TeamSelectQuestion
                        organizationSlug={organizationSlug}
                        value={wizardState.teamId}
                        onChange={(teamId) => handleAnswerUpdate('teamId', teamId)}
                    />
                )}

                {currentQuestion.type === 'text' && currentQuestion.id === 'opponent' && (
                    <TextInputQuestion
                        value={wizardState.opponent}
                        onChange={(value) => handleAnswerUpdate('opponent', value)}
                        placeholder="e.g., Cloud9 Academy, Team Liquid..."
                        label="Opponent Team Name"
                        description="Enter the name of the team you played against"
                        minLength={2}
                        maxLength={100}
                    />
                )}

                {currentQuestion.type === 'date' && (
                    <DateTimeQuestion
                        value={wizardState.startedAt}
                        onChange={(value) => handleAnswerUpdate('startedAt', value)}
                        label="Match Date & Time"
                        description="When did this match take place?"
                        showTime={true}
                    />
                )}

                {currentQuestion.type === 'choice' && currentQuestion.id === 'bestOf' && (
                    <ChoiceQuestion
                        value={wizardState.bestOf}
                        onChange={(value) => handleAnswerUpdate('bestOf', value)}
                        label="Series Format"
                        description="How many games were in this series?"
                        choices={[
                            {
                                value: 1,
                                label: "Best of 1",
                                description: "Single game",
                                icon: <Hash className="h-8 w-8 text-primary" />,
                            },
                            {
                                value: 3,
                                label: "Best of 3",
                                description: "First to 2 wins",
                                icon: <Trophy className="h-8 w-8 text-primary" />,
                            },
                            {
                                value: 5,
                                label: "Best of 5",
                                description: "First to 3 wins",
                                icon: <Trophy className="h-8 w-8 text-primary" />,
                            },
                        ]}
                        columns={3}
                    />
                )}

                {currentQuestion.type === 'choice' && currentQuestion.id === 'subs' && (
                    <ChoiceQuestion
                        value={wizardState.showSubs}
                        onChange={(value) => {
                            setShowSubs(value === true);
                            handleAnswerUpdate('showSubs', value);
                        }}
                        label="Substitute Players"
                        description="Will you be entering stats for substitute players?"
                        choices={[
                            {
                                value: false,
                                label: "No",
                                description: "Only starters played",
                            },
                            {
                                value: true,
                                label: "Yes",
                                description: "Include substitute players",
                            },
                        ]}
                        columns={2}
                    />
                )}

                {currentQuestion.type === 'map-detail' && (
                    <MapDetailQuestion
                        roundNumber={currentQuestion.context?.roundNumber || 1}
                        gameName={selectedGame}
                        availableMaps={availableMaps}
                        value={wizardState.maps?.[currentQuestion.context?.mapIndex || 0]}
                        onChange={(mapData) => {
                            const mapIndex = currentQuestion.context?.mapIndex || 0;
                            const updatedMaps = [...(wizardState.maps || [])];
                            updatedMaps[mapIndex] = {
                                title: `Map ${mapIndex + 1}`,
                                mapName: mapData.mapName,
                                gameIdx: mapIndex + 1,
                                ourScore: mapData.ourScore,
                                theirScore: mapData.theirScore,
                            };
                            handleAnswerUpdate('maps', updatedMaps);
                        }}
                    />
                )}

                {currentQuestion.type === 'player-stats' && (
                    <PlayerStatsQuestion
                        roundNumber={currentQuestion.context?.roundNumber || 1}
                        roundName={currentQuestion.context?.roundName || 'Map'}
                        playerName={currentQuestion.context?.playerName || 'Player'}
                        playerAvatar={currentQuestion.context?.playerAvatar}
                        statFields={getGameStatFields(selectedGame)}
                        value={wizardState.playerStats?.find(
                            (s) =>
                                s.playerId === currentQuestion.context?.playerId &&
                                (s as any).mapIndex === currentQuestion.context?.mapIndex
                        )}
                        onChange={(statData) => {
                            console.log('🎮 PlayerStatsQuestion onChange called:', {
                                playerId: currentQuestion.context?.playerId,
                                mapIndex: currentQuestion.context?.mapIndex,
                                statData
                            });

                            const updatedStats = [...(wizardState.playerStats || [])];
                            console.log('🎮 Current playerStats before update:', updatedStats.length);

                            const existingIndex = updatedStats.findIndex(
                                (s) =>
                                    s.playerId === currentQuestion.context?.playerId &&
                                    (s as any).mapIndex === currentQuestion.context?.mapIndex
                            );

                            const newStat = {
                                playerId: currentQuestion.context?.playerId || '',
                                playerName: currentQuestion.context?.playerName,
                                mapIndex: currentQuestion.context?.mapIndex,
                                role: statData.role,
                                statsJson: statData.statsJson,
                                rating: statData.rating,
                                isMvp: statData.isMvp,
                            };

                            if (existingIndex >= 0) {
                                console.log('🎮 Updating existing stat at index:', existingIndex);
                                updatedStats[existingIndex] = newStat;
                            } else {
                                console.log('🎮 Adding new stat');
                                updatedStats.push(newStat);
                            }

                            console.log('🎮 After update, total stats:', updatedStats.length);
                            handleAnswerUpdate('playerStats', updatedStats);
                        }}
                    />
                )}

                {currentQuestion.type === 'review' && (
                    <ReviewQuestion
                        wizardState={{
                            ...wizardState,
                            teamName: selectedTeam?.name,
                        }}
                        onEdit={(questionId) => {
                            const questionIndex = questions.findIndex(q => q.id === questionId);
                            if (questionIndex >= 0) {
                                setCurrentQuestionIndex(questionIndex);
                            }
                        }}
                    />
                )}

                {/* Placeholder for other question types */}
                {!['team-select', 'text', 'date', 'choice', 'map-detail', 'player-stats', 'review'].includes(currentQuestion.type) && (
                    <div className="flex items-center justify-center border-2 border-dashed border-muted rounded-lg p-8">
                        <div className="text-center space-y-4">
                            <p className="text-muted-foreground">
                                Question type: <span className="font-mono font-semold">{currentQuestion.type}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This question type is not yet implemented
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Render navigation footer (shared between modes)
    const renderNavigation = () => (
        <div className={fullPage ? "mt-6 bg-card rounded-lg border shadow-sm p-6" : "pt-6 border-t"}>
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={!canGoBack}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <div className="flex gap-2">
                    {currentQuestion.skippable && currentQuestion.type === 'player-stats' && (
                        <>
                            <Button variant="ghost" onClick={handleSkip}>
                                Skip This Player
                            </Button>
                            <Button variant="ghost" onClick={handleSkipAllStats}>
                                Skip All Stats
                            </Button>
                        </>
                    )}

                    {currentQuestion.skippable && currentQuestion.type !== 'player-stats' && (
                        <Button variant="ghost" onClick={handleSkip}>
                            Skip
                        </Button>
                    )}

                    {currentQuestionIndex === totalQuestions - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !wizardState.teamId || !wizardState.opponent}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Match
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            disabled={!canGoNext || !isCurrentQuestionValid() || isSubmitting}
                        >
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    // Main return - different layout based on fullPage prop
    if (fullPage) {
        return (
            <>
                <div className="space-y-6">
                    <div className="mb-6 flex items-start gap-4">
                        <div className="flex-1">
                            <WizardProgress
                                currentStep={currentQuestionIndex + 1}
                                totalSteps={totalQuestions}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowResetConfirm(true)}
                            className="text-muted-foreground flex-shrink-0"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Progress
                        </Button>
                    </div>

                    <div className="bg-card rounded-lg border shadow-sm p-8">
                        {renderQuestionContent()}
                    </div>

                    {renderNavigation()}
                </div>

                <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reset progress?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will clear all your progress and start the wizard from the beginning. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetProgress}>
                                Reset Progress
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    // Dialog mode layout
    return (
        <>
            <div className="flex flex-col h-full">
                <DialogHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">Match Logging Wizard</DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowResetConfirm(true)}
                                className="text-muted-foreground"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleBackToSelection}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </div>
                    </div>
                    <WizardProgress
                        currentStep={currentQuestionIndex + 1}
                        totalSteps={totalQuestions}
                    />
                </DialogHeader>

                <div className="flex-1 py-8">
                    {renderQuestionContent()}
                </div>

                {renderNavigation()}
            </div>

            <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset progress?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear all your progress and start the wizard from the beginning. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetProgress}>
                            Reset Progress
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
