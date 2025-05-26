'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CategoryContent from '../../components/V2/category/CategoryContent';
import { Suspense } from 'react';
import CategoryContentSkeleton from '../../components/V2/loaders/CategoryContentSkeleton';
import styles from './category.module.css';

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
    <div className={styles.categoryPage}>
      <main className={styles.categoryPageWrapper}>
        <Suspense fallback={<CategoryContentSkeleton />}>
          <CategoryPageContent />
        </Suspense>
      </main>
    </div>
  );
}
