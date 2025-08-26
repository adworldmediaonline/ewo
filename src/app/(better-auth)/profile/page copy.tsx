'use client';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/authClient';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';

// Import reusable components
import {
  ProfileDetails,
  ProfileLayout,
  ProfileLoadingState,
  ProfileOrdersSection,
  ProfileOrderStats,
  ProfileSettings,
} from '@/components/version-tsx/profile';

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Add client-side state to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);

  // Use nuqs to persist active tab in URL
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'overview',
    parse: value => {
      // Validate tab value to prevent invalid states
      const validTabs = ['overview', 'orders', 'profile', 'settings'];
      return validTabs.includes(value) ? value : 'overview';
    },
  });

  useEffect(() => {
    // Set client-side flag to prevent hydration mismatches
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
    }
  }, [session, isPending, router]);

  // Refresh session periodically to keep it alive
  useEffect(() => {
    if (session) {
      const interval = setInterval(() => {
        authClient.getSession().then(({ data: _data }) => {
          // Session will be automatically updated by the authClient
        });
      }, 60000); // Refresh every minute

      return () => clearInterval(interval);
    }
  }, [session]);

  // Show loading state until client-side hydration is complete
  if (!isClient || isPending) {
    return <ProfileLoadingState />;
  }

  // Don't render anything if no session (will redirect)
  if (!session) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    Welcome back, {session.user.name || session.user.email}!
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Manage your profile, track orders, and view your account
                    information.
                  </p>
                </div>
                <Button asChild size="lg" className="flex items-center gap-2">
                  <Link href="/shop">
                    Continue Shopping
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Order Statistics */}
            <ProfileOrderStats userId={session.user.id} />

            {/* Profile Overview */}
            {/* <ProfileOverview user={session.user} /> */}
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Orders
              </h1>
              <p className="text-lg text-muted-foreground">
                Track your order status and view order history
              </p>
            </div>
            <ProfileOrdersSection
              userId={session.user.id}
              maxOrders={10}
              showViewAllButton={false}
            />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Profile Information
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your personal information and account details
              </p>
            </div>
            <ProfileDetails user={session.user} />
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Account Settings
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your security settings and preferences
              </p>
            </div>
            <ProfileSettings />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProfileLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={session.user}
    >
      {renderTabContent()}
    </ProfileLayout>
  );
}
