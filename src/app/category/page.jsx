import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CategorySkeleton from '../../components/V2/loaders/CategorySkeleton';
import CategoryContent from '../../components/V2/category/CategoryContent';

export const metadata = {
  title: 'Category | EWO Shop',
  description: 'Browse our product categories',
};

export default async function CategoryPage({ searchParams }) {
  // Validate category ID
  const categoryId = searchParams?.id;

  if (!categoryId) {
    return redirect('/shop');
  }

  return (
    <main className="category-page-wrapper">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryContent categoryId={categoryId} />
      </Suspense>
    </main>
  );
}
