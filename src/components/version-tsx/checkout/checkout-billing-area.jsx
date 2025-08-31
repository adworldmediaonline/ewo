'use client';
import useCartInfo from '@/hooks/use-cart-info';
import { authClient } from '@/lib/authClient';
import { useGetAllActiveCouponsQuery } from '@/redux/features/coupon/couponApi';
import { load_applied_coupons } from '@/redux/features/coupon/couponSlice';
import { reset_address_discount } from '@/redux/features/order/orderSlice';
import { CardElement } from '@stripe/react-stripe-js';
import { City, Country, State } from 'country-state-city';
import { useSearchParams } from 'next/navigation';
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
  const { data: session } = authClient.useSession();
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
    totalShippingCost,
    shippingDiscount,
    firstTimeDiscount,
    addressDiscountAmount,
  } = useSelector(state => state.cart);

  const { total, subtotal, firstTimeDiscountAmount } = useCartInfo();

  // Enhanced multiple coupon state - get coupon discount from coupon state like cart dropdown
  const {
    applied_coupons,
    total_coupon_discount,
    coupon_error,
    coupon_loading,
  } = useSelector(state => state.coupon);

  // Get URL search parameters for auto-fill functionality
  const searchParams = useSearchParams();

  // Fetch all active coupons from backend for smart auto-fill
  const {
    data: activeCouponsData,
    isLoading: couponsLoading,
    isError: couponsError,
  } = useGetAllActiveCouponsQuery();

  // State to store the auto-filled coupon info for percentage display
  const [autoFilledCoupon, setAutoFilledCoupon] = useState(null);

  // Load applied coupons on component mount
  useEffect(() => {
    dispatch(load_applied_coupons());
  }, [dispatch]);

  // Smart auto-fill coupon code from various sources including backend
  useEffect(() => {
    const autoFillCouponCode = () => {
      console.log('🎟️ Auto-fill: Starting smart coupon auto-fill check...');
      console.log('🎟️ Auto-fill: couponsLoading:', couponsLoading);
      console.log('🎟️ Auto-fill: activeCouponsData:', activeCouponsData);
      console.log('🎟️ Auto-fill: couponRef.current:', couponRef.current);
      console.log('🎟️ Auto-fill: applied_coupons:', applied_coupons);

      // Don't proceed if coupons are still loading or ref is not available
      if (couponsLoading || !couponRef.current || couponRef.current.value) {
        if (couponsLoading)
          console.log('⏳ Auto-fill: Still loading coupons...');
        if (!couponRef.current)
          console.log('⚠️ Auto-fill: couponRef not available');
        if (couponRef.current?.value)
          console.log(
            'ℹ️ Auto-fill: Input field already has value:',
            couponRef.current.value
          );
        return;
      }

      let couponCodeToFill = null;

      // Priority order for coupon sources:
      // 1. URL parameter 'coupon' or 'couponCode' or 'code' (highest priority)
      // 2. localStorage 'pendingCouponCode'
      // 3. Smart selection from backend active coupons (best coupon logic)

      // Check URL parameters first (highest priority)
      const urlCoupon =
        searchParams.get('coupon') ||
        searchParams.get('couponCode') ||
        searchParams.get('code');

      if (urlCoupon) {
        couponCodeToFill = urlCoupon.trim();
        console.log('🎟️ Auto-fill: Found URL coupon:', couponCodeToFill);
      }

      // Check localStorage for pending coupon
      if (!couponCodeToFill) {
        const pendingCoupon = localStorage.getItem('pendingCouponCode');
        if (pendingCoupon) {
          console.log(
            '🎟️ Auto-fill: Found localStorage coupon:',
            pendingCoupon
          );
          try {
            const parsed = JSON.parse(pendingCoupon);
            couponCodeToFill =
              typeof parsed === 'string' ? parsed : parsed.code;
          } catch {
            couponCodeToFill = pendingCoupon;
          }
        } else {
          console.log('🎟️ Auto-fill: No localStorage coupon found');
        }
      }

      // Smart selection from backend active coupons (if no URL/localStorage coupon)
      if (
        !couponCodeToFill &&
        activeCouponsData?.success &&
        activeCouponsData?.data?.length > 0
      ) {
        console.log('🎟️ Auto-fill: Looking for best coupon from backend...');

        const availableCoupons = activeCouponsData.data.filter(coupon => {
          // Filter out already applied coupons
          const isAlreadyApplied = applied_coupons.some(
            appliedCoupon =>
              appliedCoupon.couponCode?.toLowerCase() ===
              coupon.couponCode?.toLowerCase()
          );
          return (
            !isAlreadyApplied && coupon.status === 'active' && coupon.couponCode
          );
        });

        console.log('🎟️ Auto-fill: Available coupons:', availableCoupons);

        if (availableCoupons.length > 0) {
          // Smart logic to select the best coupon:
          // 1. Priority by discount amount (highest first)
          // 2. Priority by minimum amount (lowest first, easier to qualify)
          // 3. Priority by discount percentage (highest first)

          const bestCoupon = availableCoupons.reduce((best, current) => {
            // Priority 1: Higher discount amount
            const bestDiscount = best.discountAmount || 0;
            const currentDiscount = current.discountAmount || 0;

            if (currentDiscount > bestDiscount) return current;
            if (currentDiscount < bestDiscount) return best;

            // Priority 2: Lower minimum amount (easier to qualify)
            const bestMinimum = best.minimumAmount || 0;
            const currentMinimum = current.minimumAmount || 0;

            if (currentMinimum < bestMinimum) return current;
            if (currentMinimum > bestMinimum) return best;

            // Priority 3: Higher discount percentage
            const bestPercentage = best.discountPercentage || 0;
            const currentPercentage = current.discountPercentage || 0;

            return currentPercentage > bestPercentage ? current : best;
          });

          couponCodeToFill = bestCoupon.couponCode;
          setAutoFilledCoupon(bestCoupon); // Store the coupon data for percentage display

          console.log('🎯 Auto-fill: Selected best coupon:', {
            code: bestCoupon.couponCode,
            discountAmount: bestCoupon.discountAmount,
            discountPercentage: bestCoupon.discountPercentage,
            minimumAmount: bestCoupon.minimumAmount,
            title: bestCoupon.title,
          });
        } else {
          console.log('ℹ️ Auto-fill: No available coupons to auto-fill');
        }
      }

      // If we found a coupon code and the input field is available and empty
      if (couponCodeToFill && couponRef.current && !couponRef.current.value) {
        // Check if this coupon is not already applied
        const isAlreadyApplied = applied_coupons.some(
          coupon =>
            coupon.couponCode?.toLowerCase() === couponCodeToFill.toLowerCase()
        );

        console.log('🎟️ Auto-fill: isAlreadyApplied:', isAlreadyApplied);

        if (!isAlreadyApplied) {
          couponRef.current.value = couponCodeToFill;
          console.log('✅ Auto-filled coupon code:', couponCodeToFill);

          // Clear the localStorage after auto-filling to prevent re-filling
          if (localStorage.getItem('pendingCouponCode')) {
            localStorage.removeItem('pendingCouponCode');
            console.log('🎟️ Auto-fill: Cleared localStorage');
          }
        } else {
          console.log(
            '⚠️ Auto-fill: Coupon already applied, skipping auto-fill'
          );
        }
      } else {
        if (!couponCodeToFill) {
          console.log('ℹ️ Auto-fill: No coupon code found to auto-fill');
        } else if (!couponRef.current) {
          console.log('⚠️ Auto-fill: couponRef not available');
        } else if (couponRef.current.value) {
          console.log(
            'ℹ️ Auto-fill: Input field already has value:',
            couponRef.current.value
          );
        }
      }
    };

    // Small delay to ensure the ref is available and coupons are loaded
    const timeoutId = setTimeout(autoFillCouponCode, 200);

    return () => clearTimeout(timeoutId);
  }, [
    searchParams,
    applied_coupons,
    couponRef,
    activeCouponsData,
    couponsLoading,
  ]);

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
  }, [selectedCountry, selectedState]);

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

  // Calculate final total with all discounts - Simplified to match cart dropdown logic
  const calculateFinalTotal = () => {
    // Use the same logic as cart dropdown for consistency
    // total already includes first-time discount, so use it directly
    const baseTotal = Number(total) || 0;
    const shipping = Number(totalShippingCost) || 0;
    const couponDiscount = Number(total_coupon_discount) || 0;
    const addressDiscount = Number(addressDiscountAmount) || 0;

    // Calculate: Base Total + Shipping - Coupon Discounts - Address Discount
    const finalTotal = baseTotal + shipping - couponDiscount - addressDiscount;

    // Ensure total doesn't go below 0
    return Math.max(0, finalTotal);
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

            {/* Auto-fill helper messages */}
            {couponsLoading && (
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-primary animate-spin"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1h-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Looking for the best coupon for you...
              </div>
            )}

            {!couponsLoading &&
              couponRef.current?.value &&
              applied_coupons.length === 0 &&
              autoFilledCoupon &&
              autoFilledCoupon.discountPercentage && (
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Best Coupon Found!
                        </p>
                        <p className="text-xs text-green-600">
                          Click Apply to save{' '}
                          {autoFilledCoupon.discountPercentage}% on your order
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white">
                        {autoFilledCoupon.discountPercentage}% OFF
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {couponsError && (
              <div className="text-sm text-destructive mt-1 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Unable to load coupons. Please enter manually.
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
                          <span className="font-medium text-foreground">
                            -${Number(coupon.discount || 0).toFixed(2)}
                          </span>
                        </div>
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
                ${(Number(subtotal) || 0).toFixed(2)}
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
