import React from 'react';
import { redirect } from 'next/navigation';
import styles from './CategoryContent.module.css';
import ChildCategoryCard from './ChildCategoryCard';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Footer from '@/layout/footers/footer';
import parentCategoryModified from '@/lib/parentCategory';

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
  const category = await fetchCategory(categoryId);
  const parentCategory = parentCategoryModified(category.parent);

  if (!category.children || category.children.length === 0) {
    redirect(`/shop?category=${parentCategory}`);
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
