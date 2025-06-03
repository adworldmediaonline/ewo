'use client';
import React, { useEffect, useState } from 'react';
import styles from './thank-you-modal.module.css';

const ThankYouModal = ({ isOpen, onClose, orderData = {}, onContinue }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Auto close confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
      <div className={styles.backdrop} onClick={handleContinue}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          {/* Confetti Animation */}
          {showConfetti && (
            <div className={styles.confetti}>
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className={styles.confettiPiece}
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: [
                      '#ff6b6b',
                      '#4ecdc4',
                      '#45b7d1',
                      '#f9ca24',
                      '#6c5ce7',
                      '#a55eea',
                    ][Math.floor(Math.random() * 6)],
                  }}
                />
              ))}
            </div>
          )}

          {/* Main Content */}
          <div className={styles.content}>
            {/* Success Icon */}
            <div className={styles.iconContainer}>
              <div className={styles.successIcon}>
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
            <h2 className={styles.title}>Thank you for your purchase</h2>

            {/* Subtitle */}
            <p className={styles.subtitle}>
              Your order has been successfully placed. You'll be receiving an
              email shortly with purchase details.
            </p>

            {/* Order Info */}
            {orderData.orderId && (
              <div className={styles.orderInfo}>
                <p className={styles.orderNumber}>Order #{orderData.orderId}</p>
              </div>
            )}

            {/* Continue Button */}
            <button className={styles.continueButton} onClick={handleContinue}>
              Check Order Details →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYouModal;
