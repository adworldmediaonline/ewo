import Image from 'next/image';
import Link from 'next/link';
import styles from './CategoryList.module.css';
import { get } from '@/services/api';
import { titleCaseFirstLetterOfEveryWord } from '@/lib/titleCaseFirstLetterOfEveryWord';

export default async function CategoryItems() {
  const data = await get('/api/category/show', {
    cache: 'force-cache',
    tags: ['categories'],
    revalidate: 3600, // Revalidate every hour
  });

  if (!data?.result?.length) {
    return <div className={styles.ewoError}>No categories found</div>;
  }

  // Filter out categories with no products or hidden status
  const filteredCategories = data.result.filter(
    category => category.products?.length > 0 && category.status === 'Show'
  );

  return (
    <div className={styles.container}>
      <div className={styles.ewoHeader}>
        <h2 className={styles.ewoTitle}>
          <span className={styles.titleHighlight}>Explore</span> Categories
        </h2>
        <p className={styles.ewoSubtitle}>
          Find high-quality auto parts for your vehicle from our extensive
          catalog
        </p>
      </div>

      <div className={styles.ewoList}>
        {filteredCategories.map((category, index) => (
          <Link
            href={`/category?id=${category._id}`}
            key={category._id}
            className={`${styles.ewoItem} ${styles.itemAppear}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.ewoImageWrapper}>
              <Image
                src={category.img}
                alt={category.parent}
                width={240}
                height={240}
                className={styles.ewoImage}
                priority={filteredCategories.indexOf(category) < 6}
              />
              <div className={styles.ewoOverlay}>
                <span className={styles.ewoViewButton}>
                  View Parts
                  <svg
                    className={styles.arrowIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <div className={styles.ewoContent}>
              <h3 className={styles.ewoCategoryTitle}>
                {titleCaseFirstLetterOfEveryWord(category?.parent)}
              </h3>
              {/* <div className={styles.ewoMeta}> */}
              {/* <span className={styles.ewoCount}>
                  {category.products.length}{' '}
                  {category.products.length === 1 ? 'part' : 'parts'}
                </span>
                <div className={styles.ewoDivider}></div> */}
              {/* <span className={styles.ewoShopLink}>Shop Now</span> */}
              {/* </div> */}
            </div>
            <div className={styles.ewoCardDecoration}></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
