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

  useEffect(() => {
    const cart = cart_products.reduce(
      (cartTotal, cartItem) => {
        const { price, orderQuantity } = cartItem;
        const itemTotal = price * orderQuantity;
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
    let discountAmount = 0;
    if (firstTimeDiscount.isApplied && cart.total > 0) {
      discountAmount = (cart.total * firstTimeDiscount.percentage) / 100;
    }
    setFirstTimeDiscountAmount(discountAmount);

    // Calculate final total (subtotal - first-time discount)
    const finalTotal = cart.total - discountAmount;
    setTotal(finalTotal);
    setTotalWithShipping(finalTotal + totalShippingCost);
  }, [cart_products, totalShippingCost, firstTimeDiscount]);

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
