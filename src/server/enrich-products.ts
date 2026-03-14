/**
 * Server-side product price enrichment.
 * No "use cache" - coupon data must be fresh.
 */
import {
  getStoreCouponSettings,
  getActiveCoupons,
  buildOffersForProduct,
  pickBestOffer,
} from "@/lib/store-api";
import type { CouponBehaviorSettings } from "@/lib/store-api";
import type { RawCoupon } from "@/lib/store-api";

/** Product shape for enrichment - needs _id, price, updatedPrice, finalPriceDiscount */
type ProductForEnrichment = {
  _id: string;
  price?: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  [key: string]: unknown;
};

/** Enriched product with display price fields */
export type EnrichedProduct = ProductForEnrichment & {
  displayPrice?: number;
  displayMarkedPrice?: number;
  hasDisplayDiscount?: boolean;
  /** Coupon code when auto-applied (for cart discount badge) */
  appliedCouponCode?: string;
  /** Coupon percentage when auto-applied (for cart discount badge) */
  appliedCouponPercentage?: number;
};

/** Pre-fetched data for enrichment - enables parallel fetch with products */
export type EnrichmentPreFetched = {
  settings: CouponBehaviorSettings;
  coupons: RawCoupon[];
};

function enrichProductsSync<T extends ProductForEnrichment>(
  products: T[],
  settings: CouponBehaviorSettings,
  couponsRaw: RawCoupon[]
): (T & EnrichedProduct)[] {
  const strategy =
    settings.autoApply && settings.autoApplyStrategy !== "customer_choice"
      ? (settings.autoApplyStrategy as
          | "best_savings"
          | "first_created"
          | "highest_percentage")
      : null;
  const coupons = strategy ? couponsRaw : [];

  return products.map((p) => {
    const mainPrice = Number(p.finalPriceDiscount ?? p.price ?? 0);
    const originalBasePrice = Number(p.price ?? p.updatedPrice ?? mainPrice);

    let displayPrice = mainPrice;
    let displayMarkedPrice: number | undefined;
    let hasDisplayDiscount = mainPrice < originalBasePrice;

    if (strategy && mainPrice > 0 && coupons.length > 0) {
      const offers = buildOffersForProduct(coupons, p._id, mainPrice);
      const best = pickBestOffer(offers, strategy);

      if (best && best.discountAmount > 0) {
        displayPrice = Math.round((mainPrice - best.discountAmount) * 100) / 100;
        displayMarkedPrice = originalBasePrice;
        hasDisplayDiscount = true;
        const couponPercentage =
          best.type === "percentage"
            ? Math.round(best.value)
            : mainPrice > 0
              ? Math.round((best.discountAmount / mainPrice) * 100)
              : 0;
        return {
          ...p,
          finalPriceDiscount: displayPrice,
          displayPrice,
          displayMarkedPrice,
          hasDisplayDiscount,
          appliedCouponCode: best.code,
          appliedCouponPercentage: couponPercentage,
        };
      } else {
        displayMarkedPrice = hasDisplayDiscount ? originalBasePrice : undefined;
      }
    } else {
      displayMarkedPrice = hasDisplayDiscount ? originalBasePrice : undefined;
    }

    return {
      ...p,
      finalPriceDiscount: displayPrice,
      displayPrice,
      displayMarkedPrice,
      hasDisplayDiscount,
    };
  });
}

/**
 * Enrich products with display prices on the server.
 * Accepts optional pre-fetched settings/coupons for parallel loading.
 */
export async function enrichProductsWithDisplayPrices<T extends ProductForEnrichment>(
  products: T[],
  preFetched?: EnrichmentPreFetched
): Promise<(T & EnrichedProduct)[]> {
  if (products.length === 0) return [];

  try {
    const [settings, couponsRaw] = preFetched
      ? [preFetched.settings, preFetched.coupons]
      : await Promise.all([
          getStoreCouponSettings(),
          getActiveCoupons(),
        ]);
    return enrichProductsSync(products, settings, couponsRaw);
  } catch (err) {
    console.error("enrichProductsWithDisplayPrices error:", err);
    return products.map((p) => {
      const mainPrice = Number(p.finalPriceDiscount ?? p.price ?? 0);
      const originalBasePrice = Number(p.price ?? p.updatedPrice ?? mainPrice);
      const hasDisplayDiscount = mainPrice < originalBasePrice;
      const displayPrice = mainPrice;
      const displayMarkedPrice = hasDisplayDiscount ? originalBasePrice : undefined;
      return {
        ...p,
        finalPriceDiscount: displayPrice,
        displayPrice,
        displayMarkedPrice,
        hasDisplayDiscount,
      };
    });
  }
}
