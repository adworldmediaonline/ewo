import styles from './CouponBadge.module.css';

export default function CouponBadge({ coupons = [], className = '' }) {
  if (!coupons || coupons.length === 0) {
    return null;
  }

  // Get the most relevant coupon (highest priority or first one)
  const primaryCoupon = coupons.reduce((best, current) => {
    if (!best) return current;
    if (current.priority > best.priority) return current;
    if (current.priority === best.priority) {
      // If same priority, prefer percentage over fixed amount
      if (
        current.discountType === 'percentage' &&
        best.discountType !== 'percentage'
      ) {
        return current;
      }
    }
    return best;
  }, null);

  if (!primaryCoupon) return null;

  const getDiscountText = coupon => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountPercentage}% OFF`;
    } else if (coupon.discountType === 'fixed_amount') {
      return `$${coupon.discountAmount} OFF`;
    } else if (coupon.discountType === 'free_shipping') {
      return 'FREE SHIPPING';
    } else if (coupon.discountType === 'buy_x_get_y') {
      return `BUY ${coupon.buyQuantity} GET ${coupon.getQuantity}`;
    }
    return 'COUPON';
  };

  return (
    <div className={`${styles.couponBadge} ${className}`}>
      <span className={styles.couponBadgeText}>
        {getDiscountText(primaryCoupon)}
      </span>
    </div>
  );
}
