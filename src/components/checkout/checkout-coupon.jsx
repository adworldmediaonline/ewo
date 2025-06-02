'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './checkout-coupon.module.css';

const CheckoutCoupon = ({ handleCouponCode, couponRef, couponApplyMsg }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { coupon_info } = useSelector(state => state.coupon);

  return (
    <div className={styles.couponSection}>
      <p className={styles.couponTrigger}>
        Have a coupon?
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className={styles.couponButton}
        >
          Click here to enter your code
        </button>
      </p>

      {isOpen && (
        <div className={styles.couponForm}>
          <form onSubmit={handleCouponCode}>
            <label className={styles.couponLabel}>Coupon Code :</label>
            <div className={styles.couponInputGroup}>
              <input
                ref={couponRef}
                type="text"
                placeholder="Coupon"
                className={styles.couponInput}
              />
              <button type="submit" className={styles.couponSubmitBtn}>
                Apply
              </button>
            </div>
          </form>
          {couponApplyMsg && (
            <p className={styles.couponMessage}>{couponApplyMsg}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckoutCoupon;
