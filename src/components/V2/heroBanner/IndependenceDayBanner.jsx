'use client';

import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import { useState } from 'react';
import styles from './IndependenceDayBanner.module.css';

export default function IndependenceDayBanner() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={styles.bannerWrapper}>
      <div
        className={styles.bannerContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href="/coupon" className={styles.bannerLink}>
          <div className={styles.imageWrapper}>
            <CldImage
              src="INDEPENDENCE_DAY_SALE_UP_TO_70_25_OFF_SHOP_NOW_20250702_131612_0000_1_wfztyr"
              width={1680}
              height={400}
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 90vw, (max-width: 1440px) 85vw, 1680px"
              className={`${styles.bannerImage} ${
                isHovered ? styles.hovered : ''
              }`}
              alt="Independence Day Sale - Up to 20% Off - Shop Now!"
              crop="scale"
              quality={95}
              priority
              loading="eager"
            />

            {/* Overlay with call-to-action */}
            <div className={styles.bannerOverlay}>
              <div className={styles.overlayContent}>
                <div className={styles.ctaButton}>
                  <span>SHOP NOW</span>
                  <svg
                    className={styles.arrowIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
