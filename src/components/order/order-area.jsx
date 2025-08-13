'use client';
import ErrorMsg from '@/components/common/error-msg';
import PrdDetailsLoader from '@/components/loader/prd-details-loader';
import { useGetUserOrderByIdQuery } from '@/redux/features/order/orderApi';
import dayjs from 'dayjs';
const styles = new Proxy({}, { get: () => '' });

export default function OrderArea({ orderId }) {
  const { data: order, isError, isLoading } = useGetUserOrderByIdQuery(orderId);

  if (isLoading) {
    return (
      <div className="">
        <PrdDetailsLoader loading={isLoading} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="">
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

  // Calculate first-time discount amount if applied
  let firstTimeDiscountAmount = 0;
  if (firstTimeDiscount?.isApplied && firstTimeDiscount?.amount > 0) {
    // Only use first-time discount if it's explicitly applied AND has an amount
    firstTimeDiscountAmount = firstTimeDiscount.amount;
  } else {
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
    <div className="">
      <div className="">
        {/* Header Card */}
        <div className="">
          <div className="">
            <div className="">
              <h1 className="">Order Confirmation</h1>
              <p className="">Thank you for your purchase</p>
            </div>
            <div className="">
              <div className="">
                <span className="">Order ID</span>
                <span className="">
                  {orderUniqueId || invoice}
                </span>
              </div>
            </div>
          </div>

          <div className="">
            <div className="">
              <span className="">Order Date</span>
              <span className="">{orderDate}</span>
            </div>
            <div className="">
              <span className="">Order Time</span>
              <span className="">{orderTime}</span>
            </div>
            <div className="">
              <span className="">Status</span>
              <div
                className=""
                style={{ backgroundColor: getStatusColor() }}
              >
                <span className="">{getStatusIcon()}</span>
                <span className="">{status}</span>
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
            className=""
            style={{
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              border: '2px solid #0ea5e9',
            }}
          >
            <div className="">
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
        <div className="">
          {/* Order Summary */}
          <div className="">
            <div className="">
              <h2 className="">Order Summary</h2>
              <span className="">
                {cart.length} item{cart.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="">
              <div className="">
                <div className="">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="">
                  <span>Shipping</span>
                  <span>${parseFloat(shippingCost.toFixed(2)).toFixed(2)}</span>
                </div>
                {/* First-time discount */}
                {(firstTimeDiscount?.isApplied ||
                  (!firstTimeDiscount?.isApplied &&
                    discount > 0 &&
                    Math.abs(discount - subtotal * 0.1) < 0.01)) &&
                  firstTimeDiscountAmount > 0 && (
                    <div className="">
                      <span>
                        🎉 First-time order discount (-
                        {firstTimeDiscount?.percentage || 10}%)
                      </span>
                      <span className="">
                        -${firstTimeDiscountAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                {/* Coupon discounts */}
                {couponDiscounts > 0 && (
                  <div className="">
                    <span>{couponDisplayText}</span>
                    <span className="">
                      -${couponDiscounts.toFixed(2)}
                    </span>
                  </div>
                )}
                {/* Other discounts (if any remaining) */}
                {otherDiscounts > 0 && (
                  <div className="">
                    <span>Other Discounts</span>
                    <span className="">
                      -${otherDiscounts.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="">
                <span className="">Total</span>
                <span className="">
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
          <div className="">
            <div className="">
              <h2 className="">Customer Information</h2>
            </div>
            <div className="">
              <div className="">
                <div className="">
                  <h3 className="">Contact Details</h3>
                  <div className="">
                    <div className="">
                      <span className="">Name</span>
                      <span className="">{name}</span>
                    </div>
                    <div className="">
                      <span className="">Email</span>
                      <span className="">
                        {email || contact}
                      </span>
                    </div>
                    <div className="">
                      <span className="">Phone</span>
                      <span className="">{contact}</span>
                    </div>
                  </div>
                </div>
                <div className="">
                  <h3 className="">Delivery Details</h3>
                  <div className="">
                    <div className="">
                      <span className="">Location</span>
                      <span className="">
                        {city}, {country}
                      </span>
                    </div>
                    <div className="">
                      <span className="">Payment</span>
                      <span className="">
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
        <div className="">
          <div className="">
            <h2 className="">Order Items</h2>
          </div>
          <div className="">
            <div className="">
              {cart.map((item, i) => (
                <div key={i} className="">
                  <div className="">
                    <div className="">
                      <img
                        src={item.img}
                        alt={item.title}
                        className=""
                      />
                    </div>
                    <div className="">
                      <h3 className="">{item.title}</h3>
                      <span className="">
                        Quantity: {item.orderQuantity}
                      </span>
                    </div>
                    <div className="">
                      <span className="">
                        ${(item.price * item.orderQuantity).toFixed(2)}
                      </span>
                      {item.orderQuantity > 1 && (
                        <span className="">
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
