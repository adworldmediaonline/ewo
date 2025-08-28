'use client';

import useCartTracking from '@/hooks/useCartTracking';
import useGuestCartNavigation from '@/hooks/useGuestCartNavigation';
import { add_cart_product } from '@/redux/features/cartSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductItem from './product-item';

// Types
interface Product {
  _id: string;
  title: string;
  slug: string;
  sku?: string;
  productType?: string;
  img?: string;
  imageURLs?: string[];
  price: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  category?: {
    name: string;
    id: string;
  };
  status: string;
  quantity: number;
  shipping?: {
    price: number;
    description?: string;
  };
  reviews?: Array<{
    rating: number;
  }>;
}

interface Coupon {
  _id: string;
  couponCode: string;
  discountType: 'percentage' | 'amount';
  discountPercentage?: number;
  discountAmount?: number;
  endTime: string;
  applicableProducts: Product[];
}

interface ProductItemWrapperProps {
  product: Product;
  coupons: Coupon[];
}

export default function ProductItemWrapper({
  product,
  coupons = [],
}: ProductItemWrapperProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { navigateToCart } = useGuestCartNavigation();
  const { cart_products } = useSelector((state: any) => state.cart);
  const isAddedToCart = cart_products.some(
    (prd: any) => prd._id === product._id
  );
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
    if (product.status !== 'out-of-stock') {
      // First, track the add to cart event
      try {
        const trackingResult = await trackAddToCart(product, 1, 'coupon-page');

        // Also trigger client-side Meta pixel AddToCart event
        if (typeof window !== 'undefined' && window.fbq) {
          // Add test event code for Meta testing
          const eventData: any = {
            content_ids: [product._id],
            content_type: 'product',
            value: finalSellingPrice,
            currency: 'USD',
          };

          // Add test event code if in development
          if (process.env.NODE_ENV !== 'production') {
            eventData.test_event_code = 'TEST75064';
          }

          window.fbq('track', 'AddToCart', eventData);
        }
      } catch (error) {
        // Continue with adding to cart even if tracking fails
      }

      // Then add to cart as usual
      const cartProduct = {
        ...productWithCalculatedPrice,
        orderQuantity: 1,
        img: productWithCalculatedPrice.img || '',
        finalPriceDiscount:
          productWithCalculatedPrice.finalPriceDiscount || finalSellingPrice,
      };

      dispatch(add_cart_product(cartProduct));
    } else {
    }
  };

  const handleViewCart = () => {
    navigateToCart();
  };

  return (
    <div className="">
      <div className="">
        <ProductItem product={formattedProduct} coupons={coupons} />

        <div className="">
          <button
            type="button"
            className={` ${
              isAddedToCart
                ? 'bg-primary text-primary-foreground'
                : 'bg-white hover:bg-gray-50'
            } border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors`}
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
            <span className="">
              {isAddedToCart ? 'View Cart' : 'Add to Cart'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
