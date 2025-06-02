'use client';
import React, { useState, useEffect } from 'react';
import ErrorMsg from '../common/error-msg';
import { useSelector, useDispatch } from 'react-redux';
import { Country, State, City } from 'country-state-city';
import { reset_address_discount } from '@/redux/features/order/orderSlice';
import styles from './checkout-billing-area.module.css';

const CheckoutBillingArea = ({
  register,
  errors,
  isGuest = false,
  checkAddressDiscount,
  setValue,
}) => {
  const { user } = useSelector(state => state.auth);
  const { isCheckoutSubmitting } = useSelector(state => state.order);
  const dispatch = useDispatch();
  const [showCheckButton, setShowCheckButton] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

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

  useEffect(() => {
    const { address, city, state, country } = formValues;
    setShowCheckButton(address && city && state && country);
  }, [formValues]);

  const handleCheckEligibility = () => {
    const { address, city, state, country, zipCode } = formValues;

    if (address && city && state && country) {
      setCheckingEligibility(true);

      checkAddressDiscount({
        address,
        city,
        state,
        country,
        zipCode,
      });

      setTimeout(() => {
        setCheckingEligibility(false);
      }, 1000);
    }
  };

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

  return (
    <div className={styles.billingArea}>
      <h3 className={styles.sectionTitle}>Billing Details</h3>

      <div className={styles.formGrid}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              First Name <span className={styles.required}>*</span>
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
              className={styles.formInput}
            />
            <ErrorMsg msg={errors?.firstName?.message} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Last Name <span className={styles.required}>*</span>
            </label>
            <input
              {...register('lastName', {
                required: `Last Name is required!`,
              })}
              name="lastName"
              id="lastName"
              type="text"
              placeholder="Last Name"
              className={styles.formInput}
            />
            <ErrorMsg msg={errors?.lastName?.message} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Country <span className={styles.required}>*</span>
          </label>
          <select
            {...register('country', {
              required: `Country is required!`,
            })}
            name="country"
            id="country"
            className={styles.formSelect}
            onChange={handleCountryChange}
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

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Street address <span className={styles.required}>*</span>
          </label>
          <input
            {...register('address', { required: `Address is required!` })}
            name="address"
            id="address"
            type="text"
            placeholder="House number and street name"
            onChange={handleAddressChange}
            className={styles.formInput}
          />
          <ErrorMsg msg={errors?.address?.message} />
        </div>

        <div className={styles.formRowThree}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              City <span className={styles.required}>*</span>
            </label>
            <input
              {...register('city', { required: `City is required!` })}
              name="city"
              id="city"
              type="text"
              placeholder="Enter city"
              onChange={handleCityChange}
              className={styles.formInput}
            />
            <ErrorMsg msg={errors?.city?.message} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              State <span className={styles.required}>*</span>
            </label>
            <select
              {...register('state', {
                required: `State is required!`,
              })}
              name="state"
              id="state"
              className={styles.formSelect}
              onChange={handleStateChange}
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

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              ZIP Code <span className={styles.required}>*</span>
            </label>
            <input
              {...register('zipCode', {
                required: `ZIP Code is required!`,
              })}
              name="zipCode"
              id="zipCode"
              type="text"
              placeholder="Enter ZIP code"
              onChange={handleZipCodeChange}
              className={styles.formInput}
            />
            <ErrorMsg msg={errors?.zipCode?.message} />
          </div>
        </div>

        {showCheckButton && !isGuest && (
          <div className={styles.formGroup}>
            <button
              type="button"
              onClick={handleCheckEligibility}
              className={styles.eligibilityButton}
              disabled={checkingEligibility}
            >
              {checkingEligibility ? (
                <span>
                  <span
                    className={`spinner-border spinner-border-sm ${styles.spinner}`}
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Checking Address Eligibility...
                </span>
              ) : (
                'Check eligibility (10% discount)'
              )}
            </button>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Phone <span className={styles.required}>*</span>
          </label>
          <input
            {...register('contactNo', {
              required: `ContactNumber is required!`,
            })}
            name="contactNo"
            id="contactNo"
            type="text"
            placeholder="Phone"
            className={styles.formInput}
          />
          <ErrorMsg msg={errors?.contactNo?.message} />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Email address <span className={styles.required}>*</span>
          </label>
          <input
            {...register('email', { required: `Email is required!` })}
            name="email"
            id="email"
            type="email"
            placeholder="Email"
            defaultValue={user?.email}
            className={styles.formInput}
          />
          <ErrorMsg msg={errors?.email?.message} />
        </div>

        {/* Uncomment for Order Notes feature
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Order notes (optional)</label>
          <textarea
            {...register('orderNote', { required: false })}
            name="orderNote"
            id="orderNote"
            placeholder="Notes about your order, e.g. special notes for delivery."
            className={styles.formTextarea}
          />
        </div>
        */}
      </div>
    </div>
  );
};

export default CheckoutBillingArea;
