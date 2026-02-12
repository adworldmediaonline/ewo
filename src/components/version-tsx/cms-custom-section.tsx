import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CustomSectionContent, CustomBlock } from '@/server/page-sections';

interface CmsCustomSectionProps {
  content: CustomSectionContent;
}

export default function CmsCustomSection({ content }: CmsCustomSectionProps) {
  const { layout = {}, blocks = [] } = content;
  const { width = 'contained', backgroundColor } = layout;

  const containerClass =
    width === 'full'
      ? 'w-full'
      : 'w-full container mx-auto px-4 sm:px-6 lg:px-8';

  const sectionStyle: React.CSSProperties | undefined = backgroundColor
    ? { backgroundColor }
    : undefined;

  return (
    <section
      className="py-12 md:py-16"
      style={sectionStyle}
    >
      <div className={containerClass}>
        <div className="space-y-8">
          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </div>
    </section>
  );
}

const blockWrapperClass = (block: CustomBlock) =>
  cn(block.className);

function BlockRenderer({ block }: { block: CustomBlock }) {
  const wrapperClass = blockWrapperClass(block);

  switch (block.type) {
    case 'text':
      return (
        <div className={cn('space-y-2', wrapperClass)}>
          {block.heading && (
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {block.heading}
            </h2>
          )}
          {block.body && (
            <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">
              {block.body}
            </p>
          )}
        </div>
      );

    case 'image':
      if (!block.image?.url) return null;
      const imageContent = (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={block.image.url}
            alt={block.image.altText || block.image.title || ''}
            title={block.image.title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
        </div>
      );
      return (
        <div className={cn('relative w-full max-w-2xl mx-auto', wrapperClass)}>
          {block.image?.link ? (
            <Link href={block.image.link} className="block">
              {imageContent}
            </Link>
          ) : (
            <div className="block">{imageContent}</div>
          )}
          {block.image?.title && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {block.image.title}
            </figcaption>
          )}
        </div>
      );

    case 'button':
      if (!block.text) return null;
      return (
        <div className={wrapperClass}>
          <Button asChild>
            <Link href={block.link || '#'}>{block.text}</Link>
          </Button>
        </div>
      );

    case 'spacer':
      return (
        <div
          className={wrapperClass}
          style={{ height: `${block.height ?? 24}px` }}
          aria-hidden
        />
      );

    default:
      return null;
  }
}
