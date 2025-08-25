'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';

const CheckoutCoupon = ({ handleCouponCode, couponRef, couponApplyMsg }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { coupon_info } = useSelector(state => state.coupon);

  return (
    <div className="">
      <p className="">
        Have a coupon?
        <button onClick={() => setIsOpen(!isOpen)} type="button" className="">
          Click here to enter your code
        </button>
      </p>

      {isOpen && (
        <div className="">
          <form onSubmit={handleCouponCode}>
            <label className="">Coupon Code :</label>
            <div className="">
              <input
                ref={couponRef}
                type="text"
                placeholder="Coupon"
                className=""
              />
              <button type="submit" className="">
                Apply
              </button>
            </div>
          </form>
          {couponApplyMsg && <p className="">{couponApplyMsg}</p>}
        </div>
      )}
    </div>
  );
};

export default CheckoutCoupon;
