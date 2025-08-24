'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/authClient';
import { useGetUserOrdersQuery } from '@/redux/features/order/orderApi';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Package,
  TrendingUp,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Import reusable components
import {
  OrderCard,
  ProfileDetails,
  ProfileLoadingState,
  ProfileOverview,
  ProfileSessionInfo,
  ProfileSettings,
} from '@/components/version-tsx/profile';

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useGetUserOrdersQuery(undefined, { skip: !session?.user?.id });

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <ProfileLoadingState />;
  }

  if (!session) {
    return null;
  }

  // Calculate order statistics
  const orders = ordersData?.orders || [];
  const orderStats = {
    total: ordersData?.totalDoc || 0,
    pending: ordersData?.pending || 0,
    processing: ordersData?.processing || 0,
    shipped: ordersData?.shipped || 0,
    delivered: ordersData?.delivered || 0,
    cancelled: ordersData?.cancelled || 0,
  };

  const totalOrders = orderStats.total;
  const completedOrders = orderStats.delivered;
  const completionRate =
    totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  Profile
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

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

        {/* Order Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.total}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.processing}</div>
              <p className="text-xs text-muted-foreground">
                Currently processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orderStats.delivered}</div>
              <p className="text-xs text-muted-foreground">
                Successfully delivered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Completion Rate Progress */}
        {totalOrders > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Order Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">
                    Completed Orders
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {completedOrders} / {totalOrders}
                  </span>
                </div>
                <Progress value={completionRate} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {completionRate.toFixed(1)}% of your orders have been
                  successfully delivered
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ProfileOverview user={session.user} />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Recent Orders
                </CardTitle>
                <CardDescription>
                  Track your order status and view order details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : ordersError ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load orders. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No Orders Yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Start shopping to see your orders here.
                    </p>
                    <Button asChild>
                      <Link href="/shop">
                        Start Shopping
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order: any) => (
                      <OrderCard key={order._id} order={order} />
                    ))}
                    {orders.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" asChild>
                          <Link href="/orders">
                            View All Orders ({orders.length})
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileDetails user={session.user} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <ProfileSettings />
          </TabsContent>
        </Tabs>

        {/* Session Information */}
        <ProfileSessionInfo session={session} />
      </div>
    </div>
  );
}
