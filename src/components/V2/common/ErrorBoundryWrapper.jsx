'use client';

import { ErrorBoundary } from 'react-error-boundary';
import styles from './ErrorBoundryWrapper.module.css';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className={styles.errorContainer}>
      <div className={styles.content}>
        <svg
          className={styles.icon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <h2 className={styles.title}>Oops! Something went wrong</h2>
        <div>
          <p className={styles.message}>We encountered an unexpected error.</p>
          <div className={styles.errorBox}>
            <pre className={styles.errorText}>{error.message}</pre>
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <button onClick={resetErrorBoundary} className={styles.primaryButton}>
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className={styles.secondaryButton}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ErrorBoundryWrapper({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
