'use client';
import React, { useEffect, useState } from 'react';
import Confetti from './confetti';
import styles from './first-time-celebration.module.css';

export default function FirstTimeCelebration({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  console.log('🎉 FirstTimeCelebration Debug:', { show, isVisible });

  useEffect(() => {
    if (show) {
      console.log('🎊 Starting celebration animation!');
      setIsVisible(true);
      const timer = setTimeout(() => {
        console.log('🔄 Auto-closing celebration');
        setIsVisible(false);
        onClose && onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      <Confetti show={isVisible} duration={3000} pieceCount={60} />
      <div className={`${styles.celebration} ${isVisible ? styles.show : ''}`}>
        <div className={styles.celebrationContent}>
          <div className={styles.iconContainer}>
            <div className={styles.successIcon}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
          </div>
          <div className={styles.message}>
            <h3 className={styles.title}>🎉 Congratulations!</h3>
            <p className={styles.subtitle}>
              You've unlocked <strong>10% OFF</strong> on your first order!
            </p>
            <div className={styles.badge}>
              ✅ First-time customer discount applied
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
