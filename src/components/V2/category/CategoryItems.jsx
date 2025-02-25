import Image from 'next/image';
import Link from 'next/link';
import styles from './CategoryList.module.css';
import { get } from '@/services/api';

export default async function CategoryItems() {
  const data = await get('/api/category/show', {
    cache: 'force-cache',
    tags: ['categories'],
    revalidate: 3600, // Revalidate every hour
  });

  if (!data?.result?.length) {
    return <div className={styles.ewoError}>No categories found</div>;
  }

  return (
    <section className={styles.ewoSection}>
      {/* <div className={styles.ewoHeader}>
        <h2 className={styles.ewoTitle}>Categories</h2>
      </div> */}
      <div className={styles.ewoList}>
        {data.result.map(category => (
          <Link
            href={`/shop?category=${category?.parent
              .toLowerCase()
              .replace(/[&\s]+/g, '-')}`}
            key={category._id}
            className={styles.ewoItem}
          >
            <div className={styles.ewoImageWrapper}>
              <Image
                src={category.img}
                alt={category.parent}
                width={140}
                height={140}
                className={styles.ewoImage}
              />
            </div>
            <div className={styles.ewoContent}>
              <h3 className={styles.ewoCategoryTitle}>{category?.parent}</h3>
              <span className={styles.ewoCount}>
                {category.products.length} items
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
