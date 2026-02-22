import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { getActiveBanners } from '@/server/banner';
import { ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  /** Pre-fetched banners; when provided, skips internal fetch (for parallel loading) */
  banners?: unknown[];
}

export default async function HeroBanner({ banners: bannersProp }: HeroBannerProps = {}) {
  const banners = bannersProp ?? (await getActiveBanners());
  const banner = Array.isArray(banners) && banners.length > 0 ? banners[0] : null;

  const BannerContent = () => {
    if (!banner) return null;

    // If includeCaption is false, render as simple clickable image
    if (banner.includeCaption === false) {
      return (
        <section className="relative w-full overflow-hidden">
          <Link href={banner.cta?.link || '/shop'} className="block w-full">
            {/* Desktop Banner - 1920x800 aspect ratio */}
            <div className="hidden md:block relative w-full aspect-[1920/800]">
              <Image
                src={banner.desktopImg}
                alt={banner.heading || 'Hero banner'}
                fill
                preload={true}
                loading="eager"
                fetchPriority="high"
                quality={75}
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Mobile Banner - 480x511 aspect ratio */}
            <div className="block md:hidden relative w-full aspect-[480/511]">
              <Image
                src={banner.mobileImg}
                alt={banner.heading || 'Hero banner'}
                fill
                preload={true}
                loading="eager"
                fetchPriority="high"
                quality={75}
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </Link>
        </section>
      );
    }

    // Render with caption (default behavior)
    return (
      <section className="relative w-full overflow-hidden">
        {/* Container for images and overlay */}
        <div className="relative w-full">
          {/* Desktop Banner - 1920x800 aspect ratio */}
          <div className="hidden md:block relative w-full aspect-[1920/800]">
            <Image
              src={'/assets/banners/EWO Car Banner (1920 x 800 px) (3).webp'}
              alt={banner.heading || 'Hero banner'}
              fill
              preload={true}
              loading="eager"
              fetchPriority="high"
              quality={75}
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* Mobile Banner - 480x511 aspect ratio */}
          <div className="block md:hidden relative w-full aspect-[480/511]">
            <Image
              src={'/assets/banners/EWO Car Banner Mobile (480 x 511 px) (1).webp'}
              alt={banner.heading || 'Hero banner'}
              fill
              preload={true}
              loading="eager"
              fetchPriority="high"
              quality={75}
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* Overlay Gradient - Optimized for performance */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-[1]" />

          {/* Content Overlay */}
          <div className="absolute inset-0 z-[2] flex items-center">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-2xl">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 leading-tight drop-shadow-lg">
                  {banner.heading}
                </h1>

                {/* Subtitle */}
                <h2 className="text-base md:text-lg lg:text-xl font-semibold text-white/90 mb-3 md:mb-4 drop-shadow-md">
                  {banner.description}
                </h2>

                {/* Description */}
                {banner.smallSubDescription && (
                  <p className="text-sm md:text-base lg:text-lg text-white/90 mb-4 md:mb-5 leading-relaxed font-medium drop-shadow-md">
                    {banner.smallSubDescription}
                  </p>
                )}

                {banner.selectedCoupon && (
                  <p
                    style={{
                      textTransform: 'uppercase',
                      color: '#ffffff',
                    }}
                    className="text-lg uppercase md:text-xl lg:text-2xl mb-3 md:mb-4 leading-relaxed font-medium animate-pulse-glow"
                  >
                    {banner.selectedCoupon}
                  </p>
                )}



                {/* Promotional Content */}
                <div className="space-y-2 mb-4 md:mb-6">
                  <p
                    style={{
                      color: '#ffffff',
                    }}
                    className="text-sm uppercase md:text-base lg:text-lg leading-relaxed font-medium animate-pulse-glow-yellow"
                  >
                    20% OFF ON ALL OFF-ROAD PARTS
                  </p>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  style={{
                    backgroundColor: '#cb0405',
                    color: '#ffffff',
                  }}
                  className="rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 text-base md:text-lg h-auto group py-2.5 animate-pulse-glow-button"
                >
                  <Link href={banner.cta?.link || '/shop'} className="inline-flex items-center gap-2">
                    {banner.cta.text}
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative Bottom Gradient - Subtle enhancement */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/15 to-transparent pointer-events-none z-[1]" />
        </div>
      </section>
    );
  };

  return (
    <>
      <BannerContent />
      {!banner && (
        <section aria-label="Hero banner" className="relative w-full">
          <div className="relative hidden md:block w-full">
            <div className="relative w-full aspect-1920/780">
              <p className="text-white text-center text-2xl font-bold">Banner not found</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
