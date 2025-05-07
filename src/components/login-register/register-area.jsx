'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
// internal
// import LoginShapes from './login-shapes';
import RegisterForm from '../forms/register-form';
import GoogleSignUp from './google-sign-up';

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
      <section className="tp-login-area pb-140 p-relative z-index-1 fix">
        {/* <LoginShapes /> */}
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="tp-login-wrapper">
                <div className="tp-login-top text-center mb-30">
                  <h3 className="tp-login-title">Sign Up EWO.</h3>
                  <p>
                    Already have an account?{' '}
                    <span>
                      <Link
                        href={
                          redirectTo
                            ? `/login?redirect=${redirectTo}`
                            : '/login'
                        }
                      >
                        Sign In
                      </Link>
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
                  <div className="tp-login-social mb-10 d-flex flex-wrap align-items-center justify-content-center">
                    {/* TODO: Add social login REMOVE BELOW COMMENTED CODE */}
                    {/* <div className="tp-login-option-item has-google">
                      <GoogleSignUp />
                    </div> */}
                  </div>
                  <div className="tp-login-mail text-center mb-40">
                    <p>
                      Sign up with <a href="#">Email</a>
                    </p>
                  </div>
                  {/* form start */}
                  <RegisterForm redirectUrl={redirectTo} />
                  {/* form end */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
