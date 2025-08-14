'use client';

import { Button } from '@/components/ui/button';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';

interface HeroBannerProps {
  desktopPublicId?: string; // 1920x800
  mobilePublicId?: string; // 420x170
  desktopTitle?: string;
  mobileTitle?: string;
  href?: string;
  priority?: boolean;
}

export default function HeroBanner({
  desktopPublicId = 'hero-banner-desktop_dja8ci',
  mobilePublicId = 'hero-banner-mobile_uprqgb',
  desktopTitle = 'Explore premium off‑road accessories, parts and gear for every adventure',
  mobileTitle = 'Premium off‑road accessories',
  href = '/shop',
  priority = true,
}: HeroBannerProps) {
  return (
    <section aria-label="Hero banner" className="relative w-full">
      {/* Desktop / Large screens */}
      <div className="relative hidden md:block w-full">
        {/* Aspect ratio ~1920/800 */}
        <div className="relative w-full aspect-[1920/680]">
          <CldImage
            alt={desktopTitle}
            src={desktopPublicId}
            fill
            sizes="100vw"
            priority={priority}
            quality={90}
            className="object-cover"
          />
          {/* left gradient for text legibility */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[45%] lg:w-[36%] xl:w-[32%] bg-gradient-to-r from-black/70 to-transparent" />
        </div>
      </div>

      {/* Mobile / Small screens */}
      <div className="relative block md:hidden w-full">
        {/* Aspect ratio ~420/170 */}
        <div className="relative w-full aspect-[420/170]">
          <CldImage
            alt={mobileTitle}
            src={mobilePublicId}
            fill
            sizes="100vw"
            priority={priority}
            quality={85}
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-3/4 sm:w-1/2 bg-gradient-to-r from-black/70 to-transparent" />
        </div>
      </div>

      {/* Overlay content - shared */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto w-full px-3 md:px-6">
          <div className="max-w-[75%] sm:max-w-lg md:max-w-xl lg:max-w-xl xl:max-w-2xl">
            {/* Desktop heading */}
            <h2 className="hidden md:block text-white/95 text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15] lg:leading-[1.12] drop-shadow">
              {desktopTitle}
            </h2>
            {/* Mobile heading */}
            <h2 className="md:hidden text-white text-xl sm:text-2xl font-semibold leading-tight drop-shadow">
              {mobileTitle}
            </h2>
            <div className="mt-5 md:mt-6 lg:mt-8">
              <Button
                asChild
                size="lg"
                className="hidden md:inline-flex justify-center items-center rounded-full text-sm md:text-base"
              >
                <Link href={href} aria-label="Shop now from hero banner">
                  Shop Now
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="inline-flex justify-center items-center md:hidden rounded-full text-sm md:text-base"
              >
                <Link href={href} aria-label="Shop now from hero banner">
                  Shop Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
