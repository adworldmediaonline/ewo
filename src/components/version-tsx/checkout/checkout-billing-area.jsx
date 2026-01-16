'use client';
import useCartInfo from '@/hooks/use-cart-info';
import { authClient } from '@/lib/authClient';
import { reset_address_discount } from '@/redux/features/order/orderSlice';
import { cn } from '@/lib/utils';

import { Country } from 'country-state-city';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useWatch } from 'react-hook-form';
import ErrorMsg from '../../common/error-msg';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useTaxCalculation } from '@/hooks/use-tax-calculation';

const CheckoutBillingArea = ({ register, errors, setValue, control, checkoutData }) => {
  const { data: session } = authClient.useSession();
  const user = {};
  const { isCheckoutSubmitting } = useSelector(state => state.order);
  const dispatch = useDispatch();

  const {
    stripe,
    isCheckoutSubmit,
    processingPayment,
    cardError,
    register: checkoutRegister,
  } = checkoutData;

  const { totalShippingCost, addressDiscountAmount } = useSelector(
    state => state.cart
  );

  const { total } = useCartInfo();

  // Enhanced multiple coupon state - get coupon discount from coupon state like cart dropdown
  const { total_coupon_discount } = useSelector(state => state.coupon);

  // Tax calculation hook
  const { taxData, calculateTax, isLoading: taxLoading, error: taxError } = useTaxCalculation();
  const { cart_products } = useSelector(state => state.cart);

  // Watch individual address fields for tax calculation
  // Watch each field separately to ensure proper reactivity
  const address = useWatch({ control, name: 'address' });
  const city = useWatch({ control, name: 'city' });
  const state = useWatch({ control, name: 'state' });
  const zipCode = useWatch({ control, name: 'zipCode' });
  const country = useWatch({ control, name: 'country' });

  // Get tax data setter from checkoutData
  const { setTaxData } = checkoutData || {};

  const countries = Country.getAllCountries();
  const defaultCountry = countries.find(country => country.isoCode === 'US');

  const [selectedCountry, setSelectedCountry] = useState(
    defaultCountry || null
  );

  // Set initial form values to prevent validation errors
  useEffect(() => {
    if (user?.firstName) setValue('firstName', user.firstName);
    if (user?.lastName) setValue('lastName', user.lastName);
    if (user?.email) setValue('email', user.email);
    if (defaultCountry) setValue('country', defaultCountry.isoCode);
  }, [user, setValue, defaultCountry]);

  // Calculate tax when ANY address field changes
  // This handles all edge cases: country change, state/city/zip change, address change
  useEffect(() => {
    // Clear tax data immediately if country is not US
    if (country && country !== 'US') {
      if (setTaxData) {
        setTaxData(null);
      }
      return;
    }

    // For US addresses, check if we have minimum required fields
    // Minimum required: state, city, and zipCode (address/line1 is optional for tax calculation)
    const hasMinimumFields = country === 'US' &&
                             state &&
                             state.trim() !== '' &&
                             city &&
                             city.trim() !== '' &&
                             zipCode &&
                             zipCode.trim() !== '';

    // Only calculate if:
    // 1. Country is US
    // 2. We have minimum required fields (state, city, zipCode)
    // 3. Cart has products
    // 4. Shipping cost is valid (>= 0)
    if (hasMinimumFields && cart_products.length > 0 && totalShippingCost >= 0) {
      calculateTax(
        {
          line1: address || '',
          address: address || '',
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          postal_code: zipCode.trim(),
          country: 'US',
        },
        cart_products,
        totalShippingCost
      );
    } else {
      // Clear tax data if address is incomplete
      if (setTaxData) {
        setTaxData(null);
      }
    }
  }, [address, city, state, zipCode, country, cart_products, totalShippingCost, calculateTax, setTaxData]);

  // Update tax data, loading, and error in checkoutData
  useEffect(() => {
    if (setTaxData && taxData) {
      console.log('Setting tax data in checkoutData:', taxData);
      setTaxData(taxData);
    }
    if (checkoutData && typeof checkoutData.setTaxLoading === 'function') {
      checkoutData.setTaxLoading(taxLoading);
    }
    if (checkoutData && typeof checkoutData.setTaxError === 'function') {
      checkoutData.setTaxError(taxError);
    }
  }, [taxData, taxLoading, taxError, setTaxData, checkoutData]);

  const handleCountryChange = e => {
    if (isCheckoutSubmitting) return;

    const countryCode = e.target.value;
    if (!countryCode) return;

    dispatch(reset_address_discount());

    const country = countries.find(c => c.isoCode === countryCode);

    // Update state immediately
    setSelectedCountry(country);

    // Update form values immediately
    setValue('country', countryCode);
  };

  const handleStateChange = e => {
    if (isCheckoutSubmitting) return;

    const stateValue = e.target.value;
    dispatch(reset_address_discount());
    setValue('state', stateValue);
  };

  const handleCityChange = e => {
    if (isCheckoutSubmitting) return;

    const cityValue = e.target.value;
    dispatch(reset_address_discount());
    setValue('city', cityValue);
  };

  const handleAddressChange = e => {
    if (isCheckoutSubmitting) return;

    const address = e.target.value;
    dispatch(reset_address_discount());
    setValue('address', address);
  };

  const handleZipCodeChange = e => {
    if (isCheckoutSubmitting) return;

    const zipCode = e.target.value;
    dispatch(reset_address_discount());
    setValue('zipCode', zipCode);
  };

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
              <Controller
                name="country"
                control={control}
                rules={{ required: 'Country is required!' }}
                render={({ field }) => {
                  const countryOptions = countries.map(country => ({
                    value: country.isoCode,
                    label: country.name,
                  }));

                  return (
                    <>
                      <SearchableSelect
                        options={countryOptions}
                        value={field.value || selectedCountry?.isoCode || 'US'}
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Simulate event for handleCountryChange
                          const syntheticEvent = {
                            target: { value },
                          };
                          handleCountryChange(syntheticEvent);
                        }}
                        placeholder="Select Country"
                        searchPlaceholder="Search countries..."
                        emptyMessage="No country found."
                        error={!!errors?.country}
                      />
                    </>
                  );
                }}
              />
              <ErrorMsg msg={errors?.country?.message} />
            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('state', {
                    required: 'State is required!',
                    onChange: e => {
                      handleStateChange(e);
                    },
                  })}
                  name="state"
                  id="state"
                  type="text"
                  placeholder="Enter state name"
                  className={cn(
                    'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                    errors?.state && 'border-destructive'
                  )}
                />
                <ErrorMsg msg={errors?.state?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('city', {
                    required: 'City is required!',
                    onChange: e => {
                      handleCityChange(e);
                    },
                  })}
                  name="city"
                  id="city"
                  type="text"
                  placeholder="Enter city name"
                  className={cn(
                    'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                    errors?.city && 'border-destructive'
                  )}
                />
                <ErrorMsg msg={errors?.city?.message} />
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

          {/* Tax Calculation Status */}
          {country === 'US' && (
            <div className="mt-4 p-3 bg-muted rounded-md border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Tax Calculation</span>
                {taxLoading && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-xs text-muted-foreground">Calculating...</span>
                  </div>
                )}
                {!taxLoading && taxData && (
                  <span className="text-sm font-semibold text-primary">
                    ${Number(taxData.taxAmount || 0).toFixed(2)}
                  </span>
                )}
                {taxError && (
                  <span className="text-xs text-destructive">{taxError}</span>
                )}
                {!taxLoading && !taxData && !taxError && state && city && zipCode && (
                  <span className="text-xs text-muted-foreground">Ready to calculate</span>
                )}
              </div>
              {taxData && (
                <div className="space-y-1">
                  {taxData.taxAmount > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Estimated tax for {city}, {state} {zipCode}
                    </p>
                  ) : taxData.taxabilityReason === 'not_collecting' ? (
                    <p className="text-xs text-muted-foreground">
                      Tax not applicable for this location. Registration may need activation.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No tax applicable for {city}, {state} {zipCode}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary and Complete Purchase moved to right side - see checkout-order-area.jsx */}

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
