import {
  setSession,
  setTokens,
  updateUser,
  userLoggedOut,
} from '../redux/features/auth/authSlice';
import { store } from '../redux/store';
import { tokenStorage } from './authClient';

// Utility to sync Better Auth state with Redux
export const syncAuthWithRedux = session => {
  const dispatch = store.dispatch;

  if (session) {
    dispatch(setSession(session));
  } else {
    dispatch(userLoggedOut());
  }
};

// Utility to sync tokens with Redux
export const syncTokensWithRedux = () => {
  const dispatch = store.dispatch;
  const bearerToken = tokenStorage.getToken();
  const jwtToken = tokenStorage.getJWT();

  if (bearerToken || jwtToken) {
    dispatch(setTokens({ bearerToken, jwtToken }));
  }
};

// Utility to get current auth state from Redux
export const getAuthState = () => {
  return store.getState().auth;
};

// Utility to check if user is authenticated
export const isAuthenticated = () => {
  const state = store.getState();
  return state.auth.isAuthenticated || !!state.auth.accessToken;
};

// Utility to get current user
export const getCurrentUser = () => {
  const state = store.getState();
  return state.auth.user || state.auth.userInfo?.user;
};

// Utility to get current access token
export const getCurrentAccessToken = () => {
  const state = store.getState();
  return state.auth.accessToken || state.auth.userInfo?.accessToken;
};

// Utility to update user profile in Redux
export const updateUserInRedux = userData => {
  const dispatch = store.dispatch;
  dispatch(updateUser(userData));
};

// Export the store for direct access if needed
export { store };
