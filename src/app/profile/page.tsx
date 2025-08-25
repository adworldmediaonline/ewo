import { redirect } from 'next/navigation';
import { getServerSession } from '../../lib/server-session';

export default async function ProfilePage() {
  try {
    const session = await getServerSession();

    if (!session) {
      redirect('/sign-in');
    }

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Profile</h1>
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              User Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-muted-foreground">
                  Email:
                </span>
                <span className="ml-2 text-foreground">
                  {session?.user?.email}
                </span>
              </div>
              {session?.user?.name && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Name:
                  </span>
                  <span className="ml-2 text-foreground">
                    {session.user.name}
                  </span>
                </div>
              )}
              {session?.user?.role && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Role:
                  </span>
                  <span className="ml-2 text-foreground capitalize">
                    {session.user.role}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Profile page error:', error);
    redirect('/sign-in');
  }
}
