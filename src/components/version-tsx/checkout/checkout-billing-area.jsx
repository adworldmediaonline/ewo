'use client';
import useCartInfo from '@/hooks/use-cart-info';
import { authClient } from '@/lib/authClient';
import { load_applied_coupons } from '@/redux/features/coupon/couponSlice';
import { reset_address_discount } from '@/redux/features/order/orderSlice';
import { CardElement } from '@stripe/react-stripe-js';
import { City, Country, State } from 'country-state-city';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorMsg from '../../common/error-msg';

const CheckoutBillingArea = ({
  register,
  errors,
  isGuest = false,
  setValue,
  checkoutData,
}) => {
  const { data: session, isPending } = authClient.useSession();
  const { user } = useSelector(state => state.auth);
  const { isCheckoutSubmitting } = useSelector(state => state.order);
  const dispatch = useDispatch();

  const {
    stripe,
    isCheckoutSubmit,
    processingPayment,
    cardError,
    register: checkoutRegister,
    handleCouponSubmit,
    handleRemoveCoupon,
    handleClearAllCoupons,
    couponRef,
    couponApplyMsg,
  } = checkoutData;

  const {
    cart_products,
    totalShippingCost,
    shippingDiscount,
    firstTimeDiscount,
    total_coupon_discount,
    discountAmount,
    addressDiscountAmount,
  } = useSelector(state => state.cart);

  const { total, totalWithShipping, subtotal, firstTimeDiscountAmount } =
    useCartInfo();

  // Enhanced multiple coupon state
  const { applied_coupons, coupon_error, coupon_loading } = useSelector(
    state => state.coupon
  );

  // Load applied coupons on component mount
  useEffect(() => {
    dispatch(load_applied_coupons());
  }, [dispatch]);

  const countries = Country.getAllCountries();
  const defaultCountry = countries.find(country => country.isoCode === 'US');

  const [selectedCountry, setSelectedCountry] = useState(
    defaultCountry || null
  );
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [formValues, setFormValues] = useState({
    country: 'US',
    state: '',
    city: '',
    address: '',
    zipCode: '',
  });

  // Set initial form values to prevent validation errors
  useEffect(() => {
    if (user?.firstName) setValue('firstName', user.firstName);
    if (user?.lastName) setValue('lastName', user.lastName);
    if (user?.email) setValue('email', user.email);
    if (defaultCountry) setValue('country', defaultCountry.isoCode);
  }, [user, setValue, defaultCountry]);

  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(countryStates);

      setFormValues(prev => ({
        ...prev,
        country: selectedCountry.isoCode,
      }));
    }
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(countryStates);

      if (selectedState) {
        setSelectedState(null);
        setSelectedCity('');
        setFormValues(prev => ({
          ...prev,
          state: '',
          city: '',
        }));
      }
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      setCities(stateCities);
    }
  }, [selectedCountry, selectedState]);

  const handleCountryChange = e => {
    if (isCheckoutSubmitting) return;

    const countryCode = e.target.value;
    if (!countryCode) return;

    dispatch(reset_address_discount());

    const country = countries.find(c => c.isoCode === countryCode);
    setSelectedCountry(country);

    setValue('country', countryCode);
    setValue('state', '');
    setValue('city', '');

    setFormValues(prev => ({
      ...prev,
      country: countryCode,
      state: '',
      city: '',
    }));
  };

  const handleStateChange = e => {
    if (isCheckoutSubmitting) return;

    const stateCode = e.target.value;
    if (!stateCode) return;

    dispatch(reset_address_discount());

    const state = states.find(s => s.isoCode === stateCode);
    setSelectedState(state);

    setValue('state', stateCode);
    setValue('city', '');

    setFormValues(prev => ({
      ...prev,
      state: stateCode,
      city: '',
    }));
  };

  const handleCityChange = e => {
    if (isCheckoutSubmitting) return;

    const cityName = e.target.value;

    dispatch(reset_address_discount());

    setSelectedCity(cityName);

    setValue('city', cityName);

    setFormValues(prev => ({
      ...prev,
      city: cityName,
    }));
  };

  const handleAddressChange = e => {
    if (isCheckoutSubmitting) return;

    const address = e.target.value;

    dispatch(reset_address_discount());

    setValue('address', address);

    setFormValues(prev => ({
      ...prev,
      address,
    }));
  };

  const handleZipCodeChange = e => {
    if (isCheckoutSubmitting) return;

    const zipCode = e.target.value;

    dispatch(reset_address_discount());

    setValue('zipCode', zipCode);

    setFormValues(prev => ({
      ...prev,
      zipCode,
    }));
  };

  // Calculate discount percentage to display
  const discountPercentage =
    shippingDiscount > 0 ? (shippingDiscount * 100).toFixed(0) : 0;

  // Calculate final total with all discounts
  const calculateFinalTotal = () => {
    // Ensure we have a valid base total
    const baseTotal = Number(totalWithShipping);

    // If totalWithShipping is NaN or invalid, calculate it manually
    if (isNaN(baseTotal) || baseTotal <= 0) {
      const cartTotal =
        cart_products?.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.orderQuantity),
          0
        ) || 0;

      const shipping = Number(totalShippingCost) || 0;
      const firstTimeDiscountAmt = Number(firstTimeDiscountAmount) || 0;

      const manualTotal = cartTotal + shipping - firstTimeDiscountAmt;

      let finalTotal = manualTotal;

      // Subtract multiple coupon discounts
      if (Number(total_coupon_discount) > 0) {
        finalTotal -= Number(total_coupon_discount);
      } else if (Number(discountAmount) > 0) {
        // Fall back to legacy discount amount
        finalTotal -= Number(discountAmount);
      }

      // Subtract address discount
      const addressDiscount = Number(addressDiscountAmount) || 0;
      if (addressDiscount > 0) {
        finalTotal -= addressDiscount;
      }

      return Math.max(0, finalTotal);
    }

    let finalTotal = baseTotal;

    // Subtract multiple coupon discounts
    if (Number(total_coupon_discount) > 0) {
      finalTotal -= Number(total_coupon_discount);
    } else if (Number(discountAmount) > 0) {
      // Fall back to legacy discount amount
      finalTotal -= Number(discountAmount);
    }

    // Subtract address discount
    const addressDiscount = Number(addressDiscountAmount) || 0;
    if (addressDiscount > 0) {
      finalTotal -= addressDiscount;
    }

    // Ensure total doesn't go below 0 and is a valid number
    const result = Math.max(0, finalTotal);
    return isNaN(result) ? 0 : result;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 border border-border">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Billing Details
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('firstName', {
                    required: `First Name is required!`,
                  })}
                  name="firstName"
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  defaultValue={user?.firstName}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <ErrorMsg msg={errors?.firstName?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('lastName', {
                    required: `Last Name is required!`,
                  })}
                  name="lastName"
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <ErrorMsg msg={errors?.lastName?.message} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Country <span className="text-destructive">*</span>
              </label>
              <select
                {...register('country', {
                  required: `Country is required!`,
                  onChange: e => {
                    handleCountryChange(e);
                  },
                })}
                name="country"
                id="country"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                defaultValue={formValues.country}
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
              <ErrorMsg msg={errors?.country?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Street address <span className="text-destructive">*</span>
              </label>
              <input
                {...register('address', {
                  required: `Address is required!`,
                  onChange: e => {
                    handleAddressChange(e);
                  },
                })}
                name="address"
                id="address"
                type="text"
                placeholder="House number and street name"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <ErrorMsg msg={errors?.address?.message} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('city', {
                    required: `City is required!`,
                    onChange: e => {
                      handleCityChange(e);
                    },
                  })}
                  name="city"
                  id="city"
                  type="text"
                  placeholder="Enter city"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <ErrorMsg msg={errors?.city?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State <span className="text-destructive">*</span>
                </label>
                <select
                  {...register('state', {
                    required: `State is required!`,
                    onChange: e => {
                      handleStateChange(e);
                    },
                  })}
                  name="state"
                  id="state"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  defaultValue={formValues.state}
                  disabled={!selectedCountry}
                >
                  <option value="">Enter state</option>
                  {states.map(state => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <ErrorMsg msg={errors?.state?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ZIP Code <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('zipCode', {
                    required: `ZIP Code is required!`,
                    onChange: e => {
                      handleZipCodeChange(e);
                    },
                  })}
                  name="zipCode"
                  id="zipCode"
                  type="text"
                  placeholder="Enter ZIP code"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <ErrorMsg msg={errors?.zipCode?.message} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone <span className="text-destructive">*</span>
              </label>
              <input
                {...register('contactNo', {
                  required: `ContactNumber is required!`,
                })}
                name="contactNo"
                id="contactNo"
                type="text"
                placeholder="Phone"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <ErrorMsg msg={errors?.contactNo?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email address <span className="text-destructive">*</span>
              </label>
              <input
                {...register('email', { required: `Email is required!` })}
                name="email"
                id="email"
                type="email"
                placeholder="Email"
                defaultValue={user?.email}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <ErrorMsg msg={errors?.email?.message} />
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="border-t border-border pt-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Order Summary
          </h3>

          {/* Coupon Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <input
                ref={couponRef}
                type="text"
                placeholder="Add coupon code"
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                disabled={
                  coupon_loading || isCheckoutSubmit || processingPayment
                }
              />
              <button
                type="button"
                onClick={handleCouponSubmit}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                disabled={
                  coupon_loading || isCheckoutSubmit || processingPayment
                }
              >
                {coupon_loading ? 'Applying...' : 'Apply'}
              </button>
            </div>

            {/* Enhanced coupon messages */}
            {couponApplyMsg && (
              <div className="text-sm text-destructive mt-1">
                {couponApplyMsg}
              </div>
            )}

            {/* Display multiple applied coupons */}
            {applied_coupons.length > 0 && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground text-sm">
                    Applied Coupons ({applied_coupons.length})
                  </h4>
                  {applied_coupons.length > 1 && (
                    <button
                      type="button"
                      onClick={handleClearAllCoupons}
                      className="text-xs text-destructive hover:text-destructive/90 underline"
                      disabled={isCheckoutSubmit || processingPayment}
                    >
                      Remove All
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {applied_coupons.map((coupon, index) => (
                    <div
                      key={coupon.couponCode || index}
                      className="flex items-center justify-between p-2 bg-background rounded text-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">
                            {coupon.couponCode}
                          </span>
                          <span className="text-muted-foreground">
                            {coupon.title}
                          </span>
                          <span className="font-medium text-foreground">
                            -${Number(coupon.discount || 0).toFixed(2)}
                          </span>
                        </div>
                        {coupon.applicableProductNames &&
                          coupon.applicableProductNames.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Applied to:{' '}
                              {coupon.applicableProductNames
                                .slice(0, 2)
                                .join(', ')}
                              {coupon.applicableProductNames.length > 2 &&
                                ` +${
                                  coupon.applicableProductNames.length - 2
                                } more`}
                            </span>
                          )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoupon(coupon.couponCode)}
                        className="text-destructive hover:text-destructive/90 ml-2"
                        disabled={isCheckoutSubmit || processingPayment}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                $
                {(
                  Number(firstTimeDiscount.isApplied ? subtotal : total) || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-foreground">
                ${(Number(totalShippingCost) || 0).toFixed(2)}
                {discountPercentage > 0 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded">
                    {discountPercentage}% off
                  </span>
                )}
              </span>
            </div>

            {/* Multiple coupon discounts display */}
            {Number(total_coupon_discount) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Coupon Discounts
                  {applied_coupons.length > 1 && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {applied_coupons.length} coupons
                    </span>
                  )}
                </span>
                <span className="font-medium text-foreground">
                  -${Number(total_coupon_discount).toFixed(2)}
                </span>
              </div>
            )}

            {/* Legacy fallback for single coupon */}
            {Number(total_coupon_discount) === 0 &&
              Number(discountAmount) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Coupon Discount</span>
                  <span className="font-medium text-foreground">
                    -${Number(discountAmount).toFixed(2)}
                  </span>
                </div>
              )}

            {/* Address discount */}
            {Number(addressDiscountAmount) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Address Discount</span>
                <span className="font-medium text-foreground">
                  -${Number(addressDiscountAmount).toFixed(2)}
                </span>
              </div>
            )}

            {/* First-time discount */}
            {firstTimeDiscount.isApplied > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  First-time order discount (-{firstTimeDiscount.percentage}
                  %)
                </span>
                <span className="font-medium text-green-600">
                  -${(Number(firstTimeDiscountAmount) || 0).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-lg font-semibold text-foreground">
                Total
              </span>
              <span className="text-lg font-semibold text-foreground">
                ${calculateFinalTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="border-t border-border pt-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">
            Payment Information
          </h4>
          <div className="p-4 bg-muted rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                    fontFamily: 'var(--font-lato), "Lato", sans-serif',
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
            {cardError && (
              <div className="mt-2 text-destructive text-sm">
                <small>Payment could not be processed:</small>
                <strong>{cardError}</strong>
                <div>
                  <small>Please check your card details and try again.</small>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Secure Checkout Badge */}
        <div className="flex items-start space-x-3 p-4 bg-muted rounded-md">
          <svg
            className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div className="font-medium text-foreground">
              Secure Checkout - SSL Encrypted
            </div>
            <div className="text-sm text-muted-foreground">
              Ensuring your financial and personal details are secure during
              every transaction.
            </div>
          </div>
        </div>

        {/* Complete Purchase Button */}
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
            `Complete Purchase - $${calculateFinalTotal().toFixed(2)}`
          )}
        </button>

        {/* Hidden payment and shipping inputs for form validation */}
        <div style={{ display: 'none' }}>
          <input
            {...checkoutRegister(`shippingOption`, {
              required: `Shipping Option is required!`,
            })}
            type="radio"
            name="shippingOption"
            value="calculated"
            defaultChecked
          />
          <input
            {...checkoutRegister(`payment`, {
              required: `Payment Option is required!`,
            })}
            type="radio"
            name="payment"
            value="Card"
            defaultChecked
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutBillingArea;
