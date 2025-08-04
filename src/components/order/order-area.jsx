'use client';
import ErrorMsg from '@/components/common/error-msg';
import PrdDetailsLoader from '@/components/loader/prd-details-loader';
import { useGetUserOrderByIdQuery } from '@/redux/features/order/orderApi';
import dayjs from 'dayjs';
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
    appliedCoupons = [], // Enhanced: Multiple coupons support
    appliedCoupon, // Legacy: Single coupon support
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
  if (firstTimeDiscount?.isApplied && firstTimeDiscount?.amount > 0) {
    // Only use first-time discount if it's explicitly applied AND has an amount
    firstTimeDiscountAmount = firstTimeDiscount.amount;
    console.log('✅ First-time discount applied:', firstTimeDiscountAmount);
  } else {
    console.log('❌ No first-time discount for this order:', {
      isApplied: firstTimeDiscount?.isApplied,
      amount: firstTimeDiscount?.amount,
    });
  }

  // Calculate coupon discounts
  let couponDiscounts = 0;
  let couponDisplayText = '';

  // Handle multiple coupons first (enhanced)
  if (appliedCoupons && appliedCoupons.length > 0) {
    couponDiscounts = appliedCoupons.reduce(
      (sum, coupon) => sum + (coupon.discount || coupon.discountAmount || 0),
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

  const getStatusColor = () => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return '#10b981';
    if (statusLower === 'processing') return '#f59e0b';
    return '#6b7280';
  };

  const getStatusIcon = () => {
    return '';
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

        {/* Coupon Success Message */}
        {(appliedCoupons.length > 0 ||
          (appliedCoupon &&
            (appliedCoupon.discount > 0 ||
              appliedCoupon.discountAmount > 0))) && (
          <div
            className={styles.card}
            style={{
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #0ea5e9',
            }}
          >
            <div className={styles.cardBody}>
              {appliedCoupons.length > 0 ? (
                appliedCoupons.length === 1 ? (
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#0c4a6e', margin: '0 0 10px 0' }}>
                      Coupon Applied Successfully!
                    </h3>
                    <p
                      style={{
                        color: '#075985',
                        margin: '0',
                        fontSize: '16px',
                      }}
                    >
                      <strong>{appliedCoupons[0].couponCode}</strong> -{' '}
                      {appliedCoupons[0].title}
                      <br />
                      <span style={{ fontSize: '14px' }}>
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
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#0c4a6e', margin: '0 0 10px 0' }}>
                      {appliedCoupons.length} Coupons Applied Successfully!
                    </h3>
                    <div
                      style={{
                        color: '#075985',
                        margin: '0',
                        fontSize: '16px',
                      }}
                    >
                      {appliedCoupons.map((coupon, index) => (
                        <div key={index} style={{ marginBottom: '5px' }}>
                          <strong>{coupon.couponCode}</strong> - {coupon.title}
                        </div>
                      ))}
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginTop: '10px',
                        }}
                      >
                        Total savings: ${couponDiscounts.toFixed(2)}!
                      </div>
                    </div>
                  </div>
                )
              ) : (
                appliedCoupon && (
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ color: '#0c4a6e', margin: '0 0 10px 0' }}>
                      Coupon Applied Successfully!
                    </h3>
                    <p
                      style={{
                        color: '#075985',
                        margin: '0',
                        fontSize: '16px',
                      }}
                    >
                      <strong>{appliedCoupon.couponCode}</strong> -{' '}
                      {appliedCoupon.title}
                      <br />
                      <span style={{ fontSize: '14px' }}>
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
            </div>
          </div>
        )}

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
                {/* Coupon discounts */}
                {couponDiscounts > 0 && (
                  <div className={styles.summaryRow}>
                    <span>{couponDisplayText}</span>
                    <span className={styles.discount}>
                      -${couponDiscounts.toFixed(2)}
                    </span>
                  </div>
                )}
                {/* Other discounts (if any remaining) */}
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
                    firstTimeDiscountAmount -
                    couponDiscounts +
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
