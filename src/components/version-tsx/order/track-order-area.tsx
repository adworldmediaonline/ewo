'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUserOrderByIdQuery } from '@/redux/features/order/orderApi';
import dayjs from 'dayjs';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Loading State Component
const TrackOrderLoadingState = () => (
  <div className="py-8 lg:py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>

        {/* Order Info Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Error State Component
const TrackOrderErrorState = () => (
  <div className="py-8 lg:py-12">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <Card>
        <CardContent className="pt-8 pb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Error Loading Order
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            We encountered an issue while loading your order details. Please
            contact support if the problem persists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href="/contact">
                Contact Support
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Empty State Component
const TrackOrderEmptyState = () => (
  <div className="py-8 lg:py-12">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <Card>
        <CardContent className="pt-8 pb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <Receipt className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Order Not Found
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            We couldn't find the order you're looking for. Please check your
            order ID or contact support for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href="/shop">
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link href="/contact">
                Contact Support
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function TrackOrderArea({ orderId }: { orderId: string }) {
  const { data: order, isError, isLoading } = useGetUserOrderByIdQuery(orderId);

  if (isLoading) {
    return <TrackOrderLoadingState />;
  }

  if (isError || !order) {
    return <TrackOrderErrorState />;
  }

  if (!order.order) {
    return <TrackOrderEmptyState />;
  }

  const {
    name,
    invoice,
    orderId: orderUniqueId,
    createdAt,
    cart,
    shippingCost,
    discount,
    totalAmount: orderTotalAmount,
    taxAmount: orderTaxAmount = 0,
    paymentMethod,
    status,
    email,
    firstTimeDiscount,
    appliedCoupons = [],
    appliedCoupon,
    shippingDetails,
  } = order.order;

  const orderDate = dayjs(createdAt).format('MMMM D, YYYY');
  const orderTime = dayjs(createdAt).format('h:mm A');
  const subtotal = cart.reduce(
    (sum: number, item: any) =>
      sum + Number(item.finalPriceDiscount || 0) * item.orderQuantity,
    0
  );

  // Calculate first-time discount amount if applied
  let firstTimeDiscountAmount = 0;
  if (firstTimeDiscount?.isApplied && firstTimeDiscount?.amount > 0) {
    firstTimeDiscountAmount = firstTimeDiscount.amount;
  }

  // Calculate coupon discounts
  let couponDiscounts = 0;
  let couponDisplayText = '';

  // Handle multiple coupons first (enhanced)
  if (appliedCoupons && appliedCoupons.length > 0) {
    couponDiscounts = appliedCoupons.reduce(
      (sum: number, coupon: any) =>
        sum + (coupon.discount || coupon.discountAmount || 0),
      0
    );

    if (appliedCoupons.length === 1) {
      const coupon = appliedCoupons[0];
      couponDisplayText = `${coupon.couponCode} (${coupon.title})`;
    } else {
      couponDisplayText = `${appliedCoupons.length} Coupons Applied`;
    }
  } else if (
    appliedCoupon &&
    (appliedCoupon.discount > 0 || appliedCoupon.discountAmount > 0)
  ) {
    // Legacy single coupon support
    couponDiscounts = appliedCoupon.discount || appliedCoupon.discountAmount;
    couponDisplayText = `${appliedCoupon.couponCode} (${appliedCoupon.title})`;
  }

  // Calculate other discounts (remaining after first-time and coupon discounts)
  const otherDiscounts = Math.max(
    0,
    discount - firstTimeDiscountAmount - couponDiscounts
  );

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered')
      return 'bg-green-100 text-green-800 border-green-200';
    if (statusLower === 'processing')
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (statusLower === 'shipped')
      return 'bg-blue-100 text-blue-800 border-blue-200';
    if (statusLower === 'cancelled')
      return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return <CheckCircle className="w-4 h-4" />;
    if (statusLower === 'processing') return <Clock className="w-4 h-4" />;
    if (statusLower === 'shipped') return <Truck className="w-4 h-4" />;
    if (statusLower === 'cancelled')
      return <AlertTriangle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  // Format estimated delivery date
  const formatEstimatedDelivery = () => {
    if (!shippingDetails?.estimatedDelivery) return null;
    const date =
      shippingDetails.estimatedDelivery instanceof Date
        ? shippingDetails.estimatedDelivery
        : new Date(shippingDetails.estimatedDelivery);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format shipped date
  const formatShippedDate = () => {
    if (!shippingDetails?.shippedDate) return null;
    const date =
      shippingDetails.shippedDate instanceof Date
        ? shippingDetails.shippedDate
        : new Date(shippingDetails.shippedDate);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isShipped = status?.toLowerCase() === 'shipped';

  // Support both new (multiple carriers) and legacy (single carrier) formats
  const shippingCarriers = shippingDetails?.carriers && Array.isArray(shippingDetails.carriers) && shippingDetails.carriers.length > 0
    ? shippingDetails.carriers
    : shippingDetails?.carrier
      ? [{
        carrier: shippingDetails.carrier,
        trackingNumber: shippingDetails.trackingNumber,
        trackingUrl: shippingDetails.trackingUrl,
      }]
      : [];

  // Legacy fields for backward compatibility
  const trackingUrl = shippingDetails?.trackingUrl;
  const trackingNumber = shippingDetails?.trackingNumber;
  const carrier = shippingDetails?.carrier || 'Standard Shipping';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  Track Order
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Order Snapshot */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Receipt className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Order ID
                  </p>
                  <p className="text-lg font-semibold text-foreground font-mono">
                    {orderUniqueId || invoice}
                  </p>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Order Date
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {orderDate}
                  </p>
                  <p className="text-sm text-muted-foreground">{orderTime}</p>
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge className={`${getStatusColor(status)} border`}>
                    <span className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      {status}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Information - Prominent for Shipped Orders */}
        {isShipped && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Shipping Information
                {shippingCarriers.length > 1 && (
                  <Badge variant="secondary" className="ml-2">
                    {shippingCarriers.length} Packages
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Multiple Carriers Display */}
              {shippingCarriers.length > 0 ? (
                <div className="space-y-4">
                  {shippingCarriers.map((carrierItem: { carrier?: string; trackingNumber?: string; trackingUrl?: string }, index: number) => (
                    <div
                      key={index}
                      className="bg-background border-2 border-primary/20 rounded-lg p-4 space-y-3"
                    >
                      {shippingCarriers.length > 1 && (
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            Package {index + 1} of {shippingCarriers.length}
                          </Badge>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-2 flex-1">
                          <div>
                            <p className="text-sm text-muted-foreground">Carrier</p>
                            <p className="font-semibold text-foreground">
                              {carrierItem.carrier || 'Standard Shipping'}
                            </p>
                          </div>
                          {carrierItem.trackingNumber && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Tracking Number
                              </p>
                              <p className="font-mono text-sm text-foreground break-all">
                                {carrierItem.trackingNumber}
                              </p>
                            </div>
                          )}
                        </div>

                        {carrierItem.trackingUrl && (
                          <Button
                            asChild
                            size="lg"
                            className="w-full sm:w-auto shrink-0"
                          >
                            <a
                              href={carrierItem.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              Track Package {shippingCarriers.length > 1 ? index + 1 : ''}
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>

                      {!carrierItem.trackingUrl && !carrierItem.trackingNumber && (
                        <Alert className="mt-2">
                          <Clock className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Tracking information will be available soon for this package.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback: Legacy single carrier display */
                <>
                  {/* Tracking URL - Most Important */}
                  {trackingUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-primary" />
                          Track Your Package
                        </h3>
                      </div>
                      <div className="bg-background border-2 border-primary/20 rounded-lg p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Carrier</p>
                            <p className="font-semibold text-foreground">{carrier}</p>
                            {trackingNumber && (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  Tracking Number
                                </p>
                                <p className="font-mono text-sm text-foreground">
                                  {trackingNumber}
                                </p>
                              </>
                            )}
                          </div>
                          <Button
                            asChild
                            size="lg"
                            className="w-full sm:w-auto"
                          >
                            <a
                              href={trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              Track Order
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tracking Number Only (if URL not available) */}
                  {!trackingUrl && trackingNumber && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Truck className="w-4 h-4 text-primary" />
                          Tracking Information
                        </h3>
                      </div>
                      <div className="bg-background border rounded-lg p-4 space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Carrier</p>
                          <p className="font-semibold text-foreground">{carrier}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Tracking Number
                          </p>
                          <p className="font-mono text-sm text-foreground break-all">
                            {trackingNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Shipped Date */}
              {formatShippedDate() && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Shipped Date
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatShippedDate()}
                  </p>
                </div>
              )}

              {/* Estimated Delivery */}
              {formatEstimatedDelivery() && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Estimated Delivery
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {formatEstimatedDelivery()}
                  </p>
                </div>
              )}

              {/* No tracking info available */}
              {shippingCarriers.length === 0 && !trackingUrl && !trackingNumber && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Your order has been shipped! Tracking information will be
                    available soon. You will receive an email notification once
                    tracking details are updated.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Status for Non-Shipped Orders */}
        {!isShipped && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  {status?.toLowerCase() === 'processing'
                    ? 'Your order is currently being processed. You will receive a shipping notification with tracking information once your order ships.'
                    : `Your order status: ${status}. We will notify you when your order ships with tracking information.`}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Order Summary - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    ${parseFloat(shippingCost.toFixed(2)).toFixed(2)}
                  </span>
                </div>

                {/* First-time discount */}
                {firstTimeDiscountAmount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center gap-2">
                      🎉 First-time order discount (-
                      {firstTimeDiscount?.percentage || 10}%)
                    </span>
                    <span className="font-medium">
                      -${firstTimeDiscountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Coupon discounts */}
                {couponDiscounts > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-muted-foreground">
                      {couponDisplayText}
                    </span>
                    <span className="font-medium">
                      -${couponDiscounts.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Other discounts */}
                {otherDiscounts > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-muted-foreground">Other Discounts</span>
                    <span className="font-medium">
                      -${otherDiscounts.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Tax */}
                {Number(orderTaxAmount) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">
                      ${Number(orderTaxAmount).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="border-t border-border pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    $
                    {(
                      orderTotalAmount ??
                      subtotal +
                        parseFloat(shippingCost) -
                        firstTimeDiscountAmount -
                        couponDiscounts -
                        otherDiscounts +
                        Number(orderTaxAmount || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Payment Method
                  </p>
                  <p className="text-foreground">
                    {paymentMethod === 'COD'
                      ? 'Cash on Delivery'
                      : paymentMethod || 'Credit Card'}
                  </p>
                </div>
                {email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Email
                    </p>
                    <p className="text-foreground">{email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Order Date
                  </p>
                  <p className="text-foreground">{orderDate} at {orderTime}</p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Order Items - Compact View */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cart.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30"
                >
                  <div className="w-16 h-16 shrink-0">
                    <Image
                      src={item.img}
                      alt={item.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {item.title}
                    </h3>
                    {item.selectedOption && (
                      <p className="text-xs text-muted-foreground">
                        {item.selectedOption.title} (+$
                        {Number(item.selectedOption.price).toFixed(2)})
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.orderQuantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-foreground">
                      $
                      {(
                        Number(item.finalPriceDiscount || 0) *
                        item.orderQuantity
                      ).toFixed(2)}
                    </div>
                    {item.orderQuantity > 1 && (
                      <div className="text-xs text-muted-foreground">
                        ${Number(item.finalPriceDiscount || 0).toFixed(2)} each
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Need help with your order? Contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/shop" className="flex items-center gap-2">
                  Continue Shopping
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact" className="flex items-center gap-2">
                  Contact Support
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

