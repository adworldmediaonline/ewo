'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

export default function OrderSuccess() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear cart and other data
    localStorage.removeItem('cart_products');
    localStorage.removeItem('couponInfo');
    localStorage.removeItem('shipping_info');

    // Dispatch clear cart action if cart state needs to be reset
    // Note: We're not importing the action to avoid the import error
    // The localStorage clear above will handle most clearing needs

    // If user tries to go back to checkout, redirect them to home
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, '', window.location.href);
      router.push('/');
    };
  }, [dispatch, router]);

  return (
    <div className="mt-50 mb-50">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card text-center p-5">
              <div className="mb-4">
                <svg
                  viewBox="0 0 24 24"
                  className="text-success"
                  width="100"
                  height="100"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M9 12l2 2l4 -4"></path>
                </svg>
              </div>
              <h2 className="mt-3 mb-4">Payment Successful!</h2>
              <p className="mb-4">
                Thank you for your purchase. Your payment has been processed and
                your order is being created.
              </p>
              <p className="mb-4">
                You'll receive a confirmation email shortly with your order
                details.
              </p>
              <div className="mt-4">
                <Link href="/user-dashboard" className="btn btn-primary mx-2">
                  View Orders
                </Link>
                <Link href="/" className="btn btn-outline-primary mx-2">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
