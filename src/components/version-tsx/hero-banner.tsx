import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { getActiveBanners } from '@/server/banner';
import { ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  desktopTitle?: string;
  mobileTitle?: string;
  href?: string;
  priority?: boolean;
}

export default async function HeroBanner() {
  const banners = await getActiveBanners();


  const banner = banners.length > 0 ? banners[0] : null;


  return (

    <>
      {banner && (
        <section className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden">
          {/* Next.js Image Component - Optimized with best practices */}
          <Image
            src={banner?.desktopImg}
            alt="Modern shopping experience - Discover your favorite products"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: "center",
            }}
          />

          {/* Overlay Gradient - Responsive opacity */}
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/40 md:from-black/70 md:via-black/50 md:to-black/30" />

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 leading-tight">
                  {banner?.heading}
                </h1>

                {/* Subtitle */}
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white/90 mb-4 md:mb-6">
                  {banner?.description}
                </h2>

                {/* Description */}
                <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 leading-relaxed font-medium">
                  {banner?.smallSubDescription}
                </p>

                {/* CTA Button */}
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl text-base md:text-lg  h-auto group py-2.5"
                >
                  <Link href={banner?.cta?.link || '/shop'} className="inline-flex items-center gap-2">
                    {banner?.cta?.text}
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
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
