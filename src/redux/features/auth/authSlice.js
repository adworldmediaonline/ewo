import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { tokenStorage } from '../../../lib/authClient';

const initialState = {
  accessToken: undefined,
  user: undefined,
  // Better Auth specific fields
  session: undefined,
  isAuthenticated: false,
  isLoading: false,
  // Legacy support
  userInfo: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Legacy actions for backward compatibility
    userLoggedIn: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.user = payload.user;
      state.userInfo = payload;
      state.isAuthenticated = true;

      // Store in cookies for legacy support
      Cookies.set('userInfo', JSON.stringify(payload));
    },

    userLoggedOut: state => {
      state.accessToken = undefined;
      state.user = undefined;
      state.userInfo = undefined;
      state.session = undefined;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Clear cookies and tokens
      Cookies.remove('userInfo');
      tokenStorage.clearTokens();
    },

    // Better Auth specific actions
    setSession: (state, { payload }) => {
      state.session = payload;
      state.user = payload?.user;
      state.isAuthenticated = !!payload;
      state.isLoading = false;

      // Update legacy fields for backward compatibility
      if (payload?.user) {
        state.userInfo = {
          accessToken: payload.session?.id, // Use session ID as access token
          user: payload.user,
        };
        // Store in cookies for legacy support
        Cookies.set('userInfo', JSON.stringify(state.userInfo));
      }
    },

    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },

    updateUser: (state, { payload }) => {
      if (state.user) {
        state.user = { ...state.user, ...payload };
      }
      if (state.userInfo?.user) {
        state.userInfo.user = { ...state.userInfo.user, ...payload };
        // Update cookies
        Cookies.set('userInfo', JSON.stringify(state.userInfo));
      }
    },

    // Token management
    setTokens: (state, { payload }) => {
      if (payload.bearerToken) {
        state.accessToken = payload.bearerToken;
      }
      if (payload.jwtToken) {
        // JWT token is stored separately in tokenStorage
        // but we can track it in state if needed
      }
    },

    clearTokens: state => {
      state.accessToken = undefined;
      tokenStorage.clearTokens();
    },

    // Initialize auth state from stored data
    initializeAuth: state => {
      // Try to restore from cookies (legacy support)
      const storedUserInfo = Cookies.get('userInfo');
      if (storedUserInfo) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          state.userInfo = userInfo;
          state.accessToken = userInfo.accessToken;
          state.user = userInfo.user;
          state.isAuthenticated = true;
        } catch (error) {
          console.warn('Failed to parse stored user info:', error);
          Cookies.remove('userInfo');
        }
      }

      // Check for Better Auth tokens
      const bearerToken = tokenStorage.getToken();
      if (bearerToken) {
        state.accessToken = bearerToken;
        state.isAuthenticated = true;
      }
    },
  },
});

export const {
  userLoggedIn,
  userLoggedOut,
  setSession,
  setLoading,
  updateUser,
  setTokens,
  clearTokens,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
