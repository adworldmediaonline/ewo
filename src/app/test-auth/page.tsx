// 'use client';

// import { useAuthCheck } from '../../hooks/use-auth-check';
// import { useSession } from '../../lib/authClient';

// export default function TestAuthPage() {
//   // Use the official Better Auth useSession hook
//   const {
//     data: session,
//     isPending: sessionLoading,
//     error: sessionError,
//   } = useSession();
//   const { isAuthenticated, user, isLoading: authLoading } = useAuthCheck();

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">
//           Authentication Test Page
//         </h1>

//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Better Auth Session (Official)
//           </h2>
//           <div className="space-y-2">
//             <p>
//               <strong>Session Loading:</strong> {sessionLoading ? 'Yes' : 'No'}
//             </p>
//             <p>
//               <strong>Session:</strong>{' '}
//               {session ? JSON.stringify(session, null, 2) : 'None'}
//             </p>
//             <p>
//               <strong>Session Error:</strong>{' '}
//               {sessionError ? JSON.stringify(sessionError, null, 2) : 'None'}
//             </p>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Auth Check Hook
//           </h2>
//           <div className="space-y-2">
//             <p>
//               <strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}
//             </p>
//             <p>
//               <strong>Is Authenticated:</strong>{' '}
//               {isAuthenticated ? 'Yes' : 'No'}
//             </p>
//             <p>
//               <strong>User:</strong>{' '}
//               {user ? JSON.stringify(user, null, 2) : 'None'}
//             </p>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Debug Information
//           </h2>
//           <div className="space-y-2">
//             <p>
//               <strong>Window Object:</strong>{' '}
//               {typeof window !== 'undefined' ? 'Available' : 'Not Available'}
//             </p>
//             <p>
//               <strong>Local Storage:</strong>{' '}
//               {typeof localStorage !== 'undefined'
//                 ? 'Available'
//                 : 'Not Available'}
//             </p>
//             <p>
//               <strong>Current URL:</strong>{' '}
//               {typeof window !== 'undefined' ? window.location.href : 'N/A'}
//             </p>
//             <p>
//               <strong>Session State:</strong> {session ? 'Active' : 'Inactive'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { authClient } from '../../lib/authClient';

// export default function TestAuthPage() {
//   const {
//     data: session,
//     isPending: sessionLoading,
//     error: sessionError,
//   } = authClient.useSession();

//   if (sessionLoading) {
//     return <div>Loading...</div>;
//   }

//   if (sessionError) {
//     return <div>Error: {sessionError.message}</div>;
//   }

//   if (!session) {
//     return <div>Not authenticated</div>;
//   }

//   if (!session.user) {
//     return <div>No user</div>;
//   }

//   return <div>{JSON.stringify(session, null, 2)}</div>;
// }

export default function TestAuthPage() {
  return <div>Test Auth Page</div>;
}
