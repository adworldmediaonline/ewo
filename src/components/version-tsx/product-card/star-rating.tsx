'use client';

import { Star } from 'lucide-react';

export interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, size = 'sm' }: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={`full-${i}`}
        className={`${sizeClass} fill-yellow-400 text-yellow-400`}
      />
    );
  }

  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className={`${sizeClass} text-yellow-400`} />
        <div className="absolute inset-0 overflow-hidden">
          <Star
            className={`${sizeClass} fill-yellow-400 text-yellow-400`}
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      </div>
    );
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className={`${sizeClass} text-yellow-400`} />
    );
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}
