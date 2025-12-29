"use client";

import { useMemo, useState, useEffect } from "react";
import { useMousePosition } from "./useMousePosition";
import { useImageLoad } from "./useImageLoad";

interface MagnifierConfig {
    /** Diameter of the magnifier lens in pixels */
    lensSize?: number;
    /** Zoom level (1 = no zoom, 2 = 2x, etc.) */
    zoomLevel?: number;
    /** Border radius of lens (0 for circle, other values for other shapes) */
    borderRadius?: number;
    /** Offset from cursor position */
    offset?: { x: number; y: number };
}

interface UseMagnifierOptions extends MagnifierConfig {
    /** Image source URL */
    imageSrc: string;
    /** Optional higher resolution image for zoom */
    zoomImageSrc?: string;
}

interface LensStyle {
    width: number;
    height: number;
    left: number;
    top: number;
    backgroundImage: string;
    backgroundPosition: string;
    backgroundSize: string;
    borderRadius: number;
    opacity: number;
    transform: string;
    pointerEvents: "none";
}

export interface PreviewStyle {
    backgroundImage: string;
    backgroundPosition: string;
    backgroundSize: string;
}

interface UseMagnifierReturn {
    // State
    isActive: boolean;
    isLoading: boolean;
    isLoaded: boolean;
    error: string | null;

    // Lens positioning
    lensStyle: LensStyle;

    // Side preview positioning
    previewStyle: PreviewStyle;

    // Zoom image src for side preview
    zoomImageSrc: string;

    // Container props
    containerRef: React.RefObject<HTMLDivElement | null>;
    containerProps: {
        onMouseEnter: () => void;
        onMouseLeave: () => void;
        onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    };

    // Image props
    imageProps: {
        onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
        onError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    };

    // Dimensions
    containerDimensions: { width: number; height: number };
    imageDimensions: { width: number; height: number };
}

const defaultConfig: Required<MagnifierConfig> = {
    lensSize: 150,
    zoomLevel: 2.5,
    borderRadius: 9999, // Full circle
    offset: { x: 0, y: 0 },
};

export function useMagnifier(options: UseMagnifierOptions): UseMagnifierReturn {
    const {
        imageSrc,
        zoomImageSrc,
        lensSize = defaultConfig.lensSize,
        zoomLevel = defaultConfig.zoomLevel,
        borderRadius = defaultConfig.borderRadius,
        offset = defaultConfig.offset,
    } = options;

    // Check if we're on a touch device
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        // Only run on client
        setIsTouchDevice(
            typeof window !== "undefined" &&
            ("ontouchstart" in window || navigator.maxTouchPoints > 0)
        );
    }, []);

    // Mouse position tracking with edge padding to keep lens visible
    const {
        position,
        containerRef,
        handleMouseEnter,
        handleMouseLeave,
        handleMouseMove,
        containerDimensions,
    } = useMousePosition({
        edgePadding: 0,
        throttle: true,
    });

    // Image loading state
    const {
        isLoading,
        isLoaded,
        error,
        naturalWidth,
        naturalHeight,
        handleImageLoad,
        handleImageError,
        zoomImageLoaded,
    } = useImageLoad(imageSrc, {
        preloadZoomImage: true,
        zoomImageSrc,
    });

    // Determine if magnifier should be active
    const isActive = position.isInBounds && isLoaded && !isTouchDevice;

    // Resolved zoom image source
    const resolvedZoomSrc = zoomImageSrc || imageSrc;

    // Calculate lens style
    const lensStyle = useMemo((): LensStyle => {
        const halfLens = lensSize / 2;

        // Position lens centered on cursor
        const left = position.x - halfLens + offset.x;
        const top = position.y - halfLens + offset.y;

        // Calculate background position for zoom effect
        // The background should show the area around the cursor position, zoomed in
        const bgX = position.normalizedX * 100;
        const bgY = position.normalizedY * 100;

        // Background size based on zoom level
        const bgSizeX = containerDimensions.width * zoomLevel;
        const bgSizeY = containerDimensions.height * zoomLevel;

        return {
            width: lensSize,
            height: lensSize,
            left,
            top,
            backgroundImage: `url(${resolvedZoomSrc})`,
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundSize: `${bgSizeX}px ${bgSizeY}px`,
            borderRadius,
            opacity: isActive ? 1 : 0,
            transform: isActive ? "scale(1)" : "scale(0.8)",
            pointerEvents: "none" as const,
        };
    }, [
        position,
        lensSize,
        offset,
        zoomLevel,
        containerDimensions,
        resolvedZoomSrc,
        borderRadius,
        isActive,
    ]);

    // Calculate side preview style
    const previewStyle = useMemo((): PreviewStyle => {
        const bgX = position.normalizedX * 100;
        const bgY = position.normalizedY * 100;

        // Use absolute pixel values for background size to match lens scaling
        const bgSizeX = containerDimensions.width * zoomLevel;
        const bgSizeY = containerDimensions.height * zoomLevel;

        return {
            backgroundImage: `url(${resolvedZoomSrc})`,
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundSize: `${bgSizeX}px ${bgSizeY}px`,
        };
    }, [
        position.normalizedX,
        position.normalizedY,
        resolvedZoomSrc,
        zoomLevel,
        containerDimensions.width,
        containerDimensions.height,
    ]);

    return {
        isActive,
        isLoading,
        isLoaded,
        error,
        lensStyle,
        previewStyle,
        zoomImageSrc: resolvedZoomSrc,
        containerRef,
        containerProps: {
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onMouseMove: handleMouseMove,
        },
        imageProps: {
            onLoad: handleImageLoad,
            onError: handleImageError,
        },
        containerDimensions,
        imageDimensions: {
            width: naturalWidth,
            height: naturalHeight,
        },
    };
}
