'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CategoryContent from '../../components/V2/category/CategoryContent';

export default function CategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get('id');

  if (!categoryId) {
    router.push('/shop');
    return null;
  }

  return (
    <main className="category-page-wrapper">
      <CategoryContent categoryId={categoryId} />
    </main>
  );
}
