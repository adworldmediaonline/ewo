import styles from '../../app/coupon/Coupon.module.css';

export default function CouponError() {
  return (
    <div className={styles.couponPage}>
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>
            Failed to load coupons. Please try again later.
          </p>
        </div>
      </div>
    </div>
  );
}
