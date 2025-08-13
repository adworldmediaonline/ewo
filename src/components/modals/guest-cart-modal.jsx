'use client';
const styles = new Proxy({}, { get: () => '' });
import { useSaveGuestCartMutation } from '@/redux/features/cart/cartApi';
import {
  hideGuestCartModal,
  setGuestEmail,
} from '@/redux/features/guestCart/guestCartSlice';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function GuestCartModal() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { showModal } = useSelector(state => state.guestCart);
  const { cart_products } = useSelector(state => state.cart);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // RTK Query mutation
  const [saveGuestCart, { isLoading, error }] = useSaveGuestCartMutation();

  // Don't show modal on auth pages (login, register, etc.)
  const isAuthPage =
    pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/email-verify') ||
    pathname.includes('/forgot') ||
    pathname.includes('/forget-password');

  // If we're on an auth page, don't render the modal even if showModal is true
  if (isAuthPage) {
    return null;
  }

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = e => {
    const value = e.target.value;
    setEmail(value);
    if (emailError && validateEmail(value)) {
      setEmailError('');
    }
  };

  const handleContinueAsGuest = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (cart_products.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      // Save cart using RTK Query
      const result = await saveGuestCart({
        email,
        cartItems: cart_products,
      }).unwrap();

      // Store email for checkout process
      dispatch(setGuestEmail(email));
      localStorage.setItem('guestEmail', email);

      dispatch(hideGuestCartModal());
      toast.success('Cart saved! Redirecting to checkout...');

      // Redirect to checkout
      router.push('/checkout');
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to save cart';
      setEmailError(errorMessage);
      toast.error(`${errorMessage}. Please try again.`);
    }
  };

  const handleViewCart = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (cart_products.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      // Save cart using RTK Query (same API call as continue to checkout)
      const result = await saveGuestCart({
        email,
        cartItems: cart_products,
      }).unwrap();

      // Store email for future use
      dispatch(setGuestEmail(email));
      localStorage.setItem('guestEmail', email);

      dispatch(hideGuestCartModal());
      toast.success('Cart saved! Redirecting to cart...');

      // Redirect to cart page
      router.push('/cart');
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to save cart';
      setEmailError(errorMessage);
      toast.error(`${errorMessage}. Please try again.`);
    }
  };

  const handleSignIn = () => {
    dispatch(hideGuestCartModal());
    router.push('/login?redirect=/checkout');
  };

  const handleClose = () => {
    dispatch(hideGuestCartModal());
    setEmail('');
    setEmailError('');
  };

  if (!showModal) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.closeButton} onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Choose Your Option</h2>
        </div>

        {/* Content */}
        <div className={styles.modalBody}>
          {/* Continue as Guest Option */}
          <div className={styles.optionSection}>
            <h3 className={styles.optionTitle}>Continue as Guest</h3>
            <p className={styles.optionDescription}>
              Enter your email to save your cart and proceed to checkout.
            </p>

            <div className={styles.emailForm}>
              <div className={styles.inputGroup}>
                <input
                  id="guest-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  className={`${styles.emailInput} ${
                    emailError ? styles.inputError : ''
                  }`}
                  disabled={isLoading}
                />
                {emailError && (
                  <span className={styles.errorMessage}>{emailError}</span>
                )}
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error?.data?.message ||
                    error?.message ||
                    'An error occurred'}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  onClick={handleViewCart}
                  disabled={isLoading || !email.trim()}
                  className={styles.viewCartButton}
                >
                  {isLoading ? (
                    <span className={styles.loadingSpinner}>
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="31.416"
                          strokeDashoffset="31.416"
                          className={styles.spinner}
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'View Cart'
                  )}
                </button>

                <button
                  onClick={handleContinueAsGuest}
                  disabled={isLoading || !email.trim()}
                  className={styles.continueButton}
                >
                  {isLoading ? (
                    <span className={styles.loadingSpinner}>
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="31.416"
                          strokeDashoffset="31.416"
                          className={styles.spinner}
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Continue to Checkout'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerText}>or</span>
          </div>

          {/* Sign In Option */}
          <div className={styles.optionSection}>
            <h3 className={styles.optionTitle}>Sign In</h3>
            <p className={styles.optionDescription}>
              Access your account for faster checkout and order history.
            </p>

            <button onClick={handleSignIn} className={styles.signInButton}>
              Sign In to Your Account
            </button>

            <p className={styles.registerPrompt}>
              Don't have an account?{' '}
              <Link
                href="/register?redirect=/checkout"
                className={styles.registerLink}
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
