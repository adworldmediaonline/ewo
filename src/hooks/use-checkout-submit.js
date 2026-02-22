'use client';
import {
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, hideCartConfirmation } from '@/redux/features/cartSlice';
import {
  useCalculateTaxMutation,
  useCreatePaymentIntentMutation,
  useSaveOrderMutation,
} from '@/redux/features/order/orderApi';
import {
  begin_checkout_submission,
  end_checkout_submission,
  set_client_secret,
  set_shipping,
  set_tax_preview,
} from '@/redux/features/order/orderSlice';
import { notifyError, notifySuccess } from '@/utils/toast';
import { authClient } from '../lib/authClient';
import useCartInfo from './use-cart-info';
import { useCartSummary } from './use-cart-summary';

const useCheckoutSubmit = () => {
  const { data: session } = authClient.useSession();

  const [saveOrder] = useSaveOrderMutation();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [calculateTax, { isLoading: isTaxLoading }] = useCalculateTaxMutation();
  const { cart_products, couponCode, discountAmount } = useSelector(state => state.cart);

  const { tax_preview } = useSelector(state => state.order);
  const { total, setTotal } = useCartInfo();
  const { displayTotal, effectiveShippingCost } = useCartSummary();

  const [cartTotal, setCartTotal] = useState('');
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [cardError, setCardError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
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
    watch,
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

  const taxDebounceRef = useRef(null);

  const address = watch('address');
  const city = watch('city');
  const stateVal = watch('state');
  const zipCode = watch('zipCode');
  const country = watch('country');

  const addressKey = `${address?.trim() || ''}|${city?.trim() || ''}|${stateVal?.trim() || ''}|${zipCode?.trim() || ''}|${country?.trim() || ''}`;

  useEffect(() => {
    const hasCompleteAddress =
      address?.trim() && city?.trim() && stateVal?.trim() && zipCode?.trim() && country?.trim();

    if (
      !hasCompleteAddress ||
      !cart_products?.length ||
      isCheckoutSubmit ||
      processingPayment
    ) {
      dispatch(set_tax_preview(null));
      return;
    }

    if (taxDebounceRef.current) {
      clearTimeout(taxDebounceRef.current);
    }

    taxDebounceRef.current = setTimeout(() => {
      calculateTax({
        cart: cart_products,
        orderData: {
          address: address?.trim(),
          city: city?.trim(),
          state: stateVal?.trim(),
          zipCode: zipCode?.trim(),
          country: country?.trim(),
          shippingCost: Number(effectiveShippingCost) || 0,
          discountAmount: Number(discountAmount ?? 0) || 0,
        },
      }).catch(() => {
        dispatch(set_tax_preview(null));
      });
      taxDebounceRef.current = null;
    }, 500);

    return () => {
      if (taxDebounceRef.current) {
        clearTimeout(taxDebounceRef.current);
      }
    };
  }, [
    addressKey,
    cart_products,
    isCheckoutSubmit,
    processingPayment,
    calculateTax,
    dispatch,
    effectiveShippingCost,
    discountAmount,
  ]);

  useEffect(() => {
    return () => {
      dispatch(set_tax_preview(null));
    };
  }, [dispatch]);

  useEffect(() => {
    setCartTotal(Number(displayTotal).toFixed(2));
  }, [displayTotal]);

  const calculateTotals = () => {
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
      const cartSubtotal = cart_products.reduce((sum, item) => {
        const quantity = Number(item?.orderQuantity || 0);
        const price = Number(item?.price || 0);
        if (isNaN(quantity) || isNaN(price)) return sum;
        return sum + quantity * price;
      }, 0);

      return {
        cartSubtotal: Math.round(cartSubtotal * 100) / 100,
        totalDiscount: 0,
        finalTotal: Math.round(cartSubtotal * 100) / 100,
      };
    } catch (error) {
      return {
        cartSubtotal: 0,
        totalDiscount: 0,
        finalTotal: 0,
      };
    }
  };

  const createStripePaymentIntent = async orderData => {
    try {
      const orderPayload = {
        ...orderData,
        totalAmount: Math.max(0, cartTotal),
        isGuestOrder: !session?.user?.id,
      };

      if (tax_preview?.calculationId && tax_preview?.taxCollected) {
        orderPayload.calculationId = tax_preview.calculationId;
        orderPayload.taxCollected = tax_preview.taxCollected;
      }

      const response = await createPaymentIntent({
        price: Math.max(0, parseFloat(cartTotal) || 0),
        email: orderData.email,
        cart: cart_products,
        orderData: orderPayload,
      });

      const responseData = response.data || response;
      if (responseData.isFreeOrder) {
        return { isFreeOrder: true, totalAmount: responseData.totalAmount };
      }

      const clientSecret = responseData.clientSecret;

      if (!clientSecret) {
        throw new Error('Failed to get client secret from payment intent');
      }

      setClientSecret(clientSecret);
      dispatch(set_client_secret(clientSecret));

      return {
        clientSecret,
        taxAmount: responseData.taxAmount,
        totalAmount: responseData.totalAmount,
      };
    } catch (error) {
      throw error;
    }
  };

  const submitHandler = async data => {
    const newShippingInfo = {
      ...data,
      shippingOption: 'Free',
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    };
    dispatch(set_shipping(newShippingInfo));
    setIsCheckoutSubmit(true);
    dispatch(begin_checkout_submission());

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

    const rawSubTotal =
      cart_products?.reduce(
        (acc, item) => acc + Number(item.finalPriceDiscount || item.price || 0) * item.orderQuantity,
        0
      ) || 0;

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
      subTotal: rawSubTotal,
      totalAmount: finalTotalAmount,
      discount: discountAmount ?? 0,
      shippingCost: Number(effectiveShippingCost) || 0,
      discountAmount: Number(discountAmount ?? 0) || 0,
      ...(couponCode && discountAmount > 0 && {
        appliedCoupon: {
          couponCode,
          discountAmount,
          discount: discountAmount,
        },
      }),
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
      ...(newShippingInfo.orderNote && { orderNote: newShippingInfo.orderNote.trim() }),
    };

    const card = elements?.getElement(CardNumberElement);

    if (!stripe || !elements) {
      return;
    }
    if (!card) {
      notifyError('Please enter your card information');
      setIsCheckoutSubmit(false);
      dispatch(end_checkout_submission());
      return;
    }

    if (newShippingInfo.shippingOption === 'COD') {
      orderInfo.paymentMethod = 'COD';

      saveOrder(orderInfo)
        .then(res => {
          const orderId =
            res.data?.order?._id ||
            res.order?._id ||
            res.data?.order?.invoice ||
            res.order?.invoice;

          setOrderDataForModal({
            orderId: orderId,
            customOrderId: res.data?.order?.orderId,
          });
          setShowThankYouModal(true);

          localStorage.removeItem('cart_products');
          localStorage.removeItem('shipping_info');

          dispatch(clearCart());
          dispatch(hideCartConfirmation());

          setIsCheckoutSubmit(false);
          setProcessingPayment(false);
          dispatch(end_checkout_submission());
        })
        .catch(() => {
          notifyError(
            'Something went wrong with your order. Please try again.'
          );
          setIsCheckoutSubmit(false);
          dispatch(end_checkout_submission());
        });
    } else {
      if (cart_products?.length === 0) {
        notifyError('Please add products to cart first');
        setIsCheckoutSubmit(false);
        dispatch(end_checkout_submission());
        return;
      }

      try {
        setProcessingPayment(true);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: card,
        });

        if (error) {
          setCardError(error.message);

          const productSummary =
            cart_products.length > 1
              ? `${cart_products[0].title} and ${cart_products.length - 1} more items`
              : cart_products[0]?.title || 'your items';

          notifyError(
            `We couldn't process your card for ${productSummary}. Please check your card details.`
          );
          setIsCheckoutSubmit(false);
          setProcessingPayment(false);
          dispatch(end_checkout_submission());
          return;
        }

        try {
          const paymentResult = await createStripePaymentIntent({
            ...orderInfo,
            cardInfo: paymentMethod,
          });

          if (paymentResult.isFreeOrder) {
            localStorage.removeItem('cart_products');

            setIsCheckoutSubmit(false);
            setProcessingPayment(false);

            saveOrder({
              ...orderInfo,
              paymentMethod: 'Free Order',
              isPaid: true,
              paidAt: new Date(),
              paymentInfo: {
                id: `free_order_${Date.now()}`,
                status: 'succeeded',
                amount_received: 0,
                currency: 'usd',
                payment_method_types: ['card'],
              },
            })
              .then(res => {
                const orderId =
                  res.data?.order?._id ||
                  res.order?._id ||
                  res.data?.order?.invoice ||
                  res.order?.invoice;

                setOrderDataForModal({
                  orderId: orderId,
                  customOrderId: res.data?.order?.orderId,
                });
                setShowThankYouModal(true);

                notifySuccess(
                  '🎉 Your free order has been placed successfully!'
                );
              })
              .catch(() => {
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

          const secret = paymentResult.clientSecret;
          const paymentTaxAmount = paymentResult.taxAmount;
          const paymentTotalAmount = paymentResult.totalAmount;

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

            const productSummary =
              cart_products.length > 1
                ? `${cart_products[0].title} and ${cart_products.length - 1} more items`
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

          if (paymentIntent.status === 'succeeded') {
            setPaymentSuccessful(true);

            localStorage.removeItem('cart_products');
            localStorage.removeItem('shipping_info');

            dispatch(clearCart());
            dispatch(hideCartConfirmation());

            setIsCheckoutSubmit(false);
            setProcessingPayment(false);

            const orderToSave = {
              ...orderInfo,
              paymentInfo: paymentIntent,
              isPaid: true,
              paidAt: new Date(),
            };
            if (paymentTaxAmount !== undefined && paymentTaxAmount > 0) {
              orderToSave.taxAmount = paymentTaxAmount;
            }
            if (paymentTotalAmount !== undefined && paymentTotalAmount > 0) {
              orderToSave.totalAmount = paymentTotalAmount;
            }
            saveOrder(orderToSave)
              .then(res => {
                const orderId =
                  res.data?.order?._id ||
                  res.order?._id ||
                  res.data?.order?.invoice ||
                  res.order?.invoice;

                setTimeout(() => {
                  setPaymentSuccessful(false);
                  router.push(`/order/${orderId}`);
                }, 1500);
              })
              .catch(() => {
                setPaymentSuccessful(false);
                const productSummary =
                  cart_products.length > 1
                    ? `${cart_products[0].title} and ${cart_products.length - 1} other items`
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

  const handleThankYouModalClose = () => {
    setShowThankYouModal(false);
  };

  const handleThankYouModalContinue = () => {
    setShowThankYouModal(false);

    const orderId = orderDataForModal?.orderId;

    if (orderId) {
      router.push(`/order/${orderId}`);
    } else {
      router.push('/order');
    }
  };

  return {
    handleSubmit,
    submitHandler,
    register,
    errors,
    setValue,
    cardError,
    total,
    cartTotal,
    isCheckoutSubmit,
    setTotal,
    stripe,
    control,
    clientSecret,
    setClientSecret,
    showCard,
    setShowCard,
    processingPayment,
    paymentSuccessful,
    calculateTotals,
    tax_preview,
    isTaxLoading,
    showThankYouModal,
    orderDataForModal,
    handleThankYouModalClose,
    handleThankYouModalContinue,
  };
};

export default useCheckoutSubmit;
