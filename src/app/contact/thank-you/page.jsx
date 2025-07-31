'use client';
import Footer from '@/layout/footers/footer';
import HeaderV2 from '@/layout/headers/HeaderV2';
import Wrapper from '@/layout/wrapper';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function ThankYouPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [contactId, setContactId] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');

  useEffect(() => {
    // Small delay to ensure stable rendering before checking authorization
    const checkAuthorization = () => {
      // Check if user came from successful form submission
      const contactSubmitted = sessionStorage.getItem('contactSubmitted');
      const contactIdFromStorage = sessionStorage.getItem('contactId');
      const submittedAtFromStorage =
        sessionStorage.getItem('contactSubmittedAt');

      if (contactSubmitted === 'true' && contactIdFromStorage) {
        // Check if submission is recent (within last 10 minutes)
        if (submittedAtFromStorage) {
          const submissionTime = new Date(submittedAtFromStorage);
          const now = new Date();
          const timeDiff = now - submissionTime;
          const tenMinutes = 10 * 60 * 1000;

          if (timeDiff <= tenMinutes) {
            setIsAuthorized(true);
            setContactId(contactIdFromStorage);
            setSubmittedAt(submissionTime.toLocaleString());
          } else {
            // Submission too old, redirect to contact page
            router.push('/contact');
          }
        } else {
          // No timestamp, redirect to contact page
          router.push('/contact');
        }
      } else {
        // No valid submission flag, redirect to contact page
        router.push('/contact');
      }
    };

    // Add a small delay to prevent race conditions
    const timer = setTimeout(checkAuthorization, 100);

    // Cleanup function to clear session storage when component unmounts
    return () => {
      clearTimeout(timer);
      // Clear session storage when leaving the page
      if (isAuthorized) {
        sessionStorage.removeItem('contactSubmitted');
        sessionStorage.removeItem('contactId');
        sessionStorage.removeItem('contactSubmittedAt');
      }
    };
  }, [router, isAuthorized]);

  // Show loading while checking authorization
  if (!isAuthorized) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Verifying submission...</p>
      </div>
    );
  }

  return (
    <div className={styles.thankYouPage}>
      <Wrapper>
        <HeaderV2 />
        <div className={styles.thankYouContainer}>
          <div className={styles.thankYouContent}>
            {/* Success Icon */}
            <div className={styles.successIcon}>
              <div className={styles.checkmark}>
                <svg viewBox="0 0 52 52" className={styles.checkmarkSvg}>
                  <circle
                    className={styles.checkmarkCircle}
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className={styles.checkmarkCheck}
                    fill="none"
                    d="m16 27 8 8 16-16"
                  />
                </svg>
              </div>
            </div>

            {/* Main Message */}
            <div className={styles.mainMessage}>
              <h1 className={styles.thankYouTitle}>
                Message Sent Successfully!
              </h1>
              <p className={styles.thankYouSubtitle}>
                Thank you for contacting us. We've received your message and
                will get back to you soon.
              </p>
            </div>

            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <p className={styles.contactText}>Need immediate assistance?</p>
              <div className={styles.contactButtons}>
                <a href="tel:1-866-396-7623" className={styles.phoneButton}>
                  Call 1-866-396-7623 (EWO ROAD)
                </a>
                <a
                  href="mailto:info@eastwestoffroad.com"
                  className={styles.emailButton}
                >
                  Email Us
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button
                onClick={() => router.push('/')}
                className={styles.homeButton}
              >
                Back to Home
              </button>
              <button
                onClick={() => router.push('/shop')}
                className={styles.shopButton}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        <Footer primary_style={true} />
      </Wrapper>
    </div>
  );
}
