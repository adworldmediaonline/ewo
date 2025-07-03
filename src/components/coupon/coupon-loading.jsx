import styles from '../../app/coupon/Coupon.module.css';

export default function CouponLoading() {
  return (
    <div className={styles.couponPage}>
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </div>
    </div>
  );
}
