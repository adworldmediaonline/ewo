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
import { AlertCircle, CheckCircle, KeyRound, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { authClient } from '@/lib/authClient';
import Link from 'next/link';

export default function ResetPasswordLinkPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      if (errorParam === 'INVALID_TOKEN') {
        setError(
          'This reset link is invalid or has expired. Please request a new one.'
        );
      } else {
        setError('There was an error with your reset link. Please try again.');
      }
    } else if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError(
        'No reset token found. Please request a new password reset link.'
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(
        'No reset token found. Please request a new password reset link.'
      );
      return;
    }

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
    const { error: resetError } = await authClient.resetPassword(
      {
        newPassword,
        token,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError('');
        },
        onSuccess: () => {
          setSuccess(true);
        },
        onError: ctx => {
          if (ctx.error.message?.includes('INVALID_TOKEN')) {
            setError(
              'This reset link has expired or is invalid. Please request a new one.'
            );
          } else {
            setError(
              ctx.error.message || 'Failed to reset password. Please try again.'
            );
          }
          setIsLoading(false);
        },
      }
    );

    // Fallback error handling if callbacks don't work
    if (resetError && !error) {
      if (resetError.message?.includes('INVALID_TOKEN')) {
        setError(
          'This reset link has expired or is invalid. Please request a new one.'
        );
      } else {
        setError(
          resetError.message || 'Failed to reset password. Please try again.'
        );
      }
      setIsLoading(false);
    }
  };

  if (success) {
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

  if (error && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/forgot-password')}
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/sign-in')}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
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
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !token}
            >
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
