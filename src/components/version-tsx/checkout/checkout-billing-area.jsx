'use client';
import { authClient } from '@/lib/authClient';
import { cn } from '@/lib/utils';

import { Country } from 'country-state-city';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Controller } from 'react-hook-form';
import ErrorMsg from '../../common/error-msg';
import { SearchableSelect } from '@/components/ui/searchable-select';

const CheckoutBillingArea = ({ register, errors, setValue, control, checkoutData }) => {
  const user = {};
  const { isCheckoutSubmitting } = useSelector(state => state.order);

  const {
    register: checkoutRegister,
  } = checkoutData;

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

  const handleCountryChange = e => {
    if (isCheckoutSubmitting) return;

    const countryCode = e.target.value;
    if (!countryCode) return;

    const country = countries.find(c => c.isoCode === countryCode);

    setSelectedCountry(country);
    setValue('country', countryCode);
  };

  const handleStateChange = e => {
    if (isCheckoutSubmitting) return;

    const stateValue = e.target.value;
    setValue('state', stateValue);
  };

  const handleCityChange = e => {
    if (isCheckoutSubmitting) return;

    const cityValue = e.target.value;
    setValue('city', cityValue);
  };

  const handleAddressChange = e => {
    if (isCheckoutSubmitting) return;

    const address = e.target.value;
    setValue('address', address);
  };

  const handleZipCodeChange = e => {
    if (isCheckoutSubmitting) return;

    const zipCode = e.target.value;
    setValue('zipCode', zipCode);
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
                className={cn(
                  'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                  errors?.address && 'border-destructive'
                )}
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
                  className={cn(
                    'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                    errors?.zipCode && 'border-destructive'
                  )}
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Important Note
              </label>
              <textarea
                {...register('orderNote')}
                name="orderNote"
                id="orderNote"
                rows={4}
                placeholder="Add any important notes or special instructions for your order..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <ErrorMsg msg={errors?.orderNote?.message} />
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
