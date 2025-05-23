'use client';
import React, { useState, useEffect } from 'react';
import ErrorMsg from '../common/error-msg';
import { useSelector } from 'react-redux';
import { Country, State, City } from 'country-state-city';
import { useFormContext } from 'react-hook-form';

const CheckoutBillingArea = ({ register, errors, isGuest = false }) => {
  const { user } = useSelector(state => state.auth);

  // Get all countries
  const countries = Country.getAllCountries();

  // Find US country for default
  const defaultCountry = countries.find(country => country.isoCode === 'US');

  // States for selections with defaults
  const [selectedCountry, setSelectedCountry] = useState(
    defaultCountry || null
  );
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Form values to track selections
  const [formValues, setFormValues] = useState({
    country: 'US',
    state: '',
    city: '',
  });

  // Load states for default country (US) on initial render
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(countryStates);

      // Set form value
      setFormValues(prev => ({
        ...prev,
        country: selectedCountry.isoCode,
      }));
    }
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
      setStates(countryStates);

      // Reset state and city when country changes
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

  // Update cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(
        selectedCountry.isoCode,
        selectedState.isoCode
      );
      setCities(stateCities);
    }
  }, [selectedCountry, selectedState]);

  // Handle country change
  const handleCountryChange = e => {
    const countryCode = e.target.value;
    if (!countryCode) return;

    const country = countries.find(c => c.isoCode === countryCode);
    setSelectedCountry(country);

    // Update form value for country
    setFormValues(prev => ({
      ...prev,
      country: countryCode,
      state: '',
      city: '',
    }));
  };

  // Handle state change
  const handleStateChange = e => {
    const stateCode = e.target.value;
    if (!stateCode) return;

    const state = states.find(s => s.isoCode === stateCode);
    setSelectedState(state);

    // Update form value for state
    setFormValues(prev => ({
      ...prev,
      state: stateCode,
      city: '',
    }));
  };

  // Handle city change
  const handleCityChange = e => {
    const cityName = e.target.value;
    setSelectedCity(cityName);

    // Update form value for city
    setFormValues(prev => ({
      ...prev,
      city: cityName,
    }));
  };

  return (
    <div className="tp-checkout-bill-area">
      <h3 className="tp-checkout-bill-title">Billing Details</h3>

      <div className="tp-checkout-bill-form">
        <div className="tp-checkout-bill-inner">
          <div className="row">
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>
                  First Name <span>*</span>
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
                />
                <ErrorMsg msg={errors?.firstName?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>
                  Last Name <span>*</span>
                </label>
                <input
                  {...register('lastName', {
                    required: `Last Name is required!`,
                  })}
                  name="lastName"
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                />
                <ErrorMsg msg={errors?.lastName?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label>
                  Country <span>*</span>
                </label>
                <select
                  {...register('country', {
                    required: `Country is required!`,
                  })}
                  name="country"
                  id="country"
                  className="w-100 form-select"
                  onChange={handleCountryChange}
                  value={formValues.country}
                >
                  <option value="">Select Country</option>
                  {countries.map(country => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {!formValues.country && (
                  <ErrorMsg msg={errors?.country?.message} />
                )}
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label>Street address</label>
                <input
                  {...register('address', { required: `Address is required!` })}
                  name="address"
                  id="address"
                  type="text"
                  placeholder="House number and street name"
                />
                <ErrorMsg msg={errors?.address?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>
                  State / Province <span>*</span>
                </label>
                <select
                  {...register('state', {
                    required: `State is required!`,
                  })}
                  name="state"
                  id="state"
                  className="w-100 form-select"
                  onChange={handleStateChange}
                  value={formValues.state}
                  disabled={!selectedCountry}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </select>
                {!formValues.state && <ErrorMsg msg={errors?.state?.message} />}
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>Town / City</label>
                <select
                  {...register('city', {
                    required: `City is required!`,
                  })}
                  name="city"
                  id="city"
                  className="w-100 form-select"
                  onChange={handleCityChange}
                  value={formValues.city}
                  disabled={!selectedState}
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option
                      key={`${city.name}-${city.latitude}`}
                      value={city.name}
                    >
                      {city.name}
                    </option>
                  ))}
                </select>
                {!formValues.city && <ErrorMsg msg={errors?.city?.message} />}
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>Postal Code</label>
                <input
                  {...register('zipCode', {
                    required: `Postal Code is required!`,
                  })}
                  name="zipCode"
                  id="zipCode"
                  type="text"
                  placeholder="Postal Code"
                />
                <ErrorMsg msg={errors?.zipCode?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>
                  Phone <span>*</span>
                </label>
                <input
                  {...register('contactNo', {
                    required: `ContactNumber is required!`,
                  })}
                  name="contactNo"
                  id="contactNo"
                  type="text"
                  placeholder="Phone"
                />
                <ErrorMsg msg={errors?.contactNo?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label>
                  Email address <span>*</span>
                </label>
                <input
                  {...register('email', { required: `Email is required!` })}
                  name="email"
                  id="email"
                  type="email"
                  placeholder="Email"
                  defaultValue={user?.email}
                />
                <ErrorMsg msg={errors?.email?.message} />
              </div>
            </div>
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label>Order notes (optional)</label>
                <textarea
                  {...register('orderNote', { required: false })}
                  name="orderNote"
                  id="orderNote"
                  placeholder="Notes about your order, e.g. special notes for delivery."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutBillingArea;
