'use client';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
//internal import
import { clearCart, completeFirstTimeDiscount, hideCartConfirmation } from '@/redux/features/cartSlice';
import { useValidateCouponMutation } from '@/redux/features/coupon/couponApi';
import {
  add_applied_coupon,
  clear_all_coupons,
  clear_coupon,
  load_applied_coupons,
  remove_applied_coupon,
  set_applied_coupons,
  set_coupon_error,
  set_coupon_loading,
} from '@/redux/features/coupon/couponSlice';
import {
  useCreatePaymentIntentMutation,
  useSaveOrderMutation,
} from '@/redux/features/order/orderApi';
import {
  begin_checkout_submission,
  end_checkout_submission,
  set_client_secret,
  set_shipping,
} from '@/redux/features/order/orderSlice';
import { notifyError, notifySuccess } from '@/utils/toast';
import { authClient } from '../lib/authClient';
import useCartInfo from './use-cart-info';

const useCheckoutSubmit = () => {
  const { data: session, isPending } = authClient.useSession();

  // Enhanced coupon validation
  const [validateCoupon, { isLoading: couponValidationLoading }] =
    useValidateCouponMutation();

  // addOrder
  const [saveOrder, { }] = useSaveOrderMutation();
  // createPaymentIntent
  const [createPaymentIntent, { }] = useCreatePaymentIntentMutation();
  // cart_products
  const { cart_products, firstTimeDiscount } = useSelector(state => state.cart);

  // shipping_info
  const { shipping_info } = useSelector(state => state.order);
  // total amount
  const { total, setTotal, firstTimeDiscountAmount } = useCartInfo();

  // Enhanced coupon state from Redux
  const {
    applied_coupons,
    total_coupon_discount,
    coupon_error,
    coupon_loading,
    last_applied_coupon,
  } = useSelector(state => state.coupon);

  // Legacy coupon state (keeping for backward compatibility)
  const [couponInfo, setCouponInfo] = useState({});
  //cartTotal
  const [cartTotal, setCartTotal] = useState('');
  // minimumAmount
  const [minimumAmount, setMinimumAmount] = useState(0);
  // shippingCost
  const [shippingCost, setShippingCost] = useState(0);
  // discountAmount - now using enhanced coupon discount
  const [discountAmount, setDiscountAmount] = useState(0);
  // discountPercentage
  const [discountPercentage, setDiscountPercentage] = useState(0);
  // discountProductType
  const [discountProductType, setDiscountProductType] = useState('');
  // isCheckoutSubmit
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  // paymentSuccessful - shows immediate success feedback
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  // cardError
  const [cardError, setCardError] = useState('');
  // clientSecret
  const [clientSecret, setClientSecret] = useState('');
  // showCard
  const [showCard, setShowCard] = useState(false);
  // coupon apply message
  const [couponApplyMsg, setCouponApplyMsg] = useState('');
  // processing payment
  const [processingPayment, setProcessingPayment] = useState(false);
  // Thank You Modal
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [orderDataForModal, setOrderDataForModal] = useState({});

  const dispatch = useDispatch();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
      city: '',
      country: 'US',
      state: '',
      zipCode: '',
      contactNo: '',
    },
  });

  let couponRef = useRef(null);

  // Load applied coupons on component mount
  useEffect(() => {
    dispatch(load_applied_coupons());
  }, [dispatch]);

  // Update discount amount when enhanced coupon changes
  useEffect(() => {
    setDiscountAmount(total_coupon_discount);
  }, [total_coupon_discount]);

  // Clear success message when coupon is removed or when there's an error
  useEffect(() => {
    if (applied_coupons.length === 0) {
      setCouponApplyMsg('');
      dispatch(set_coupon_error(null));
    }
  }, [applied_coupons.length, dispatch]);

  // Legacy coupon loading (keeping for backward compatibility)
  useEffect(() => {
    if (localStorage.getItem('couponInfo')) {
      const data = localStorage.getItem('couponInfo');
      const coupon = JSON.parse(data);
      setCouponInfo(coupon);
      setDiscountPercentage(coupon.discountPercentage);
      setMinimumAmount(coupon.minimumAmount);
      setDiscountProductType(coupon.productType);
    }
  }, []);

  useEffect(() => {
    if (minimumAmount - discountAmount > total || cart_products.length === 0) {
      setDiscountPercentage(0);
      localStorage.removeItem('couponInfo');
    }
  }, [minimumAmount, total, discountAmount, cart_products]);

  // Calculate total and discount value
  useEffect(() => {
    let totalValue = '';
    let subTotal = Number((total + shippingCost).toFixed(2));

    // Use enhanced coupon discount if available, otherwise fall back to legacy
    let totalDiscount = total_coupon_discount;

    // Legacy calculation for backward compatibility
    if (applied_coupons.length === 0 && discountPercentage > 0) {
      const result = cart_products?.filter(
        p => p.productType === discountProductType
      );
      const discountProductTotal = result?.reduce(
        (preValue, currentValue) =>
          preValue + currentValue.price * currentValue.orderQuantity,
        0
      );
      totalDiscount = Number(discountProductTotal * (discountPercentage / 100));
    }

    totalValue = Number(subTotal - totalDiscount);
    setDiscountAmount(totalDiscount);
    setCartTotal(totalValue);
  }, [
    total,
    shippingCost,
    discountPercentage,
    cart_products,
    discountProductType,
    total_coupon_discount,
    applied_coupons,
    cartTotal,
  ]);

  // Update coupon message when new coupon is applied
  useEffect(() => {
    if (last_applied_coupon && last_applied_coupon.applicableProductNames) {
      const productNames =
        last_applied_coupon.applicableProductNames.join(', ');
      const discountPercentage =
        last_applied_coupon.discountPercentage ||
        last_applied_coupon.discountAmount;

      setCouponApplyMsg(
        `Coupon "${last_applied_coupon.couponCode}" applied! ${discountPercentage}% discount on ${productNames}.`
      );
    }
  }, [last_applied_coupon]);

  // Calculate cart totals including multiple coupon discounts
  const calculateTotals = () => {
    // Add safety check for cart_products
    if (
      !cart_products ||
      !Array.isArray(cart_products) ||
      cart_products.length === 0
    ) {
      return {
        cartSubtotal: 0,
        totalDiscount: 0,
        finalTotal: 0,
      };
    }

    try {
      const cartSubtotal = cart_products.reduce((total, item) => {
        // Add safety checks for item properties
        const quantity = Number(item?.orderQuantity || 0);
        const price = Number(item?.price || 0);

        if (isNaN(quantity) || isNaN(price)) {
          return total;
        }

        return total + quantity * price;
      }, 0);

      const totalDiscount = Number(total_coupon_discount || 0);
      const finalTotal = Math.max(0, cartSubtotal - totalDiscount);

      return {
        cartSubtotal: Math.round(cartSubtotal * 100) / 100,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        finalTotal: Math.round(finalTotal * 100) / 100,
      };
    } catch (error) {
      return {
        cartSubtotal: 0,
        totalDiscount: 0,
        finalTotal: 0,
      };
    }
  };

  // Apply a new coupon
  const handleCouponSubmit = async e => {
    e.preventDefault();

    if (!couponRef.current?.value) {
      notifyError('Please Input a Coupon Code!');
      return;
    }

    const couponCode = couponRef.current.value.trim();

    if (!couponCode) {
      notifyError('Please Input a Coupon Code!');
      return;
    }

    // Check if API URL is configured
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      const errorMsg = 'API configuration error. Please contact support.';

      notifyError(errorMsg);
      dispatch(set_coupon_error(errorMsg));
      return;
    }

    // Check if cart has products
    if (!cart_products || cart_products.length === 0) {
      notifyError('Your cart is empty. Add products before applying coupons.');
      return;
    }

    // Check if coupon is already applied
    const existingCoupon = applied_coupons.find(
      coupon =>
        coupon.couponCode.toUpperCase() === couponCode.trim().toUpperCase()
    );

    if (existingCoupon) {
      notifyError(`Coupon "${couponCode}" is already applied`);
      dispatch(set_coupon_error(`Coupon "${couponCode}" is already applied`));
      return;
    }

    dispatch(set_coupon_loading(true));
    dispatch(set_coupon_error(null));
    setCouponApplyMsg('');

    try {
      // Debug logging

      const { cartSubtotal } = calculateTotals();

      // Additional validation for cart subtotal
      if (cartSubtotal <= 0) {
        throw new Error(
          'Cart total must be greater than zero to apply coupons.'
        );
      }

      // If this is the first coupon, use single validation for backward compatibility
      if (applied_coupons.length === 0) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/validate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              couponCode: couponCode.trim(),
              cartItems: cart_products,
              cartTotal: cartSubtotal,
              cartSubtotal: cartSubtotal,
              shippingCost: 0,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to validate coupon');
        }

        if (result.success && result.data) {
          dispatch(add_applied_coupon(result.data));
          couponRef.current.value = '';
          notifySuccess(
            `Coupon "${result.data.couponCode}" applied successfully!`
          );
        } else {
          throw new Error(result.message || 'Coupon validation failed');
        }
      } else {
        // Use multiple coupon validation for additional coupons
        const newCouponCodes = [couponCode.trim()];
        const excludeAppliedCoupons = applied_coupons.map(c => c.couponCode);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/validate-multiple`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              couponCodes: newCouponCodes,
              cartItems: cart_products,
              cartTotal: cartSubtotal,
              cartSubtotal: cartSubtotal,
              shippingCost: 0,
              excludeAppliedCoupons: excludeAppliedCoupons,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to validate coupons');
        }

        if (result.success && result.data.appliedCoupons.length > 0) {
          // Add each new coupon to the existing list
          result.data.appliedCoupons.forEach(couponData => {
            dispatch(add_applied_coupon(couponData));
          });

          couponRef.current.value = '';
          notifySuccess(
            `${result.data.appliedCoupons.length} coupon(s) applied successfully!`
          );
        } else {
          const failureReason =
            result.data?.validationResults?.[0]?.message ||
            result.message ||
            'Coupon validation failed';
          throw new Error(failureReason);
        }
      }
    } catch (error) {
      // Provide more specific error messages based on error type
      let errorMessage;

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else if (error.message.includes('API configuration')) {
        errorMessage = 'Configuration error. Please contact support.';
      } else if (error.message.includes('Cart total must be greater')) {
        errorMessage = 'Cart total must be greater than zero to apply coupons.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please try again.';
      } else {
        errorMessage =
          error.message || 'Failed to apply coupon. Please try again.';
      }

      setCouponApplyMsg(errorMessage);
      dispatch(set_coupon_error(errorMessage));
      notifyError(errorMessage);
    } finally {
      dispatch(set_coupon_loading(false));
    }
  };

  // Remove a specific coupon
  const handleRemoveCoupon = couponCode => {
    const removedCoupon = applied_coupons.find(
      c => c.couponCode === couponCode
    );
    dispatch(remove_applied_coupon(couponCode));

    if (removedCoupon) {
      notifySuccess(`Coupon "${couponCode}" removed successfully!`);
    }

    // Clear message if this was the last coupon
    if (applied_coupons.length === 1) {
      setCouponApplyMsg('');
    }
  };

  // Clear all applied coupons
  const handleClearAllCoupons = () => {
    dispatch(clear_all_coupons());
    setCouponApplyMsg('');
    notifySuccess('All coupons removed successfully!');
  };

  // Re-validate all applied coupons (useful when cart changes)
  const revalidateAllCoupons = async () => {
    if (applied_coupons.length === 0) return;

    dispatch(set_coupon_loading(true));

    try {
      const { cartSubtotal } = calculateTotals();
      const couponCodes = applied_coupons.map(c => c.couponCode);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coupon/validate-multiple`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            couponCodes: couponCodes,
            cartItems: cart_products,
            cartTotal: cartSubtotal,
            cartSubtotal: cartSubtotal,
            shippingCost: 0,
            excludeAppliedCoupons: [], // Don't exclude any since we're revalidating
          }),
        }
      );

      const result = await response.json();

      if (result.success && result.data.appliedCoupons) {
        dispatch(set_applied_coupons(result.data.appliedCoupons));

        // Show notification if some coupons were removed
        const removedCount =
          applied_coupons.length - result.data.appliedCoupons.length;
        if (removedCount > 0) {
          notifyError(
            `${removedCount} coupon(s) are no longer valid and have been removed.`
          );
        }
      } else {
        // All coupons invalid, clear them
        dispatch(clear_all_coupons());
        notifyError(
          'All applied coupons are no longer valid and have been removed.'
        );
      }
    } catch (error) {
      // Keep existing coupons on revalidation error
    } finally {
      dispatch(set_coupon_loading(false));
    }
  };

  // handle shipping cost
  const handleShippingCost = value => {
    setShippingCost(value);
  };

  // create stripe payment intent
  const createStripePaymentIntent = async orderData => {
    try {
      const response = await createPaymentIntent({
        price: parseInt(Math.max(0, cartTotal)), // Ensure never negative
        email: orderData.email,
        cart: cart_products,
        orderData: {
          ...orderData,
          totalAmount: Math.max(0, cartTotal), // Ensure never negative
          isGuestOrder: !session?.user?.id,
        },
      });

      // Check if this is a free order
      const responseData = response.data || response;
      if (responseData.isFreeOrder) {
        return { isFreeOrder: true, totalAmount: responseData.totalAmount };
      }

      // The backend returns: { clientSecret: '...', paymentIntentId: '...' }
      // But RTK Query wraps it in { data: { clientSecret: '...', paymentIntentId: '...' } }
      const clientSecret = response.data?.clientSecret || response.clientSecret;

      if (!clientSecret) {
        throw new Error('Failed to get client secret from payment intent');
      }

      setClientSecret(clientSecret);
      dispatch(set_client_secret(clientSecret));
      return clientSecret;
    } catch (error) {
      throw error;
    }
  };

  // submitHandler
  const submitHandler = async data => {
    const newShippingInfo = {
      ...data,
      shippingOption: 'Free',
      // Combine firstName and lastName into name field
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    };
    dispatch(set_shipping(newShippingInfo));
    setIsCheckoutSubmit(true);
    dispatch(begin_checkout_submission());

    // Validate required fields
    if (
      !data.firstName ||
      !data.lastName ||
      !data.email ||
      !data.address ||
      !data.city ||
      !data.country ||
      !data.state ||
      !data.zipCode ||
      !data.contactNo
    ) {
      notifyError('Please fill in all required fields');
      setIsCheckoutSubmit(false);
      dispatch(end_checkout_submission());
      return;
    }

    // Calculate correct subtotal (before any discounts)
    const rawSubTotal =
      cart_products?.reduce(
        (acc, item) => acc + Number(item.finalPriceDiscount || 0) * item.orderQuantity,
        0
      ) || 0;

    // Calculate total discount amount (coupon + first-time discount)
    const totalDiscount = discountAmount + (firstTimeDiscountAmount || 0);

    // Ensure total amount is never negative (for 100% discount coupons)
    const finalTotalAmount = Math.max(0, cartTotal);

    const orderInfo = {
      cart: cart_products?.map(item => {
        const {
          createdAt,
          updatedAt,
          reviews,
          __v,
          sellCount,
          ...otherProperties
        } = item;

        return otherProperties;
      }),
      subTotal: rawSubTotal, // Raw subtotal before any discounts
      shippingCost: shippingCost,
      discount: discountAmount, // Coupon discount only
      totalAmount: finalTotalAmount, // Ensure never negative
      name: newShippingInfo.name,
      email: newShippingInfo.email,
      address: newShippingInfo.address,
      contact: newShippingInfo.contactNo,
      city: newShippingInfo.city,
      country: newShippingInfo.country,
      zipCode: newShippingInfo.zipCode,
      state: newShippingInfo.state,
      user: session?.user?.id,
      paymentMethod: 'Card',
      // Add first-time discount information
      firstTimeDiscount: {
        isApplied: firstTimeDiscount?.isApplied || false,
        percentage: firstTimeDiscount?.percentage || 0,
        amount: firstTimeDiscountAmount || 0,
      },
      // Add enhanced coupon information
      appliedCoupons: applied_coupons,
    };

    const card = elements?.getElement(CardElement);

    if (!stripe || !elements) {
      return;
    }
    if (!card) {
      notifyError('Please enter your card information');
      setIsCheckoutSubmit(false);
      dispatch(end_checkout_submission());
      return;
    }

    // COD logic
    if (newShippingInfo.shippingOption === 'COD') {
      orderInfo.paymentMethod = 'COD';

      saveOrder(orderInfo)
        .then(res => {
          // Extract MongoDB ObjectId for the redirect (backend expects _id, not invoice)
          const orderId =
            res.data?.order?._id ||
            res.order?._id ||
            res.data?.order?.invoice ||
            res.order?.invoice;

          // Show Thank You Modal for COD orders
          setOrderDataForModal({
            orderId: orderId,
            customOrderId: res.data?.order?.orderId,
          });
          setShowThankYouModal(true);

          // Clean up - Remove from localStorage
          localStorage.removeItem('cart_products');
          localStorage.removeItem('couponInfo');
          localStorage.removeItem('shipping_cost');

          // Clear Redux cart state
          dispatch(clearCart());

          // Hide cart confirmation modal
          dispatch(hideCartConfirmation());

          // Clear enhanced coupon
          dispatch(clear_coupon());
          dispatch(clear_all_coupons());

          setIsCheckoutSubmit(false);
          setProcessingPayment(false);
          dispatch(end_checkout_submission());
        })
        .catch(err => {
          notifyError(
            'Something went wrong with your order. Please try again.'
          );
          setIsCheckoutSubmit(false);
          dispatch(end_checkout_submission());
        });
    } else {
      // Card Payment logic
      if (cart_products?.length === 0) {
        notifyError('Please add products to cart first');
        setIsCheckoutSubmit(false);
        dispatch(end_checkout_submission());
        return;
      }

      try {
        setProcessingPayment(true);

        // Step 1: Validate the card
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: card,
        });

        if (error) {
          setCardError(error.message);

          // Create a summary of attempted purchase
          const productSummary =
            cart_products.length > 1
              ? `${cart_products[0].title} and ${cart_products.length - 1
              } more items`
              : cart_products[0]?.title || 'your items';

          // Show a user-friendly message
          notifyError(
            `We couldn't process your card for ${productSummary}. Please check your card details.`
          );
          setIsCheckoutSubmit(false);
          setProcessingPayment(false);
          dispatch(end_checkout_submission());
          return;
        }

        // Step 2: Create payment intent with order data
        try {
          const paymentResult = await createStripePaymentIntent({
            ...orderInfo,
            cardInfo: paymentMethod,
          });

          // Handle free orders (100% discount coupons)
          if (paymentResult.isFreeOrder) {
            // Clean up first
            localStorage.removeItem('cart_products');
            localStorage.removeItem('couponInfo');

            // Clear enhanced coupon
            dispatch(clear_coupon());

            // Mark first-time discount as used after successful free order
            dispatch(completeFirstTimeDiscount());

            setIsCheckoutSubmit(false);
            setProcessingPayment(false);

            // Save free order
            saveOrder({
              ...orderInfo,
              paymentMethod: 'Free Order (100% Discount)',
              isPaid: true,
              paidAt: new Date(),
              paymentInfo: {
                id: `free_order_${Date.now()}`,
                status: 'succeeded',
                amount_received: 0,
                currency: 'usd',
                payment_method_types: ['coupon'],
              },
            })
              .then(res => {
                // Extract MongoDB ObjectId for the redirect
                const orderId =
                  res.data?.order?._id ||
                  res.order?._id ||
                  res.data?.order?.invoice ||
                  res.order?.invoice;

                // Set order data and show Thank You modal
                setOrderDataForModal({
                  orderId: orderId,
                  customOrderId: res.data?.order?.orderId,
                });
                setShowThankYouModal(true);

                notifySuccess(
                  '🎉 Your free order has been placed successfully!'
                );
              })
              .catch(err => {
                notifyError(
                  'Something went wrong with your free order. Please try again.'
                );
                setIsCheckoutSubmit(false);
                setProcessingPayment(false);
                dispatch(end_checkout_submission());
              });

            dispatch(end_checkout_submission());
            return;
          }

          const secret = paymentResult;

          // Step 3: Confirm the payment with Stripe
          const { paymentIntent, error: confirmError } =
            await stripe.confirmCardPayment(secret, {
              payment_method: {
                card: card,
                billing_details: {
                  name: orderInfo.name,
                  email: orderInfo.email,
                },
              },
            });

          if (confirmError) {
            let errorMessage = confirmError.message;
            // Add more user-friendly error messages based on error types
            if (confirmError.type === 'card_error') {
              if (confirmError.code === 'card_declined') {
                errorMessage =
                  'Your card was declined. Please use a different card.';
              } else if (confirmError.code === 'expired_card') {
                errorMessage =
                  'Your card has expired. Please use a different card.';
              } else if (confirmError.code === 'incorrect_cvc') {
                errorMessage =
                  'The security code (CVC) is incorrect. Please check and try again.';
              } else if (confirmError.code === 'processing_error') {
                errorMessage =
                  'An error occurred while processing your card. Please try again.';
              }
            }

            // Create a summary of attempted purchase
            const productSummary =
              cart_products.length > 1
                ? `${cart_products[0].title} and ${cart_products.length - 1
                } more items`
                : cart_products[0]?.title || 'your items';

            setCardError(errorMessage);
            notifyError(
              `We couldn't complete your purchase for ${productSummary}: ${errorMessage}`
            );
            setIsCheckoutSubmit(false);
            setProcessingPayment(false);
            dispatch(end_checkout_submission());
            return;
          }

          // Step 4: Payment confirmed by Stripe
          if (paymentIntent.status === 'succeeded') {
            // ✅ IMMEDIATELY show success feedback
            setPaymentSuccessful(true);

            // Clean up first - Remove from localStorage
            localStorage.removeItem('cart_products');
            localStorage.removeItem('couponInfo');
            localStorage.removeItem('shipping_cost');

            // Clear Redux cart state
            dispatch(clearCart());

            // Hide cart confirmation modal
            dispatch(hideCartConfirmation());

            // Clear enhanced coupon
            dispatch(clear_coupon());
            dispatch(clear_all_coupons());

            // Mark first-time discount as used after successful payment
            dispatch(completeFirstTimeDiscount());

            setIsCheckoutSubmit(false);
            setProcessingPayment(false);

            // Save order and redirect to order page
            saveOrder({
              ...orderInfo,
              paymentInfo: paymentIntent,
              isPaid: true,
              paidAt: new Date(),
            })
              .then(res => {
                // Extract MongoDB ObjectId for the redirect
                const orderId =
                  res.data?.order?._id ||
                  res.order?._id ||
                  res.data?.order?.invoice ||
                  res.order?.invoice;

                // Keep success overlay visible for 1.5 seconds, then redirect
                setTimeout(() => {
                  setPaymentSuccessful(false);
                  router.push(`/order/${orderId}`);
                }, 1500);
              })
              .catch(err => {
                setPaymentSuccessful(false);
                const productSummary =
                  cart_products.length > 1
                    ? `${cart_products[0].title} and ${cart_products.length - 1
                    } other items`
                    : cart_products[0]?.title || 'your product';

                notifyError(
                  `Your payment for ${productSummary} was successful, but we encountered an issue saving your order details. Our team has been notified.`
                );
                router.push('/order');
              });
          } else {
            notifyError(
              `We couldn't complete your purchase. Please try again or contact customer support.`
            );
            setIsCheckoutSubmit(false);
            notifyError(
              `Payment not completed. Status: ${paymentIntent.status}`
            );
            setIsCheckoutSubmit(false);
            setProcessingPayment(false);
            dispatch(end_checkout_submission());
          }
        } catch (err) {
          notifyError(
            'Error creating payment: Please check your payment details and try again.'
          );
          setIsCheckoutSubmit(false);
          setProcessingPayment(false);
          dispatch(end_checkout_submission());
        }
      } catch (err) {
        notifyError(
          'There was a problem processing your payment. Please try again.'
        );
        setIsCheckoutSubmit(false);
        setProcessingPayment(false);
        dispatch(end_checkout_submission());
      }
    }
  };

  // Handle Thank You modal close and redirect
  const handleThankYouModalClose = () => {
    setShowThankYouModal(false);
  };

  const handleThankYouModalContinue = () => {
    setShowThankYouModal(false);

    // Try to redirect to order details page
    const orderId = orderDataForModal?.orderId;

    if (orderId) {
      // Use invoice number for URL if available, otherwise use _id
      const redirectPath = `/order/${orderId}`;

      router.push(redirectPath);
    } else {
      router.push('/order');
    }
  };

  return {
    handleCouponSubmit,
    handleRemoveCoupon,
    handleClearAllCoupons,
    revalidateAllCoupons,
    couponRef,
    handleShippingCost,
    discountAmount,
    total,
    shippingCost,
    discountPercentage,
    discountProductType,
    isCheckoutSubmit,
    setTotal,
    register,
    errors,
    setValue,
    cardError,
    submitHandler,
    stripe,
    handleSubmit,
    control,
    clientSecret,
    setClientSecret,
    cartTotal,
    isCheckoutSubmit,
    couponApplyMsg,
    setCouponApplyMsg,
    showCard,
    setShowCard,
    processingPayment,
    // Payment Success Overlay
    paymentSuccessful,
    applied_coupons,
    total_coupon_discount,
    coupon_error,
    coupon_loading,
    calculateTotals,
  };
};

export default useCheckoutSubmit;
