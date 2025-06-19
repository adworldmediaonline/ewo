'use client';
import * as dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
//internal import
import useCartInfo from './use-cart-info';
import {
  set_shipping,
  set_client_secret,
  begin_checkout_submission,
  end_checkout_submission,
} from '@/redux/features/order/orderSlice';
import { set_coupon } from '@/redux/features/coupon/couponSlice';
import { notifyError, notifySuccess } from '@/utils/toast';
import {
  useCreatePaymentIntentMutation,
  useSaveOrderMutation,
} from '@/redux/features/order/orderApi';
import { useGetOfferCouponsQuery } from '@/redux/features/coupon/couponApi';
import { completeFirstTimeDiscount } from '@/redux/features/cartSlice';

const useCheckoutSubmit = () => {
  // offerCoupons
  const { data: offerCoupons, isError, isLoading } = useGetOfferCouponsQuery();
  // addOrder
  const [saveOrder, {}] = useSaveOrderMutation();
  // createPaymentIntent
  const [createPaymentIntent, {}] = useCreatePaymentIntentMutation();
  // cart_products
  const { cart_products, firstTimeDiscount } = useSelector(state => state.cart);
  // user
  const { user } = useSelector(state => state.auth);
  // shipping_info
  const { shipping_info } = useSelector(state => state.order);
  // total amount
  const { total, setTotal, firstTimeDiscountAmount } = useCartInfo();
  // couponInfo
  const [couponInfo, setCouponInfo] = useState({});
  //cartTotal
  const [cartTotal, setCartTotal] = useState('');
  // minimumAmount
  const [minimumAmount, setMinimumAmount] = useState(0);
  // shippingCost
  const [shippingCost, setShippingCost] = useState(0);
  // discountAmount
  const [discountAmount, setDiscountAmount] = useState(0);
  // discountPercentage
  const [discountPercentage, setDiscountPercentage] = useState(0);
  // discountProductType
  const [discountProductType, setDiscountProductType] = useState('');
  // isCheckoutSubmit
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
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

  let couponRef = useRef('');

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
    const result = cart_products?.filter(
      p => p.productType === discountProductType
    );
    const discountProductTotal = result?.reduce(
      (preValue, currentValue) =>
        preValue + currentValue.price * currentValue.orderQuantity,
      0
    );
    let totalValue = '';
    let subTotal = Number((total + shippingCost).toFixed(2));
    let discountTotal = Number(
      discountProductTotal * (discountPercentage / 100)
    );

    totalValue = Number(subTotal - discountTotal);
    setDiscountAmount(discountTotal);
    setCartTotal(totalValue);
  }, [
    total,
    shippingCost,
    discountPercentage,
    cart_products,
    discountProductType,
    discountAmount,
    cartTotal,
  ]);

  // handleCouponCode
  const handleCouponCode = e => {
    e.preventDefault();

    if (!couponRef.current?.value) {
      notifyError('Please Input a Coupon Code!');
      return;
    }
    if (isLoading) {
      return <h3>Loading...</h3>;
    }
    if (isError) {
      return notifyError('Something went wrong');
    }
    const result = offerCoupons?.filter(
      coupon => coupon.couponCode === couponRef.current?.value
    );
    if (result?.length > 0) {
      localStorage.setItem('couponInfo', JSON.stringify(result[0]));
      setCouponInfo(result[0]);
      setMinimumAmount(result[0].minimumAmount);
      setDiscountPercentage(result[0].discountPercentage);
      setDiscountProductType(result[0].productType);
      couponRef.current.value = '';
      setCouponApplyMsg(
        `Your Coupon is Applied! You got ${result[0].discountPercentage}% discount.`
      );
      notifySuccess(
        `Your Coupon is Applied! You got ${result[0].discountPercentage}% discount.`
      );
    } else {
      setCouponApplyMsg('Please Input a Valid Coupon!');
      notifyError('Please Input a Valid Coupon!');
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
        price: parseInt(cartTotal),
        email: orderData.email,
        cart: cart_products,
        orderData: {
          ...orderData,
          totalAmount: cartTotal,
          isGuestOrder: !user,
        },
      });

      console.log('Payment intent response:', response);

      // The backend returns: { clientSecret: '...', paymentIntentId: '...' }
      // But RTK Query wraps it in { data: { clientSecret: '...', paymentIntentId: '...' } }
      const clientSecret = response.data?.clientSecret || response.clientSecret;

      if (!clientSecret) {
        console.error('No client secret received:', response);
        throw new Error('Failed to get client secret from payment intent');
      }

      setClientSecret(clientSecret);
      dispatch(set_client_secret(clientSecret));
      return clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
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
      console.log('Missing required form fields:', data);
      notifyError('Please fill in all required fields');
      setIsCheckoutSubmit(false);
      dispatch(end_checkout_submission());
      return;
    }

    // Calculate correct subtotal (before any discounts)
    const rawSubTotal =
      cart_products?.reduce(
        (acc, item) => acc + item.price * item.orderQuantity,
        0
      ) || 0;

    // Calculate total discount amount (coupon + first-time discount)
    const totalDiscount = discountAmount + (firstTimeDiscountAmount || 0);

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
      totalAmount: cartTotal,
      name: newShippingInfo.name,
      email: newShippingInfo.email,
      address: newShippingInfo.address,
      contact: newShippingInfo.contactNo,
      city: newShippingInfo.city,
      country: newShippingInfo.country,
      zipCode: newShippingInfo.zipCode,
      state: newShippingInfo.state,
      user: user ? user._id : undefined,
      paymentMethod: 'Card',
      // Add first-time discount information
      firstTimeDiscount: {
        isApplied: firstTimeDiscount?.isApplied || false,
        percentage: firstTimeDiscount?.percentage || 0,
        amount: firstTimeDiscountAmount || 0,
      },
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

      console.log('📦 COD Order Info:', {
        subTotal: orderInfo.subTotal,
        shippingCost: orderInfo.shippingCost,
        discount: orderInfo.discount,
        firstTimeDiscount: orderInfo.firstTimeDiscount,
        totalAmount: orderInfo.totalAmount,
      });

      saveOrder(orderInfo)
        .then(res => {
          console.log('COD Order response:', res);

          // Extract MongoDB ObjectId for the redirect (backend expects _id, not invoice)
          const orderId =
            res.data?.order?._id ||
            res.order?._id ||
            res.data?.order?.invoice ||
            res.order?.invoice;

          console.log('Extracted COD Order ID (ObjectId):', orderId);

          // Show Thank You Modal for COD orders
          setOrderDataForModal({
            orderId: orderId,
          });
          setShowThankYouModal(true);

          // Clean up
          localStorage.removeItem('cart_products');
          localStorage.removeItem('couponInfo');
          setIsCheckoutSubmit(false);
          setProcessingPayment(false);
          dispatch(end_checkout_submission());
        })
        .catch(err => {
          console.error('COD Order error:', err);
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
          console.error('Card validation error:', error);
          setCardError(error.message);

          // Create a summary of attempted purchase
          const productSummary =
            cart_products.length > 1
              ? `${cart_products[0].title} and ${
                  cart_products.length - 1
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

        console.log('Payment method created:', paymentMethod);

        // Step 2: Create payment intent with order data
        try {
          const secret = await createStripePaymentIntent({
            ...orderInfo,
            cardInfo: paymentMethod,
          });

          console.log('Payment intent created, client secret received');

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
            console.error('Payment confirmation error:', confirmError);
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
                ? `${cart_products[0].title} and ${
                    cart_products.length - 1
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

          console.log('Payment intent status:', paymentIntent.status);

          // Step 4: Payment confirmed by Stripe
          if (paymentIntent.status === 'succeeded') {
            // Clean up first
            localStorage.removeItem('cart_products');
            localStorage.removeItem('couponInfo');

            // Mark first-time discount as used after successful payment
            dispatch(completeFirstTimeDiscount());

            setIsCheckoutSubmit(false);
            setProcessingPayment(false);

            console.log('💳 Card Order Info:', {
              subTotal: orderInfo.subTotal,
              shippingCost: orderInfo.shippingCost,
              discount: orderInfo.discount,
              firstTimeDiscount: orderInfo.firstTimeDiscount,
              totalAmount: orderInfo.totalAmount,
            });

            // Save order and show Thank You modal
            saveOrder({
              ...orderInfo,
              paymentInfo: paymentIntent,
              isPaid: true,
              paidAt: new Date(),
            })
              .then(res => {
                console.log('Card Order response:', res);

                // Extract MongoDB ObjectId for the redirect (backend expects _id, not invoice)
                const orderId =
                  res.data?.order?._id ||
                  res.order?._id ||
                  res.data?.order?.invoice ||
                  res.order?.invoice;

                console.log('Extracted Card Order ID (ObjectId):', orderId);

                // Set order data and show Thank You modal
                setOrderDataForModal({
                  orderId: orderId,
                });
                setShowThankYouModal(true);
              })
              .catch(err => {
                console.error('Order error:', err);
                const productSummary =
                  cart_products.length > 1
                    ? `${cart_products[0].title} and ${
                        cart_products.length - 1
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
          console.error('Payment intent error:', err);
          notifyError(
            'Error creating payment: Please check your payment details and try again.'
          );
          setIsCheckoutSubmit(false);
          setProcessingPayment(false);
          dispatch(end_checkout_submission());
        }
      } catch (err) {
        console.error('Payment error:', err);
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
    console.log(
      'Thank you modal continue clicked, orderData:',
      orderDataForModal
    );

    setShowThankYouModal(false);

    // Try to redirect to order details page
    const orderId = orderDataForModal?.orderId;
    console.log('Attempting to redirect with order ID:', orderId);

    if (orderId) {
      // Use invoice number for URL if available, otherwise use _id
      const redirectPath = `/order/${orderId}`;
      console.log('Redirecting to:', redirectPath);
      router.push(redirectPath);
    } else {
      console.warn('No order ID found, redirecting to orders list');
      router.push('/order');
    }
  };

  return {
    handleCouponCode,
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
    clientSecret,
    setClientSecret,
    cartTotal,
    isCheckoutSubmit,
    couponApplyMsg,
    showCard,
    setShowCard,
    processingPayment,
    // Thank You Modal props
    showThankYouModal,
    orderDataForModal,
    handleThankYouModalClose,
    handleThankYouModalContinue,
  };
};

export default useCheckoutSubmit;
