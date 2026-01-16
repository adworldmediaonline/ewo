import { apiSlice } from '../../api/apiSlice';

export interface TaxCalculationRequest {
  cart: Array<{
    _id?: string;
    title: string;
    price?: number;
    finalPriceDiscount?: number;
    updatedPrice?: number;
    orderQuantity: number;
    taxCode?: string;
  }>;
  shippingCost: number;
  address: {
    line1?: string;
    address?: string;
    city: string;
    state: string;
    postal_code?: string;
    zipCode?: string;
    country: string;
  };
}

export interface TaxBreakdown {
  jurisdiction: string;
  rate: number;
  amount: number;
  country: string;
  state: string | null;
  taxability_reason?: string | null;
}

export interface TaxCalculationResponse {
  success: boolean;
  calculationId: string | null;
  taxAmount: number;
  taxAmountExclusive: number;
  amountTotal: number;
  subtotal: number;
  taxBreakdown: TaxBreakdown[];
  isCollectingTax?: boolean;
  taxabilityReason?: string | null;
  message?: string;
  error?: string;
}

export const taxApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // Calculate tax
    calculateTax: builder.mutation<TaxCalculationResponse, TaxCalculationRequest>({
      query: data => ({
        url: 'api/tax/calculate',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useCalculateTaxMutation } = taxApi;
