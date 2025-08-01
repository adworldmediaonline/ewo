'use client';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useState } from 'react';
import styles from './my-orders.module.css';

// SVG Icons for Order Status
const OrderStatusIcon = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case 'pending':
      return (
        <svg className={styles.orderStatIcon} viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <polyline
            points="12,6 12,12 16,14"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'processing':
      return (
        <svg className={styles.orderStatIcon} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'shipped':
      return (
        <svg className={styles.orderStatIcon} viewBox="0 0 24 24" fill="none">
          <rect
            x="1"
            y="3"
            width="15"
            height="13"
            stroke="currentColor"
            strokeWidth="2"
          />
          <polygon
            points="16,8 20,8 23,11 23,16 16,16 16,8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="5.5"
            cy="18.5"
            r="2.5"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            cx="18.5"
            cy="18.5"
            r="2.5"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'delivered':
      return (
        <svg className={styles.orderStatIcon} viewBox="0 0 24 24" fill="none">
          <path
            d="M22 11.08V12a10 10 0 11-5.93-9.14"
            stroke="currentColor"
            strokeWidth="2"
          />
          <polyline
            points="22,4 12,14.01 9,11.01"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case 'cancel':
    case 'cancelled':
      return (
        <svg className={styles.orderStatIcon} viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="15"
            y1="9"
            x2="9"
            y2="15"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="9"
            y1="9"
            x2="15"
            y2="15"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    default:
      return (
        <svg className={styles.orderStatIcon} viewBox="0 0 24 24" fill="none">
          <path
            d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
  }
};

const OrderTimeline = ({ order }) => {
  const stages = [
    { key: 'pending', label: 'Order Placed', icon: OrderStatusIcon },
    { key: 'processing', label: 'Processing', icon: OrderStatusIcon },
    { key: 'shipped', label: 'Shipped', icon: OrderStatusIcon },
    { key: 'delivered', label: 'Delivered', icon: OrderStatusIcon },
  ];

  const normalizedStatus = order.status?.toLowerCase();
  const currentStageIndex = stages.findIndex(
    stage => stage.key === normalizedStatus
  );

  // Handle cancelled orders
  if (['cancel', 'cancelled'].includes(normalizedStatus)) {
    return (
      <div className={styles.orderTimeline}>
        <div className={styles.timelineTitle}>Order Status</div>
        <div className={styles.timelineContainer}>
          <div className={`${styles.timelineStep} ${styles.completed}`}>
            <div className={`${styles.timelineIcon} ${styles.cancelled}`}>
              <OrderStatusIcon status="cancelled" />
            </div>
            <div className={styles.timelineLabel}>Order Cancelled</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.orderTimeline}>
      <div className={styles.timelineTitle}>Order Progress</div>
      <div className={styles.timelineContainer}>
        {stages.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const IconComponent = stage.icon;

          return (
            <div
              key={stage.key}
              className={`${styles.timelineStep} ${
                isCompleted ? styles.completed : ''
              } ${isCurrent ? styles.current : ''}`}
            >
              <div
                className={`${styles.timelineIcon} ${
                  isCompleted ? styles.completed : ''
                } ${isCurrent ? styles.current : ''}`}
              >
                <IconComponent status={stage.key} />
              </div>
              <div className={styles.timelineLabel}>{stage.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Expand/Collapse Icon
const ExpandIcon = ({ expanded }) => (
  <svg
    className={`${styles.expandIcon} ${expanded ? styles.expanded : ''}`}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function MyOrders({ orderData }) {
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const order_items = orderData?.orders || [];

  // Filter orders with proper status normalization
  const filteredOrders =
    filter === 'all'
      ? order_items
      : order_items.filter(order => {
          const normalizedStatus = order.status?.toLowerCase();
          if (filter === 'cancelled') {
            return ['cancel', 'cancelled'].includes(normalizedStatus);
          }
          return normalizedStatus === filter;
        });

  const filterCounts = {
    all: order_items.length,
    pending: order_items.filter(o => o.status?.toLowerCase() === 'pending')
      .length,
    processing: order_items.filter(
      o => o.status?.toLowerCase() === 'processing'
    ).length,
    shipped: order_items.filter(o => o.status?.toLowerCase() === 'shipped')
      .length,
    delivered: order_items.filter(o => o.status?.toLowerCase() === 'delivered')
      .length,
    cancelled: order_items.filter(o =>
      ['cancel', 'cancelled'].includes(o.status?.toLowerCase())
    ).length,
  };

  const toggleOrderExpansion = orderId => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusClass = status => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'shipped':
        return 'shipped';
      case 'delivered':
        return 'delivered';
      case 'cancel':
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  const formatStatusText = status => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'cancel') return 'Cancelled';
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  };

  if (!order_items || order_items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>🛒</div>
        <h3 className={styles.emptyStateTitle}>No Orders Yet!</h3>
        <p className={styles.emptyStateText}>
          Start shopping to see your orders here
        </p>
        <Link href="/shop" className={styles.emptyStateButton}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.myOrdersContainer}>
      {/* Order Filters */}
      <div className={styles.ordersFilterSection}>
        <div className={styles.ordersFilterButtons}>
          {Object.entries(filterCounts).map(([key, count]) => (
            <button
              key={key}
              className={`${styles.filterButton} ${
                filter === key ? styles.active : ''
              }`}
              onClick={() => setFilter(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
              <span className={styles.filterBadge}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className={styles.ordersContainer}>
        {filteredOrders.map(order => {
          const isExpanded = expandedOrder === order._id;

          return (
            <div key={order._id} className={styles.orderCard}>
              {/* Order Header */}
              <div
                className={styles.orderHeader}
                onClick={() => toggleOrderExpansion(order._id)}
              >
                <div className={styles.orderHeaderTop}>
                  <div className={styles.orderHeaderLeft}>
                    <div className={styles.orderStat}>
                      <OrderStatusIcon status={order.status} />
                      <div>
                        <h4 className={styles.orderId}>
                          #{order.invoice || order._id.substring(20, 25)}
                        </h4>
                        <p className={styles.orderDate}>
                          {dayjs(order.createdAt).format(
                            'MMM D, YYYY • h:mm A'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.orderHeaderRight}>
                    <div className={styles.orderStats}>
                      <div className={styles.orderStat}>
                        <span className={styles.orderAmount}>
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                        <span className={styles.orderItemsCount}>
                          {order.cart?.length || 0} items
                        </span>
                      </div>
                    </div>

                    <span
                      className={`${styles.statusBadge} ${
                        styles[getStatusClass(order.status)]
                      }`}
                    >
                      {formatStatusText(order.status)}
                    </span>

                    <ExpandIcon expanded={isExpanded} />
                  </div>
                </div>
              </div>

              {/* Expanded Order Details */}
              {isExpanded && (
                <div className={`${styles.orderContent} ${styles.expanded}`}>
                  {/* Order Timeline */}
                  <OrderTimeline order={order} />

                  {/* Order Items */}
                  {order.cart && order.cart.length > 0 && (
                    <div className={styles.orderItems}>
                      <h5 className={styles.orderItemsTitle}>
                        Order Items ({order.cart.length})
                      </h5>
                      <div className={styles.orderItemsList}>
                        {order.cart.slice(0, 3).map((item, index) => (
                          <div key={index} className={styles.orderItem}>
                            <img
                              src={
                                item.img ||
                                item.image?.url ||
                                '/placeholder.png'
                              }
                              alt={item.title}
                              className={styles.orderItemImage}
                              onError={e => {
                                e.target.src = '/placeholder.png';
                              }}
                            />
                            <div className={styles.orderItemInfo}>
                              <h6 className={styles.orderItemTitle}>
                                {item.title}
                              </h6>
                              <p className={styles.orderItemDetails}>
                                ${item.price?.toFixed(2)} each
                              </p>
                            </div>
                            <div className={styles.orderItemQuantity}>
                              {item.orderQuantity}
                            </div>
                            <div className={styles.orderItemPrice}>
                              ${(item.price * item.orderQuantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                        {order.cart.length > 3 && (
                          <div className={styles.orderItem}>
                            <div className={styles.orderItemInfo}>
                              <p className={styles.orderItemTitle}>
                                +{order.cart.length - 3} more items
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Pricing Breakdown */}
                  <div className={styles.orderPricing}>
                    <h5 className={styles.pricingTitle}>Order Summary</h5>
                    <div className={styles.pricingBreakdown}>
                      <div className={styles.pricingRow}>
                        <span className={styles.pricingLabel}>Subtotal:</span>
                        <span className={styles.pricingValue}>
                          ${order.subTotal?.toFixed(2) || '0.00'}
                        </span>
                      </div>

                      {/* Shipping Cost */}
                      <div className={styles.pricingRow}>
                        <span className={styles.pricingLabel}>Shipping:</span>
                        <span className={styles.pricingValue}>
                          ${order.shippingCost?.toFixed(2) || '0.00'}
                        </span>
                      </div>

                      {/* First Time Discount */}
                      {order.firstTimeDiscount?.isApplied &&
                        order.firstTimeDiscount?.amount > 0 && (
                          <div
                            className={`${styles.pricingRow} ${styles.discountRow}`}
                          >
                            <span className={styles.pricingLabel}>
                              🎉 First-time order discount (-
                              {order.firstTimeDiscount?.percentage || 10}%):
                            </span>
                            <span
                              className={`${styles.pricingValue} ${styles.discountValue}`}
                            >
                              -${order.firstTimeDiscount.amount.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Applied Coupons */}
                      {order.appliedCoupons &&
                        order.appliedCoupons.length > 0 && (
                          <>
                            {order.appliedCoupons.map((coupon, index) => (
                              <div
                                key={index}
                                className={`${styles.pricingRow} ${styles.discountRow}`}
                              >
                                <span className={styles.pricingLabel}>
                                  🎫 Coupon {coupon.couponCode} ({coupon.title}
                                  ):
                                </span>
                                <span
                                  className={`${styles.pricingValue} ${styles.discountValue}`}
                                >
                                  -$
                                  {(
                                    coupon.discountAmount ||
                                    coupon.discount ||
                                    0
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </>
                        )}

                      {/* Legacy single coupon support */}
                      {!order.appliedCoupons?.length &&
                        order.appliedCoupon &&
                        order.appliedCoupon.discountAmount > 0 && (
                          <div
                            className={`${styles.pricingRow} ${styles.discountRow}`}
                          >
                            <span className={styles.pricingLabel}>
                              🎫 Coupon {order.appliedCoupon.couponCode} (
                              {order.appliedCoupon.title}):
                            </span>
                            <span
                              className={`${styles.pricingValue} ${styles.discountValue}`}
                            >
                              -${order.appliedCoupon.discountAmount.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Legacy discount */}
                      {!order.appliedCoupons?.length &&
                        !order.appliedCoupon?.discountAmount &&
                        order.discount > 0 && (
                          <div
                            className={`${styles.pricingRow} ${styles.discountRow}`}
                          >
                            <span className={styles.pricingLabel}>
                              💰 Discount:
                            </span>
                            <span
                              className={`${styles.pricingValue} ${styles.discountValue}`}
                            >
                              -${order.discount.toFixed(2)}
                            </span>
                          </div>
                        )}

                      {/* Total */}
                      <div
                        className={`${styles.pricingRow} ${styles.totalRow}`}
                      >
                        <span className={styles.pricingLabel}>Total:</span>
                        <span
                          className={`${styles.pricingValue} ${styles.totalValue}`}
                        >
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  {order.address && (
                    <div className={styles.shippingInfo}>
                      <h5 className={styles.shippingTitle}>
                        Shipping Information
                      </h5>
                      <div className={styles.shippingDetails}>
                        <div className={styles.shippingDetail}>
                          <span className={styles.shippingLabel}>
                            Delivery Address:
                          </span>
                          <span className={styles.shippingValue}>
                            {order.name}, {order.address}, {order.city},{' '}
                            {order.state} {order.zipCode}
                          </span>
                        </div>
                        {order.shippingDetails?.trackingNumber && (
                          <div className={styles.shippingDetail}>
                            <span className={styles.shippingLabel}>
                              Tracking Number:
                            </span>
                            <span
                              className={`${styles.shippingValue} ${styles.trackingNumber}`}
                            >
                              {order.shippingDetails.trackingNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className={styles.orderActions}>
                    <Link
                      href={`/order/${order._id}`}
                      className={`${styles.actionButton} ${styles.primary}`}
                    >
                      View Details
                    </Link>
                    {order.status?.toLowerCase() === 'delivered' && (
                      <button
                        className={`${styles.actionButton} ${styles.secondary}`}
                      >
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🔍</div>
          <h4 className={styles.emptyStateTitle}>No {filter} orders found</h4>
          <p className={styles.emptyStateText}>
            Try changing the filter to see more orders
          </p>
          <button
            className={styles.emptyStateButton}
            onClick={() => setFilter('all')}
          >
            Show All Orders
          </button>
        </div>
      )}
    </div>
  );
}
