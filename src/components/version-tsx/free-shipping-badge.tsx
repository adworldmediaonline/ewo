'use client';

import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FreeShippingBadgeProps {
  minimumOrder?: number;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * FreeShippingBadge Component
 *
 * A reusable badge component that displays free shipping information.
 * Supports two variants: horizontal (default) and vertical.
 *
 * @example
 * ```tsx
 * // Horizontal variant (default)
 * <FreeShippingBadge minimumOrder={500} />
 *
 * // Vertical variant
 * <FreeShippingBadge minimumOrder={500} variant="vertical" />
 * ```
 */
export default function FreeShippingBadge({
  minimumOrder = 70,
  variant = 'horizontal',
  className = '',
}: FreeShippingBadgeProps) {
  const isVertical = variant === 'vertical';

  return (
    <div className={cn('pt-2', className)}>
      <div
        className={cn(
          'relative inline-flex items-center gap-3 rounded-lg overflow-hidden',
          'px-4 py-2.5',
          isVertical && 'flex-col px-5 py-4'
        )}
        role="banner"
        aria-label={`Free shipping available on orders over $${minimumOrder}`}
      >
        {/* Animated Gradient Border */}
        <div
          className={cn(
            'absolute -inset-[2px] rounded-lg -z-10',
            'bg-gradient-to-r from-orange-500 via-primary to-orange-500',
            'animate-gradient-x'
          )}
        />

        {/* Content Container */}
        <div className="relative z-10 flex items-center gap-3 bg-background rounded-md px-3 py-2">
          {/* Truck Icon */}
          <Truck className={cn(
            'text-primary flex-shrink-0',
            isVertical ? 'w-10 h-10' : 'w-7 h-7'
          )} />

          {/* Text Content */}
          <div className={cn(
            'flex flex-col',
            isVertical && 'items-center text-center'
          )}>
            <span className={cn(
              'font-bold text-orange-600 leading-tight',
              isVertical ? 'text-xl' : 'text-base'
            )}>
              FREE SHIPPING
            </span>
            <span className={cn(
              'text-primary leading-tight',
              isVertical ? 'text-sm font-semibold' : 'text-xs font-medium'
            )}>
              All Orders Over <span className="font-bold text-sm">${minimumOrder}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

