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
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { authClient } from '@/lib/authClient';
import Link from 'next/link';

export default function SignInOTPPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: sendError } =
        await authClient.emailOtp.sendVerificationOtp({
          email: email.trim(),
          type: 'sign-in',
        });

      if (sendError) {
        setError(sendError.message || 'Failed to send OTP. Please try again.');
        return;
      }

      setStep('otp');
      setResendCooldown(60);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Send OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await authClient.signIn.emailOtp({
        email,
        otp: otp.trim(),
      });

      if (signInError) {
        const errorMessage = signInError.message || '';
        if (errorMessage.includes('MAX_ATTEMPTS_EXCEEDED')) {
          setError('Maximum attempts exceeded. Please request a new OTP.');
        } else if (errorMessage.includes('INVALID_OTP')) {
          setError('Invalid OTP. Please check your code and try again.');
        } else if (errorMessage.includes('EXPIRED')) {
          setError('OTP has expired. Please request a new one.');
        } else {
          setError(errorMessage || 'Sign-in failed. Please try again.');
        }
        return;
      }

      console.log('✅ OTP Sign-in successful:', data);
      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('OTP sign-in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error: resendError } =
        await authClient.emailOtp.sendVerificationOtp({
          email,
          type: 'sign-in',
        });

      if (resendError) {
        setError(
          resendError.message || 'Failed to resend OTP. Please try again.'
        );
        return;
      }

      setResendCooldown(60);
      setOtp('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'email' ? 'Sign In with OTP' : 'Enter Verification Code'}
          </CardTitle>
          <CardDescription>
            {step === 'email'
              ? 'Enter your email to receive a one-time password'
              : `We've sent a 6-digit code to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
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
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
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
                    Signing In...
                  </>
                ) : (
                  'Sign In'
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

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Prefer password?{' '}
              <Link
                href="/sign-in"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in with password
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
