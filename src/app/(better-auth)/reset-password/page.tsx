'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, KeyRound, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { authClient } from '@/lib/authClient';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>(
    'email'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if email is provided in URL (from forgot-password page)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');

    if (emailParam) {
      setEmail(emailParam);

      if (otpParam) {
        setOtp(otpParam);
        setStep('password'); // Start at password step if both email and OTP are provided
      } else {
        setStep('otp'); // Start at OTP step if only email is provided
      }

      setIsLoading(false); // Ensure loading state is reset
      setError(''); // Clear any errors
      setOtpSent(true); // Mark OTP as sent since we came from forgot-password
    }
  }, [searchParams]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Use better-auth's official callback pattern
    const { error: sendError } = await authClient.forgetPassword.emailOtp(
      {
        email: email.trim(),
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError('');
        },
        onSuccess: () => {
          setStep('otp');
          setResendCooldown(60);
        },
        onError: ctx => {
          setError(
            ctx.error.message || 'Failed to send reset code. Please try again.'
          );
          setIsLoading(false);
        },
      }
    );

    // Fallback error handling if callbacks don't work
    if (sendError && !error) {
      setError(
        sendError.message || 'Failed to send reset code. Please try again.'
      );
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    // Use better-auth's official callback pattern
    const { error: verifyError } =
      await authClient.emailOtp.checkVerificationOtp(
        {
          email,
          type: 'forget-password',
          otp: otp.trim(),
        },
        {
          onRequest: () => {
            setIsLoading(true);
            setError('');
          },
          onSuccess: () => {
            setStep('password');
          },
          onError: ctx => {
            const errorMessage = ctx.error.message || '';
            if (errorMessage.includes('MAX_ATTEMPTS_EXCEEDED')) {
              setError('Maximum attempts exceeded. Please request a new code.');
            } else if (errorMessage.includes('INVALID_OTP')) {
              setError('Invalid code. Please check and try again.');
            } else if (errorMessage.includes('EXPIRED')) {
              setError('Code has expired. Please request a new one.');
            } else {
              setError(
                errorMessage || 'Verification failed. Please try again.'
              );
            }
            setIsLoading(false);
          },
        }
      );

    // Fallback error handling if callbacks don't work
    if (verifyError && !error) {
      const errorMessage = verifyError.message || '';
      if (errorMessage.includes('MAX_ATTEMPTS_EXCEEDED')) {
        setError('Maximum attempts exceeded. Please request a new code.');
      } else if (errorMessage.includes('INVALID_OTP')) {
        setError('Invalid code. Please check and try again.');
      } else if (errorMessage.includes('EXPIRED')) {
        setError('Code has expired. Please request a new one.');
      } else {
        setError(errorMessage || 'Verification failed. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Use better-auth's official callback pattern
    const { error: resetError } = await authClient.emailOtp.resetPassword(
      {
        email,
        otp,
        password: newPassword,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError('');
        },
        onSuccess: () => {
          setStep('success');
        },
        onError: ctx => {
          setError(
            ctx.error.message || 'Failed to reset password. Please try again.'
          );
          setIsLoading(false);
        },
      }
    );

    // Fallback error handling if callbacks don't work
    if (resetError && !error) {
      setError(
        resetError.message || 'Failed to reset password. Please try again.'
      );
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Use better-auth's official callback pattern
    const { error: resendError } = await authClient.forgetPassword.emailOtp(
      {
        email,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError('');
        },
        onSuccess: () => {
          setResendCooldown(60);
          setOtp('');
        },
        onError: ctx => {
          setError(
            ctx.error.message || 'Failed to resend code. Please try again.'
          );
          setIsLoading(false);
        },
      }
    );

    // Fallback error handling if callbacks don't work
    if (resendError && !error) {
      setError(
        resendError.message || 'Failed to resend code. Please try again.'
      );
      setIsLoading(false);
    }
  };

  // Cooldown timer
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Password Reset Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been updated. You can now sign in with your
                new password.
              </p>
              <Button
                onClick={() => router.push('/sign-in')}
                className="w-full"
              >
                Continue to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'email' && 'Reset Password'}
            {step === 'otp' && 'Enter Verification Code'}
            {step === 'password' && 'Set New Password'}
          </CardTitle>
          <CardDescription>
            {step === 'email' && 'Enter your email to receive a reset code'}
            {step === 'otp' && `We've sent a 6-digit code to ${email}`}
            {step === 'password' && 'Enter your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    setError('');
                  }}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend Code'}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setStep('email')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Change Email
                </Button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading}
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading}
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                href="/sign-in"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
