'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, CheckCircle, Clock } from 'lucide-react';

interface ProfileDetailsProps {
  user: any;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile Details
        </CardTitle>
        <CardDescription>
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Full Name
            </label>
            <div className="p-3 bg-muted rounded-md">
              {user.name || 'Not provided'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="p-3 bg-muted rounded-md">
              {user.email}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">
            Account Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                User ID
              </label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                {user.id}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Verification
              </label>
              <div className="mt-1">
                {user.emailVerified ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending Verification
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileDetails;
