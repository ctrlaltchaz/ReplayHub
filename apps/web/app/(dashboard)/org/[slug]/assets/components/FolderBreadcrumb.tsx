'use client';

import { Button } from '@/components/ui/button';
import type { AssetFolder } from '@/types/asset';
import { ChevronRight, Home } from 'lucide-react';

interface FolderBreadcrumbProps {
    folders: AssetFolder[];
    onFolderClick: (folderId: string | null) => void;
}

export function FolderBreadcrumb({ folders, onFolderClick }: FolderBreadcrumbProps) {
    return (
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 shrink-0"
                onClick={() => onFolderClick(null)}
            >
                <Home className="h-4 w-4" />
            </Button>

            {folders.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-1 shrink-0 min-w-0">
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 font-medium max-w-[200px]"
                        onClick={() => onFolderClick(folder.id)}
                        disabled={index === folders.length - 1}
                        title={folder.name}
                    >
                        <span className="truncate">{folder.name}</span>
                    </Button>
                </div>
            ))}
        </div>
    );
}
