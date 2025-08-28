// 'use client';

import { getServerSession } from '../../../lib/server-session';

// import { Button } from '@/components/ui/button';
// import { authClient } from '@/lib/authClient';
// import { ArrowRight, Loader2 } from 'lucide-react';
// import Link from 'next/link';
// import { useQueryState } from 'nuqs';

// import {
//   ProfileDetails,
//   ProfileLayout,
//   ProfileOrdersSection,
//   ProfileOrderStats,
//   ProfileSettings,
// } from '@/components/version-tsx/profile';
// import NotAuthenticated from '../../../components/version-tsx/profile/not-authenticated';

// export default function DashboardPage() {
//   const { data: session, isPending } = authClient.useSession();

//   const [activeTab, setActiveTab] = useQueryState('tab', {
//     defaultValue: 'overview',
//     parse: value => {
//       // Validate tab value to prevent invalid states
//       const validTabs = ['overview', 'orders', 'profile', 'settings'];
//       return validTabs.includes(value) ? value : 'overview';
//     },
//   });

//   if (isPending) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader2 className="w-10 h-10 animate-spin" />
//       </div>
//     );
//   }

//   if (!session) {
//     return <NotAuthenticated />;
//   }

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return (
//           <div className="space-y-6">
//             {/* Header Section */}
//             <div className="mb-8">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div>
//                   <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
//                     Welcome back, {session.user.name || session.user.email}!
//                   </h1>
//                   <p className="text-lg text-muted-foreground">
//                     Manage your profile, track orders, and view your account
//                     information.
//                   </p>
//                 </div>
//                 <Button asChild size="lg" className="flex items-center gap-2">
//                   <Link href="/shop">
//                     Continue Shopping
//                     <ArrowRight className="w-5 h-5" />
//                   </Link>
//                 </Button>
//               </div>
//             </div>

//             {/* Order Statistics */}
//             <ProfileOrderStats userId={session.user.id} />

//             {/* Profile Overview */}
//             {/* <ProfileOverview user={session.user} /> */}
//           </div>
//         );

//       case 'orders':
//         return (
//           <div className="space-y-6">
//             <div>
//               <h1 className="text-3xl font-bold text-foreground mb-2">
//                 My Orders
//               </h1>
//               <p className="text-lg text-muted-foreground">
//                 Track your order status and view order history
//               </p>
//             </div>
//             <ProfileOrdersSection
//               userId={session.user.id}
//               maxOrders={10}
//               showViewAllButton={false}
//             />
//           </div>
//         );

//       case 'profile':
//         return (
//           <div className="space-y-6">
//             <div>
//               <h1 className="text-3xl font-bold text-foreground mb-2">
//                 Profile Information
//               </h1>
//               <p className="text-lg text-muted-foreground">
//                 Manage your personal information and account details
//               </p>
//             </div>
//             <ProfileDetails user={session.user} />
//           </div>
//         );

//       case 'settings':
//         return (
//           <div className="space-y-6">
//             <div>
//               <h1 className="text-3xl font-bold text-foreground mb-2">
//                 Account Settings
//               </h1>
//               <p className="text-lg text-muted-foreground">
//                 Manage your security settings and preferences
//               </p>
//             </div>
//             <ProfileSettings />
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <ProfileLayout
//       activeTab={activeTab}
//       onTabChange={setActiveTab}
//       user={session.user}
//     >
//       {renderTabContent()}
//     </ProfileLayout>
//   );
// }

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session) {
    return <div>Not authenticated</div>;
  }
  return <div>{JSON.stringify(session, null, 2)}</div>;
}
