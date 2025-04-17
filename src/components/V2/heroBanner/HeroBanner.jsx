'use client';

import { CldImage } from 'next-cloudinary';
import styles from './HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <div className={styles.bannerContainer}>
      <CldImage
        src="banner1_zyqptl"
        alt="Banner"
        width={1680}
        height={650}
        sizes="100vw"
        preserveTransformations={true}
        crop="scale"
        gravity="center"
        priority
        className={styles.bannerImage}
      />
    </div>
  );
}
