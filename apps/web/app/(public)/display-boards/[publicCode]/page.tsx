"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import './animations.css';

interface BoardData {
    id: string;
    name: string;
    interval: number;
    transition: string;
    images: {
        id: string;
        fileName: string;
        url: string;
        order: number;
    }[];
}

export default function PublicDisplayBoardPage() {
    const params = useParams();
    const publicCode = params?.publicCode as string;

    const [board, setBoard] = useState<BoardData | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());

    // Preload all images when board loads
    useEffect(() => {
        if (!board) return;

        board.images.forEach((image) => {
            const img = new Image();
            img.onload = () => {
                setImagesLoaded((prev) => new Set(prev).add(image.id));
            };
            img.src = image.url;
        });
    }, [board]);

    // Fetch board data initially and periodically
    useEffect(() => {
        async function fetchBoard() {
            try {
                const response = await fetch(`/api/public/display-boards/${publicCode}/data`);
                if (!response.ok) {
                    throw new Error("Board not found");
                }
                const data = await response.json();
                setBoard(data);
                setLoading(false);
                // Update page title
                document.title = data.name;
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load board");
                setLoading(false);
            }
        }

        fetchBoard();

        // Auto-refresh every 10 seconds to check for updates
        const refreshInterval = setInterval(fetchBoard, 10000);

        return () => clearInterval(refreshInterval);
    }, [publicCode]);

    // Auto-advance images
    useEffect(() => {
        if (!board || board.images.length <= 1) return;

        const timer = setInterval(() => {
            setPreviousIndex(currentIndex);
            setCurrentIndex((prev) => (prev + 1) % board.images.length);
        }, board.interval);

        return () => clearInterval(timer);
    }, [board, currentIndex]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
                    <p className="text-white text-lg">Loading display...</p>
                </div>
            </div>
        );
    }

    if (error || !board) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Display Not Found</h1>
                    <p className="text-gray-400">{error || "The display board you're looking for doesn't exist."}</p>
                </div>
            </div>
        );
    }

    if (board.images.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">{board.name}</h1>
                    <p className="text-gray-400">No images to display</p>
                </div>
            </div>
        );
    }

    const currentImage = board.images[currentIndex];
    const transition = board.transition || 'fade';
    const singleImage = board.images.length === 1;

    const getTransitionClass = (imageIndex: number) => {
        const isActive = imageIndex === currentIndex;
        const wasPrevious = imageIndex === previousIndex;

        if (singleImage) return 'opacity-100 translate-x-0 scale-100';

        // Keep previous image visible during transition
        if (!isActive && !wasPrevious) return 'opacity-0 pointer-events-none';
        if (wasPrevious && !isActive) return 'opacity-100 pointer-events-none';

        switch (transition) {
            case 'slide':
                return 'animate-slide-in';
            case 'zoom':
                return 'animate-zoom-in';
            case 'none':
                return 'opacity-100';
            case 'fade':
            default:
                return 'animate-fade-in';
        }
    };

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Render all images, show only active one */}
            {board.images.map((image, index) => (
                <img
                    key={`${image.id}-${index}`}
                    src={image.url}
                    alt={image.fileName}
                    className={`absolute inset-0 w-full h-full object-cover ${getTransitionClass(index)}`}
                    style={{
                        animation: (singleImage || index !== currentIndex) ? 'none' : undefined,
                        zIndex: index === currentIndex ? 2 : (index === previousIndex ? 1 : 0)
                    }}
                    loading="eager"
                />
            ))}

            {/* Board info in bottom left corner */}
            <div className="absolute bottom-2 left-2 text-white/40 text-[10px] z-10">
                {board.name}
                {!singleImage && ` • ${currentIndex + 1}/${board.images.length}`}
            </div>
        </div>
    );
}
