import Link from 'next/link';
import styles from '../../app/coupon/Coupon.module.css';

export default function NoCouponFound() {
  return (
    <div className={styles.couponPage}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Active Coupons</h1>
          <p className={styles.pageSubtitle}>
            Save big with our exclusive discount codes
          </p>
        </div>
        <div className={styles.noCouponsContainer}>
          <h2 className={styles.noCouponsTitle}>No Active Coupons</h2>
          <p className={styles.noCouponsMessage}>
            We don't have any active coupons at the moment. Check back later for
            amazing deals!
          </p>
          <Link href="/shop" className={styles.browseProductsBtn}>
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
