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
import { clearCart } from '@/redux/features/cartSlice';

const useCheckoutSubmit = () => {
  // offerCoupons
  const { data: offerCoupons, isError, isLoading } = useGetOfferCouponsQuery();
  // addOrder
  const [saveOrder, { isLoading: isSavingOrder }] = useSaveOrderMutation();
  // createPaymentIntent
  const [createPaymentIntent, { isLoading: isCreatingIntent }] =
    useCreatePaymentIntentMutation();
  // cart_products and totalShippingCost
  const { cart_products, totalShippingCost } = useSelector(state => state.cart);
  // user
  const { user } = useSelector(state => state.auth);
  // shipping_info
  const { shipping_info } = useSelector(state => state.order);
  // total amount
  const { total, setTotal, totalWithShipping } = useCartInfo();
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
  // order reference ID to prevent duplicates
  const [orderReferenceId, setOrderReferenceId] = useState('');

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

  // Generate a unique order reference ID
  useEffect(() => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    setOrderReferenceId(`order-${timestamp}-${random}`);
  }, []);

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

  // Use shipping cost from cart state directly
  useEffect(() => {
    if (totalShippingCost !== undefined) {
      setShippingCost(totalShippingCost);
    }
  }, [totalShippingCost]);

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

    // Ensure all values are properly formatted to avoid floating point issues
    const subTotal = parseFloat(
      (total + parseFloat(shippingCost.toFixed(2))).toFixed(2)
    );
    const discountTotal = parseFloat(
      (discountProductTotal * (discountPercentage / 100)).toFixed(2)
    );
    const totalValue = parseFloat((subTotal - discountTotal).toFixed(2));

    setDiscountAmount(discountTotal);
    setCartTotal(totalValue);
  }, [
    total,
    shippingCost,
    discountPercentage,
    cart_products,
    discountProductType,
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
    setShippingCost(parseFloat(value));
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
      // Check if user is logged in
      const isAuthenticate = Cookies.get('userInfo');
      const isGuestCheckout = !isAuthenticate;

      // Log the reference ID to make sure it's being used
      console.log(
        'Creating payment intent with reference ID:',
        orderReferenceId
      );

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
          totalAmount: parseFloat(cartTotal.toFixed(2)),
          isGuestOrder: isGuestCheckout,
          orderReferenceId: orderReferenceId, // Include reference ID to prevent duplicates
          shippingCost: parseFloat(shippingCost.toFixed(2)),
          discount: parseFloat(discountAmount.toFixed(2)),
          // Add all shipping details to ensure they're in the webhook
          address: orderData.address,
          contact: orderData.contactNo,
          city: orderData.city,
          country: orderData.country,
          zipCode: orderData.zipCode,
        },
      });

      return response.data.clientSecret;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  };

  // Handle successful order completion
  const handleOrderCompletion = orderId => {
    // Clear cart data
    dispatch(clearCart());
    localStorage.removeItem('couponInfo');
    localStorage.removeItem('cart_products');

    // Show success message
    notifySuccess('Your order has been placed successfully!');

    // Redirect to order details page
    router.push(`/order/${orderId}`);
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
      subTotal: parseFloat(total.toFixed(2)),
      shippingCost: parseFloat(shippingCost.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)),
      totalAmount: parseFloat(cartTotal.toFixed(2)),
      orderNote: data.orderNote,
      isGuestOrder: isGuestCheckout,
      orderReferenceId: orderReferenceId, // Include reference ID for webhook matching
    };

    // Only add user ID if the user is logged in
    if (!isGuestCheckout && user?._id) {
      orderInfo.user = user._id;
    }

    try {
      if (data.payment === 'Card') {
        if (!stripe || !elements) {
          setIsCheckoutSubmit(false);
          return;
        }

        const card = elements.getElement(CardElement);
        if (card == null) {
          setIsCheckoutSubmit(false);
          return;
        }

        setProcessingPayment(true);
        setCardError('');

        try {
          // Step 1: Validate the card
          const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
          });

          if (error) {
            setCardError(error.message);
            setIsCheckoutSubmit(false);
            setProcessingPayment(false);
            return;
          }

          // Step 2: Create payment intent with order data
          const secret = await createStripePaymentIntent({
            ...orderInfo,
            cardInfo: paymentMethod,
          });

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
            setCardError(confirmError.message);
            setIsCheckoutSubmit(false);
            setProcessingPayment(false);
            return;
          }

          // Step 4: Payment confirmed by Stripe
          if (paymentIntent.status === 'succeeded') {
            console.log(
              'Payment succeeded, creating order with reference ID:',
              orderReferenceId
            );

            // Always create the order in the frontend, never depend on the webhook
            const orderResponse = await saveOrder({
              ...orderInfo,
              paymentIntent: {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                status: paymentIntent.status,
              },
              isPaid: true,
              paidAt: new Date(),
              // The webhook will only update this order, not create a new one
            });

            if (orderResponse.data?.order?._id) {
              handleOrderCompletion(orderResponse.data.order._id);
            } else {
              // Fallback if order ID is not returned
              router.push('/order');
            }
          }
        } catch (err) {
          console.error('Payment error:', err);
          notifyError('There was a problem processing your payment');
          setIsCheckoutSubmit(false);
          setProcessingPayment(false);
        }
      } else if (data.payment === 'COD') {
        // For Cash on Delivery, create order directly
        const orderResponse = await saveOrder({
          ...orderInfo,
        });

        if (orderResponse.data?.order?._id) {
          handleOrderCompletion(orderResponse.data.order._id);
        } else {
          notifyError('Error creating your order');
          setIsCheckoutSubmit(false);
        }
      }
    } catch (err) {
      console.error('Order submission error:', err);
      notifyError('Error creating your order');
      setIsCheckoutSubmit(false);
      setProcessingPayment(false);
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
    orderReferenceId,
  };
};

export default useCheckoutSubmit;
