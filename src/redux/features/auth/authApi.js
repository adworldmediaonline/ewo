import { apiSlice } from '../../api/apiSlice';
import {
  setSession,
  updateUser,
  userLoggedIn,
  userLoggedOut,
} from './authSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // Get current session (Better Auth)
    getSession: builder.query({
      query: () => '/api/me',
      providesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setSession(data));
          }
        } catch (error) {
          console.warn('Failed to get session:', error);
        }
      },
    }),

    // Sign in with email/password (Better Auth)
    signIn: builder.mutation({
      query: credentials => ({
        url: '/api/auth/signin',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setSession(data));
          }
        } catch (error) {
          console.error('Sign in failed:', error);
        }
      },
    }),

    // Sign up with email/password (Better Auth)
    signUp: builder.mutation({
      query: userData => ({
        url: '/api/auth/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setSession(data));
          }
        } catch (error) {
          console.error('Sign up failed:', error);
        }
      },
    }),

    // Sign out (Better Auth)
    signOut: builder.mutation({
      query: () => ({
        url: '/api/auth/signout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
        } catch (error) {
          console.error('Sign out failed:', error);
          // Force logout even if API call fails
          dispatch(userLoggedOut());
        }
      },
    }),

    // Update profile
    updateProfile: builder.mutation({
      query: profileData => ({
        url: '/api/user/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Auth', 'User'],
      async onQueryStarted(profileData, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(updateUser(data));
          }
        } catch (error) {
          console.error('Profile update failed:', error);
        }
      },
    }),

    // Get user profile
    getUserProfile: builder.query({
      query: () => '/api/user/profile',
      providesTags: ['User'],
    }),

    // Legacy authentication endpoints (for backward compatibility)
    legacySignIn: builder.mutation({
      query: credentials => ({
        url: '/api/user/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.accessToken && data?.user) {
            dispatch(userLoggedIn(data));
          }
        } catch (error) {
          console.error('Legacy sign in failed:', error);
        }
      },
    }),

    legacySignUp: builder.mutation({
      query: userData => ({
        url: '/api/user/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Check authentication status
    checkAuth: builder.query({
      query: () => '/api/me',
      providesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setSession(data));
          } else {
            dispatch(userLoggedOut());
          }
        } catch (error) {
          console.warn('Auth check failed:', error);
          dispatch(userLoggedOut());
        }
      },
    }),
  }),
});

export const {
  useGetSessionQuery,
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
  useUpdateProfileMutation,
  useGetUserProfileQuery,
  useLegacySignInMutation,
  useLegacySignUpMutation,
  useCheckAuthQuery,
} = authApi;
