'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from '@/components/version-tsx/auth/sign-in-form';
import { SignUpForm } from '@/components/version-tsx/auth/sign-up-form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
  defaultTab?: 'signin' | 'signup';
}

export default function AuthDialog({
  isOpen,
  onClose,
  redirectPath = '/profile',
  defaultTab = 'signin',
}: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);
  const router = useRouter();

  // Handle tab switching from form buttons
  useEffect(() => {
    const handleSwitchToSignUp = () => setActiveTab('signup');
    const handleSwitchToSignIn = () => setActiveTab('signin');

    window.addEventListener('switchToSignUp', handleSwitchToSignUp);
    window.addEventListener('switchToSignIn', handleSwitchToSignIn);

    return () => {
      window.removeEventListener('switchToSignUp', handleSwitchToSignUp);
      window.removeEventListener('switchToSignIn', handleSwitchToSignIn);
    };
  }, []);

  // Reset tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Handle successful authentication
  const handleAuthSuccess = () => {
    onClose();
    if (redirectPath) {
      router.push(redirectPath);
      router.refresh(); // Force refresh to update session state
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {activeTab === 'signin'
              ? 'Sign In to Your Account'
              : 'Create Your Account'}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'signin' | 'signup')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <SignInForm
              onSuccess={handleAuthSuccess}
              redirectPath={redirectPath}
              isDialog={true}
            />
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <SignUpForm
              onSuccess={handleAuthSuccess}
              redirectPath={redirectPath}
              isDialog={true}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
