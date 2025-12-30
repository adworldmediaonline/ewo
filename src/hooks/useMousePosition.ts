"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface MousePosition {
    x: number;
    y: number;
    normalizedX: number;
    normalizedY: number;
    isInBounds: boolean;
}

interface UseMousePositionOptions {
    /** Padding from edges in pixels to start clamping */
    edgePadding?: number;
    /** Enable RAF throttling for performance */
    throttle?: boolean;
}

interface UseMousePositionReturn {
    position: MousePosition;
    containerRef: (node: HTMLDivElement | null) => void;
    containerElement: HTMLDivElement | null;
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
    containerDimensions: { width: number; height: number };
}

const defaultPosition: MousePosition = {
    x: 0,
    y: 0,
    normalizedX: 0.5,
    normalizedY: 0.5,
    isInBounds: false,
};

export function useMousePosition(
    options: UseMousePositionOptions = {}
): UseMousePositionReturn {
    const { edgePadding = 0, throttle = true } = options;

    const [position, setPosition] = useState<MousePosition>(defaultPosition);
    const [containerDimensions, setContainerDimensions] = useState({
        width: 0,
        height: 0,
    });

    const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        setContainerElement(node);
    }, []);

    const rafIdRef = useRef<number | null>(null);
    const lastPositionRef = useRef<MousePosition>(defaultPosition);

    // Update container dimensions on resize
    useEffect(() => {
        const container = containerElement;
        if (!container) return;

        const updateDimensions = () => {
            const rect = container.getBoundingClientRect();
            setContainerDimensions({ width: rect.width, height: rect.height });
        };

        // Initial measurement
        updateDimensions();

        // ResizeObserver for responsive updates
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [containerElement]);

    const calculatePosition = useCallback(
        (clientX: number, clientY: number): MousePosition => {
            const container = containerElement;
            if (!container) return defaultPosition;

            const rect = container.getBoundingClientRect();

            // Calculate raw position relative to container
            let x = clientX - rect.left;
            let y = clientY - rect.top;

            // Clamp to container bounds with padding
            const minX = edgePadding;
            const maxX = rect.width - edgePadding;
            const minY = edgePadding;
            const maxY = rect.height - edgePadding;

            x = Math.max(minX, Math.min(maxX, x));
            y = Math.max(minY, Math.min(maxY, y));

            // Calculate normalized coordinates (0-1 range)
            const normalizedX = rect.width > 0 ? x / rect.width : 0.5;
            const normalizedY = rect.height > 0 ? y / rect.height : 0.5;

            // Check if cursor is within bounds
            const isInBounds =
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom;

            return { x, y, normalizedX, normalizedY, isInBounds };
        },
        [edgePadding]
    );

    const updatePosition = useCallback(
        (clientX: number, clientY: number) => {
            const newPosition = calculatePosition(clientX, clientY);

            // Only update if position actually changed
            if (
                newPosition.x !== lastPositionRef.current.x ||
                newPosition.y !== lastPositionRef.current.y ||
                newPosition.isInBounds !== lastPositionRef.current.isInBounds
            ) {
                lastPositionRef.current = newPosition;
                setPosition(newPosition);
            }
        },
        [calculatePosition]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const { clientX, clientY } = e;

            if (throttle) {
                // Cancel any pending animation frame
                if (rafIdRef.current !== null) {
                    cancelAnimationFrame(rafIdRef.current);
                }

                // Schedule update for next frame
                rafIdRef.current = requestAnimationFrame(() => {
                    updatePosition(clientX, clientY);
                });
            } else {
                updatePosition(clientX, clientY);
            }
        },
        [throttle, updatePosition]
    );

    const handleMouseEnter = useCallback(() => {
        setPosition((prev) => ({ ...prev, isInBounds: true }));
    }, []);

    const handleMouseLeave = useCallback(() => {
        // Cancel any pending updates
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }

        setPosition((prev) => ({ ...prev, isInBounds: false }));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, []);

    return {
        position,
        containerRef,
        containerElement,
        handleMouseEnter,
        handleMouseLeave,
        handleMouseMove,
        containerDimensions,
    };
}
