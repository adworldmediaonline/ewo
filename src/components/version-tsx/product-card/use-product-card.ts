'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useProductCoupon } from '@/hooks/useProductCoupon';
import { useRefetchOnVisibility } from '@/hooks/use-refetch-on-visibility';
import {
  getProductImageSrc,
  getProductImageAlt,
  getProductImageTitle,
  isProductImageProxyUrl,
} from '@/lib/product-image';
import type { ProductBase } from '@/types/product';

interface SelectedOption {
  title: string;
  price: number;
}

export interface UseProductCardOptions {
  product: ProductBase & {
    options?: Array<{ title: string; price: number }>;
    productConfigurations?: Array<{
      title: string;
      options: Array<{ name: string; price: number; isSelected: boolean }>;
    }>;
  };
  selectedOption?: SelectedOption | null;
  index?: number;
}

export interface UseProductCardResult {
  isAddedToCart: boolean;
  cartQuantity: number;
  isAddedToWishlist: boolean;
  hasCoupon: boolean;
  couponPercentage: number;
  couponCode: string | null;
  hasConfigurations: boolean;
  imageSrc: string;
  imageAlt: string;
  imageTitle: string | null;
  useProxyForFilename: boolean;
  isCloudinaryAsset: boolean;
  shouldEagerLoad: boolean;
  shouldUseHighPriority: boolean;
  averageRating: number;
  calculateFinalPrice: (option?: SelectedOption | null) => string;
  calculateMarkedPrice: (option?: SelectedOption | null) => string;
}

export function useProductCard({
  product,
  selectedOption = null,
  index = 0,
}: UseProductCardOptions): UseProductCardResult {
  const { cart_products } = useSelector((state: { cart: { cart_products: unknown[] } }) => state.cart);
  const { wishlist } = useSelector((state: { wishlist: { wishlist: unknown[] } }) => state.wishlist);

  const baseUnitPrice = Number(product.finalPriceDiscount || product.price || 0);
  const couponRefetchKey = useRefetchOnVisibility();
  const { hasCoupon, couponPercentage, couponCode } = useProductCoupon(
    product._id,
    baseUnitPrice,
    couponRefetchKey
  );

  const cartItem = (cart_products as { _id: string; orderQuantity?: number; selectedOption?: { title: string } }[]).find(
    (prd) => {
      if (prd.selectedOption && selectedOption) {
        return prd._id === product._id && prd.selectedOption?.title === selectedOption.title;
      }
      if (!prd.selectedOption && !selectedOption) {
        return prd._id === product._id;
      }
      return false;
    }
  );
  const isAddedToCart = !!cartItem;
  const cartQuantity = cartItem?.orderQuantity ?? 0;
  const isAddedToWishlist = (wishlist as { _id: string }[]).some(
    (prd) => prd._id === product._id
  );

  const hasConfigurations = useMemo(() => {
    const configs = product.productConfigurations;
    if (!configs || !Array.isArray(configs) || configs.length === 0) return false;
    return configs.some(
      (c) => c?.options && Array.isArray(c.options) && c.options.length > 0
    );
  }, [product.productConfigurations]);

  const imageSrc = getProductImageSrc(product);
  const imageAlt = getProductImageAlt(product);
  const imageTitle = getProductImageTitle(product);
  const useProxyForFilename = isProductImageProxyUrl(imageSrc);
  const isCloudinaryAsset =
    typeof imageSrc === 'string' &&
    imageSrc.startsWith('https://res.cloudinary.com/') &&
    imageSrc.includes('/upload/');

  const shouldEagerLoad = index < 8;
  const shouldUseHighPriority = index < 4;

  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const calculateFinalPrice = (opt?: SelectedOption | null) => {
    const basePrice = product.finalPriceDiscount || product.price;
    let discountedBasePrice = Number(basePrice);
    if (hasCoupon && couponPercentage) {
      discountedBasePrice = basePrice * (1 - couponPercentage / 100);
    }
    const optionPrice = (opt ?? selectedOption) ? Number((opt ?? selectedOption)!.price) : 0;
    const finalPrice = discountedBasePrice + optionPrice;
    return finalPrice.toFixed(2);
  };

  const calculateMarkedPrice = (opt?: SelectedOption | null) => {
    const basePrice = product.finalPriceDiscount || product.price;
    const optionPrice = (opt ?? selectedOption) ? Number((opt ?? selectedOption)!.price) : 0;
    return (Number(basePrice) + optionPrice).toFixed(2);
  };

  return {
    isAddedToCart,
    cartQuantity,
    isAddedToWishlist,
    hasCoupon,
    couponPercentage,
    couponCode,
    hasConfigurations,
    imageSrc,
    imageAlt,
    imageTitle,
    useProxyForFilename,
    isCloudinaryAsset,
    shouldEagerLoad,
    shouldUseHighPriority,
    averageRating,
    calculateFinalPrice,
    calculateMarkedPrice,
  };
}
