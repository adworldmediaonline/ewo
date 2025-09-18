'use client';

import posthog from 'posthog-js';
import { posthogEvents, type PostHogEventName } from './posthog-events';

/**
 * Client-side PostHog utilities
 * Use these functions in client components for consistent event tracking
 */

// Initialize PostHog (should be called once in the app)
export const initPostHog = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageleave: true,
      capture_exceptions: true,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true, email: true },
      },
      autocapture: {
        dom_event_allowlist: ['click', 'change', 'submit'],
        css_selector_allowlist: [
          '[data-ph-capture]',
          '.ph-capture',
          '[data-posthog-capture]',
        ],
      },
    });
  }
};

// User identification - call once during login
export const identifyUser = (
  userId: string,
  userProperties?: Record<string, any>
) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, userProperties);
  }
};

// Reset user session - call during logout
export const resetUser = () => {
  if (typeof window !== 'undefined') {
    posthog.reset();
  }
};

// Capture success events
export const captureEvent = (
  eventName: PostHogEventName | string,
  properties?: Record<string, any>
) => {
  if (typeof window !== 'undefined') {
    const eventKey = eventName as keyof typeof posthogEvents;
    const fullEventName = posthogEvents[eventKey] || eventName;

    posthog.capture(fullEventName, {
      timestamp: new Date().toISOString(),
      ...properties,
    });
  }
};

// Capture exceptions and errors
export const captureException = (
  error: unknown,
  additionalProperties?: Record<string, any>
) => {
  if (typeof window !== 'undefined') {
    posthog.captureException(error, {
      timestamp: new Date().toISOString(),
      ...additionalProperties,
    });
  }
};

// eCommerce specific tracking functions
export const trackProductView = (productProperties: {
  product_id: string;
  product_name: string;
  product_category: string;
  product_price: number;
  product_sku: string;
  product_variant?: string;
}) => {
  captureEvent('product_viewed', productProperties);
};

export const trackAddToCart = (productProperties: {
  product_id: string;
  product_name: string;
  product_category: string;
  product_price: number;
  product_sku: string;
  quantity: number;
  product_variant?: string;
  cart_total?: number;
}) => {
  captureEvent('product_added_to_cart', productProperties);
};

export const trackRemoveFromCart = (productProperties: {
  product_id: string;
  product_name: string;
  quantity: number;
  cart_total?: number;
}) => {
  captureEvent('product_removed_from_cart', productProperties);
};

export const trackPurchase = (orderProperties: {
  order_id: string;
  order_total: number;
  order_items: Array<{
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    variant?: string;
  }>;
  payment_method?: string;
  coupon_code?: string;
  discount_amount?: number;
}) => {
  captureEvent('order_placed', orderProperties);
};

export const trackSearch = (searchProperties: {
  search_term: string;
  search_results_count: number;
  search_category?: string;
  search_filters?: Record<string, any>;
}) => {
  captureEvent('search_performed', searchProperties);
};

// Feature flags (use sparingly)
export const getFeatureFlag = (
  flagKey: string
): boolean | string | undefined => {
  if (typeof window !== 'undefined') {
    return posthog.getFeatureFlag(flagKey);
  }
  return undefined;
};

// Check if PostHog is loaded
export const isPostHogLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!posthog.__loaded;
};

export default posthog;
