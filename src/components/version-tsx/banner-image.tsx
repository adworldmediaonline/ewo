'use client';

import { CldImage } from 'next-cloudinary';

interface BannerImageProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: 'contain' | 'cover';
}

// Helper function to check if URL is a Cloudinary asset
const isCloudinaryAsset = (url: string): boolean => {
  return (
    typeof url === 'string' &&
    url.startsWith('https://res.cloudinary.com/') &&
    url.includes('/upload/')
  );
};

export function BannerImage({
  src,
  alt,
  className = '',
  objectFit = 'contain',
}: BannerImageProps) {
  const isCloudinary = isCloudinaryAsset(src);

  return (
    <CldImage
      src={src}
      alt={alt}
      fill
      loading="eager"
      fetchPriority="high"
      sizes="100vw"
      className={className}
      preserveTransformations={isCloudinary}
      deliveryType={isCloudinary ? undefined : 'fetch'}
    />
  );
}

