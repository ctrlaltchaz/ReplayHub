'use client';

import { Button } from '@/components/ui/button';
import type { AssetFolder } from '@/types/asset';
import { ChevronRight, Folder, FolderOpen, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAssetFolders } from '../hooks/useAssetFolders';

interface FolderTreeProps {
    orgSlug: string;
    selectedFolderId?: string | null;
    onFolderSelect: (folderId: string | null) => void;
}

interface FolderNodeProps {
    folder: AssetFolder;
    orgSlug: string;
    selectedFolderId?: string | null;
    onFolderSelect: (folderId: string | null) => void;
    level: number;
}

function FolderNode({ folder, orgSlug, selectedFolderId, onFolderSelect, level }: FolderNodeProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isSelected = selectedFolderId === folder.id;

    const { data: childrenResponse, isLoading } = useAssetFolders(orgSlug, {
        parentId: folder.id,
    });

    const hasChildren = (folder._count?.children || 0) > 0;
    const children = childrenResponse?.data || [];

    return (
        <div>
            <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-left font-normal min-w-0 ${
                    isSelected ? 'bg-accent' : ''
                }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => onFolderSelect(folder.id)}
            >
                {hasChildren && (
                    <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                    />
                )}
                {!hasChildren && <div className="w-4 shrink-0" />}
                {isExpanded ? (
                    <FolderOpen className="ml-2 h-4 w-4 shrink-0" />
                ) : (
                    <Folder className="ml-2 h-4 w-4 shrink-0" />
                )}
                <span className="ml-2 truncate min-w-0 flex-1" title={folder.name}>{folder.name}</span>
                {folder._count && (
                    <span className="ml-auto pl-2 text-xs text-muted-foreground shrink-0">
                        {folder._count.assets}
                    </span>
                )}
            </Button>

            {isExpanded && hasChildren && (
                <div>
                    {isLoading && (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    )}
                    {children.map((child) => (
                        <FolderNode
                            key={child.id}
                            folder={child}
                            orgSlug={orgSlug}
                            selectedFolderId={selectedFolderId}
                            onFolderSelect={onFolderSelect}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function FolderTree({ orgSlug, selectedFolderId, onFolderSelect }: FolderTreeProps) {
    const { data: response, isLoading } = useAssetFolders(orgSlug, {
        parentId: 'root',
    });

    const rootFolders = response?.data || [];

    return (
        <div className="h-full overflow-y-auto">
            <div className="space-y-1 p-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-left font-normal ${
                        selectedFolderId === null ? 'bg-accent' : ''
                    }`}
                    onClick={() => onFolderSelect(null)}
                >
                    <Folder className="mr-2 h-4 w-4" />
                    All Assets
                </Button>
                
                <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-left font-normal ${
                        selectedFolderId === 'root' ? 'bg-accent' : ''
                    }`}
                    onClick={() => onFolderSelect('root')}
                >
                    <Folder className="mr-2 h-4 w-4" />
                    📁 Root Folder
                </Button>

                {isLoading && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                )}

                {rootFolders.map((folder) => (
                    <FolderNode
                        key={folder.id}
                        folder={folder}
                        orgSlug={orgSlug}
                        selectedFolderId={selectedFolderId}
                        onFolderSelect={onFolderSelect}
                        level={0}
                    />
                ))}
            </div>
        </div>
    );
}
