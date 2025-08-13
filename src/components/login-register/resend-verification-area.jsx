'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
// internal
import ResendVerificationForm from '../forms/resend-verification-form';
const styles = new Proxy({}, { get: () => '' });

export default function ResendVerificationArea() {
  const searchParams = useSearchParams();
  const [helpMessage, setHelpMessage] = useState('');
  const emailFromParams = searchParams?.get('email');

  useEffect(() => {
    // Show special message if email is pre-filled
    if (emailFromParams) {
      setHelpMessage(
        'We found an unverified account with this email. Get a new verification link below.'
      );
    }
  }, [emailFromParams]);

  return (
    <>
      <section className={`tp-login-area ${styles.resendSection}`}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className={`tp-login-wrapper ${styles.resendWrapper}`}>
                {/* Header */}
                <div
                  className={`tp-login-top text-center ${styles.resendHeader}`}
                >
                  {/* Back Button */}
                  <div className={styles.backButton}>
                    <Link href="/login" className={styles.backLink}>
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
                      Back to Login
                    </Link>
                  </div>

                  <div className={styles.brandSection}>
                    <h1 className={`tp-login-title ${styles.resendTitle}`}>
                      Activate Your Account
                    </h1>
                    <p className={styles.resendSubtitle}>
                      Get a new verification link sent to your email
                    </p>
                  </div>

                  {/* Help Message */}
                  {helpMessage && (
                    <div className={styles.helpMessage}>
                      <p>{helpMessage}</p>
                    </div>
                  )}
                </div>

                {/* Resend Verification Form */}
                <div className={`tp-login-option ${styles.resendForm}`}>
                  <ResendVerificationForm />
                </div>

                {/* Info Section */}
                <div className={styles.infoSection}>
                  <div className={styles.infoCard}>
                    <h4>📧 Verification Email Info</h4>
                    <ul>
                      <li>Check your spam/junk folder</li>
                      <li>Verification links expire after 10 minutes</li>
                      <li>You can request a new link every minute</li>
                      <li>Make sure you entered the correct email address</li>
                    </ul>
                  </div>
                </div>

                {/* Sign In Link */}
                <div className={styles.signinSection}>
                  <p>
                    Already activated your account?{' '}
                    <Link href="/login" className={styles.signinLink}>
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
