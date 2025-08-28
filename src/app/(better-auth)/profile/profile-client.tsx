'use client';

import { LogOut, Settings, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuthCheck } from '../../../hooks/use-auth-check';
import { useSession } from '../../../lib/authClient';
import {
  useGetUserProfileQuery,
  useUpdateProfileMutation,
} from '../../../redux/features/auth/authApi';

interface ProfileClientProps {
  initialSession: any;
}

export default function ProfileClient({ initialSession }: ProfileClientProps) {
  // Use the official Better Auth useSession hook
  const { data: session, isPending: sessionLoading } = useSession();
  const { logout } = useAuthCheck();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
  });

  // Use RTK Query for profile data
  const { data: profileData, isLoading: isProfileLoading } =
    useGetUserProfileQuery(undefined, {
      skip: !session,
    });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  // Use the most up-to-date data
  const currentUser =
    profileData?.user || session?.user || initialSession?.user;
  const currentSession = session || initialSession;

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
      });
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editData).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Show loading state while session is being fetched
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show not authenticated state
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Not Authenticated
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access your profile and manage your account.
          </p>
          <div className="space-y-3">
            <Link
              href="/sign-in"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors block"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {currentUser?.name || currentUser?.email}!
                </h1>
                <p className="text-gray-600">
                  Manage your profile, track orders, and view your account
                  information.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Session ID: {currentSession?.session?.id?.slice(0, 8) || 'N/A'}
                ...
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/shop"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Continue Shopping
                </h3>
                <p className="text-sm text-gray-600">
                  Browse our latest products
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile/orders"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">My Orders</h3>
                <p className="text-sm text-gray-600">Track your orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile/settings"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-600">Manage your account</p>
              </div>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Account Information
            </h2>
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">Email:</span>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className="text-gray-900 border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                <span className="text-gray-900">{currentUser?.email}</span>
              )}
            </div>

            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">Name:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="text-gray-900 border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                <span className="text-gray-900">
                  {currentUser?.name || 'Not set'}
                </span>
              )}
            </div>

            {currentUser?.role && (
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="font-medium text-gray-700">Role:</span>
                <span className="text-gray-900 capitalize">
                  {currentUser.role}
                </span>
              </div>
            )}

            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">User ID:</span>
              <span className="text-gray-900 font-mono text-sm">
                {currentUser?.id}
              </span>
            </div>

            <div className="flex justify-between py-3">
              <span className="font-medium text-gray-700">Member Since:</span>
              <span className="text-gray-900">
                {currentUser?.createdAt
                  ? new Date(currentUser.createdAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Session Info (for debugging) */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Session Information
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(
                { currentUser, currentSession, session },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
