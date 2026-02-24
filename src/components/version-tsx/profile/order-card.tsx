'use client';

import { add_cart_product } from '@/redux/features/cartSlice';
import { notifySuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import dayjs from 'dayjs';
import {
  CreditCard,
  DollarSign,
  Eye,
  ExternalLink,
  Package,
  RotateCcw,
  ShoppingCart,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import OrderStatusBadge from './order-status-badge';

interface OrderCardProps {
  order: any;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const dispatch = useDispatch();
  const [isReordering, setIsReordering] = useState(false);

  const handleReorder = async () => {
    if (!order.cart?.length) return;
    setIsReordering(true);
    let addedCount = 0;
    for (const item of order.cart) {
      const qty = item.orderQuantity || 1;
      const cartProduct = {
        _id: item._id,
        title: item.title || `Product`,
        img: item.img || '',
        finalPriceDiscount: Number(item.finalPriceDiscount || 0),
        orderQuantity: 1,
        quantity: item.quantity || 999,
        slug: item.slug || item._id,
        shipping: item.shipping || { price: 0 },
        sku: item.sku ?? item._id ?? '',
        selectedOption: item.selectedOption,
      };
      for (let i = 0; i < qty; i++) {
        dispatch(add_cart_product(cartProduct));
        addedCount++;
      }
    }
    setIsReordering(false);
    notifySuccess(`Added ${addedCount} item${addedCount !== 1 ? 's' : ''} to cart`);
  };
  const orderDate = dayjs(order.createdAt).format('MMM D, YYYY');
  const orderTime = dayjs(order.createdAt).format('h:mm A');

  const trackingUrl =
    order.shippingDetails?.trackingUrl ||
    order.shippingDetails?.carriers?.[0]?.trackingUrl;
  const hasTracking = Boolean(trackingUrl);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Order Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                  Order #{order.orderId || order.invoice}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {orderDate} at {orderTime}
                </p>
              </div>
            </div>

            {/* Order Status and Actions - Mobile Optimized */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <OrderStatusBadge status={order.status} />
              <div className="flex flex-wrap items-center gap-1">
                {order.cart?.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-8"
                    onClick={handleReorder}
                    disabled={isReordering}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">
                      {isReordering ? 'Adding...' : 'Reorder'}
                    </span>
                  </Button>
                )}
                {hasTracking && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-8"
                  >
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">Track</span>
                    </a>
                  </Button>
                )}
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 py-1 h-8"
                >
                  <Link
                    href={`/order/${order._id}`}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="hidden sm:inline">View</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Product Images - Mobile Optimized */}
          {order.cart && order.cart.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Products:</p>
              <div className="grid grid-cols-1 gap-3">
                {order.cart.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    {item.img ? (
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-background border flex-shrink-0">
                        <Image
                          src={item.img}
                          alt={item.title || `Product ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 48px, 64px"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {item.title || `Product ${index + 1}`}
                      </p>
                      {item.selectedOption && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.selectedOption.title} (+${Number(item.selectedOption.price).toFixed(2)})
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                        <span>Qty: {item.orderQuantity || 1}</span>
                        <span>${Number(item.finalPriceDiscount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Details - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">
                {order.cart?.length || 0} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">
                ${order.totalAmount?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">
                {order.paymentMethod === 'COD' ? 'COD' : 'Card'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
