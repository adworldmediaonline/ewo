'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { add_cart_product } from '@/redux/features/cartSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { notifyError, notifySuccess } from '@/utils/toast';

import type { ShopProduct } from '../shop-types';

interface SelectedOption {
  title: string;
  price: number;
}

export const useShopActions = () => {
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state: any) => state.cart);

  const handleAddToCart = useCallback(
    (product: ShopProduct, selectedOption?: SelectedOption) => {
      if (product.options && product.options.length > 0 && !selectedOption) {
        notifyError(
          'Please select an option before adding the product to your cart.'
        );
        return;
      }

      const existingProduct = cart_products.find(
        (item: any) => item._id === product._id
      );

      const optionChanged =
        existingProduct &&
        JSON.stringify(existingProduct.selectedOption) !==
        JSON.stringify(selectedOption);

      const currentQty = existingProduct ? existingProduct.orderQuantity : 0;
      const finalQuantity = optionChanged ? currentQty : currentQty + 1;

      if (product.quantity && finalQuantity > product.quantity) {
        notifyError(
          `Sorry, only ${product.quantity} items available. ${existingProduct
            ? `You already have ${currentQty} in your cart.`
            : ''}`
        );
        return;
      }

      // Calculate base price and total price with option
      const basePrice = Number(product.finalPriceDiscount || 0);
      const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
      const totalPrice = basePrice + optionPrice;

      const cartProduct = {
        _id: product._id,
        title: product.title,
        img: product.imageURLs?.[0] || product.img || '',
        finalPriceDiscount: totalPrice, // Include option price (this is the price field we use)
        orderQuantity: 1,
        quantity: product.quantity,
        slug: product.slug,
        shipping: product.shipping || { price: 0 },
        sku: product.sku,
        selectedOption: selectedOption, // Store selected option details
        basePrice: basePrice, // Store original base price for reference
      };

      dispatch(add_cart_product(cartProduct));

      if (optionChanged) {
        notifySuccess(`Option updated to "${selectedOption?.title}"`);
        return;
      }

      notifySuccess(`${product.title} added to cart`);
    },
    [cart_products, dispatch]
  );

  const handleAddToWishlist = useCallback(
    (product: ShopProduct) => {
      const wishlistProduct = {
        _id: product._id,
        title: product.title,
        img: product.imageURLs?.[0] || product.img || '',
        price: product.price,
        category: product.category,
        slug: product.slug,
        sku: product.sku,
        finalPriceDiscount: product.finalPriceDiscount,
        updatedPrice: product.updatedPrice,
      };

      dispatch(add_to_wishlist(wishlistProduct));
      notifySuccess(`${product.title} added to wishlist`);
    },
    [dispatch]
  );

  return {
    handleAddToCart,
    handleAddToWishlist,
  } as const;
};

