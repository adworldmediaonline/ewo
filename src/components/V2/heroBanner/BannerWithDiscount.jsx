'use client';

import { CldImage } from 'next-cloudinary';
import styles from './BannerWithDiscount.module.css';

export default function BannerWithDiscount() {
  return (
    <div className={styles.bannerContainer}>
      <CldImage
        src="disocunt-banenr-3_ucp6lf"
        width={1680}
        height={401}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1680px"
        className={styles.bannerImage}
        alt="EWO Special Offer"
        crop="scale"
        quality={90}
        loading="lazy"
      />
    </div>
  );
}
