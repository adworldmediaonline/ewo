'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import styles from '../styleModules/Error.module.css';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={styles.errorIcon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1 className={styles.errorTitle}>Something went wrong!</h1>
        <p className={styles.errorMessage}>
          We apologize for the inconvenience. The page you're trying to access
          encountered an error. You can try again or return to the homepage.
        </p>
        <div className={styles.errorActions}>
          <button onClick={() => reset()} className={styles.primaryButton}>
            Try Again
          </button>
          <Link href="/" className={styles.secondaryButton}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
