'use client';

import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { isCloudinaryUrl } from '@/lib/product-image';
import type { CartItemType } from './cart-types';

export interface CartItemCardProps {
  item: CartItemType;
  lineTotal: string;
  onIncrement: (item: CartItemType) => void;
  onDecrement: (item: CartItemType) => void;
  onRemove: (item: CartItemType) => void;
  productHref: (item: CartItemType) => string;
  onProductClick?: () => void;
  /** Compact layout for checkout (smaller image, tighter spacing) */
  variant?: 'default' | 'compact';
  /** When true, disable quantity/remove (e.g. during payment) */
  disabled?: boolean;
}

export function CartItemCard({
  item,
  lineTotal,
  onIncrement,
  onDecrement,
  onRemove,
  productHref,
  onProductClick,
  variant = 'default',
  disabled = false,
}: CartItemCardProps) {
  const imageUrl = item.img;
  const isCloudinaryImage = isCloudinaryUrl(imageUrl);
  const href = productHref(item);
  const isCompact = variant === 'compact';

  return (
    <div
      className={`group flex gap-3 rounded-xl border border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md ${
        isCompact ? 'p-2' : 'gap-4 p-3'
      }`}
    >
      <Link
        href={href}
        className={`relative shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/40 ${
          isCompact ? 'size-12 sm:size-16' : 'size-20'
        }`}
        aria-label={item.title}
        onClick={onProductClick}
      >
        {imageUrl ? (
          <CldImage
            src={imageUrl}
            alt={item.title}
            fill
            sizes="80px"
            className="object-cover transition-transform group-hover:scale-105"
            preserveTransformations={isCloudinaryImage}
            deliveryType={isCloudinaryImage ? undefined : 'fetch'}
            loading="lazy"
            fetchPriority="low"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="font-semibold text-foreground line-clamp-2 transition-colors hover:text-primary"
          onClick={onProductClick}
        >
          {item.title}
        </Link>
        {item.selectedOption && (
          <p className="text-muted-foreground mt-0.5 text-xs">
            {item.selectedOption.title} (+$
            {Number(item.selectedOption.price).toFixed(2)})
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <div className="flex items-center overflow-hidden rounded-lg border border-border/60 bg-muted/30">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDecrement(item)}
              disabled={item.orderQuantity <= 1}
              className="rounded-none hover:bg-muted/60"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="size-3" />
            </Button>
            <span className="min-w-7 px-1.5 text-center text-sm font-medium tabular-nums">
              {item.orderQuantity}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onIncrement(item)}
              className="rounded-none hover:bg-muted/60"
              aria-label="Increase quantity"
            >
              <PlusIcon className="size-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(item)}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Remove item"
          >
            <Trash2Icon className="size-3" />
          </Button>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className={`font-bold tabular-nums text-foreground ${isCompact ? 'text-sm' : 'text-base'}`}>
          ${lineTotal}
        </span>
      </div>
    </div>
  );
}
