'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
// internal
import logo from '@assets/img/logo/logo.webp';
import ErrorMsg from '@/components/common/error-msg';
import { useGetUserOrderByIdQuery } from '@/redux/features/order/orderApi';
import PrdDetailsLoader from '@/components/loader/prd-details-loader';
import styles from './order-area.module.css';

export default function OrderArea({ orderId }) {
  const printRef = useRef();
  const { data: order, isError, isLoading } = useGetUserOrderByIdQuery(orderId);

  // UI state management
  const [activeItem, setActiveItem] = useState(null);
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  // Setup print handler
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${order?.order?.invoice || 'Order'}`,
  });

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
          <h1 className={styles.pageTitle}>
            Order Details <span className={styles.orderId}>#{invoice}</span>
          </h1>
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
                    background: 'rgba(79, 70, 229, 0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    color: '#4f46e5',
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
                      ${shippingCost.toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Discount</span>
                    <span className={styles.summaryValue}>
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span className={styles.summaryTotalLabel}>Total</span>
                    <span className={styles.summaryTotalValue}>
                      ${parseInt(totalAmount).toFixed(2)}
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

                <div className={styles.divider}></div>

                <button
                  type="button"
                  className={styles.button}
                  onClick={handlePrint}
                >
                  <svg
                    className={styles.buttonIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Print-only version */}
        <div className={styles.printWrapper} ref={printRef}>
          <div className={styles.printHeader}>
            <h1 className={styles.printTitle}>Invoice #{invoice}</h1>
            <Image
              className={styles.printLogo}
              src={logo}
              alt="logo"
              width={120}
            />
          </div>

          <div className={styles.printGrid}>
            <div>
              <div className={styles.printSection}>
                <h2 className={styles.printSectionTitle}>Customer</h2>
                <p>
                  <strong>{name}</strong>
                </p>
                <p>{email || contact}</p>
                <p>
                  {country}, {city}
                </p>
                <p>{contact}</p>
              </div>
            </div>
            <div>
              <div className={styles.printSection}>
                <h2 className={styles.printSectionTitle}>Order Details</h2>
                <p>
                  <strong>Order Number:</strong> #{invoice}
                </p>
                <p>
                  <strong>Date:</strong> {orderDate}
                </p>
                <p>
                  <strong>Payment Method:</strong> {paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>
                  Product
                </th>
                <th style={{ textAlign: 'center', padding: '0.75rem' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>
                  Price
                </th>
                <th style={{ textAlign: 'right', padding: '0.75rem' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>{item.title}</td>
                  <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                    {item.orderQuantity}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                    ${item.price.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.75rem' }}>
                    ${(item.price * item.orderQuantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              marginTop: '2rem',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '0.5rem 0',
              }}
            >
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '0.5rem 0',
              }}
            >
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '0.5rem 0',
              }}
            >
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                margin: '1rem 0',
                borderTop: '2px solid #e5e7eb',
                paddingTop: '1rem',
                fontWeight: 'bold',
              }}
            >
              <span>Total</span>
              <span>${parseInt(totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div
            style={{
              marginTop: '3rem',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem',
            }}
          >
            <p>Thank you for your purchase!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
