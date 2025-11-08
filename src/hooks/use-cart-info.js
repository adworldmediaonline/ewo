'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const useCartInfo = () => {
  const [quantity, setQuantity] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalWithShipping, setTotalWithShipping] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [firstTimeDiscountAmount, setFirstTimeDiscountAmount] = useState(0);
  const { cart_products, totalShippingCost, firstTimeDiscount } = useSelector(
    state => state.cart
  );
  const { applied_coupons } = useSelector(state => state.coupon);

  useEffect(() => {
    const cart = cart_products.reduce(
      (cartTotal, cartItem) => {
        const { finalPriceDiscount, orderQuantity } = cartItem;
        const itemTotal = Number(finalPriceDiscount || 0) * orderQuantity;
        cartTotal.total += itemTotal;
        cartTotal.quantity += orderQuantity;

        return cartTotal;
      },
      {
        total: 0,
        quantity: 0,
      }
    );

    // Set subtotal (before any discounts)
    setSubtotal(cart.total);
    setQuantity(cart.quantity);

    // Calculate first-time discount amount
    // IMPORTANT: First-time discount is NOT applied when coupons are active
    let discountAmount = 0;
    const hasCouponsApplied = applied_coupons && applied_coupons.length > 0;
    
    if (firstTimeDiscount.isApplied && cart.total > 0 && !hasCouponsApplied) {
      discountAmount = (cart.total * firstTimeDiscount.percentage) / 100;
    }
    setFirstTimeDiscountAmount(discountAmount);

    // Calculate final total (subtotal - first-time discount)
    const finalTotal = cart.total - discountAmount;
    setTotal(finalTotal);
    setTotalWithShipping(finalTotal + totalShippingCost);
  }, [cart_products, totalShippingCost, firstTimeDiscount, applied_coupons]);

  return {
    quantity,
    total,
    totalWithShipping,
    subtotal,
    firstTimeDiscountAmount,
    firstTimeDiscount,
    setTotal,
  };
};

export default useCartInfo;
