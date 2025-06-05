'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
// internal
import LoginForm from '../forms/login-form';
// import LoginShapes from './login-shapes';
import GoogleSignUp from './google-sign-up';
import styles from './login-area.module.css';

export default function LoginArea() {
  const searchParams = useSearchParams();
  const [redirectMessage, setRedirectMessage] = useState('');
  const redirectTo = searchParams.get('redirect');

  useEffect(() => {
    // Show special message if coming from checkout
    if (redirectTo === '/checkout') {
      setRedirectMessage(
        'Sign in to continue with your order or go back to checkout as guest.'
      );
    }
  }, [redirectTo]);

  return (
    <>
      <section className={`tp-login-area ${styles.loginSection}`}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className={`tp-login-wrapper ${styles.loginWrapper}`}>
                {/* Clean Header */}
                <div
                  className={`tp-login-top text-center ${styles.loginHeader}`}
                >
                  {/* Back Button */}
                  <div className={styles.backButton}>
                    <Link href="/" className={styles.backLink}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M19 12H5M12 19L5 12L12 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Back to Home
                    </Link>
                  </div>

                  <div className={styles.brandSection}>
                    <h1 className={`tp-login-title ${styles.loginTitle}`}>
                      Sign In
                    </h1>
                    <p className={styles.loginSubtitle}>Welcome back to EWO</p>
                  </div>

                  {/* Redirect Message */}
                  {redirectMessage && (
                    <div className={styles.redirectMessage}>
                      <p>{redirectMessage}</p>
                      <Link href="/checkout" className={styles.checkoutLink}>
                        ← Return to checkout
                      </Link>
                    </div>
                  )}
                </div>

                {/* Login Form */}
                <div className={`tp-login-option ${styles.loginForm}`}>
                  <LoginForm />
                </div>

                {/* Sign Up Link */}
                <div className={styles.signupSection}>
                  <p>
                    Don't have an account?{' '}
                    <Link href="/register" className={styles.signupLink}>
                      Create one here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
