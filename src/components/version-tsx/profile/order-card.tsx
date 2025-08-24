'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, DollarSign, CreditCard, Eye } from 'lucide-react';
import Link from 'next/link';
import dayjs from 'dayjs';
import OrderStatusBadge from './order-status-badge';

interface OrderCardProps {
  order: any;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const orderDate = dayjs(order.createdAt).format('MMM D, YYYY');
  const orderTime = dayjs(order.createdAt).format('h:mm A');

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Order #{order.orderId || order.invoice}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {orderDate} at {orderTime}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {order.cart?.length || 0} items
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  ${order.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {order.paymentMethod === 'COD'
                    ? 'Cash on Delivery'
                    : 'Credit Card'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <Button asChild size="sm" variant="outline">
              <Link
                href={`/order/${order._id}`}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
