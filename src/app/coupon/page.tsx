'use client';

import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import CouponCard from '@/components/version-tsx/coupon/coupon-card';
import CouponProductGrid from '@/components/version-tsx/coupon/coupon-product-grid';
import { useGetAllActiveCouponsQuery } from '@/redux/features/coupon/couponApi';
import {
  AlertCircle,
  Bell,
  Package,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';

export default function CouponPage() {
  const { data: coupons, isLoading, error } = useGetAllActiveCouponsQuery({});
  console.log(coupons);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">
                    Coupons & Deals
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-4">
              <h1 className="text-3xl font-bold text-foreground">
                Coupons & Deals
              </h1>
              <p className="text-muted-foreground mt-2">
                Find the best discounts on automotive parts
              </p>
            </div>
          </div>
        </header>

        {/* Loading State */}
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-muted-foreground animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Finding the best deals...
              </h3>
              <p className="text-muted-foreground">
                Please wait while we load your exclusive offers
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">
                    Coupons & Deals
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Error State */}
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto bg-destructive/5 border-destructive/20">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-destructive mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-muted-foreground mb-6">
                We couldn't load the coupons right now. Please check your
                connection and try again.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!coupons?.data || coupons.data.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">
                    Coupons & Deals
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Empty State */}
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                No Active Deals Right Now
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Don't worry! We're constantly adding new deals and discounts.
                Check back soon or browse our products to find great automotive
                parts.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="default" size="lg">
                  <Link href="/shop" className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Browse Products
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact" className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notify Me of Deals
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  Coupons & Deals
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Coupons & Deals
              </h1>
              <p className="text-muted-foreground mt-2">
                Find the best discounts on automotive parts
              </p>
            </div>

            {/* Coupon Count */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <Package className="h-4 w-4 mr-2" />
                {coupons.data.length}{' '}
                {coupons.data.length === 1 ? 'coupon' : 'coupons'} available
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {/* Coupons List */}
          {coupons.data.map((coupon: any, index: number) => (
            <div key={coupon._id || index} className="space-y-6">
              <CouponCard coupon={coupon} />
              <CouponProductGrid
                products={coupon.applicableProducts}
                coupon={coupon}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
