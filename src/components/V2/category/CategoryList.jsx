import React, { Suspense } from 'react';
import CategorySkeleton from '../loaders/CategorySkeleton';
import styles from './CategoryList.module.css';
import CategoryItems from './CategoryItems';
import ErrorBoundryWrapper from '../common/ErrorBoundryWrapper';

export default async function CategoryList() {
  return (
    <section className={styles.ewoSection}>
      <div className={styles.sectionInner}>
        <ErrorBoundryWrapper>
          <Suspense fallback={<CategorySkeleton />}>
            <CategoryItems />
          </Suspense>
        </ErrorBoundryWrapper>
      </div>
    </section>
  );
}
