'use client';

import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import styles from './BannerWithDiscount.module.css';

export default function BannerWithDiscount() {
  return (
    <div className={styles.bannerContainer}>
      <Link href="/profile">
        <CldImage
          src="EWO_Website_Block_Image_01_omtnwa"
          width={1680}
          height={401}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1680px"
          className={styles.bannerImage}
          alt="EWO Special Offer"
          crop="scale"
          quality={90}
          loading="lazy"
        />
      </Link>
    </div>
  );
}
