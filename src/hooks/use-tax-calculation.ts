import { useEffect, useState, useCallback, useRef } from 'react';
import { useCalculateTaxMutation, TaxCalculationRequest, TaxCalculationResponse } from '@/redux/features/tax/taxApi';
import { useSelector } from 'react-redux';

interface UseTaxCalculationReturn {
  taxData: TaxCalculationResponse | null;
  calculateTax: (address: TaxCalculationRequest['address'], cart: TaxCalculationRequest['cart'], shippingCost: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearTax: () => void;
}

/**
 * Hook to calculate tax using Stripe Tax API
 * Debounces address changes to avoid excessive API calls
 */
export const useTaxCalculation = (): UseTaxCalculationReturn => {
  const [taxData, setTaxData] = useState<TaxCalculationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculateTaxMutation, { isLoading }] = useCalculateTaxMutation();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRequestRef = useRef<string | null>(null);

  // Get cart products from Redux
  const cart_products = useSelector((state: any) => state.cart.cart_products || []);
  const totalShippingCost = useSelector((state: any) => state.cart.totalShippingCost || 0);

  /**
   * Check if address is complete for tax calculation
   */
  const hasCompleteAddress = useCallback((address: TaxCalculationRequest['address']): boolean => {
    if (!address) return false;

    // For US addresses, we need state, city, and zip code
    if (address.country === 'US') {
      return !!(
        address.state &&
        address.city &&
        (address.postal_code || address.zipCode)
      );
    }

    // For other countries, we might not calculate tax
    return false;
  }, []);

  /**
   * Create a cache key from address and cart
   */
  const createCacheKey = useCallback((
    address: TaxCalculationRequest['address'],
    cart: TaxCalculationRequest['cart'],
    shippingCost: number
  ): string => {
    const addressKey = `${address.country}-${address.state}-${address.city}-${address.postal_code || address.zipCode}`;
    const cartKey = cart.map(item => `${item._id}-${item.orderQuantity}-${item.finalPriceDiscount || item.price}`).join('|');
    return `${addressKey}-${cartKey}-${shippingCost}`;
  }, []);

  /**
   * Calculate tax with debouncing
   */
  const calculateTax = useCallback(async (
    address: TaxCalculationRequest['address'],
    cart?: TaxCalculationRequest['cart'],
    shippingCost?: number
  ) => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Validate address
    if (!hasCompleteAddress(address)) {
      setTaxData(null);
      setError(null);
      return;
    }

    // Use provided cart or fallback to Redux cart
    const cartToUse = cart || cart_products;
    const shippingToUse = shippingCost !== undefined ? shippingCost : totalShippingCost;

    // Create cache key
    const cacheKey = createCacheKey(address, cartToUse, shippingToUse);

    // Skip if same request
    if (lastRequestRef.current === cacheKey && taxData) {
      return;
    }

    // Debounce the API call
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setError(null);
        lastRequestRef.current = cacheKey;

        // Prepare request
        const request: TaxCalculationRequest = {
          cart: cartToUse.map(item => ({
            _id: item._id || item.productId || '',
            title: item.title || '',
            price: Number(item.price) || 0,
            finalPriceDiscount: Number(item.finalPriceDiscount || item.price || 0),
            updatedPrice: Number(item.updatedPrice || item.finalPriceDiscount || item.price || 0),
            orderQuantity: Number(item.orderQuantity || 1),
            taxCode: item.taxCode,
          })),
          shippingCost: shippingToUse,
          address: {
            line1: address.line1 || address.address || '',
            city: address.city || '',
            state: address.state || '',
            postal_code: address.postal_code || address.zipCode || '',
            country: address.country || 'US',
          },
        };

        // Call API
        const result = await calculateTaxMutation(request).unwrap();

        console.log('Tax calculation result:', result);

        if (result.success) {
          setTaxData(result);
          console.log('Tax data set:', result);
        } else {
          setTaxData(null);
          setError(result.message || 'Failed to calculate tax');
        }
      } catch (err: any) {
        console.error('Tax calculation error:', err);
        setTaxData(null);
        setError(err?.data?.message || err?.message || 'Failed to calculate tax');
      }
    }, 300); // 300ms debounce
  }, [cart_products, totalShippingCost, hasCompleteAddress, createCacheKey, calculateTaxMutation]);

  /**
   * Clear tax data
   */
  const clearTax = useCallback(() => {
    setTaxData(null);
    setError(null);
    lastRequestRef.current = null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    taxData,
    calculateTax,
    isLoading,
    error,
    clearTax,
  };
};
