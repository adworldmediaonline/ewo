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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
// import { Checkbox } from '@/components/ui/checkbox';
import { authClient } from '@/lib/authClient';
import { AlertCircle, Loader2 } from 'lucide-react';
import GoogleSignIn from './google-signin';
// import { Checkbox } from '@/components/ui/checkbox';

interface SignInFormProps {
  onSuccess?: () => void;
  redirectPath?: string;
  isDialog?: boolean;
}

export function SignInForm({
  onSuccess,
  redirectPath = '/profile',
  isDialog = false,
}: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [_rememberMe, _setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data: _data, error: signInError } = await authClient.signIn.email(
        {
          email,
          password,
          // rememberMe,
          callbackURL: redirectPath,
        },
        {
          onSuccess: () => {
            // Handle successful sign-in
            console.log('✅ Sign-in successful');
          },
          onError: ctx => {
            setError(ctx.error.message || 'Sign in failed');
          },
        }
      );

      if (signInError) {
        setError(signInError.message || 'Sign in failed');
        setIsLoading(false);
        return;
      }

      // If successful, handle success
      console.log('✅ Sign-in successful');
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback to default behavior
        router.push(redirectPath);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
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

      {/* Google Sign In */}
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

      {/* Email/Password Sign In */}
      <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
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
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* remember me */}
        {/* <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            defaultChecked={rememberMe}
            onCheckedChange={checked => setRememberMe(checked)}
          />

          <label
            htmlFor="rememberMe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me
          </label>
        </div> */}
        {/* remember me code end here */}

        <div className="flex items-center justify-between">
          <a
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </a>
          {/* <a
            href="/sign-in-otp"
            className="text-sm text-primary hover:underline"
          >
            Sign in with OTP
          </a> */}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Don't have an account?{' '}
        {isDialog ? (
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('switchToSignUp'))
            }
            className="text-primary hover:underline"
          >
            Sign up
          </button>
        ) : (
          <a href="/sign-up" className="text-primary hover:underline">
            Sign up
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
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{formContent}</CardContent>
    </Card>
  );
}
