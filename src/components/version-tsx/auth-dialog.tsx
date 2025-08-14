'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// Forms are rendered via reusable components below
// We now use a single-view layout that can toggle between modes without tabs
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import AuthLoginForm from './auth-login-form';
import AuthRegisterForm from './auth-register-form';

interface AuthDialogProps {
  children: React.ReactNode;
}

type Mode = 'login' | 'register';

export default function AuthDialog({
  children,
}: AuthDialogProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>('login');
  const router = useRouter();

  // Mutations
  const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();
  const [registerUser, { isLoading: isRegisterLoading }] =
    useRegisterUserMutation();

  // Login form schema
  const loginSchema = Yup.object({
    email: Yup.string().required('Email is required').email('Invalid email'),
    password: Yup.string().required('Password is required').min(6),
  });

  // Register form schema
  const registerSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Invalid email'),
    password: Yup.string().required('Password is required').min(6),
  });

  const loginForm = useForm<{ email: string; password: string }>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const registerForm = useForm<{
    name: string;
    email: string;
    password: string;
  }>({
    resolver: yupResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function handleLogin(values: { email: string; password: string }) {
    try {
      const result = await loginUser(values).unwrap();
      if (result) {
        notifySuccess('Login successful!');
        setOpen(false);
        router.refresh?.();
      }
    } catch (error: any) {
      notifyError(error?.data?.error || 'Login failed');
    }
  }

  async function handleRegister(values: {
    name: string;
    email: string;
    password: string;
  }) {
    try {
      await registerUser(values).unwrap();
      notifySuccess(
        'Registration successful! Please check your email to activate your account.'
      );
      // Prefill login and switch to login view
      loginForm.setValue('email', values.email);
      setMode('login');
    } catch (error: any) {
      notifyError(error?.data?.message || 'Registration failed');
    }
  }

  // Social buttons are handled inside the reusable forms

  const title = mode === 'login' ? 'Welcome back' : 'Create account';
  const subtitle =
    mode === 'login' ? 'Log in to continue' : 'Create your account';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <Card className="border-0 rounded-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            {mode === 'login' ? (
              <AuthLoginForm
                form={loginForm}
                isLoading={isLoginLoading}
                onSubmit={handleLogin}
                onSwitchToRegister={() => setMode('register')}
              />
            ) : (
              <AuthRegisterForm
                form={registerForm}
                isLoading={isRegisterLoading}
                onSubmit={handleRegister}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
          </CardContent>
        </Card>

        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 px-6 pb-6">
          By clicking continue, you agree to our{' '}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </DialogContent>
    </Dialog>
  );
}
