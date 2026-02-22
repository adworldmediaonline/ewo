'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useCartInfo from '@/hooks/use-cart-info';
import { useCouponAutoApply } from '@/hooks/use-coupon-auto-apply';
import { saveUserRemoved } from '@/lib/coupon-user-removed';
import { getStoreShippingSettings } from '@/lib/store-api';
import {
  add_cart_product,
  applyCoupon,
  get_cart_products,
  quantityDecrement,
  removeCoupon,
} from '@/redux/features/cartSlice';
import { Minus, Plus } from '@/svg';
import { CouponSection } from './coupon-section';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import { CldImage } from 'next-cloudinary';

const isCloudinaryUrl = url =>
  typeof url === 'string' &&
  url.startsWith('https://res.cloudinary.com/') &&
  url.includes('/upload/');

export default function CheckoutOrderArea({ checkoutData, variant = 'full' }) {
  const dispatch = useDispatch();

  const [cartDataLoaded, setCartDataLoaded] = useState(false);

  const {
    cartTotal = 0,
    isCheckoutSubmit,
    processingPayment,
    stripe,
    cardError,
    tax_preview,
    isTaxLoading,
  } = checkoutData;

  const { cart_products, couponCode, discountAmount, isAutoApplied } = useSelector(state => state.cart);
  const { total, subtotal, quantity } = useCartInfo();
  const { retryAutoApply } = useCouponAutoApply();
  const { isCheckoutSubmitting } = useSelector(state => state.order);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(null);

  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const qualifiesForFreeShipping =
    freeShippingThreshold != null &&
    freeShippingThreshold > 0 &&
    subtotalAfterDiscount >= freeShippingThreshold;
  const gapToFreeShipping =
    freeShippingThreshold != null &&
    freeShippingThreshold > 0 &&
    subtotalAfterDiscount < freeShippingThreshold
      ? Math.ceil(freeShippingThreshold - subtotalAfterDiscount)
      : null;

  useEffect(() => {
    dispatch(get_cart_products());

    const quickCheck = setTimeout(() => {
      setCartDataLoaded(true);
    }, 100);

    return () => clearTimeout(quickCheck);
  }, [dispatch]);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!cartDataLoaded) {
        setCartDataLoaded(true);
      }
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [cartDataLoaded]);

  useEffect(() => {
    getStoreShippingSettings()
      .then((s) => setFreeShippingThreshold(s.freeShippingThreshold))
      .catch(() => setFreeShippingThreshold(null));
  }, []);

  const taxAmountDollars = tax_preview?.taxCollected
    ? (tax_preview.tax ?? 0) / 100
    : 0;
  const totalWithTaxDollars = tax_preview?.taxCollected
    ? (tax_preview.total ?? 0) / 100
    : null;

  const displaySubtotal = subtotal;
  const displayFinalTotal =
    totalWithTaxDollars !== null ? totalWithTaxDollars : Number(cartTotal) || total;

  const handleAddProduct = product => {
    dispatch(add_cart_product(product));
  };

  const handleDecrement = product => {
    dispatch(quantityDecrement(product));
  };

  if (!cartDataLoaded) {
    const loadingTitle = variant === 'summary' ? 'Order Summary' : 'Your Order';
    return (
      <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4 md:mb-6">
          {loadingTitle}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">
            Loading order details...
          </span>
        </div>
      </div>
    );
  }

  const showItems = variant === 'items' || variant === 'full';
  const showSummary = variant === 'summary' || variant === 'full';

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 border border-border">
      {showItems && (
        <>
          <h3 className="text-xl font-semibold text-foreground mb-4 md:mb-6">
            Your Order
          </h3>

          <div className="space-y-3 sm:space-y-2 mb-4 sm:mb-4">
            {cart_products.map(item => {
              const imageUrl = item.img || '';
              const isCloudImage = isCloudinaryUrl(imageUrl);

              return (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-2 border-b border-border last:border-0 gap-3 sm:gap-2"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 sm:max-w-[60%]">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden shrink-0 bg-muted">
                      {imageUrl ? (
                        <CldImage
                          src={imageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 48px, 64px"
                          className="object-cover"
                          preserveTransformations={isCloudImage}
                          deliveryType={isCloudImage ? undefined : 'fetch'}
                          loading="lazy"
                          fetchPriority="low"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] sm:text-xs text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm sm:text-xs leading-tight">
                        {item.title}
                      </h4>
                      {item.selectedOption && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.selectedOption.title} (+$
                          {Number(item.selectedOption.price).toFixed(2)})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3 shrink-0 w-full sm:w-auto">
                    <div className="flex items-center border border-border rounded">
                      <button
                        type="button"
                        onClick={() => handleDecrement(item)}
                        className="w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={
                          isCheckoutSubmit ||
                          processingPayment ||
                          item.orderQuantity <= 1
                        }
                      >
                        <Minus width={10} height={10} />
                      </button>
                      <span className="w-8 h-6 sm:w-6 sm:h-5 flex items-center justify-center text-sm sm:text-xs font-medium">
                        {item.orderQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddProduct(item)}
                        className="w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        disabled={isCheckoutSubmit || processingPayment}
                      >
                        <Plus width={10} height={10} />
                      </button>
                    </div>

                    <div className="text-foreground font-medium text-base sm:text-sm min-w-[4rem] sm:min-w-[5rem] sm:w-[5rem] text-right whitespace-nowrap">
                      ${(item.price * item.orderQuantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showSummary && (
        <div className={showItems ? 'border-t border-border pt-6 mt-6' : 'pt-0 mt-0'}>
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Order Summary
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                ${(Number(displaySubtotal) || 0).toFixed(2)}
              </span>
            </div>

            <CouponSection
              subtotal={subtotal}
              items={cart_products.map((i) => ({
                productId: i._id,
                quantity: i.orderQuantity,
                unitPrice: Number(i.finalPriceDiscount || i.price || 0),
                title: i.title,
              }))}
              onApplied={(amount, code) => dispatch(applyCoupon({ code, discountAmount: amount }))}
              appliedCode={couponCode}
              appliedAmount={discountAmount}
              onRemove={() => {
                saveUserRemoved(quantity, subtotal);
                dispatch(removeCoupon());
              }}
              onRetryAutoApply={retryAutoApply}
            />

            {couponCode && discountAmount > 0 &&
              (isAutoApplied ? (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                  <span className="font-medium">
                    {subtotal > 0
                      ? `${Math.round((discountAmount / subtotal) * 100)}% OFF applied`
                      : 'Discount applied'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({couponCode})</span>
                  <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                </div>
              ))}

            {qualifiesForFreeShipping && (
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            )}

            {gapToFreeShipping != null && gapToFreeShipping > 0 && (
              <p className="text-muted-foreground text-xs">
                Add ${gapToFreeShipping} more for free shipping
              </p>
            )}

            {isTaxLoading ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tax (estimated)</span>
                <span className="text-sm text-muted-foreground">
                  Calculating...
                </span>
              </div>
            ) : tax_preview ? (
              tax_preview.taxCollected ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax (estimated)</span>
                  <span className="font-medium text-foreground">
                    ${Number(taxAmountDollars).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-sm text-muted-foreground">
                    No tax for your location
                  </span>
                </div>
              )
            ) : null}
          </div>

          <div className="border-t border-border pt-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">
                ${Number(displayFinalTotal).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-md bg-background">
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="radio"
                    id="card-payment"
                    name="paymentMethod"
                    value="card"
                    defaultChecked
                    className="text-primary focus:ring-ring"
                  />
                  <label
                    htmlFor="card-payment"
                    className="font-medium text-foreground"
                  >
                    Credit / Debit Card
                  </label>
                </div>

                <div className="bg-background border border-border rounded-md p-3 space-y-3">
                  <div className="min-w-0 w-full">
                    <CardNumberElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#374151',
                            '::placeholder': {
                              color: '#9CA3AF',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <CardExpiryElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#374151',
                              '::placeholder': {
                                color: '#9CA3AF',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <CardCvcElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#374151',
                              '::placeholder': {
                                color: '#9CA3AF',
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                {cardError && (
                  <div className="mt-2 text-sm text-destructive">{cardError}</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={!stripe || isCheckoutSubmit || processingPayment}
              className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
            >
              {processingPayment ? (
                <span className="flex items-center justify-center">
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing Your Order...
                </span>
              ) : (
                `Complete Purchase - $${Number(displayFinalTotal).toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
