'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/authClient';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import GoogleSignIn from './google-signin';

interface SignUpFormProps {
  onSuccess?: () => void;
  redirectPath?: string;
  isDialog?: boolean;
}

export function SignUpForm({
  onSuccess,
  redirectPath = '/profile',
  isDialog = false,
}: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use the correct Better Auth method for email/password sign-up
      const { data, error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: redirectPath,
      });

      if (signUpError) {
        setError(signUpError.message || 'Sign up failed');
        setIsLoading(false);
        return;
      }

      // Redirect to OTP verification page with email parameter
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError('Sign up failed');
      setIsLoading(false);
      console.error('Sign-up error:', err);
    }
  };

  const formContent = (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Google Sign Up */}
      <GoogleSignIn onSuccess={onSuccess} redirectPath={redirectPath} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password Sign Up */}
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password (min. 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{' '}
        {isDialog ? (
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('switchToSignIn'))
            }
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        ) : (
          <a href="/sign-in" className="text-primary hover:underline">
            Sign in
          </a>
        )}
      </div>
    </div>
  );

  if (isDialog) {
    return (
      <Card className="w-full max-w-md mx-auto border-0 shadow-none">
        <CardContent className="space-y-4 p-0">{formContent}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up for a new account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{formContent}</CardContent>
    </Card>
  );
}
