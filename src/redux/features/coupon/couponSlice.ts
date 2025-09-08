import { createSlice } from '@reduxjs/toolkit';

// Types
interface Coupon {
  _id: string;
  couponCode: string;
  discountType: 'percentage' | 'amount';
  discountPercentage?: number;
  discountAmount?: number;
  endTime: string;
  discount?: number;
  applicableProducts: any[];
}

interface CouponState {
  coupon_info: any;
  applied_coupons: Coupon[];
  total_coupon_discount: number;
  coupon_error: any;
  coupon_loading: boolean;
  last_applied_coupon: Coupon | null;
}

const initialState: CouponState = {
  coupon_info: undefined,
  applied_coupons: [],
  total_coupon_discount: 0,
  coupon_error: null,
  coupon_loading: false,
  last_applied_coupon: null,
};

export const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    set_coupon: (state, { payload }) => {
      state.coupon_info = payload;

      localStorage.setItem('couponInfo', JSON.stringify(payload));
    },
    get_coupons: state => {
      const data = localStorage.getItem('couponInfo');
      if (data) {
        state.coupon_info = JSON.parse(data);
      } else {
        state.coupon_info = undefined;
      }
    },

    // Enhanced multiple coupon actions
    set_applied_coupons: (state, { payload }) => {
      // payload should be an array of coupon data
      state.applied_coupons = Array.isArray(payload) ? payload : [];
      state.total_coupon_discount = state.applied_coupons.reduce(
        (total, coupon) => total + (coupon.discount || 0),
        0
      );
      state.coupon_error = null;

      // Store in localStorage for persistence
      localStorage.setItem(
        'appliedCoupons',
        JSON.stringify(state.applied_coupons)
      );
    },

    add_applied_coupon: (state, { payload }) => {
      // Add a single coupon to the array
      if (
        payload &&
        !state.applied_coupons.find(c => c.couponCode === payload.couponCode)
      ) {
        state.applied_coupons.push(payload);
        state.total_coupon_discount = state.applied_coupons.reduce(
          (total, coupon) => total + (coupon.discount || 0),
          0
        );
        state.last_applied_coupon = payload;
        state.coupon_error = null;

        // Store in localStorage for persistence
        localStorage.setItem(
          'appliedCoupons',
          JSON.stringify(state.applied_coupons)
        );
      }
    },

    remove_applied_coupon: (state, { payload }) => {
      // Remove a specific coupon by couponCode
      const couponCode = payload;
      state.applied_coupons = state.applied_coupons.filter(
        coupon => coupon.couponCode !== couponCode
      );
      state.total_coupon_discount = state.applied_coupons.reduce(
        (total, coupon) => total + (coupon.discount || 0),
        0
      );

      // Update localStorage
      if (state.applied_coupons.length > 0) {
        localStorage.setItem(
          'appliedCoupons',
          JSON.stringify(state.applied_coupons)
        );
      } else {
        localStorage.removeItem('appliedCoupons');
      }
    },

    set_coupon_error: (state, { payload }) => {
      state.coupon_error = payload;
      state.last_applied_coupon = null;
    },

    set_coupon_loading: (state, { payload }) => {
      state.coupon_loading = payload;
    },

    clear_all_coupons: state => {
      state.applied_coupons = [];
      state.total_coupon_discount = 0;
      state.coupon_error = null;
      state.coupon_loading = false;
      state.last_applied_coupon = null;
      localStorage.removeItem('appliedCoupons');
    },

    // Load applied coupons from localStorage on app init
    load_applied_coupons: state => {
      const data = localStorage.getItem('appliedCoupons');
      if (data) {
        try {
          const appliedCoupons = JSON.parse(data);
          if (Array.isArray(appliedCoupons)) {
            state.applied_coupons = appliedCoupons;
            state.total_coupon_discount = appliedCoupons.reduce(
              (total, coupon) => total + (coupon.discount || 0),
              0
            );
          }
        } catch (error) {
          localStorage.removeItem('appliedCoupons');
        }
      }
    },

    // Legacy compatibility actions (keeping for backward compatibility)
    set_applied_coupon: (state, { payload }) => {
      // Convert single coupon to array format
      if (payload) {
        const existingIndex = state.applied_coupons.findIndex(
          c => c.couponCode === payload.couponCode
        );
        if (existingIndex === -1) {
          state.applied_coupons.push(payload);
        } else {
          state.applied_coupons[existingIndex] = payload;
        }
        state.total_coupon_discount = state.applied_coupons.reduce(
          (total, coupon) => total + (coupon.discount || 0),
          0
        );
        state.last_applied_coupon = payload;
        state.coupon_error = null;
        localStorage.setItem(
          'appliedCoupons',
          JSON.stringify(state.applied_coupons)
        );
      }
    },

    clear_coupon: state => {
      // Legacy action - now clears all coupons
      state.applied_coupons = [];
      state.total_coupon_discount = 0;
      state.coupon_error = null;
      state.coupon_loading = false;
      state.last_applied_coupon = null;
      localStorage.removeItem('appliedCoupons');
    },

    load_applied_coupon: state => {
      // Legacy action - redirect to new action
      const data = localStorage.getItem('appliedCoupons');
      if (data) {
        try {
          const appliedCoupons = JSON.parse(data);
          if (Array.isArray(appliedCoupons)) {
            state.applied_coupons = appliedCoupons;
            state.total_coupon_discount = appliedCoupons.reduce(
              (total, coupon) => total + (coupon.discount || 0),
              0
            );
          }
        } catch (error) {
          localStorage.removeItem('appliedCoupons');
        }
      }

      // Also check for legacy single coupon
      const legacyData = localStorage.getItem('appliedCoupon');
      if (legacyData && state.applied_coupons.length === 0) {
        try {
          const legacyCoupon = JSON.parse(legacyData);
          state.applied_coupons = [legacyCoupon];
          state.total_coupon_discount = legacyCoupon.discount || 0;
          localStorage.removeItem('appliedCoupon'); // Remove legacy
          localStorage.setItem(
            'appliedCoupons',
            JSON.stringify(state.applied_coupons)
          );
        } catch (error) {
          localStorage.removeItem('appliedCoupon');
        }
      }
    },
  },
});

export const {
  set_coupon,
  get_coupons,
  set_applied_coupons,
  add_applied_coupon,
  remove_applied_coupon,
  set_coupon_error,
  set_coupon_loading,
  clear_all_coupons,
  load_applied_coupons,
  // Legacy compatibility exports
  set_applied_coupon,
  clear_coupon,
  load_applied_coupon,
} = couponSlice.actions;

export default couponSlice.reducer;
