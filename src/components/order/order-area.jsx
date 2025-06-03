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
    createdAt,
    cart,
    shippingCost,
    discount,
    totalAmount,
    paymentMethod,
    status = 'Processing',
    email,
  } = order.order;

  const orderDate = dayjs(createdAt).format('MMMM D, YYYY');
  const orderTime = dayjs(createdAt).format('h:mm A');
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.orderQuantity,
    0
  );

  const getStatusColor = () => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return '#22c55e';
    if (statusLower === 'processing') return '#f59e0b';
    return '#6b7280';
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Order Details</h1>
          <div className={styles.orderMeta}>
            <span className={styles.orderNumber}>Order #{invoice}</span>
            <span className={styles.orderDate}>
              {orderDate} at {orderTime}
            </span>
          </div>
        </div>

        <div className={styles.statusSection}>
          <div
            className={styles.statusBadge}
            style={{ backgroundColor: getStatusColor() }}
          >
            {status}
          </div>
          <p className={styles.statusText}>
            Your order has been received and is being processed.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Order Summary</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>${parseFloat(shippingCost.toFixed(2)).toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Discount</span>
              <span>-${parseFloat(discount.toFixed(2)).toFixed(2)}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>
                $
                {(
                  parseFloat(subtotal.toFixed(2)) +
                  parseFloat(shippingCost.toFixed(2)) -
                  parseFloat(discount.toFixed(2))
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Customer Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{email || contact}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{contact}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Location</span>
              <span className={styles.infoValue}>
                {city}, {country}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Payment Method</span>
              <span className={styles.infoValue}>
                {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit Card'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Order Items ({cart.length})</h2>
          <div className={styles.itemsList}>
            {cart.map((item, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.title}</h3>
                  <span className={styles.itemQuantity}>
                    Qty: {item.orderQuantity}
                  </span>
                </div>
                <span className={styles.itemPrice}>
                  ${(item.price * item.orderQuantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
