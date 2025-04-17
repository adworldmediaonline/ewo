'use client';

import { CldImage } from 'next-cloudinary';
import styles from './BannerWithDiscount.module.css';
import { useRouter } from 'next/navigation';
export default function BannerWithDiscount() {
  const router = useRouter();
  return (
    <div className={styles.bannerContainer}>
      <div className={styles.bannerGrid}>
        {/* Image Column */}
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <CldImage
              src="banner-sm-3_ekkm0p"
              alt="Special Offer"
              width={800}
              height={400}
              sizes="(max-width: 768px) 100vw, 50vw"
              crop="fit"
              gravity="center"
              priority
              className={styles.bannerImage}
            />
          </div>
        </div>

        {/* Content Column */}
        <div className={styles.contentColumn}>
          <div className={styles.content}>
            <h3 className={styles.subTitle}>LIMITED TIME OFFER</h3>
            <h2 className={styles.title}>JOIN EWO ARMY NOW TO SAVE 10%</h2>
            {/* <p className={styles.description}>
              Exclusive deals for members only. Sign up today and get instant
              access to special discounts.
            </p> */}
            <button
              className={styles.button}
              onClick={() => router.push('/profile')}
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
