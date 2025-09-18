/**
 * PostHog Events Constants
 * Centralized event names following the pattern: {action}_{entity}_{status}
 */

export const posthogEvents = {
  // Authentication Events
  user_login_success: 'auth:user_login_success',
  user_register_success: 'auth:user_register_success',
  user_logout_success: 'auth:user_logout_success',

  // eCommerce Events - Product Interactions
  product_viewed: 'ecommerce:product_viewed',
  product_added_to_cart: 'ecommerce:product_added_to_cart',
  product_removed_from_cart: 'ecommerce:product_removed_from_cart',
  product_added_to_wishlist: 'ecommerce:product_added_to_wishlist',
  product_removed_from_wishlist: 'ecommerce:product_removed_from_wishlist',
  product_compared: 'ecommerce:product_compared',
  product_option_selected: 'ecommerce:product_option_selected',

  // Cart Events
  cart_viewed: 'ecommerce:cart_viewed',
  cart_updated: 'ecommerce:cart_updated',
  cart_abandoned: 'ecommerce:cart_abandoned',

  // Checkout Events
  checkout_started: 'ecommerce:checkout_started',
  checkout_completed: 'ecommerce:checkout_completed',
  checkout_payment_success: 'ecommerce:checkout_payment_success',
  checkout_payment_failed: 'ecommerce:checkout_payment_failed',

  // Order Events
  order_placed: 'ecommerce:order_placed',
  order_viewed: 'ecommerce:order_viewed',
  order_cancelled: 'ecommerce:order_cancelled',

  // Search & Filter Events
  search_performed: 'search:search_performed',
  filter_applied: 'search:filter_applied',
  category_viewed: 'search:category_viewed',

  // Coupon Events
  coupon_applied: 'ecommerce:coupon_applied',
  coupon_removed: 'ecommerce:coupon_removed',
  coupon_failed: 'ecommerce:coupon_failed',

  // Review Events
  review_submitted: 'review:review_submitted',
  review_viewed: 'review:review_viewed',

  // Contact & Support Events
  contact_form_submitted: 'contact:form_submitted',
  newsletter_subscribed: 'marketing:newsletter_subscribed',

  // Navigation Events
  page_viewed: 'navigation:page_viewed',
  external_link_clicked: 'navigation:external_link_clicked',

  // Error Events (for captureException context)
  api_error: 'error:api_error',
  validation_error: 'error:validation_error',
  network_error: 'error:network_error',
  payment_error: 'error:payment_error',

  // General Success Events
  operation_success: 'general:operation_success',
  form_submitted_success: 'general:form_submitted_success',
} as const;

// Type for event names
export type PostHogEventName = keyof typeof posthogEvents;

// eCommerce specific event properties interfaces
export interface ProductEventProperties {
  product_id: string;
  product_name: string;
  product_category: string;
  product_price: number;
  product_sku: string;
  product_variant?: string;
  product_brand?: string;
  quantity?: number;
}

export interface CartEventProperties {
  cart_total: number;
  cart_quantity: number;
  cart_items: Array<{
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    variant?: string;
  }>;
}

export interface CheckoutEventProperties extends CartEventProperties {
  checkout_id?: string;
  payment_method?: string;
  shipping_method?: string;
  discount_amount?: number;
  coupon_code?: string;
}

export interface OrderEventProperties extends CheckoutEventProperties {
  order_id: string;
  order_total: number;
  order_status: string;
  shipping_cost?: number;
  tax_amount?: number;
}

export interface SearchEventProperties {
  search_term: string;
  search_results_count: number;
  search_category?: string;
  search_filters?: Record<string, any>;
}
