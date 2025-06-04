'use client';
import React from 'react';
import { useDispatch } from 'react-redux';
import { resetFirstTimeDiscount } from '@/redux/features/cartSlice';
import styles from './dev-tools.module.css';

export default function DevTools() {
  const dispatch = useDispatch();

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleResetDiscount = () => {
    dispatch(resetFirstTimeDiscount());
    alert(
      'First-time discount has been reset! You can now test the feature again.'
    );
  };

  return (
    <div className={styles.devTools}>
      <div className={styles.devToolsContent}>
        <h4 className={styles.devToolsTitle}>Dev Tools</h4>
        <button
          onClick={handleResetDiscount}
          className={styles.devButton}
          type="button"
        >
          Reset First-Time Discount
        </button>
      </div>
    </div>
  );
}
