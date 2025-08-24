'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetUserOrdersQuery } from '@/redux/features/order/orderApi';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import OrderCard from './order-card';

interface ProfileOrdersSectionProps {
  userId?: string;
  maxOrders?: number;
  showViewAllButton?: boolean;
}

const ProfileOrdersSection: React.FC<ProfileOrdersSectionProps> = ({
  userId,
  maxOrders = 5,
  showViewAllButton = true,
}) => {
  // Fetch user orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch,
  } = useGetUserOrdersQuery(userId, {
    refetchOnMountOrArgChange: true,
  });

  const orders = ordersData?.orders || [];

  console.log('ordersData', ordersData);

  // Loading state
  if (ordersLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Track your order status and view order details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (ordersError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Track your order status and view order details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load orders. Please try again later.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Track your order status and view order details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Orders Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link href="/shop">
                Start Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Orders display
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Recent Orders
        </CardTitle>
        <CardDescription>
          Track your order status and view order details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.slice(0, maxOrders).map((order: any) => (
            <OrderCard key={order._id} order={order} />
          ))}

          {showViewAllButton && orders.length > maxOrders && (
            <div className="text-center pt-4">
              <Button variant="outline" asChild>
                <Link href="/orders">
                  View All Orders ({orders.length})
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileOrdersSection;
