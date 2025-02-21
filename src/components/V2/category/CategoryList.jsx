import React, { Suspense } from 'react';
import CategorySkeleton from '../loaders/CategorySkeleton';
import styles from './CategoryList.module.css';
import CategoryItems from './CategoryItems';

export default async function CategoryList() {
  return (
    <section className={styles.ewoSection}>
      <div className="container">
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryItems />
        </Suspense>
      </div>
    </section>
  );
}
