'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CategoryContent from '../../components/V2/category/CategoryContent';
import { Suspense } from 'react';
import CategoryContentSkeleton from '@/components/V2/loaders/CategoryContentSkeleton';

function CategoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get('id');

  if (!categoryId) {
    router.push('/shop');
    return null;
  }
  return <CategoryContent categoryId={categoryId} />;
}

export default function CategoryPage() {
  return (
    <main className="category-page-wrapper">
      <Suspense fallback={<CategoryContentSkeleton />}>
        <CategoryPageContent />
      </Suspense>
    </main>
  );
}
