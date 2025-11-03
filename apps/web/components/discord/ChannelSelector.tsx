"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet } from "@/lib/api/client";
import { AlertCircle, Hash, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DiscordChannel {
    id: string;
    name: string;
    type: number; // 0 = text, 2 = voice, 4 = category, etc.
}

interface ChannelSelectorProps {
    slug: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function ChannelSelector({ slug, value, onChange, placeholder = "Select a channel", disabled }: ChannelSelectorProps) {
    const [channels, setChannels] = useState<DiscordChannel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadChannels();
    }, [slug]);

    const loadChannels = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await apiGet<DiscordChannel[]>(`/org/${slug}/discord/channels/list`);
            // Filter to only text channels (type 0)
            setChannels(data.filter(ch => ch.type === 0));
        } catch (err: any) {
            setError(err.message);
            setChannels([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getChannelIcon = (type: number) => {
        switch (type) {
            case 0: // Text channel
                return <Hash className="h-4 w-4" />;
            case 2: // Voice channel
                return <Volume2 className="h-4 w-4" />;
            default:
                return <Hash className="h-4 w-4" />;
        }
    };

    if (error) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span>Unable to load channels. Please check your bot configuration.</span>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md px-3 py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Loading channels...</span>
            </div>
        );
    }

    if (channels.length === 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span>No channels available. Link your Discord bot first.</span>
            </div>
        );
    }

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                        <div className="flex items-center gap-2">
                            {getChannelIcon(channel.type)}
                            <span>{channel.name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
