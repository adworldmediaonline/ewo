'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const useCartInfo = () => {
  const [quantity, setQuantity] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalWithShipping, setTotalWithShipping] = useState(0);
  const { cart_products, totalShippingCost } = useSelector(state => state.cart);

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
    setQuantity(cart.quantity);
    setTotal(cart.total);
    setTotalWithShipping(cart.total + totalShippingCost);
  }, [cart_products, totalShippingCost]);

  return {
    quantity,
    total,
    totalWithShipping,
    setTotal,
  };
};

export default useCartInfo;
