'use client';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  add_cart_product,
  quantityDecrement,
  remove_product,
} from '@/redux/features/cartSlice';
import type { CartItemType } from '@/components/version-tsx/cart/cart-types';

/**
 * Reusable cart actions for increment, decrement, remove.
 * Use across cart drawer, cart page, and checkout.
 */
export function useCartActions() {
  const dispatch = useDispatch();

  const handleIncrement = useCallback(
    (item: CartItemType) => {
      dispatch(
        add_cart_product({
          ...item,
          finalPriceDiscount: item.finalPriceDiscount ?? item.price,
          sku: item.sku ?? item._id,
        } as Parameters<typeof add_cart_product>[0])
      );
    },
    [dispatch]
  );

  const handleDecrement = useCallback(
    (item: CartItemType) => {
      dispatch(
        quantityDecrement({
          ...item,
          finalPriceDiscount: item.finalPriceDiscount ?? item.price,
          sku: item.sku ?? item._id,
        } as Parameters<typeof quantityDecrement>[0])
      );
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (item: CartItemType) => {
      dispatch(
        remove_product({
          title: item.title,
          id: item._id,
          selectedOption: item.selectedOption,
          selectedConfigurations: item.selectedConfigurations,
          customNotes: item.customNotes,
        })
      );
    },
    [dispatch]
  );

  return { handleIncrement, handleDecrement, handleRemove };
}
