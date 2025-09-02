import Banner from '@/components/version-tsx/banner';
import CategoryShowcase from '@/components/version-tsx/category-showcase';
import HeroBanner from '@/components/version-tsx/hero-banner';
import { getCategories } from '@/lib/server-data';

export default async function HomePage() {
  // Fetch categories on the server - Next.js will cache and dedupe this
  const categories = await getCategories();

  return (
    <>
      <HeroBanner />
      <Banner
        desktopPublicId="Extended_LABOR_DAY_SALE_20_OFF_On_All_Off-Road_Parts_txzlas"
        mobilePublicId="Extended_LABOR_DAY_SALE_20_OFF_On_All_Off-Road_Parts_txzlas"
        priority={false}
        showButton={false}
        aspectRatio={3.69} // 1920/520 ≈ 3.69 for 520px height
        mobileHeight={200}
      />
      <CategoryShowcase categories={categories} />
    </>
  );
}
