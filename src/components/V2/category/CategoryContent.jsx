'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CategoryContent.module.css';
import ChildCategoryCard from './ChildCategoryCard';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import parentCategoryModified from '@/lib/parentCategory';
import { useGetCategoryByIdQuery } from '@/redux/features/categoryApi';
import CategoryContentSkeleton from '../loaders/CategoryContentSkeleton';
import EmptyState from '../common/EmptyState';

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
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerAccent}></div>
          <h1 className={styles.title}>{category.parent}</h1>

          {category.description && (
            <p className={styles.description}>{category.description}</p>
          )}
          {!category.description && (
            <p className={styles.description}>
              Discover our collection of high-quality{' '}
              {category.parent.toLowerCase()} products designed to meet your
              needs. Browse our categories below.
            </p>
          )}
        </div>

        <div className={styles.gridContainer}>
          <div className={styles.grid}>
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
