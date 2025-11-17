'use client';
import useCartInfo from '@/hooks/use-cart-info';
import { authClient } from '@/lib/authClient';
import { reset_address_discount } from '@/redux/features/order/orderSlice';
import { cn } from '@/lib/utils';

import { City, Country, State } from 'country-state-city';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller } from 'react-hook-form';
import ErrorMsg from '../../common/error-msg';
import { SearchableSelect } from '@/components/ui/searchable-select';

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

  const countries = Country.getAllCountries();
  const defaultCountry = countries.find(country => country.isoCode === 'US');

  const [selectedCountry, setSelectedCountry] = useState(
    defaultCountry || null
  );
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showManualCityInput, setShowManualCityInput] = useState(false);

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

  // 1. Initial load - load US states on mount
  useEffect(() => {
    if (defaultCountry) {
      const countryStates = State.getStatesOfCountry(defaultCountry.isoCode);
      setStates(countryStates);
      setValue('country', defaultCountry.isoCode);
    }
  }, [defaultCountry, setValue]);

  // 2. Country change - load new states and reset dependents
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(countryStates);

      // Reset state and city when country changes
      setSelectedState(null);
      setSelectedCity('');
      setCities([]);
    }
  }, [selectedCountry]);

  // 3. State change - load cities
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState]);

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
    setValue('state', '');
    setValue('city', '');

    // Reset state and city immediately
    setSelectedState(null);
    setSelectedCity('');
    setCities([]);
    setShowManualCityInput(false);

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

    // Reset city immediately
    setSelectedCity('');
    setShowManualCityInput(false);

    setFormValues(prev => ({
      ...prev,
      state: stateCode,
      city: '',
    }));
  };

  const handleCityChange = e => {
    if (isCheckoutSubmitting) return;

    const cityName = e.target.value;

    // Handle manual entry trigger
    if (cityName === '__manual__') {
      setShowManualCityInput(true);
      setValue('city', '');
      setSelectedCity('');
      return;
    }

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
                <Controller
                  name="state"
                  control={control}
                  rules={{ required: 'State is required!' }}
                  render={({ field }) => {
                    const stateOptions = states.map(state => ({
                      value: state.isoCode,
                      label: state.name,
                    }));

                    return (
                      <>
                        <SearchableSelect
                          options={stateOptions}
                          value={field.value || selectedState?.isoCode || ''}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Simulate event for handleStateChange
                            const syntheticEvent = {
                              target: { value },
                            };
                            handleStateChange(syntheticEvent);
                          }}
                          placeholder={selectedCountry ? 'Select State' : 'Select country first'}
                          searchPlaceholder="Search states..."
                          emptyMessage="No state found."
                          disabled={!selectedCountry}
                          error={!!errors?.state}
                        />
                      </>
                    );
                  }}
                />
                <ErrorMsg msg={errors?.state?.message} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="city"
                  control={control}
                  rules={{ required: 'City is required!' }}
                  render={({ field }) => {
                    // Case 1: No cities available - auto show input
                    if (cities.length === 0 && selectedState) {
                      return (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                            No cities found for this state. Please enter your city manually.
                          </div>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter city name"
                            className={cn(
                              'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                              errors?.city && 'border-destructive'
                            )}
                            onChange={(e) => {
                              field.onChange(e);
                              handleCityChange(e);
                            }}
                          />
                        </div>
                      );
                    }

                    // Case 2: Cities available but user wants manual entry
                    if (showManualCityInput && cities.length > 0) {
                      return (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setShowManualCityInput(false)}
                            className="text-sm text-primary hover:text-primary/80 underline"
                          >
                            ← Back to city list
                          </button>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter city name"
                            className={cn(
                              'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                              errors?.city && 'border-destructive'
                            )}
                            onChange={(e) => {
                              field.onChange(e);
                              handleCityChange(e);
                            }}
                          />
                        </div>
                      );
                    }

                    // Case 3: Cities available - show searchable combobox with manual option
                    const cityOptions = cities.map(city => ({
                      value: city.name,
                      label: city.name,
                    }));

                    // Add manual entry option if cities are available
                    if (cityOptions.length > 0) {
                      cityOptions.push({
                        value: '__manual__',
                        label: 'City not listed? Enter manually',
                      });
                    }

                    return (
                      <>
                        <SearchableSelect
                          options={cityOptions}
                          value={field.value || selectedCity || ''}
                          onValueChange={(value) => {
                            if (value === '__manual__') {
                              setShowManualCityInput(true);
                              field.onChange('');
                              setSelectedCity('');
                            } else {
                              field.onChange(value);
                              // Simulate event for handleCityChange
                              const syntheticEvent = {
                                target: { value },
                              };
                              handleCityChange(syntheticEvent);
                            }
                          }}
                          placeholder={selectedState ? 'Select City' : 'Select state first'}
                          searchPlaceholder="Search cities..."
                          emptyMessage="No city found."
                          disabled={!selectedState}
                          error={!!errors?.city}
                        />
                      </>
                    );
                  }}
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
