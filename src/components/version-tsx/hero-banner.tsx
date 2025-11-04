import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { getActiveBanners } from '@/server/banner';
import { ArrowRight } from 'lucide-react';

export default async function HeroBanner() {
  const banners = await getActiveBanners();

  const banner = banners.length > 0 ? banners[0] : null;

  return (
    <>
      {banner && (
        <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden">
          {/* Desktop Banner - Optimized for LCP */}
          <Image
            src={banner.desktopImg}
            alt={banner.heading || 'Hero banner'}
            fill
            preload={true}
            loading="eager"
            fetchPriority="high"
            quality={75}
            sizes="100vw"
            className="hidden md:block object-cover"
          />

          {/* Mobile Banner - Optimized for LCP */}
          <Image
            src={banner.mobileImg}
            alt={banner.heading || 'Hero banner'}
            fill
            preload={true}
            loading="eager"
            fetchPriority="high"
            quality={75}
            sizes="100vw"
            className="block md:hidden object-cover"
          />

          {/* Overlay Gradient - Optimized for performance */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-2xl">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 leading-tight drop-shadow-lg">
                  {banner.heading}
                </h1>

                {/* Subtitle */}
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white/90 mb-4 md:mb-6 drop-shadow-md">
                  {banner.description}
                </h2>

                {/* Description */}
                {banner.smallSubDescription && (
                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 leading-relaxed font-medium drop-shadow-md">
                    {banner.smallSubDescription}
                  </p>
                )}

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl text-base md:text-lg h-auto group py-2.5"
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
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
        </section>
      )}
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
