// 'use client';

// import { authClient } from '@/lib/authClient';
// import { useEffect, useState } from 'react';

// export default function ProfilePage() {
//   const { data: session, isPending, error } = authClient.useSession();
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   // Debug information
//   useEffect(() => {
//     console.log('Session Debug:', { session, isPending, error });
//   }, [session, isPending, error]);

//   if (!isClient) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Profile Page</h1>

//       <div className="space-y-4">
//         <div>
//           <strong>Loading State:</strong> {isPending ? 'Yes' : 'No'}
//         </div>

//         <div>
//           <strong>Session:</strong>
//           <pre className="bg-gray-100 p-2 rounded mt-2">
//             {JSON.stringify(session, null, 2)}
//           </pre>
//         </div>

//         {error && (
//           <div>
//             <strong>Error:</strong>
//             <pre className="bg-red-100 p-2 rounded mt-2">
//               {JSON.stringify(error, null, 2)}
//             </pre>
//           </div>
//         )}

//         <div>
//           <strong>Auth Status:</strong>{' '}
//           {session ? 'Authenticated' : 'Not Authenticated'}
//         </div>
//       </div>
//     </div>
//   );

// }

'use client';
import { authClient } from '@/lib/authClient';
export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not Authenticated</div>;
  }
  return <div>{JSON.stringify(session)}</div>;
}
