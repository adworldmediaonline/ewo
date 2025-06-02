'use client';
import Link from 'next/link';
import React from 'react';
import ForgotForm from '../forms/forgot-form';
import styles from './forgot-area.module.css';
// import LoginShapes from './login-shapes';

export default function ForgotArea() {
  return (
    <section className={`tp-login-area ${styles.forgotSection}`}>
      {/* <LoginShapes /> */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-lg-6 col-md-8">
            <div className={`tp-login-wrapper ${styles.forgotWrapper}`}>
              {/* Clean Header */}
              <div
                className={`tp-login-top text-center ${styles.forgotHeader}`}
              >
                <div className={styles.brandSection}>
                  <h1 className={`tp-login-title ${styles.forgotTitle}`}>
                    Reset Password
                  </h1>
                  <p className={styles.forgotSubtitle}>
                    Enter your email address to request password reset
                  </p>
                </div>
              </div>

              {/* Forgot Form */}
              <div className={`tp-login-option ${styles.forgotForm}`}>
                <ForgotForm />
              </div>

              {/* Back to Login Link */}
              <div className={styles.loginSection}>
                <p>
                  Remember your password?{' '}
                  <Link href="/login" className={styles.loginLink}>
                    Back to login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
