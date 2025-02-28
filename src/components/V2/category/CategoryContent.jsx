import React from 'react';
import { redirect } from 'next/navigation';
import styles from '../../../styleModules/Category.module.css';
import ChildCategoryCard from './ChildCategoryCard';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';

async function fetchCategory(id) {
  const baseUrl = process.env.API_BASE_URL;
  const res = await fetch(`${baseUrl}/api/category/get/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch category');
  }

  return res.json();
}

async function CategoryContent({ categoryId }) {
  try {
    const category = await fetchCategory(categoryId);

    if (!category.children || category.children.length === 0) {
      return redirect(`/shop?category=${categoryId}`);
    }

    const parentCategory = category.parent.toLowerCase().replace(/\s+/g, '-');

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

            <div className={styles.divider}></div>
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
  } catch (error) {
    console.error('Error fetching category:', error);
    return (
      <>
        <HeaderV2 />
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.errorIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className={styles.errorTitle}>Category Not Found</h1>
            <p className={styles.errorText}>
              We couldn't find the category you're looking for. It might have
              been removed or is temporarily unavailable.
            </p>
            <a href="/shop" className={styles.errorButton}>
              Browse All Products
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}

export default CategoryContent;
