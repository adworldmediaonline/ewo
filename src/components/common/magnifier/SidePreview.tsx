import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PreviewStyle } from "@/hooks/useMagnifier";

interface SidePreviewProps {
    /** Preview styling from useMagnifier hook */
    style: PreviewStyle;
    /** Whether the preview is active */
    isActive: boolean;
    /** Width of the preview panel */
    width?: number;
    /** Height of the preview panel */
    height?: number;
    /** Fixed position top */
    top?: number;
    /** Fixed position left */
    left?: number;
    /** Alt text for accessibility */
    alt?: string;
}

export function SidePreview({
    style,
    isActive,
    width = 400,
    height = 400,
    top = 0,
    left = 0,
    alt = "Zoomed preview",
}: SidePreviewProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div
            className={`side-preview ${isActive ? "side-preview-active" : "side-preview-hidden"}`}
            style={{
                width,
                height,
                top,
                left,
                ...style,
            }}
            role="img"
            aria-label={alt}
            aria-hidden={!isActive}
        />,
        document.body
    );
}
