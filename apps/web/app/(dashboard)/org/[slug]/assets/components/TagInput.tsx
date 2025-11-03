'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
    className?: string;
}

export function TagInput({
    value,
    onChange,
    suggestions = [],
    placeholder = 'Add tags...',
    className,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter suggestions that aren't already selected and match input
    const filteredSuggestions = suggestions.filter(
        (tag) =>
            !value.includes(tag.toLowerCase()) &&
            tag.toLowerCase().includes(inputValue.toLowerCase())
    );

    const addTag = (tag: string) => {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInputValue('');
        setShowSuggestions(false);
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue) {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn('space-y-2', className)} ref={containerRef}>
            {/* Selected Tags */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Tag Input */}
            <div className="relative">
                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        className="flex-1"
                    />
                    {inputValue && (
                        <Button
                            type="button"
                            onClick={() => addTag(inputValue)}
                            size="sm"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                        </Button>
                    )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                        {filteredSuggestions.slice(0, 10).map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                                onClick={() => addTag(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
