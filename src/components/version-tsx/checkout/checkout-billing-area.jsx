'use client';
import useCartInfo from '@/hooks/use-cart-info';
import { authClient } from '@/lib/authClient';
import { reset_address_discount } from '@/redux/features/order/orderSlice';

import { City, Country, State } from 'country-state-city';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorMsg from '../../common/error-msg';

const CheckoutBillingArea = ({ register, errors, setValue, checkoutData }) => {
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
    setSelectedCountry(country);

    setValue('country', countryCode);
    setValue('state', '');
    setValue('city', '');

    // Reset state and city immediately
    setSelectedState(null);
    setSelectedCity('');
    setCities([]);

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



            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  value={selectedState?.isoCode || ''}
                  disabled={!selectedCountry}
                >
                  <option value="">
                    {selectedCountry ? 'Select State' : 'Select country first'}
                  </option>
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
                  City <span className="text-destructive">*</span>
                </label>
                <select
                  {...register('city', {
                    required: `City is required!`,
                    onChange: e => {
                      handleCityChange(e);
                    },
                  })}
                  name="city"
                  id="city"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  value={selectedCity}
                  disabled={!selectedState}
                >
                  <option value="">
                    {selectedState ? 'Select City' : 'Select state first'}
                  </option>
                  {cities.map(city => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
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
