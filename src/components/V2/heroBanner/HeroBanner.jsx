'use client';

import { CldImage } from 'next-cloudinary';
import styles from './HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <div className={styles.bannerContainer}>
      <CldImage
        src="Untitled_1656_x_700_px_2_kzqaka"
        alt="Banner"
        width={1680}
        height={700}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1680px"
        crop="scale"
        gravity="center"
        priority
        quality={90}
        className={styles.bannerImage}
      />
    </div>
  );
}
