'use client';

import { useCallback } from 'react';
import { identifyUser, resetUser, captureEvent, captureException } from '@/lib/posthog-client';

/**
 * PostHog Authentication Hook
 * Use this hook in authentication components to handle user identification
 */
export const usePostHogAuth = () => {
  // Handle user login - call this after successful authentication
  const handleLogin = useCallback((userId: string, userProperties?: {
    email?: string;
    name?: string;
    plan?: string;
    [key: string]: any;
  }) => {
    try {
      // Identify user in PostHog
      identifyUser(userId, {
        email: userProperties?.email,
        name: userProperties?.name,
        plan: userProperties?.plan || 'free',
        login_timestamp: new Date().toISOString(),
        ...userProperties,
      });

      // Track successful login
      captureEvent('user_login_success', {
        login_method: userProperties?.login_method || 'email',
        user_type: userProperties?.plan || 'free',
      });
    } catch (error) {
      captureException(error, {
        action: 'handleLogin',
        user_id: userId,
        user_properties: userProperties,
      });
    }
  }, []);

  // Handle user registration - call this after successful registration
  const handleRegistration = useCallback((userId: string, userProperties?: {
    email?: string;
    name?: string;
    registration_method?: string;
    [key: string]: any;
  }) => {
    try {
      // Identify user in PostHog
      identifyUser(userId, {
        email: userProperties?.email,
        name: userProperties?.name,
        plan: 'free', // Default plan for new users
        registration_timestamp: new Date().toISOString(),
        registration_method: userProperties?.registration_method || 'email',
        ...userProperties,
      });

      // Track successful registration
      captureEvent('user_register_success', {
        registration_method: userProperties?.registration_method || 'email',
        user_type: 'new',
      });
    } catch (error) {
      captureException(error, {
        action: 'handleRegistration',
        user_id: userId,
        user_properties: userProperties,
      });
    }
  }, []);

  // Handle user logout - call this during logout
  const handleLogout = useCallback(() => {
    try {
      // Track logout before resetting
      captureEvent('user_logout_success', {
        logout_timestamp: new Date().toISOString(),
      });

      // Reset PostHog user session
      resetUser();
    } catch (error) {
      captureException(error, {
        action: 'handleLogout',
      });
    }
  }, []);

  // Handle authentication errors
  const handleAuthError = useCallback((error: unknown, context?: {
    action?: string;
    email?: string;
    [key: string]: any;
  }) => {
    captureException(error, {
      error_type: 'authentication_error',
      ...context,
    });
  }, []);

  return {
    handleLogin,
    handleRegistration,
    handleLogout,
    handleAuthError,
  };
};

export default usePostHogAuth;
