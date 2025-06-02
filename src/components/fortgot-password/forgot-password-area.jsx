'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
// internal
import Wrapper from '@/layout/wrapper';
// import LoginShapes from "@/components/login-register/login-shapes";
import ErrorMsg from '@/components/common/error-msg';
import { useConfirmForgotPasswordMutation } from '@/redux/features/auth/authApi';
import { CloseEye, OpenEye } from '@/svg';
import { notifyError, notifySuccess } from '@/utils/toast';
import styles from './forgot-password-area.module.css';

// schema
const schema = Yup.object().shape({
  password: Yup.string().required().min(6).label('Password'),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords must match'
  ),
});

export default function ForgotPasswordArea({ token }) {
  const [showPass, setShowPass] = useState(false);
  const [showConPass, setShowConPass] = useState(false);
  const [confirmForgotPassword, { isLoading }] =
    useConfirmForgotPasswordMutation();
  const router = useRouter();
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });
  // onSubmit
  const onSubmit = data => {
    confirmForgotPassword({
      password: data.password,
      token,
    }).then(result => {
      if (result?.error) {
        notifyError(result?.error?.data?.error);
      } else {
        notifySuccess(result?.data?.message);
        reset();

        // Redirect to login page after successful password reset
        setTimeout(() => {
          router.push('/login?passwordReset=true');
        }, 2000);
      }
    });
  };

  return (
    <Wrapper>
      <section className={styles.forgotPasswordSection}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-5 col-lg-6 col-md-8">
              <div className={styles.forgotPasswordWrapper}>
                {/* Clean Header */}
                <div className={styles.forgotPasswordHeader}>
                  <div className={styles.brandSection}>
                    <h1 className={styles.forgotPasswordTitle}>
                      Set New Password
                    </h1>
                    <p className={styles.forgotPasswordSubtitle}>
                      Enter your new password below
                    </p>
                  </div>
                </div>

                {/* Password Reset Form */}
                <div className={styles.forgotPasswordForm}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="tp-login-input-wrapper">
                      {/* Password Field */}
                      <div className="tp-login-input-box">
                        <div className="p-relative">
                          <div className="tp-login-input">
                            <input
                              {...register('password', {
                                required: `Password is required!`,
                              })}
                              id="password"
                              name="password"
                              type={showPass ? 'text' : 'password'}
                              placeholder="Min. 6 character"
                              disabled={isLoading}
                            />
                          </div>
                          <div
                            className="tp-login-input-eye"
                            id="password-show-toggle"
                          >
                            <span
                              className="open-eye"
                              onClick={() => setShowPass(!showPass)}
                            >
                              {showPass ? <CloseEye /> : <OpenEye />}
                            </span>
                          </div>
                          <div className="tp-login-input-title">
                            <label htmlFor="password">New Password</label>
                          </div>
                        </div>
                        <ErrorMsg msg={errors.password?.message} />
                      </div>

                      {/* Confirm Password Field */}
                      <div className="tp-login-input-box">
                        <div className="p-relative">
                          <div className="tp-login-input">
                            <input
                              {...register('confirmPassword')}
                              type={showConPass ? 'text' : 'password'}
                              placeholder="Confirm Password"
                              name="confirmPassword"
                              id="confirmPassword"
                              disabled={isLoading}
                            />
                          </div>
                          <div
                            className="tp-login-input-eye"
                            id="password-show-toggle"
                          >
                            <span
                              className="open-eye"
                              onClick={() => setShowConPass(!showConPass)}
                            >
                              {showConPass ? <CloseEye /> : <OpenEye />}
                            </span>
                          </div>
                          <div className="tp-login-input-title">
                            <label htmlFor="confirmPassword">
                              Confirm Password
                            </label>
                          </div>
                        </div>
                        <ErrorMsg msg={errors.confirmPassword?.message} />
                      </div>
                    </div>

                    <div className="tp-login-bottom">
                      <button
                        type="submit"
                        className="tp-login-btn w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Updating Password...
                          </span>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
