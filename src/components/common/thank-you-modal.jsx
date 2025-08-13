'use client';

const ThankYouModal = ({ isOpen, onClose, orderData = {}, onContinue }) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="" onClick={handleContinue}>
        <div className="" onClick={e => e.stopPropagation()}>
          {/* Main Content */}
          <div className="">
            {/* Success Icon */}
            <div className="">
              <div className="">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
              </div>
            </div>

            {/* Thank You Message */}
            <h2 className="">Thank you for your purchase</h2>

            {/* Subtitle */}
            <p className="">
              Your order has been successfully placed. You'll be receiving an
              email shortly with purchase details.
            </p>

            {/* Order Info */}
            {orderData.orderId && (
              <div className="">
                <p className="">Order #{orderData.orderId}</p>
              </div>
            )}

            {/* Continue Button */}
            <button className="" onClick={handleContinue}>
              Check Order Details →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYouModal;
