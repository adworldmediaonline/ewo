'use client';

export interface ProductCardPriceProps {
  finalPrice: string;
  markedPrice?: string;
  showMarkedPrice: boolean;
  className?: string;
}

export function ProductCardPrice({
  finalPrice,
  markedPrice,
  showMarkedPrice,
  className = '',
}: ProductCardPriceProps) {
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 mb-2 ${className}`}>
      {showMarkedPrice && markedPrice && (
        <span className="text-[10px] sm:text-sm text-primary line-through">
          ${markedPrice}
        </span>
      )}
      <span className="text-sm sm:text-lg font-bold">${finalPrice}</span>
    </div>
  );
}
