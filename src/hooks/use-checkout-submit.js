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
import { set_shipping } from '@/redux/features/order/orderSlice';
import { set_coupon } from '@/redux/features/coupon/couponSlice';
import { notifyError, notifySuccess } from '@/utils/toast';
import {
  useCreatePaymentIntentMutation,
  useSaveOrderMutation,
} from '@/redux/features/order/orderApi';
import { useGetOfferCouponsQuery } from '@/redux/features/coupon/couponApi';

const useCheckoutSubmit = () => {
  // offerCoupons
  const { data: offerCoupons, isError, isLoading } = useGetOfferCouponsQuery();
  // addOrder
  const [saveOrder, {}] = useSaveOrderMutation();
  // createPaymentIntent
  const [createPaymentIntent, {}] = useCreatePaymentIntentMutation();
  // cart_products
  const { cart_products } = useSelector(state => state.cart);
  // user
  const { user } = useSelector(state => state.auth);
  // shipping_info
  const { shipping_info } = useSelector(state => state.order);
  // total amount
  const { total, setTotal } = useCartInfo();
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

  const dispatch = useDispatch();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

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

  //calculate total and discount value
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

    if (result.length < 1) {
      notifyError('Please Input a Valid Coupon!');
      return;
    }

    if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
      notifyError('This coupon is not valid!');
      return;
    }

    if (total < result[0]?.minimumAmount) {
      notifyError(
        `Minimum ${result[0].minimumAmount} USD required for Apply this coupon!`
      );
      return;
    } else {
      // notifySuccess(
      //   `Your Coupon ${result[0].title} is Applied on ${result[0].productType}!`
      // );
      setCouponApplyMsg(
        `Your Coupon ${result[0].title} is Applied on ${result[0].productType} productType!`
      );
      setMinimumAmount(result[0]?.minimumAmount);
      setDiscountProductType(result[0].productType);
      setDiscountPercentage(result[0].discountPercentage);
      dispatch(set_coupon(result[0]));
      setTimeout(() => {
        couponRef.current.value = '';
        setCouponApplyMsg('');
      }, 5000);
    }
  };

  // handleShippingCost
  const handleShippingCost = value => {
    setShippingCost(value);
  };

  //set values
  useEffect(() => {
    setValue('firstName', shipping_info.firstName);
    setValue('lastName', shipping_info.lastName);
    setValue('country', shipping_info.country);
    setValue('address', shipping_info.address);
    setValue('city', shipping_info.city);
    setValue('zipCode', shipping_info.zipCode);
    setValue('contactNo', shipping_info.contactNo);
    setValue('email', shipping_info.email);
    setValue('orderNote', shipping_info.orderNote);
  }, [user, setValue, shipping_info, router]);

  // create payment intent with order data for Stripe
  const createStripePaymentIntent = async orderData => {
    try {
      console.log('Creating payment intent with order data:', orderData);

      // Check if user is logged in
      const isAuthenticate = Cookies.get('userInfo');
      const isGuestCheckout = !isAuthenticate;

      // Create a payment intent with order data including cart
      const response = await createPaymentIntent({
        price: parseInt(cartTotal),
        email: orderData.email,
        // Include cart data for inventory management
        cart: cart_products,
        // Additional order metadata
        orderData: {
          state: orderData.state,
          email: orderData.email,
          name: orderData.name,
          user: isGuestCheckout ? null : user?._id,
          totalAmount: cartTotal,
          isGuestOrder: isGuestCheckout,
        },
      });

      console.log('Payment intent created:', response.data);
      return response.data.clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  // submitHandler
  const submitHandler = async data => {
    dispatch(set_shipping(data));
    setIsCheckoutSubmit(true);

    // Check if user is logged in
    const isAuthenticate = Cookies.get('userInfo');
    const isGuestCheckout = !isAuthenticate;

    let orderInfo = {
      name: `${data.firstName} ${data.lastName}`,
      address: data.address,
      contact: data.contactNo,
      email: data.email,
      city: data.city,
      state: data.state,
      country: data.country,
      zipCode: data.zipCode,
      shippingOption: data.shippingOption,
      status: 'pending',
      cart: cart_products,
      paymentMethod: data.payment,
      subTotal: total,
      shippingCost: shippingCost,
      discount: discountAmount,
      totalAmount: cartTotal,
      orderNote: data.orderNote,
      isGuestOrder: isGuestCheckout,
    };

    // Only add user ID if the user is logged in
    if (!isGuestCheckout && user?._id) {
      orderInfo.user = user._id;
    }

    if (data.payment === 'Card') {
      if (!stripe || !elements) {
        setIsCheckoutSubmit(false);
        notifyError('Stripe not initialized. Please try again.');
        return;
      }

      const card = elements.getElement(CardElement);
      if (card == null) {
        setIsCheckoutSubmit(false);
        notifyError('Card information is incomplete.');
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
            return;
          }

          console.log('Payment intent status:', paymentIntent.status);

          // Step 4: Payment confirmed by Stripe
          if (paymentIntent.status === 'succeeded') {
            // Create a summary of purchased products
            const productSummary =
              cart_products.length > 1
                ? `${cart_products[0].title} and ${
                    cart_products.length - 1
                  } other items`
                : cart_products[0]?.title || 'your product';

            notifySuccess(
              `Thank you! Your order for ${productSummary} has been confirmed.`
            );
            localStorage.removeItem('cart_products');
            localStorage.removeItem('couponInfo');
            setIsCheckoutSubmit(false);
            setProcessingPayment(false);

            // Save order and get order ID for redirect
            saveOrder({
              ...orderInfo,
              paymentInfo: paymentIntent,
              isPaid: true,
              paidAt: new Date(),
            })
              .then(res => {
                router.push(`/order/${res.data?.order?._id}`);
              })
              .catch(err => {
                console.error('Order error:', err);
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
          }
        } catch (err) {
          console.error('Payment intent error:', err);
          notifyError(
            'Error creating payment: Please check your payment details and try again.'
          );
          setIsCheckoutSubmit(false);
          setProcessingPayment(false);
        }
      } catch (err) {
        console.error('Payment error:', err);
        notifyError(
          'There was a problem processing your payment. Please try again.'
        );
        setIsCheckoutSubmit(false);
        setProcessingPayment(false);
      }
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
  };
};

export default useCheckoutSubmit;
