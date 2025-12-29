"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ImageLoadState {
    isLoading: boolean;
    isLoaded: boolean;
    error: string | null;
    naturalWidth: number;
    naturalHeight: number;
}

interface UseImageLoadOptions {
    /** Preload the zoom image for smoother experience */
    preloadZoomImage?: boolean;
    /** Optional zoom image URL if different from main image */
    zoomImageSrc?: string;
}

interface UseImageLoadReturn extends ImageLoadState {
    handleImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    handleImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    zoomImageLoaded: boolean;
}

export function useImageLoad(
    imageSrc: string,
    options: UseImageLoadOptions = {}
): UseImageLoadReturn {
    const { preloadZoomImage = true, zoomImageSrc } = options;

    const [state, setState] = useState<ImageLoadState>({
        isLoading: true,
        isLoaded: false,
        error: null,
        naturalWidth: 0,
        naturalHeight: 0,
    });

    const [zoomImageLoaded, setZoomImageLoaded] = useState(false);
    const preloadImageRef = useRef<HTMLImageElement | null>(null);

    // Preload zoom image
    useEffect(() => {
        if (!preloadZoomImage) return;

        const zoomSrc = zoomImageSrc || imageSrc;
        if (!zoomSrc) return;

        // Create preload image
        const img = new Image();
        preloadImageRef.current = img;

        img.onload = () => {
            setZoomImageLoaded(true);
        };

        img.onerror = () => {
            // Silently fail for preload - main image will still work
            setZoomImageLoaded(false);
        };

        img.src = zoomSrc;

        return () => {
            // Cleanup
            if (preloadImageRef.current) {
                preloadImageRef.current.onload = null;
                preloadImageRef.current.onerror = null;
                preloadImageRef.current = null;
            }
        };
    }, [imageSrc, zoomImageSrc, preloadZoomImage]);

    const handleImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const img = e.currentTarget;
            setState({
                isLoading: false,
                isLoaded: true,
                error: null,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
            });
        },
        []
    );

    const handleImageError = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            setState({
                isLoading: false,
                isLoaded: false,
                error: "Failed to load image",
                naturalWidth: 0,
                naturalHeight: 0,
            });
        },
        []
    );

    // Reset state when image source changes
    useEffect(() => {
        setState({
            isLoading: true,
            isLoaded: false,
            error: null,
            naturalWidth: 0,
            naturalHeight: 0,
        });
        setZoomImageLoaded(false);
    }, [imageSrc]);

    return {
        ...state,
        handleImageLoad,
        handleImageError,
        zoomImageLoaded,
    };
}
