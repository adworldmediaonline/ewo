'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const useCartInfo = () => {
  const [quantity, setQuantity] = useState(0);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const { cart_products, discountAmount } = useSelector(state => state.cart);

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

    setSubtotal(cart.total);
    setQuantity(cart.quantity);
    setTotal(Math.max(0, cart.total - (discountAmount ?? 0)));
  }, [cart_products, discountAmount]);

  return {
    quantity,
    total,
    subtotal,
    setTotal,
  };
};

export default useCartInfo;
