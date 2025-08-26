import CategoryShowcase from '@/components/version-tsx/category-showcase';
import HeroBanner from '@/components/version-tsx/hero-banner';
import { getCategories } from '@/lib/server-data';

export default async function HomePage() {
  // Fetch categories on the server - Next.js will cache and dedupe this
  const categories = await getCategories();

  return (
    <>
      <HeroBanner />
      <CategoryShowcase categories={categories} />
    </>
  );
}
