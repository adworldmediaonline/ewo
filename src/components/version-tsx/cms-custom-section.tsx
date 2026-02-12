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

function getVideoEmbedProps(url: string): { type: 'youtube' | 'vimeo' | 'direct'; src: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const youtubeMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return { type: 'youtube', src: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }

  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch) {
    return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed)) {
    return { type: 'direct', src: trimmed };
  }

  return null;
}

function VideoEmbed({ url, title }: { url: string; title?: string }) {
  const props = getVideoEmbedProps(url);
  if (!props) return null;

  if (props.type === 'direct') {
    return (
      <video
        src={props.src}
        title={title}
        controls
        className="w-full aspect-video rounded-lg object-cover"
        playsInline
      />
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        src={props.src}
        title={title ?? 'Video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}

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

    case 'columns': {
      const count = block.columnCount ?? 2;
      const cols = block.items ?? [];
      const gridClass = count === 2 ? 'grid-cols-1 md:grid-cols-2' : count === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      return (
        <div className={cn('grid gap-6', gridClass, wrapperClass)}>
          {Array.from({ length: count }, (_, i) => {
            const item = cols[i] ?? {};
            return (
              <div key={i} className="space-y-2">
                {item.heading && (
                  <h3 className="text-lg font-semibold text-foreground">{item.heading}</h3>
                )}
                {item.body && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.body}</p>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    case 'video': {
      if (!block.url?.trim()) return null;
      return (
        <div className={cn('relative w-full max-w-4xl mx-auto', wrapperClass)}>
          <VideoEmbed url={block.url} title={block.title} />
        </div>
      );
    }

    default:
      return null;
  }
}
