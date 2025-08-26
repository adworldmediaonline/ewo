import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  shipping_info: {},
  stripe_client_secret: '',
  address_discount_eligible: null,
  address_discount_message: '',
  address_discount_percentage: 10, // 10% discount
  isCheckoutSubmitting: false, // Track checkout submission state
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    set_shipping: (state, { payload }) => {
      state.shipping_info = payload;

      // Only reset address discount if not in checkout submission
      if (!state.isCheckoutSubmitting) {
        state.address_discount_eligible = null;
        state.address_discount_message = '';
      }

      localStorage.setItem('shipping_info', JSON.stringify(payload));
    },
    get_shipping: (state, { payload: _payload }) => {
      const data = localStorage.getItem('shipping_info');
      if (data) {
        state.shipping_info = JSON.parse(data);
      } else {
        state.shipping_info = {};
      }
    },
    set_client_secret: (state, { payload }) => {
      state.stripe_client_secret = payload;
    },
    set_address_discount_eligible: (state, { payload }) => {
      state.address_discount_eligible = payload;
      state.address_discount_message = payload
        ? 'You qualify for a 10% first-time address discount!'
        : 'This address has already received the 10% discount.';
    },
    reset_address_discount: state => {
      // Only reset if not in checkout submission
      if (!state.isCheckoutSubmitting) {
        state.address_discount_eligible = null;
        state.address_discount_message = '';
      }
    },
    // New actions to track checkout submission state
    begin_checkout_submission: state => {
      state.isCheckoutSubmitting = true;
    },
    end_checkout_submission: state => {
      state.isCheckoutSubmitting = false;
    },
  },
});

export const {
  get_shipping,
  set_shipping,
  set_client_secret,
  set_address_discount_eligible,
  reset_address_discount,
  begin_checkout_submission,
  end_checkout_submission,
} = orderSlice.actions;
export default orderSlice.reducer;
