"use client";

interface MagnifierLensProps {
    style: any;
    isActive: boolean;
    className?: string;
}

export function MagnifierLens({ style, isActive, className = "" }: MagnifierLensProps) {
    return (
        <div
            className={`magnifier-lens ${className}`}
            style={style}
            aria-hidden={!isActive}
        />
    );
}
