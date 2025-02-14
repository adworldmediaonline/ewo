import React, { Suspense } from 'react';
import { get } from '@/services/api';
import CategorySkeleton from '../loaders/CategorySkeleton';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CategoryList.module.css';

// Server component for fetching categories
async function CategoryItems() {
  try {
    const data = await get('/api/category/show', {
      cache: 'force-cache',
      tags: ['categories'],
      revalidate: 3600, // Revalidate every hour
    });

    return (
      <div className={styles.ewoList}>
        {data?.result?.map(category => (
          <Link
            href={`/category/${category.slug}`}
            key={category._id}
            className={styles.ewoItem}
          >
            <div className={styles.ewoImageWrapper}>
              <Image
                src={category.img}
                alt={category.parent}
                width={80}
                height={80}
                loading="lazy"
                className={styles.ewoImage}
              />
            </div>
            <div className={styles.ewoContent}>
              <h3 className={styles.ewoCategoryTitle}>{category.name}</h3>
              <span className={styles.ewoCount}>
                {category.products.length} Products
              </span>
            </div>
          </Link>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return <div className={styles.ewoError}>Failed to load categories</div>;
  }
}

// Main category component
const CategoryList = () => {
  return (
    <section className={styles.ewoSection}>
      <div className="container">
        <div className={styles.ewoHeader}>
          <h2 className={styles.ewoTitle}>Shop by Category</h2>
        </div>
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryItems />
        </Suspense>
      </div>
    </section>
  );
};

export default CategoryList;
