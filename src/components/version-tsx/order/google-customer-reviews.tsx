'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { getProductGTIN } from '@/utils/gtin-mapping';

// Extend Window interface for Google APIs
declare global {
  interface Window {
    renderOptIn?: () => void;
    gapi?: {
      load: (api: string, callback: () => void) => void;
      surveyoptin: {
        render: (config: {
          merchant_id: number;
          order_id: string;
          email: string;
          delivery_country: string;
          estimated_delivery_date: string;
          products?: Array<{ gtin: string }>;
        }) => void;
      };
    };
  }
}

interface GoogleCustomerReviewsProps {
  merchantId: number;
  orderId: string;
  email: string;
  deliveryCountry: string;
  estimatedDeliveryDate?: Date | string;
  products?: Array<{ gtin?: string; sku?: string }>;
}

const GoogleCustomerReviews = ({
  merchantId,
  orderId,
  email,
  deliveryCountry,
  estimatedDeliveryDate,
  products = [],
}: GoogleCustomerReviewsProps) => {
  useEffect(() => {
    // Ensure renderOptIn function is available globally
    if (typeof window !== 'undefined' && !window.renderOptIn) {
      window.renderOptIn = function () {
        if (typeof window.gapi === 'undefined') return;

        window.gapi.load('surveyoptin', function () {
          // Double-check gapi is still available in callback
          if (typeof window.gapi === 'undefined') return;

          // Format estimated delivery date to YYYY-MM-DD
          const formatDeliveryDate = (date?: Date | string): string => {
            if (!date) {
              // Default to 7 days from now if not provided
              const defaultDate = new Date();
              defaultDate.setDate(defaultDate.getDate() + 7);
              return defaultDate.toISOString().split('T')[0];
            }

            const deliveryDate =
              date instanceof Date ? date : new Date(date);
            return deliveryDate.toISOString().split('T')[0];
          };

          // Format country code (extract ISO 2-letter code from actual order data)
          const formatCountryCode = (country: string): string => {
            if (!country) return 'US'; // Default fallback if no country provided

            // Trim whitespace
            const trimmed = country.trim();

            // If country is already a 2-letter code, return uppercase
            if (trimmed.length === 2) {
              return trimmed.toUpperCase();
            }

            // Extract country code from formats like "City, US" or "City, CountryCode"
            // Check if string contains a comma (format: "City, CountryCode")
            if (trimmed.includes(',')) {
              const parts = trimmed.split(',').map((p) => p.trim());
              const lastPart = parts[parts.length - 1];

              // If last part is a 2-letter code, use it (this is the actual country code from order)
              if (lastPart.length === 2 && /^[A-Za-z]{2}$/.test(lastPart)) {
                return lastPart.toUpperCase();
              }
            }

            // If no valid country code found, default to US
            return 'US';
          };

          // Build products array with GTINs from actual order data
          const productsArray = products
            .map((product) => {
              // Try to get GTIN from product data or SKU mapping
              const gtin = getProductGTIN(product.sku, product.gtin);
              return gtin ? { gtin } : null;
            })
            .filter((item): item is { gtin: string } => item !== null);

          if (window.gapi && window.gapi.surveyoptin) {
            window.gapi.surveyoptin.render({
              // REQUIRED FIELDS
              merchant_id: merchantId,
              order_id: orderId,
              email: email,
              delivery_country: formatCountryCode(deliveryCountry),
              estimated_delivery_date: formatDeliveryDate(estimatedDeliveryDate),

              // OPTIONAL FIELDS
              products: productsArray.length > 0 ? productsArray : undefined,
            });
          }
        });
      };
    }
  }, [
    merchantId,
    orderId,
    email,
    deliveryCountry,
    estimatedDeliveryDate,
    products,
  ]);

  return (
    <>
      <Script
        src="https://apis.google.com/js/platform.js?onload=renderOptIn"
        strategy="afterInteractive"
        async
        defer
      />
    </>
  );
};

export default GoogleCustomerReviews;

