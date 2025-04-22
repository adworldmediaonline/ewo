'use client';

import React from 'react';
import styles from './CategoryList.module.css';
import CategoryItems from './CategoryItems';

export default function CategoryList() {
  return (
    <section className={styles.ewoSection}>
      <div className={styles.sectionInner}>
        <CategoryItems />
      </div>
    </section>
  );
}
