import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { HeroSectionContent } from '@/server/page-sections';

interface CmsHeroSectionProps {
  content: HeroSectionContent;
}

export default function CmsHeroSection({ content }: CmsHeroSectionProps) {
  const { variant, image, heading, description, smallSubDescription, cta } =
    content;

  const showImage = variant === 'image_only' || variant === 'image_content';
  const showContent = variant === 'image_content' || variant === 'content_only';

  const imageAlt = image?.altText || image?.title || heading || 'Hero';
  const imageUrl = image?.url;

  const ContentBlock = () =>
    showContent && (heading || description || smallSubDescription || cta) ? (
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          {heading && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 leading-tight drop-shadow-lg">
              {heading}
            </h1>
          )}
          {description && (
            <h2 className="text-base md:text-lg lg:text-xl font-semibold text-white/90 mb-3 md:mb-4 drop-shadow-md">
              {description}
            </h2>
          )}
          {smallSubDescription && (
            <p className="text-sm md:text-base lg:text-lg text-white/90 mb-4 md:mb-5 leading-relaxed font-medium drop-shadow-md">
              {smallSubDescription}
            </p>
          )}
          {cta?.text && (
            <Button
              asChild
              size="lg"
              className="rounded-full hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 text-base md:text-lg h-auto group py-2.5 bg-primary text-primary-foreground"
            >
              <Link href={cta.link || '/shop'} className="inline-flex items-center gap-2">
                {cta.text}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    ) : null;

  if (variant === 'content_only') {
    return (
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-[1]" />
        <div className="relative z-[2] flex items-center">
          <ContentBlock />
        </div>
      </section>
    );
  }

  if (variant === 'image_only' && imageUrl) {
    const ImageWrapper = image?.link ? Link : 'div';
    const imageWrapperProps = image?.link
      ? { href: image.link, className: 'block relative w-full aspect-[1920/800] md:aspect-[1920/800]' }
      : { className: 'relative w-full aspect-[1920/800] md:aspect-[1920/800]' };

    return (
      <section className="relative w-full overflow-hidden">
        <ImageWrapper {...imageWrapperProps}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </ImageWrapper>
      </section>
    );
  }

  if (variant === 'image_content' && imageUrl) {
    const ImageWrapper = image?.link ? Link : 'div';
    const imageWrapperProps = image?.link
      ? { href: image.link, className: 'block relative w-full aspect-[1920/800] md:aspect-[1920/800]' }
      : { className: 'relative w-full aspect-[1920/800] md:aspect-[1920/800]' };

    return (
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full">
          <div className="relative w-full">
            <ImageWrapper {...imageWrapperProps}>
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </ImageWrapper>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-[1]" />
          <div className="absolute inset-0 z-[2] flex items-center">
            <ContentBlock />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/15 to-transparent pointer-events-none z-[1]" />
        </div>
      </section>
    );
  }

  if (variant === 'image_content' && !imageUrl && showContent) {
    return (
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-[1]" />
        <div className="relative z-[2] flex items-center">
          <ContentBlock />
        </div>
      </section>
    );
  }

  return null;
}
