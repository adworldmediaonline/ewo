import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Handbag, Package } from 'lucide-react';
import Link from 'next/link';
import ProductItem from './product-item';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  sku?: string;
  productType?: string;
  img?: string;
  imageURLs?: string[];
  price: number;
  updatedPrice?: number;
  finalPriceDiscount?: number;
  category?: {
    name: string;
    id: string;
  };
  status: string;
  quantity: number;
  shipping?: {
    price: number;
    description?: string;
  };
  reviews?: Array<{
    rating: number;
  }>;
}

export interface Coupon {
  _id: string;
  couponCode: string;
  discountType: 'percentage' | 'amount';
  discountPercentage?: number;
  discountAmount?: number;
  endTime: string;
  applicableProducts: Product[];
  applicableType?: 'all' | 'product' | 'category' | 'brand';
}

interface CouponProductGridProps {
  products: Product[];
  coupon: Coupon;
}

export default function CouponProductGrid({
  products,
  coupon,
}: CouponProductGridProps) {
  // If coupon applies to all products, show shop button instead of product grid
  if (coupon.applicableType === 'all') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Handbag className="h-8 w-8 text-primary" />
        </div>
        <h4 className="text-xl font-semibold text-foreground mb-2">
          This coupon applies to all products!
        </h4>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Browse our entire collection and use coupon code{' '}
          <span className="font-mono font-bold text-primary">
            {coupon.couponCode}
          </span>{' '}
          at checkout to get your discount.
        </p>
        <Button asChild size="lg" className="px-8">
          <Link href="/shop" className="flex items-center gap-2">
            <Handbag className="h-5 w-5" />
            Shop All Products
          </Link>
        </Button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No products available for this coupon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h4 className="text-xl font-semibold text-foreground">
            Products Eligible for{' '}
            <span className="text-primary">{coupon.couponCode}</span>
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <Package className="h-4 w-4 mr-2" />
              {products.length} {products.length === 1 ? 'product' : 'products'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <div key={product._id || index} className="group">
            <ProductItem product={product} coupons={[coupon]} />
          </div>
        ))}
      </div>

      {/* View All Button */}
      {products.length > 8 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="lg" className="px-8">
            <Eye className="h-5 w-5 mr-2" />
            View All {products.length} Products
          </Button>
        </div>
      )}
    </div>
  );
}
