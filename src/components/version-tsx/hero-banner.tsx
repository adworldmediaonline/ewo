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
  // desktopPublicId = 'hero-banner-desktop_dja8ci',
  desktopPublicId = 'EWO_Car_Banner_lz703g',
  // mobilePublicId = 'hero-banner-mobile_uprqgb',
  mobilePublicId = 'EWO_Car_Banner_mobile_420x300_px_hfrxlv',
  desktopTitle = 'EAST WEST OFF ROAD',
  mobileTitle = 'EAST WEST OFF ROAD',
  href = '/shop',
  priority = true, // Enable priority for LCP optimization
}: HeroBannerProps) {
  return (
    <section aria-label="Hero banner" className="relative w-full">
      {/* Desktop / Large screens */}
      <div className="relative hidden md:block w-full">
        {/* Aspect ratio ~1920/800 */}
        {/* <div className="relative w-full aspect-[1920/680]"> */}
        <div className="relative w-full aspect-1920/780">
          <CldImage
            alt={desktopTitle}
            src={desktopPublicId}
            fill
            sizes="100vw"
            preload={priority}
            quality={100}
            className="object-cover"
            fetchPriority="high"
          />
          {/* left gradient for text legibility */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[45%] lg:w-[36%] xl:w-[32%] bg-linear-to-r from-black/70 to-transparent" />
        </div>
      </div>

      {/* Mobile / Small screens */}
      <div className="relative block md:hidden w-full">
        {/* Aspect ratio ~420/170 */}
        {/* <div className="relative w-full aspect-[420/170]"> */}
        <div className="relative w-full aspect-420/300">
          <CldImage
            alt={mobileTitle}
            src={mobilePublicId}
            fill
            sizes="100vw"
            preload={priority}
            quality={85}
            className="object-cover"
            fetchPriority="high"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-3/4 sm:w-1/2 bg-linear-to-r from-black/70 to-transparent" />
        </div>
      </div>

      {/* Overlay content - shared */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto w-full px-3 md:px-6">
          <div className="max-w-[75%] sm:max-w-lg md:max-w-xl lg:max-w-xl xl:max-w-2xl">
            {/* Desktop heading */}
            <div className="hidden md:block">
              <h1 className="text-white/95 text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.15] lg:leading-[1.12] drop-shadow mb-3">
                {desktopTitle}
              </h1>
              <h2 className="text-white/90 text-xl lg:text-2xl xl:text-3xl font-semibold tracking-wide leading-tight drop-shadow mb-2">
                HEAVY-DUTY OFF-ROAD STEERING & SUSPENSION PARTS
              </h2>
              <p className="text-white/85 text-lg lg:text-xl font-medium tracking-wide leading-relaxed drop-shadow">
                BUILT TO CONQUER ANY TERRAIN.
              </p>
            </div>

            {/* Mobile heading */}
            <div className="md:hidden">
              <h1 className="text-white text-xl sm:text-2xl font-bold leading-tight drop-shadow mb-2">
                {mobileTitle}
              </h1>
              <h2 className="text-white/90 text-sm sm:text-base font-semibold leading-tight drop-shadow mb-1">
                HEAVY-DUTY OFF-ROAD STEERING & SUSPENSION PARTS
              </h2>
              <p className="text-white/85 text-xs sm:text-sm font-medium leading-tight drop-shadow">
                BUILT TO CONQUER ANY TERRAIN.
              </p>
            </div>

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
