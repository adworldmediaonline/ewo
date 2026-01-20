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
  const taxDataRef = useRef<TaxCalculationResponse | null>(null); // Ref to track taxData without stale closure

  // Keep taxDataRef in sync with taxData state
  useEffect(() => {
    taxDataRef.current = taxData;
  }, [taxData]);

  // Get cart products from Redux
  const cart_products = useSelector((state: any) => state.cart.cart_products || []);
  const totalShippingCost = useSelector((state: any) => state.cart.totalShippingCost || 0);

  /**
   * Check if address is complete for tax calculation
   */
  const hasCompleteAddress = useCallback((address: TaxCalculationRequest['address']): boolean => {
    if (!address) return false;

    // For US addresses, we need state, city, and zip code
    // Address/line1 is optional for tax calculation
    if (address.country === 'US') {
      return !!(
        address.state &&
        address.state.trim() !== '' &&
        address.city &&
        address.city.trim() !== '' &&
        (address.postal_code || address.zipCode) &&
        (address.postal_code || address.zipCode || '').trim() !== ''
      );
    }

    // For other countries, we might not calculate tax
    return false;
  }, []);

  /**
   * Create a cache key from address and cart
   * Normalize values to ensure consistent caching
   */
  const createCacheKey = useCallback((
    address: TaxCalculationRequest['address'],
    cart: TaxCalculationRequest['cart'],
    shippingCost: number
  ): string => {
    // Normalize address fields (trim and lowercase for comparison)
    const normalizedState = (address.state || '').trim().toLowerCase();
    const normalizedCity = (address.city || '').trim().toLowerCase();
    const normalizedZip = ((address.postal_code || address.zipCode) || '').trim();
    const addressKey = `${address.country || 'US'}-${normalizedState}-${normalizedCity}-${normalizedZip}`;

    // Create cart key from product IDs, quantities, and prices
    const cartKey = cart
      .map((item: TaxCalculationRequest['cart'][number]) => `${item._id || ''}-${item.orderQuantity || 1}-${item.finalPriceDiscount || item.price || 0}`)
      .sort() // Sort to ensure consistent key regardless of order
      .join('|');

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
    console.log('🔵 [TAX CALC] calculateTax called with:', {
      address: {
        line1: address.line1 || address.address || '',
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postal_code || address.zipCode || '',
        country: address.country || 'US',
      },
      cartItems: cart?.length || cart_products.length,
      shippingCost: shippingCost !== undefined ? shippingCost : totalShippingCost,
    });

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      console.log('⏱️ [TAX CALC] Cleared previous debounce timer');
    }

    // Validate address
    if (!hasCompleteAddress(address)) {
      console.log('❌ [TAX CALC] Address incomplete, clearing tax data');
      setTaxData(null);
      setError(null);
      return;
    }

    console.log('✅ [TAX CALC] Address validation passed');

    // Use provided cart or fallback to Redux cart
    const cartToUse = cart || cart_products;
    const shippingToUse = shippingCost !== undefined ? shippingCost : totalShippingCost;

    console.log('📦 [TAX CALC] Cart details:', {
      itemCount: cartToUse.length,
      items: cartToUse.map((item: TaxCalculationRequest['cart'][number] | any) => ({
        id: item._id || item.productId,
        title: item.title,
        price: item.price,
        finalPriceDiscount: item.finalPriceDiscount,
        updatedPrice: item.updatedPrice,
        quantity: item.orderQuantity,
      })),
      shippingCost: shippingToUse,
    });

    // Create cache key
    const cacheKey = createCacheKey(address, cartToUse, shippingToUse);
    console.log('🔑 [TAX CALC] Cache key:', cacheKey);
    console.log('🔑 [TAX CALC] Last request key:', lastRequestRef.current);

    // Skip if same request AND we already have tax data for it
    // Use ref to avoid stale closure issues
    if (lastRequestRef.current === cacheKey && taxDataRef.current) {
      console.log('⏭️ [TAX CALC] Skipping - same request as before, already have data');
      return;
    }

    console.log('⏳ [TAX CALC] Starting debounce timer (300ms)...');

    // Debounce the API call
    debounceTimerRef.current = setTimeout(async () => {
      try {
        console.log('🚀 [TAX CALC] Making API call after debounce...');
        setError(null);
        lastRequestRef.current = cacheKey;

        // Prepare request
        const request: TaxCalculationRequest = {
          cart: cartToUse.map((item: TaxCalculationRequest['cart'][number] | any) => ({
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

        console.log('📤 [TAX CALC] API Request:', JSON.stringify(request, null, 2));

        // Call API
        const result = await calculateTaxMutation(request).unwrap();

        console.log('📥 [TAX CALC] API Response:', JSON.stringify(result, null, 2));
        console.log('📊 [TAX CALC] Response Summary:', {
          success: result.success,
          calculationId: result.calculationId,
          taxAmount: result.taxAmount,
          taxAmountExclusive: result.taxAmountExclusive,
          amountTotal: result.amountTotal,
          subtotal: result.subtotal,
          taxBreakdownCount: result.taxBreakdown?.length || 0,
          isCollectingTax: result.isCollectingTax,
          taxabilityReason: result.taxabilityReason,
        });

        if (result.success) {
          setTaxData(result);
          console.log('✅ [TAX CALC] Tax data set successfully');
        } else {
          console.log('❌ [TAX CALC] Tax calculation failed:', result.message);
          setTaxData(null);
          setError(result.message || 'Failed to calculate tax');
        }
      } catch (err: any) {
        console.error('❌ [TAX CALC] API Error:', err);
        console.error('❌ [TAX CALC] Error Details:', {
          type: err?.type,
          code: err?.code,
          message: err?.message,
          data: err?.data,
        });
        setTaxData(null);
        setError(err?.data?.message || err?.message || 'Failed to calculate tax');
      }
    }, 300); // 300ms debounce
  }, [cart_products, totalShippingCost, hasCompleteAddress, createCacheKey, calculateTaxMutation]); // Removed taxData to avoid stale closure

  /**
   * Clear tax data
   */
  const clearTax = useCallback(() => {
    console.log('🧹 [TAX CALC] clearTax called - clearing all tax data');
    setTaxData(null);
    setError(null);
    lastRequestRef.current = null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      console.log('⏱️ [TAX CALC] Cleared debounce timer');
    }
    console.log('✅ [TAX CALC] Tax data cleared successfully');
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
