'use client';

import { authClient } from '../../../lib/authClient';

export default function ProfilePage() {
  const {
    data: session,
    isPending: sessionLoading,
    error: sessionError,
  } = authClient.useSession();

  if (sessionLoading) {
    return <div>Loading...</div>;
  }

  if (sessionError) {
    return <div>Error: {sessionError.message}</div>;
  }

  if (!session) {
    return <div>Not authenticated</div>;
  }

  if (!session.user) {
    return <div>No user</div>;
  }

  return <div>{JSON.stringify(session, null, 2)}</div>;
}
