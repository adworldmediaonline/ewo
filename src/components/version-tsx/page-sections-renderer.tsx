import HeroBanner from './hero-banner';
import CmsHeroSection from './cms-hero-section';
import CmsCustomSection from './cms-custom-section';
import { getActivePageSections } from '@/server/page-sections';
import type {
  HeroSectionContent,
  CustomSectionContent,
} from '@/server/page-sections';

interface PageSectionsRendererProps {
  pageSlug?: string;
}

export default async function PageSectionsRenderer({
  pageSlug = 'home',
}: PageSectionsRendererProps) {
  const sections = await getActivePageSections(pageSlug);
  const sortedSections = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const heroSection = sortedSections.find((s) => s.sectionType === 'hero');
  const customSections = sortedSections.filter((s) => s.sectionType === 'custom');

  return (
    <>
      {heroSection?.content && Object.keys(heroSection.content).length > 0 ? (
        <CmsHeroSection content={heroSection.content as unknown as HeroSectionContent} />
      ) : (
        <HeroBanner />
      )}

      {customSections.map((section) => {
        const content = (section.content ?? { blocks: [] }) as unknown as CustomSectionContent;
        if (!content.blocks?.length) return null;
        return (
          <CmsCustomSection
            key={section._id}
            content={content}
          />
        );
      })}
    </>
  );
}
