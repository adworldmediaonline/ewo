import PageSectionsRenderer from '@/components/version-tsx/page-sections-renderer';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';
import { getActivePageSections } from '@/server/page-sections';
import { getActiveBanners } from '@/server/banner';
import { getCategoriesShow } from '@/server/categories';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('home');
  return buildPageMetadata('home', cmsData, {
    title: 'East West Off Road | Premium Automotive & Off-Road Gear USA',
    description:
      'Discover high-performance automotive & off-road parts at East West Offroad (EWO) USA! 🛠️ Durable, reliable, and adventure-ready gear for trucks, Jeeps & 4x4s. Shop now for exclusive deals!',
    keywords:
      'Automotive off-road parts USA, East West Offroad EWO, Jeep & truck accessories, Best off-road gear 2024, 4x4 performance upgrades, Durable automotive parts, Off-road suspension kits, Adventure-ready truck mods, USA-made off-road equipment, Top-rated automotive upgrades, hd crossover steering kit',
    canonical: '/',
  });
}

export default async function HomePage() {
  // Parallelize all homepage data fetches for instant loading
  const [sections, banners, categories] = await Promise.all([
    getActivePageSections('home'),
    getActiveBanners(),
    getCategoriesShow(),
  ]);

  return (
    <PageSectionsRenderer
      pageSlug="home"
      sections={sections}
      banners={banners}
      categories={categories}
    />
  );
}
