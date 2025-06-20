'use client';
import React from 'react';
import dayjs from 'dayjs';
import ErrorMsg from '@/components/common/error-msg';
import { useGetUserOrderByIdQuery } from '@/redux/features/order/orderApi';
import PrdDetailsLoader from '@/components/loader/prd-details-loader';
import styles from './order-area.module.css';

export default function OrderArea({ orderId }) {
  const { data: order, isError, isLoading } = useGetUserOrderByIdQuery(orderId);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <PrdDetailsLoader loading={isLoading} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <ErrorMsg msg="There was an error fetching your order details" />
      </div>
    );
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
    totalAmount,
    paymentMethod,
    status,
    email,
    firstTimeDiscount,
  } = order.order;

  const orderDate = dayjs(createdAt).format('MMMM D, YYYY');
  const orderTime = dayjs(createdAt).format('h:mm A');
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.orderQuantity,
    0
  );

  // Debug logging to see what data we have
  console.log('🔍 Order Debug Data:', {
    discount,
    firstTimeDiscount,
    subtotal,
    totalAmount,
    shippingCost,
    calculatedTotal: subtotal + parseFloat(shippingCost) - discount,
    actualTotal: totalAmount,
  });

  // Calculate first-time discount amount if applied
  let firstTimeDiscountAmount = 0;
  if (firstTimeDiscount?.isApplied) {
    // Try to use saved amount first, then calculate from percentage
    firstTimeDiscountAmount =
      firstTimeDiscount.amount ||
      (subtotal * (firstTimeDiscount.percentage || 10)) / 100;
  }

  // If no specific firstTimeDiscount data but discount > 0, check if it might be the first-time discount
  if (!firstTimeDiscount?.isApplied && discount > 0) {
    // Check if the discount amount matches a 10% first-time discount
    const expectedFirstTimeDiscount = subtotal * 0.1;
    if (Math.abs(discount - expectedFirstTimeDiscount) < 0.01) {
      console.log('💡 Detected legacy first-time discount order');
      firstTimeDiscountAmount = discount;
    }
  }

  // Calculate other discounts (coupon, etc.)
  const otherDiscounts = Math.max(0, discount - firstTimeDiscountAmount);

  const getStatusColor = () => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return '#10b981';
    if (statusLower === 'processing') return '#f59e0b';
    return '#6b7280';
  };

  const getStatusIcon = () => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return '✓';
    if (statusLower === 'processing') return '⏳';
    return '📦';
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header Card */}
        <div className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Order Confirmation</h1>
              <p className={styles.subtitle}>Thank you for your purchase</p>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.orderBadge}>
                <span className={styles.orderLabel}>Order ID</span>
                <span className={styles.orderNumber}>
                  {orderUniqueId || invoice}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.orderMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Order Date</span>
              <span className={styles.metaValue}>{orderDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Order Time</span>
              <span className={styles.metaValue}>{orderTime}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <div
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor() }}
              >
                <span className={styles.statusIcon}>{getStatusIcon()}</span>
                <span className={styles.statusText}>{status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.grid}>
          {/* Order Summary */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Order Summary</h2>
              <span className={styles.itemCount}>
                {cart.length} item{cart.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>${parseFloat(shippingCost.toFixed(2)).toFixed(2)}</span>
                </div>
                {/* First-time discount */}
                {(firstTimeDiscount?.isApplied ||
                  (!firstTimeDiscount?.isApplied &&
                    discount > 0 &&
                    Math.abs(discount - subtotal * 0.1) < 0.01)) &&
                  firstTimeDiscountAmount > 0 && (
                    <div className={styles.summaryRow}>
                      <span>
                        🎉 First-time order discount (-
                        {firstTimeDiscount?.percentage || 10}%)
                      </span>
                      <span className={styles.discount}>
                        -${firstTimeDiscountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                {/* Other discounts (coupons, etc.) */}
                {otherDiscounts > 0 && (
                  <div className={styles.summaryRow}>
                    <span>Other Discounts</span>
                    <span className={styles.discount}>
                      -${otherDiscounts.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalAmount}>
                  $
                  {(
                    subtotal -
                    firstTimeDiscountAmount +
                    parseFloat(shippingCost) -
                    otherDiscounts
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Customer Information</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoGroup}>
                  <h3 className={styles.groupTitle}>Contact Details</h3>
                  <div className={styles.infoList}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Name</span>
                      <span className={styles.infoValue}>{name}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Email</span>
                      <span className={styles.infoValue}>
                        {email || contact}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Phone</span>
                      <span className={styles.infoValue}>{contact}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.infoGroup}>
                  <h3 className={styles.groupTitle}>Delivery Details</h3>
                  <div className={styles.infoList}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Location</span>
                      <span className={styles.infoValue}>
                        {city}, {country}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Payment</span>
                      <span className={styles.infoValue}>
                        {paymentMethod === 'COD'
                          ? 'Cash on Delivery'
                          : 'Credit Card'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Order Items</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.itemsList}>
              {cart.map((item, i) => (
                <div key={i} className={styles.itemCard}>
                  <div className={styles.itemContent}>
                    <div className={styles.itemImage}>
                      <img
                        src={item.img}
                        alt={item.title}
                        className={styles.productImage}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <h3 className={styles.itemName}>{item.title}</h3>
                      <span className={styles.itemQuantity}>
                        Quantity: {item.orderQuantity}
                      </span>
                    </div>
                    <div className={styles.itemPricing}>
                      <span className={styles.itemPrice}>
                        ${(item.price * item.orderQuantity).toFixed(2)}
                      </span>
                      {item.orderQuantity > 1 && (
                        <span className={styles.unitPrice}>
                          ${item.price.toFixed(2)} each
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
