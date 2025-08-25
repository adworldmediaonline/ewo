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
import { Loader2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { authClient } from '@/lib/authClient';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Use better-auth's official callback pattern
    const { error: resetError } = await authClient.forgetPassword.emailOtp(
      {
        email: email.trim(),
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError('');
        },
        onSuccess: () => {
          // OTP sent successfully, show OTP input
          setOtpSent(true);
          setResendCooldown(60);
          setIsLoading(false);
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
    if (resetError && !error) {
      setError(
        resetError.message || 'Failed to send reset code. Please try again.'
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

    setIsLoading(true);
    setError('');

    try {
      const { error: verifyError } =
        await authClient.emailOtp.checkVerificationOtp({
          email,
          type: 'forget-password',
          otp: otp.trim(),
        });

      if (verifyError) {
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
        return;
      }

      // OTP verified successfully, redirect to password reset
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`
      );
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error: resendError } = await authClient.forgetPassword.emailOtp({
        email,
      });

      if (resendError) {
        setError(
          resendError.message || 'Failed to resend code. Please try again.'
        );
        return;
      }

      setResendCooldown(60);
      setOtp('');
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      console.error('Resend OTP error:', err);
    } finally {
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

  return (
    <div className="min-h-auto py-8 flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {otpSent ? 'Enter Verification Code' : 'Forgot Password'}
          </CardTitle>
          <CardDescription>
            {otpSent
              ? `We've sent a 6-digit code to ${email}`
              : "Enter your email address and we'll send you a code to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
          ) : (
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
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setError('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Change Email
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center space-y-2">
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
