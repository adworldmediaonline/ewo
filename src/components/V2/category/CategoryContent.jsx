'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import HeaderV2 from '@/components/version-tsx/header';
import Footer from '@/layout/footers/footer';
import parentCategoryModified from '@/lib/parentCategory';
import { useGetCategoryByIdQuery } from '@/redux/features/categoryApi';
import EmptyState from '../common/EmptyState';
import CategoryContentSkeleton from '../loaders/CategoryContentSkeleton';
import ChildCategoryCard from './ChildCategoryCard';

function CategoryContent({ categoryId }) {
  const router = useRouter();
  const {
    data: category,
    isLoading,
    isError,
  } = useGetCategoryByIdQuery(categoryId);

  // Handle redirect with useEffect
  useEffect(() => {
    if (category && (!category.children || category.children.length === 0)) {
      const parentCat = parentCategoryModified(category.parent);
      router.push(`/shop?category=${parentCat}`);
    }
  }, [category, router]);

  // Handle loading state
  if (isLoading) {
    return (
      <>
        <HeaderV2 />
        <CategoryContentSkeleton />
        <Footer />
      </>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <>
        <HeaderV2 />
        <EmptyState
          title="Failed to Load Category"
          message="We encountered an error while loading this category. Please try again later."
          icon="error"
          actionLink="/shop"
          actionText="Back to Shop"
        />
        <Footer />
      </>
    );
  }

  const parentCategory = parentCategoryModified(category.parent);

  // Return null early if there are no children
  if (!category.children || category.children.length === 0) {
    return null;
  }

  return (
    <>
      <HeaderV2 />
      <div className="">
        <div className="">
          <div className=""></div>
          <h1 className="">{category.parent}</h1>

          {category.description && <p className="">{category.description}</p>}
          {!category.description && (
            <p className="">
              Discover our collection of high-quality{' '}
              {category.parent.toLowerCase()} products designed to meet your
              needs. Browse our categories below.
            </p>
          )}
        </div>

        <div className="">
          <div className="">
            {category.children.map((childCategory, index) => (
              <ChildCategoryCard
                key={index}
                category={childCategory}
                index={index}
                parentCategory={parentCategory}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CategoryContent;
