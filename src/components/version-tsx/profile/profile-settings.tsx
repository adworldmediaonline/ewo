'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Settings, Shield } from 'lucide-react';
import React from 'react';

const ProfileSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Manage your account security and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Security</h4>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            {/* <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Enable Two-Factor Authentication
            </Button> */}
          </div>
        </div>

        {/* <Separator /> */}

        {/* <div className="space-y-4">
          <h4 className="font-medium text-foreground">Preferences</h4>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Mail className="w-4 h-4 mr-2" />
              Email Notifications
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </Button>
          </div>
        </div> */}

        {/* <Separator /> */}

        {/* <div className="space-y-4">
          <h4 className="font-medium text-foreground">Data & Privacy</h4>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Download My Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
