import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  coupon_info: undefined,
  applied_coupon: null,
  coupon_discount: 0,
  coupon_error: null,
  coupon_loading: false,
};

export const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    set_coupon: (state, { payload }) => {
      state.coupon_info = payload;
      
      localStorage.setItem(
        "couponInfo",
        JSON.stringify(payload)
      );
    },
    get_coupons: (state, { payload }) => {
      const data = localStorage.getItem('couponInfo');
      if (data) {
        state.coupon_info = JSON.parse(data);
      } else {
        state.coupon_info = undefined;
      }
    },
    // Enhanced coupon actions
    set_applied_coupon: (state, { payload }) => {
      state.applied_coupon = payload;
      state.coupon_discount = payload?.discount || 0;
      state.coupon_error = null;
      
      // Store in localStorage for persistence
      if (payload) {
        localStorage.setItem("appliedCoupon", JSON.stringify(payload));
      } else {
        localStorage.removeItem("appliedCoupon");
      }
    },
    set_coupon_error: (state, { payload }) => {
      state.coupon_error = payload;
      state.applied_coupon = null;
      state.coupon_discount = 0;
    },
    set_coupon_loading: (state, { payload }) => {
      state.coupon_loading = payload;
    },
    clear_coupon: (state) => {
      state.applied_coupon = null;
      state.coupon_discount = 0;
      state.coupon_error = null;
      state.coupon_loading = false;
      localStorage.removeItem("appliedCoupon");
    },
    // Load applied coupon from localStorage on app init
    load_applied_coupon: (state) => {
      const data = localStorage.getItem('appliedCoupon');
      if (data) {
        try {
          const appliedCoupon = JSON.parse(data);
          state.applied_coupon = appliedCoupon;
          state.coupon_discount = appliedCoupon?.discount || 0;
        } catch (error) {
          console.error('Error loading applied coupon:', error);
          localStorage.removeItem("appliedCoupon");
        }
      }
    },
  },
});

export const { 
  set_coupon, 
  get_coupons,
  set_applied_coupon,
  set_coupon_error,
  set_coupon_loading,
  clear_coupon,
  load_applied_coupon
} = couponSlice.actions;

export default couponSlice.reducer;
