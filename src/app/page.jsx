import CategoryShowcase from '@/components/version-tsx/category-showcase';
import HeroBanner from '@/components/version-tsx/hero-banner';

export default async function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategoryShowcase />
    </>
  );
}
