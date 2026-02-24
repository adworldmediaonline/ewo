'use client';

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCartSummary } from '@/hooks/use-cart-summary';
import { useCartActions } from '@/hooks/use-cart-actions';
import { useCouponAutoApply } from '@/hooks/use-coupon-auto-apply';
import { useRefetchOnVisibility } from '@/hooks/use-refetch-on-visibility';
import { saveUserRemoved } from '@/lib/coupon-user-removed';
import { getStoreCouponSettings } from '@/lib/store-api';
import {
  applyCoupon,
  get_cart_products,
  removeCoupon,
} from '@/redux/features/cartSlice';
import { CouponSection } from './coupon-section';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock } from 'lucide-react';
import {
  AutoApplySavingsBanner,
  CartItemCard,
  ShippingBenefitsBanner,
  getCartItemLineTotal,
  getCartItemProductHref,
} from '@/components/version-tsx/cart';

export default function CheckoutOrderArea({ checkoutData, variant = 'full' }) {
  const dispatch = useDispatch();
  const [cartDataLoaded, setCartDataLoaded] = useState(false);
  const [hideCouponSection, setHideCouponSection] = useState(false);

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
  const summary = useCartSummary();
  const { handleIncrement, handleDecrement, handleRemove } = useCartActions();
  const { retryAutoApply } = useCouponAutoApply();
  const couponRefetchKey = useRefetchOnVisibility();

  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);

  const taxAmountDollars = tax_preview?.taxCollected
    ? (tax_preview.tax ?? 0) / 100
    : 0;
  const totalWithTaxDollars = tax_preview?.taxCollected
    ? (tax_preview.total ?? 0) / 100
    : null;

  const displayFinalTotal =
    totalWithTaxDollars !== null ? totalWithTaxDollars : Number(cartTotal) || summary.displayTotal;

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
    getStoreCouponSettings()
      .then((settings) => {
        const autoApplyOn =
          settings.autoApply && settings.autoApplyStrategy !== 'customer_choice';
        setHideCouponSection(!!autoApplyOn);
      })
      .catch(() => setHideCouponSection(false));
  }, [couponRefetchKey]);

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
  const items = Array.isArray(cart_products) ? cart_products : [];
  const isDisabled = isCheckoutSubmit || processingPayment;

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 border border-border">
      {showItems && (
        <>
          <h3 className="text-xl font-semibold text-foreground mb-4 md:mb-6">
            Your Order
          </h3>

          <div className="space-y-3 mb-4">
            {items.map((item, idx) => (
              <CartItemCard
                key={`${item._id}-${item.selectedOption?.title ?? ''}-${idx}`}
                item={item}
                lineTotal={getCartItemLineTotal(item)}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onRemove={handleRemove}
                productHref={getCartItemProductHref}
                variant="compact"
                disabled={isDisabled}
              />
            ))}
          </div>
        </>
      )}

      {showSummary && (
        <div className={showItems ? 'border-t border-border pt-6 mt-6' : 'pt-0 mt-0'}>
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Order Summary
          </h3>

          <div className="space-y-3">
            {((summary.isAutoApplied && summary.discountAmount > 0 && summary.autoApplyPercent > 0) ||
              (summary.productLevelSavings > 0 && summary.productLevelPercent > 0)) && (
              <AutoApplySavingsBanner
                percent={
                  summary.appliedCouponPercentage ??
                  (summary.productLevelSavings > 0
                    ? summary.productLevelPercent
                    : summary.autoApplyPercent)
                }
                couponCode={summary.appliedCouponCode ?? summary.couponCode}
              />
            )}

            {(summary.qualifiesForFreeShipping ||
              summary.gapToFreeShipping != null ||
              (summary.shippingDiscountPercent != null && summary.shippingDiscountPercent > 0)) && (
              <ShippingBenefitsBanner
                qualifiesForFreeShipping={summary.qualifiesForFreeShipping}
                progressPercent={summary.progressPercent}
                gapToFreeShipping={summary.gapToFreeShipping ?? undefined}
                shippingDiscountPercent={summary.shippingDiscountPercent}
                itemCount={summary.quantity}
              />
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                ${(Number(summary.subtotal) || 0).toFixed(2)}
              </span>
            </div>

            {!hideCouponSection && (
            <CouponSection
              subtotal={summary.subtotal}
              items={items.map((i) => ({
                productId: i._id,
                quantity: i.orderQuantity,
                unitPrice: Number(i.finalPriceDiscount ?? 0),
                title: i.title,
              }))}
              onApplied={(amount, code) => dispatch(applyCoupon({ code, discountAmount: amount }))}
              appliedCode={couponCode}
              appliedAmount={discountAmount}
              onRemove={() => {
                saveUserRemoved(summary.quantity, summary.subtotal);
                dispatch(removeCoupon());
              }}
              onRetryAutoApply={retryAutoApply}
              refetchKey={couponRefetchKey}
            />
            )}

            {couponCode && discountAmount > 0 &&
              (isAutoApplied ? (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                  <span className="font-medium">
                    {summary.subtotal > 0
                      ? `${Math.round((discountAmount / summary.subtotal) * 100)}% OFF applied`
                      : 'Discount applied'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({couponCode})</span>
                  <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                </div>
              ))}

            {summary.effectiveShippingCost > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Shipping
                  {summary.shippingDiscountPercent != null && summary.shippingDiscountPercent > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 ml-1.5 font-medium">
                      ({summary.shippingDiscountPercent}% off)
                    </span>
                  )}
                </span>
                <span className="font-medium text-foreground">
                  ${summary.effectiveShippingCost.toFixed(2)}
                </span>
              </div>
            )}

            {summary.qualifiesForFreeShipping && (
              <div className="flex items-center justify-between text-sm text-green-600 dark:text-green-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
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
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Payment method
            </h3>
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <label
                htmlFor="card-payment"
                className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-muted/30"
              >
                <input
                  type="radio"
                  id="card-payment"
                  name="paymentMethod"
                  value="card"
                  defaultChecked
                  className="h-4 w-4 shrink-0 border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                />
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <CreditCard className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">
                    Credit or debit card
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Visa, Mastercard, American Express, Discover
                  </p>
                </div>
              </label>

              <div className="border-t border-border bg-muted/20 px-4 py-4 sm:px-5 sm:py-5">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Card number
                    </label>
                    <div className="rounded-lg border border-input bg-background px-3 py-2.5 shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                      <CardNumberElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: 'hsl(var(--foreground))',
                              '::placeholder': {
                                color: 'hsl(var(--muted-foreground))',
                              },
                            },
                          },
                        }}
                        onChange={(e) => {
                          if (e.complete && cardExpiryRef.current) {
                            cardExpiryRef.current.focus();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Expiry date
                      </label>
                      <div className="rounded-lg border border-input bg-background px-3 py-2.5 shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                        <CardExpiryElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: 'hsl(var(--foreground))',
                                '::placeholder': {
                                  color: 'hsl(var(--muted-foreground))',
                                },
                              },
                            },
                          }}
                          onReady={(el) => {
                            cardExpiryRef.current = el;
                          }}
                          onChange={(e) => {
                            if (e.complete && cardCvcRef.current) {
                              cardCvcRef.current.focus();
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        CVC
                      </label>
                      <div className="rounded-lg border border-input bg-background px-3 py-2.5 shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                        <CardCvcElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: 'hsl(var(--foreground))',
                                '::placeholder': {
                                  color: 'hsl(var(--muted-foreground))',
                                },
                              },
                            },
                          }}
                          onReady={(el) => {
                            cardCvcRef.current = el;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {cardError && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                    {cardError}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5 shrink-0" />
                  <span>Your payment details are encrypted and secured by Stripe</span>
                </div>
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
