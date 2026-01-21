'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAllActiveCouponsQuery } from '@/redux/features/coupon/couponApi';
// Define CartProduct and CartState types locally (from cartSlice.ts)
interface SelectedOption {
  title: string;
}

interface CartProduct {
  _id: string;
  title: string;
  img: string;
  price: number | string;
  finalPriceDiscount: number | string;
  orderQuantity: number;
  quantity?: number;
  discount?: number | string;
  slug?: string;
  shipping?: { price?: number };
  selectedOption?: SelectedOption;
}

interface FirstTimeDiscountState {
  isEligible: boolean;
  isApplied: boolean;
  percentage: number;
  showCelebration?: boolean;
}

interface LastAddedProduct {
  title: string;
  img: string;
  selectedOption?: SelectedOption;
  orderQuantity: number;
}

interface CartState {
  cart_products: CartProduct[];
  orderQuantity: number;
  cartMiniOpen: boolean;
  totalShippingCost: number;
  shippingDiscount: number;
  firstTimeDiscount: FirstTimeDiscountState;
  showCartConfirmation: boolean;
  lastAddedProduct: LastAddedProduct | null;
}

// RootState type for useSelector
import store from '@/redux/store';
type RootState = ReturnType<typeof store.getState>;
// internal
import useCartInfo from '@/hooks/use-cart-info';
import { clearCart } from '@/redux/features/cartSlice';

import CartCheckout from './cart-checkout';
import CartItem from './cart-item';

// Import shadcn Breadcrumb components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Import shadcn Alert Dialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function CartArea() {
  const { cart_products } = useSelector(
    (state: RootState) => state.cart as CartState
  );
  const dispatch = useDispatch();
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  // Fetch all active coupons from backend (same logic as product card)
  const {
    data: activeCouponsData,
    isLoading: couponsLoading,
    isError: couponsError,
  } = useGetAllActiveCouponsQuery({});

  // Check for active coupons for products in cart (same logic as product card)
  // Collect unique coupons that apply to products in the cart
  const activeCouponsForCart = useMemo(() => {
    if (!activeCouponsData?.success || !activeCouponsData?.data || cart_products.length === 0) {
      return [];
    }

    const coupons = activeCouponsData.data;
    const applicableCoupons: Array<{
      couponCode: string;
      couponPercentage: number;
      couponTitle: string | null;
      appliesToAll: boolean;
    }> = [];

    // Check each coupon to see if it applies to any product in cart
    for (const coupon of coupons) {
      if (coupon.status !== 'active') continue;

      // Check if coupon applies to products
      if (coupon.applicableType === 'product' || coupon.applicableType === 'all') {
        // If it's an "all" type coupon, it applies to all products
        if (coupon.applicableType === 'all') {
          applicableCoupons.push({
            couponCode: coupon.couponCode || '',
            couponPercentage: coupon.discountPercentage || 0,
            couponTitle: coupon.title || null,
            appliesToAll: true,
          });
          continue;
        }

        // For product-specific coupons, check if any cart product is in the applicable list
        if (
          coupon.applicableProducts &&
          Array.isArray(coupon.applicableProducts) &&
          coupon.applicableProducts.length > 0
        ) {
          const appliesToCart = cart_products.some((item: CartProduct) =>
            coupon.applicableProducts.some(
              (product: any) => product._id === item._id || product === item._id
            )
          );

          if (appliesToCart) {
            applicableCoupons.push({
              couponCode: coupon.couponCode || '',
              couponPercentage: coupon.discountPercentage || 0,
              couponTitle: coupon.title || null,
              appliesToAll: false,
            });
          }
        }
      }
    }

    // Remove duplicates (same coupon code)
    const uniqueCoupons = applicableCoupons.filter(
      (coupon, index, self) =>
        index === self.findIndex((c) => c.couponCode === coupon.couponCode)
    );

    return uniqueCoupons;
  }, [activeCouponsData, cart_products]);

  const handleClearCart = () => {
    dispatch(clearCart());
    setIsClearDialogOpen(false);
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shopping Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
        {cart_products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 h-[400px]">
            <div className="flex flex-col items-center justify-center w-full max-w-md">
              <div className="bg-gray-100 rounded-full p-6 mb-6 flex items-center justify-center">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">
                Your Cart is Empty
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link
                href="/shop"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Shopping Cart
                </h1>
                <p className="text-muted-foreground mt-1">
                  {cart_products.length}{' '}
                  {cart_products.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <AlertDialog
                open={isClearDialogOpen}
                onOpenChange={setIsClearDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-9 px-3"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Clear Cart
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will remove all items from your cart. This
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearCart}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Active Coupons Section - Shows "Applied Successfully" UI when coupons are active */}
            {/* Uses same coupon check logic as product card (useProductCoupon) */}
            {activeCouponsForCart.length > 0 && (
              <div className="mb-6">
                <div className="space-y-3">
                  {activeCouponsForCart.map((coupon, index: number) => {
                    return (
                      <div
                        key={`${coupon.couponCode}-${index}`}
                        className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-4 shadow-md"
                      >
                        {/* Decorative corner */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />

                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white uppercase tracking-wide">
                                {coupon.couponCode}
                              </p>
                              <p className="text-xs text-white/90 font-medium">
                                Applied Successfully
                              </p>
                            </div>
                          </div>
                          {coupon.couponPercentage > 0 && (
                            <div className="bg-white rounded-full px-3 py-1.5">
                              <span className="text-sm font-extrabold text-emerald-600">
                                {coupon.couponPercentage}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {cart_products.map((item: CartProduct, i: number) => (
                    <CartItem key={i} product={item} />
                  ))}
                </div>
              </div>

              {/* Cart Checkout */}
              <div className="lg:col-span-1">
                <CartCheckout />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
