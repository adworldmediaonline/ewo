'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
// internal
import LoginForm from '../forms/login-form';
// import LoginShapes from './login-shapes';
import GoogleSignUp from './google-sign-up';

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
      <section className="tp-login-area pb-140 p-relative z-index-1 fix">
        {/* <LoginShapes /> */}
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="tp-login-wrapper">
                <div className="tp-login-top text-center mb-30">
                  <h3 className="tp-login-title">Login to EWO</h3>
                  <p>
                    Don't have an account?{' '}
                    <span>
                      <Link href="/register">Create a free account</Link>
                    </span>
                  </p>

                  {redirectMessage && (
                    <div
                      className="tp-login-checkout-msg mt-20 p-3"
                      style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '5px',
                      }}
                    >
                      <p>{redirectMessage}</p>
                      <Link href="/checkout" className="tp-login-checkout-link">
                        Return to checkout
                      </Link>
                    </div>
                  )}
                </div>

                <div className="tp-login-option">
                  {/* TODO: Add social login REMOVE BELOW COMMENTED CODE */}
                  {/* <div className="tp-login-social mb-10 d-flex flex-wrap align-items-center justify-content-center">
                    <div className="tp-login-option-item has-google">
                      <GoogleSignUp />
                    </div>
                  </div> */}
                  <div className="tp-login-mail text-center mb-40">
                    <p>
                      Sign in with <a href="#">Email</a>
                    </p>
                  </div>
                  <LoginForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
