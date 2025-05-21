'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
// internal
import ErrorMsg from '@/components/common/error-msg';
import { useGetUserOrderByIdQuery } from '@/redux/features/order/orderApi';
import PrdDetailsLoader from '@/components/loader/prd-details-loader';
import styles from './order-area.module.css';

export default function OrderArea({ orderId }) {
  const { data: order, isError, isLoading } = useGetUserOrderByIdQuery(orderId);

  // UI state management
  const [activeItem, setActiveItem] = useState(null);
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  // Trigger animations on load
  useEffect(() => {
    if (!isLoading && !isError) {
      setTimeout(() => {
        setShowStatusDetails(true);
      }, 800);
    }
  }, [isLoading, isError]);

  // Handle item hover
  const handleItemHover = index => {
    setActiveItem(index);
  };

  // Handle item mouse leave
  const handleItemLeave = () => {
    setActiveItem(null);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <PrdDetailsLoader loading={isLoading} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.innerContainer}>
          <ErrorMsg msg="There was an error fetching your order details" />
        </div>
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
    status = 'Processing', // Default status if not provided
    email,
  } = order.order;

  const orderDate = dayjs(createdAt).format('MMMM D, YYYY');
  const orderTime = dayjs(createdAt).format('h:mm A');
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.orderQuantity,
    0
  );

  // Get status step based on current status
  const getStatusStep = () => {
    const statuses = ['pending', 'processing', 'delivered'];
    const currentStatus = status.toLowerCase();
    const currentStep =
      statuses.indexOf(currentStatus) !== -1
        ? statuses.indexOf(currentStatus) + 1
        : 1;
    return currentStep;
  };

  const statusStep = getStatusStep();

  return (
    <section className={styles.container}>
      <div className={styles.innerContainer}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Order Details</h1>
        </div>

        {/* Status Card */}
        <div
          className={styles.statusCard}
          onClick={() => setShowStatusDetails(!showStatusDetails)}
        >
          <div className={styles.statusIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className={styles.statusContent}>
            <h3
              style={{
                fontSize: '1.35rem',
                fontWeight: '700',
                textShadow: '0 1px 0 rgba(0,0,0,0.1)',
                color: 'white',
              }}
            >
              Thank you for your order{showStatusDetails && '!'}
            </h3>
            <p
              style={{
                fontSize: '1.1rem',
                opacity: '1',
                lineHeight: '1.5',
                fontWeight: '500',
                color: 'white',
              }}
            >
              Your order has been received and is being processed.
            </p>

            {/* Status timeline - visible on showStatusDetails */}
            {showStatusDetails && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '1rem',
                  padding: '0.5rem 0',
                  justifyContent: 'space-between',
                  width: '100%',
                  maxWidth: '350px',
                }}
              >
                {['Order Received', 'Processing', 'Delivered'].map(
                  (step, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor:
                            index + 1 <= statusStep
                              ? 'white'
                              : 'rgba(255, 255, 255, 0.3)',
                          marginBottom: '0.25rem',
                          transition: 'all 0.3s',
                          transform:
                            index + 1 === statusStep
                              ? 'scale(1.3)'
                              : 'scale(1)',
                        }}
                      />
                      {index + 1 === statusStep && (
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '-6px',
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            animation: 'pulse 2s infinite',
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: '0.7rem',
                          opacity: index + 1 <= statusStep ? 1 : 0.6,
                          whiteSpace: 'nowrap',
                          fontWeight: index + 1 === statusStep ? '600' : '400',
                        }}
                      >
                        {step}
                      </span>
                    </div>
                  )
                )}
                <div
                  style={{
                    position: 'absolute',
                    height: '1px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    width: '300px',
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    height: '2px',
                    background: 'white',
                    width: `${(statusStep - 1) * 100}px`,
                    zIndex: 1,
                    transition: 'width 1s ease',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.grid}>
          {/* Left Column - Order Details */}
          <div>
            {/* Order Items Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg
                    className={styles.cardIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Order Items
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'rgba(230, 30, 30, 0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    color: '#E61E1E',
                    fontWeight: '500',
                  }}
                >
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.productList}>
                  {cart.map((item, i) => (
                    <div
                      key={i}
                      className={styles.productItem}
                      onMouseEnter={() => handleItemHover(i)}
                      onMouseLeave={handleItemLeave}
                      style={{
                        transform:
                          activeItem === i
                            ? 'translateX(5px)'
                            : 'translateX(0)',
                        transition:
                          'all 0.3s cubic-bezier(0.215, 0.610, 0.355, 1)',
                      }}
                    >
                      <div className={styles.productInfo}>
                        <div className={styles.productName}>{item.title}</div>
                        <div className={styles.productQuantity}>
                          Qty: {item.orderQuantity}
                        </div>
                      </div>
                      <div className={styles.productPrice}>
                        ${(item.price * item.orderQuantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.divider}></div>

                <div className={styles.summary}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Subtotal</span>
                    <span className={styles.summaryValue}>
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Shipping</span>
                    <span className={styles.summaryValue}>
                      ${parseFloat(shippingCost.toFixed(2)).toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Discount</span>
                    <span className={styles.summaryValue}>
                      -${parseFloat(discount.toFixed(2)).toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span className={styles.summaryTotalLabel}>Total</span>
                    <span className={styles.summaryTotalValue}>
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
            </div>
          </div>

          {/* Right Column - Customer & Payment */}
          <div>
            {/* Customer Info Card */}
            <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg
                    className={styles.cardIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer Details
                </h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoGrid}>
                  <div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Name</div>
                      <div className={styles.infoValue}>{name}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Email</div>
                      <div className={styles.infoValue}>{email || contact}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Phone</div>
                      <div className={styles.infoValue}>{contact}</div>
                    </div>
                  </div>
                  <div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Country</div>
                      <div className={styles.infoValue}>{country}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>City</div>
                      <div className={styles.infoValue}>{city}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg
                    className={styles.cardIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payment Information
                </h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoGrid}>
                  <div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Payment Method</div>
                      <div className={styles.infoValue}>
                        <span
                          className={`${styles.paymentBadge} ${
                            paymentMethod === 'COD'
                              ? styles.codBadge
                              : styles.cardBadge
                          }`}
                        >
                          {paymentMethod === 'COD' ? (
                            <>
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  marginRight: '6px',
                                }}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
                                />
                              </svg>
                              Cash On Delivery
                            </>
                          ) : (
                            <>
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  marginRight: '6px',
                                }}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                              </svg>
                              Credit Card
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Order Date</div>
                      <div
                        className={styles.infoValue}
                        style={{ display: 'flex', flexDirection: 'column' }}
                      >
                        <span>{orderDate}</span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            marginTop: '2px',
                          }}
                        >
                          {orderTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
