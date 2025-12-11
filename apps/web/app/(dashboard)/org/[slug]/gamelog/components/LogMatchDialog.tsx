"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Settings, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogMatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizationSlug: string;
}

export function LogMatchDialog({ open, onOpenChange, organizationSlug }: LogMatchDialogProps) {
    const router = useRouter();

    const handleAdvancedMode = () => {
        onOpenChange(false);
        router.push(`/org/${organizationSlug}/gamelog/create`);
    };

    const handleSimpleMode = () => {
        onOpenChange(false);
        router.push(`/org/${organizationSlug}/gamelog/wizard`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Log Match</DialogTitle>
                    <DialogDescription>
                        Choose how you'd like to log your match results
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Simple Mode Card */}
                    <Card
                        className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 group"
                        onClick={handleSimpleMode}
                    >
                        <CardHeader className="text-center pb-3">
                            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                                <Sparkles className="h-7 w-7 text-primary" />
                            </div>
                            <CardTitle>Simple Wizard</CardTitle>
                            <CardDescription>Guided step-by-step</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Perfect for quick match logging. Answer one question at a time with a guided flow.
                            </p>
                            <div className="space-y-2 text-xs text-left bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span>Easy to use</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span>Step-by-step guidance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span>Mobile friendly</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span>Auto-save progress</span>
                                </div>
                            </div>
                            <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                Start Wizard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Advanced Mode Card */}
                    <Card
                        className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 group"
                        onClick={handleAdvancedMode}
                    >
                        <CardHeader className="text-center pb-3">
                            <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                                <Settings className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <CardTitle>Advanced Form</CardTitle>
                            <CardDescription>Full control</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-3">
                            <p className="text-sm text-muted-foreground">
                                For power users who want to see and edit all fields at once on a single page.
                            </p>
                            <div className="space-y-2 text-xs text-left bg-muted/50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                    <span>All fields visible</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                    <span>Bulk data entry</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                    <span>Advanced options</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                    <span>Faster for experts</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">
                                Use Advanced Form
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
