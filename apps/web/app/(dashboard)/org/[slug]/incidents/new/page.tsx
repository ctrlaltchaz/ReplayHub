'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { IncidentDialog } from '../components/IncidentDialog';

export default function NewIncidentPage() {
    const params = useParams();
    const orgSlug = params?.slug as string;
    const [dialogOpen, setDialogOpen] = useState(true);

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Link href={`/org/${orgSlug}/incidents`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Incidents
                    </Button>
                </Link>
            </div>

            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Create New Incident</h1>
                <p className="text-muted-foreground mb-6">
                    Report a new incident to track and resolve issues during your events.
                </p>

                <Button onClick={() => setDialogOpen(true)}>Open Incident Form</Button>

                <IncidentDialog
                    open={dialogOpen}
                    onOpenChange={handleDialogClose}
                    mode="create"
                    orgSlug={orgSlug}
                />
            </div>
        </div>
    );
}
