import { useState } from 'react';
import { useTimer } from 'react-timer-hook';
const styles = new Proxy({}, { get: () => '' });

export default function CouponCard({ coupon }) {
  const [copySuccess, setCopySuccess] = useState(false);

  const expiryTimestamp = new Date(coupon.endTime);

  const { seconds, minutes, hours, days, isRunning } = useTimer({
    expiryTimestamp,
    onExpire: () => console.warn('Coupon expired'),
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.couponCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {}
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired =
    !isRunning || (days === 0 && hours === 0 && minutes === 0 && seconds === 0);

  return (
    <div className=" ${isExpired ? styles.expired : ''}">
      <div className="">
        <div className="">
          {coupon.discountType === 'percentage'
            ? `${coupon.discountPercentage}% OFF`
            : `$${coupon.discountAmount} OFF`}
        </div>

        <div className="">
          <span className="">
            {isExpired ? 'Expired' : 'Ends in:'}
          </span>
          {!isExpired && (
            <div className="">
              {days > 0 && (
                <div className="">
                  <span className="">{days}</span>
                  <span className="">days</span>
                </div>
              )}
              <div className="">
                <span className="">
                  {hours.toString().padStart(2, '0')}
                </span>
                <span className="">hrs</span>
              </div>
              <div className="">
                <span className="">
                  {minutes.toString().padStart(2, '0')}
                </span>
                <span className="">min</span>
              </div>
              <div className="">
                <span className="">
                  {seconds.toString().padStart(2, '0')}
                </span>
                <span className="">sec</span>
              </div>
            </div>
          )}
          {isExpired && (
            <div className="">
              <span>⏰ Expired</span>
            </div>
          )}
        </div>
      </div>

      <div className="">
        <div className="">
          <div className="">
            <span className="">Code:</span>
            <div
              className=""
              style={{ position: 'relative' }}
            >
              <span className="">{coupon.couponCode}</span>
              <button
                className={` ${
                  copySuccess ? styles.copied : ''
                }`}
                onClick={handleCopyCode}
                title={copySuccess ? 'Copied!' : 'Copy code'}
                disabled={isExpired}
              >
                {copySuccess ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 5H6C5.45 5 5 5.45 5 6V18C5 18.55 5.45 19 6 19H16C16.55 19 17 18.55 17 18V16"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M8 3H18C18.55 3 19 3.45 19 4V14C19 14.55 18.55 15 18 15H8C7.45 15 7 14.55 7 14V4C7 3.45 7.45 3 8 3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                )}
              </button>
              {copySuccess && (
                <span className="">Copied!</span>
              )}
            </div>
          </div>
        </div>

        <div className="">
          <div className="">
            <div className="">
              <div className="">📅</div>
              <div className="">
                <span className="">Valid Until</span>
                <span className="">
                  {formatDate(coupon.endTime)}
                </span>
              </div>
            </div>
            <div className="">
              <div className="">📦</div>
              <div className="">
                <span className="">Products</span>
                <span className="">
                  {coupon.applicableProducts.length} items
                </span>
              </div>
            </div>
          </div>

          {!isExpired && (
            <div className="">
              <div
                className=""
                style={{
                  width: `${Math.max(
                    15,
                    Math.min(100, (days * 24 + hours) * 3)
                  )}%`,
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
