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
import GoogleCustomerReviews from './google-customer-reviews';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

// Loading State Component
const OrderLoadingState = () => (
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

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error State Component
const OrderErrorState = () => (
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
            <Button
              asChild
              className="flex items-center gap-2"
            >
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
const OrderEmptyState = () => (
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
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
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

export default function OrderArea({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isError, isLoading } = useGetUserOrderByIdQuery(orderId);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const countdownStartedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if page was already accessed and prevent re-access
  useEffect(() => {
    const storageKey = `order-success-${orderId}`;
    const wasAccessed = sessionStorage.getItem(storageKey);

    if (wasAccessed) {
      // Page was already accessed, redirect immediately to track-order
      router.replace(`/track-order/${orderId}`);
      return;
    }
  }, [orderId, router]);

  // Redirect countdown after 8 seconds - only start after order loads
  useEffect(() => {
    // Only start countdown if order is loaded successfully and countdown hasn't started
    if (!order || isError || isLoading || countdownStartedRef.current) return;

    // Mark that countdown has started
    countdownStartedRef.current = true;
    setRedirectCountdown(8);

    // Start countdown display
    let currentCount = 8;
    const countdownInterval = setInterval(() => {
      currentCount -= 1;
      setRedirectCountdown(currentCount);

      if (currentCount <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Set redirect timeout for 8 seconds
    redirectTimeoutRef.current = setTimeout(() => {
      // Mark page as accessed before redirecting
      const storageKey = `order-success-${orderId}`;
      sessionStorage.setItem(storageKey, 'true');
      // Redirect to track-order page
      router.replace(`/track-order/${orderId}`);
    }, 8000);

    return () => {
      clearInterval(countdownInterval);
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [order, isError, isLoading, orderId, router]);

  // Prevent page refresh to avoid duplicate analytics events
  useEffect(() => {
    // Prevent keyboard shortcuts (F5, Ctrl+R, Cmd+R) - show custom alert
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'r') ||
        (e.metaKey && e.key === 'r')
      ) {
        e.preventDefault();
        setShowCustomAlert(true);
      }
    };

    // Prevent context menu (right-click refresh option)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable browser refresh completely - no beforeunload event
    // This prevents the browser's native "Reload site?" dialog

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const handleGoBackToShopping = () => {
    setShowCustomAlert(false);
    window.location.href = '/shop';
  };

  const handleBackToHome = () => {
    setShowCustomAlert(false);
    window.location.href = '/';
  };

  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isLoading) {
    return <OrderLoadingState />;
  }

  if (isError || !order) {
    return <OrderErrorState />;
  }

  if (!order.order) {
    return <OrderEmptyState />;
  }

  const {
    name,
    country,
    city,
    contact,
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
    paymentIntent, // Payment intent data for Transaction ID and Currency
    shippingDetails, // Shipping details with estimatedDelivery
  } = order.order;

  const orderDate = dayjs(createdAt).format('MMMM D, YYYY');
  const orderTime = dayjs(createdAt).format('h:mm A');
  const subtotal = cart.reduce(
    (sum: number, item: any) => sum + Number(item.finalPriceDiscount || 0) * item.orderQuantity,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Alert Modal */}
      {showCustomAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleBackToHome}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  Back to Home
                </Button>
                <Button
                  onClick={handleGoBackToShopping}
                  size="lg"
                  className="flex-1"
                >
                  Back to Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Order Details
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Card */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Order Confirmation
                </h1>
                <p className="text-lg text-muted-foreground">
                  Thank you for your purchase! Your order has been successfully
                  placed.
                </p>
                {redirectCountdown !== null && redirectCountdown >= 0 && (
                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      <p className="text-base font-medium text-foreground">
                        Redirecting to track your order in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
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

        {/* Coupon Success Message */}
        {(appliedCoupons.length > 0 ||
          (appliedCoupon &&
            (appliedCoupon.discount > 0 ||
              appliedCoupon.discountAmount > 0))) && (
            <Alert className="mb-8 border-green-200 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                {appliedCoupons.length > 0 ? (
                  appliedCoupons.length === 1 ? (
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">
                        Coupon Applied Successfully!
                      </h3>
                      <p className="text-sm">
                        <strong>{appliedCoupons[0].couponCode}</strong> -{' '}
                        {appliedCoupons[0].title}
                        <br />
                        <span className="text-xs">
                          You saved $
                          {(
                            appliedCoupons[0].discount ||
                            appliedCoupons[0].discountAmount ||
                            0
                          ).toFixed(2)}{' '}
                          on this order!
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">
                        {appliedCoupons.length} Coupons Applied Successfully!
                      </h3>
                      <div className="text-sm">
                        {appliedCoupons.map((coupon: any, index: number) => (
                          <div key={index} className="mb-1">
                            <strong>{coupon.couponCode}</strong> - {coupon.title}
                          </div>
                        ))}
                        <div className="font-bold mt-2">
                          Total savings: ${couponDiscounts.toFixed(2)}!
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  appliedCoupon && (
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">
                        Coupon Applied Successfully!
                      </h3>
                      <p className="text-sm">
                        <strong>{appliedCoupon.couponCode}</strong> -{' '}
                        {appliedCoupon.title}
                        <br />
                        <span className="text-xs">
                          You saved $
                          {(
                            appliedCoupon.discount ||
                            appliedCoupon.discountAmount ||
                            0
                          ).toFixed(2)}{' '}
                          on this order!
                        </span>
                      </p>
                    </div>
                  )
                )}
              </AlertDescription>
            </Alert>
          )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
          {/* Order Summary */}
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
                {(firstTimeDiscount?.isApplied ||
                  (!firstTimeDiscount?.isApplied &&
                    discount > 0 &&
                    Math.abs(discount - subtotal * 0.1) < 0.01)) &&
                  firstTimeDiscountAmount > 0 && (
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

                {/* Other discounts (if any remaining) */}
                {otherDiscounts > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-muted-foreground">
                      Other Discounts
                    </span>
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

              {/* Total calculation: Subtotal + Shipping - All Discounts + Tax */}
              {/* <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  $
                  {(
                    subtotal +
                    parseFloat(shippingCost) -
                    firstTimeDiscountAmount -
                    couponDiscounts -
                    otherDiscounts
                  ).toFixed(2)}
                </span>
              </div> */}

              {/* new total ui - orderTotalAmount is tax-inclusive when tax was collected */}
              <div className="border-t border-border pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">Total</span>
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
              {/* new total ui code end here */}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Contact Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{email || contact}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{contact}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Delivery Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">
                        {city}, {country}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-medium flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {paymentMethod === 'COD'
                          ? 'Cash on Delivery'
                          : 'Credit Card'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details - Only show for Card payments */}
          {paymentMethod === 'Card' && paymentIntent?.id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      Transaction Information
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Transaction ID</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 flex-shrink-0"
                            onClick={() => handleCopyToClipboard(paymentIntent.id, 'transactionId')}
                            aria-label="Copy Transaction ID"
                          >
                            {copiedField === 'transactionId' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="bg-muted/50 p-2 rounded-md">
                          <span className="font-medium font-mono text-xs break-all">
                            {paymentIntent.id}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Currency</span>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="font-medium uppercase">
                            {paymentIntent.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Email</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{email || contact}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleCopyToClipboard(email || contact, 'email')}
                            aria-label="Copy Email"
                          >
                            {copiedField === 'email' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Items */}
        <Card>
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
                  <div className="w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.img}
                      alt={item.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    {item.selectedOption && (
                      <p className="text-xs text-muted-foreground">
                        {item.selectedOption.title} (+${Number(item.selectedOption.price).toFixed(2)})
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.orderQuantity}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-foreground">
                      ${(Number(item.finalPriceDiscount || 0) * item.orderQuantity).toFixed(2)}
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

      {/* Floating "Go Back to Shopping" Button */}
      <Button
        asChild
        size="lg"
        className="fixed bottom-6 right-6 z-50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
        aria-label="Go back to shopping"
      >
        <Link href="/shop" className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Go Back to Shopping
        </Link>
      </Button>

      {/* Google Customer Reviews Opt-in */}
      {email && orderUniqueId && (
        <GoogleCustomerReviews
          merchantId={5595301125}
          orderId={orderUniqueId}
          email={email}
          deliveryCountry={country || 'US'}
          estimatedDeliveryDate={shippingDetails?.estimatedDelivery}
          products={cart || []}
        />
      )}
    </div>
  );
}
