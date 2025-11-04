
import CategoryShowcase from '@/components/version-tsx/category-showcase';
import HeroBanner from '@/components/version-tsx/hero-banner';
import { Suspense } from 'react';

// Fallback skeleton for hero banner while loading
function HeroBannerSkeleton() {
  return (
    <section
      className="relative w-full h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 animate-pulse"
      aria-label="Loading banner"
    />
  );
}

export default async function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroBannerSkeleton />}>
        <HeroBanner />
      </Suspense>
      <CategoryShowcase />
    </>
  );
}
