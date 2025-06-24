'use client';

import React, { useRef, useEffect } from 'react';
import ProductItem from '../products/fashion/product-item';
import styles from '../../app/shop/shop.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { add_cart_product } from '@/redux/features/cartSlice';
import { useRouter } from 'next/navigation';
import useGuestCartNavigation from '@/hooks/useGuestCartNavigation';
import useCartTracking from '@/hooks/useCartTracking';

// Function to convert text to title case (first letter of each word capitalized)
// const toTitleCase = str => {
//   if (!str) return '';
//   return str
//     .toLowerCase()
//     .split(' ')
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(' ');
// };

export default function ProductItemWrapper({ product }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { navigateToCart } = useGuestCartNavigation();
  const { cart_products } = useSelector(state => state.cart);
  const isAddedToCart = cart_products.some(prd => prd._id === product._id);
  const cardRef = useRef(null);
  const { trackAddToCart, resetPageLoadTime } = useCartTracking();

  // Reset page load time when component mounts (when viewing a product)
  useEffect(() => {
    resetPageLoadTime();
  }, [product._id, resetPageLoadTime]);

  // Calculate pricing with markup and discount (same as ProductItem)
  const increasePriceWithInPercent = 20;
  const discountOnPrice = 15;
  const markedUpPrice = product.price * (1 + increasePriceWithInPercent / 100); // 20% markup
  const finalSellingPrice = markedUpPrice * (1 - discountOnPrice / 100); // 15% discount on marked up price

  // Create product with updated price for cart
  const productWithCalculatedPrice = {
    ...product,
    price: finalSellingPrice,
    originalPrice: product.price,
    markedUpPrice: markedUpPrice,
  };

  // Create a shallow copy of the product to modify the title safely
  const formattedProduct = {
    ...product,
    // title: toTitleCase(product.title),
    title: product.title,
  };

  const handleAddToCart = async () => {
    console.log('🛒 [FRONTEND] handleAddToCart clicked for product:', product._id);
    
    if (product.status !== 'out-of-stock') {
      // First, track the add to cart event
      try {
        console.log('🎯 [FRONTEND] Calling trackAddToCart...');
        console.log('📦 [FRONTEND] Product data:', {
          id: product._id,
          title: product.title,
          price: product.price
        });
        console.log('⚙️ [FRONTEND] Tracking options:', {
          quantity: 1,
          source: 'shop-page',
          originalPrice: product.price,
          markedUpPrice: markedUpPrice,
          finalPrice: finalSellingPrice,
          discountPercentage: discountOnPrice,
        });
        
        const trackingResult = await trackAddToCart(product, {
          quantity: 1,
          source: 'shop-page',
          originalPrice: product.price,
          markedUpPrice: markedUpPrice,
          finalPrice: finalSellingPrice,
          discountPercentage: discountOnPrice,
        });
        
        console.log('✅ [FRONTEND] trackAddToCart result:', trackingResult);
        
        // Also trigger client-side Meta pixel AddToCart event
        if (typeof window !== 'undefined' && window.fbq) {
          console.log('🎯 [FRONTEND] Triggering client-side Meta AddToCart...');
          
          // Add test event code for Meta testing
          const eventData = {
            content_ids: [product._id],
            content_type: 'product',
            value: finalSellingPrice,
            currency: 'USD'
          };
          
          // Add test event code if in development
          if (process.env.NODE_ENV !== 'production') {
            eventData.test_event_code = 'TEST75064';
            console.log('🧪 [FRONTEND] Added test event code: TEST75064');
          }
          
          window.fbq('track', 'AddToCart', eventData);
          console.log('✅ [FRONTEND] Client-side Meta AddToCart sent');
        }
      } catch (error) {
        console.error('❌ [FRONTEND] Cart tracking failed:', error);
        // Continue with adding to cart even if tracking fails
      }

      // Then add to cart as usual
      console.log('🛍️ [FRONTEND] Adding to Redux cart...');
      dispatch(add_cart_product(productWithCalculatedPrice));
      console.log('✅ [FRONTEND] Added to Redux cart successfully');
    } else {
      console.log('❌ [FRONTEND] Product is out of stock');
    }
  };

  const handleViewCart = () => {
    navigateToCart();
  };

  return (
    <div className={styles.productCard}>
      <div className={styles.productCardInner}>
        <ProductItem product={formattedProduct} />

        <div className={styles.productCardActions}>
          <button
            type="button"
            className={`${styles.addToCartBtn} ${
              isAddedToCart ? styles.active : ''
            }`}
            disabled={product.status === 'out-of-stock'}
            onClick={isAddedToCart ? handleViewCart : handleAddToCart}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.3789 8.875H4.97266L5.37891 10.375H13.625C13.9092 10.375 14.1544 10.5503 14.2261 10.8232L14.2266 10.8252C14.3172 11.1667 14.1086 11.5 13.7502 11.5H5.125C4.84082 11.5 4.5957 11.3247 4.52393 11.0518L2.65723 4.25H1C0.654297 4.25 0.375 3.97071 0.375 3.625V3.125C0.375 2.77931 0.654297 2.5 1 2.5H3.375C3.6592 2.5 3.9043 2.67534 3.97607 2.94824L4.28125 4.25H15C15.3584 4.25 15.6664 4.58325 15.5766 4.9248L14.6641 8.2998C14.5918 8.5727 14.3467 8.875 14.0625 8.875H14.3789ZM4.5 14.5C4.5 15.3285 3.8252 16 3 16C2.1748 16 1.5 15.3285 1.5 14.5C1.5 13.6716 2.1748 13 3 13C3.8252 13 4.5 13.6716 4.5 14.5ZM13.5 14.5C13.5 15.3285 12.8252 16 12 16C11.1748 16 10.5 15.3285 10.5 14.5C10.5 13.6716 11.1748 13 12 13C12.8252 13 13.5 13.6716 13.5 14.5Z"
                fill="currentColor"
              />
            </svg>
            <span className={styles.cartBtnText}>
              {isAddedToCart ? 'View Cart' : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
