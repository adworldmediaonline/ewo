'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
// internal
// import LoginShapes from './login-shapes';
import RegisterForm from '../forms/register-form';
import GoogleSignUp from './google-sign-up';
import styles from './register-area.module.css';

export default function RegisterArea() {
  const searchParams = useSearchParams();
  const [redirectMessage, setRedirectMessage] = useState('');
  const redirectTo = searchParams.get('redirect');

  useEffect(() => {
    // Show special message if coming from checkout
    if (redirectTo === '/checkout') {
      setRedirectMessage(
        'Sign up to continue with your order or go back to checkout as guest.'
      );
    }
  }, [redirectTo]);

  return (
    <>
      <section className={`tp-login-area ${styles.registerSection}`}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className={`tp-login-wrapper ${styles.registerWrapper}`}>
                {/* Clean Header */}
                <div
                  className={`tp-login-top text-center ${styles.registerHeader}`}
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
                    <h1 className={`tp-login-title ${styles.registerTitle}`}>
                      Create Account
                    </h1>
                    <p className={styles.registerSubtitle}>Join EWO today</p>
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

                {/* Register Form */}
                <div className={`tp-login-option ${styles.registerForm}`}>
                  <RegisterForm redirectUrl={redirectTo} />
                </div>

                {/* Sign In Link */}
                <div className={styles.signinSection}>
                  <p>
                    Already have an account?{' '}
                    <Link
                      href={
                        redirectTo ? `/login?redirect=${redirectTo}` : '/login'
                      }
                      className={styles.signinLink}
                    >
                      Sign in here
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
