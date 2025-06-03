'use client';

import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettings() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      
      toast({
        title: 'Settings updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name (English)</Label>
              <Input
                id="siteName"
                name="siteName"
                defaultValue={settings.siteName}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteNameNepali">Site Name (Nepali)</Label>
              <Input
                id="siteNameNepali"
                name="siteNameNepali"
                defaultValue={settings.siteNameNepali}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteLogo">Site Logo</Label>
              <Input
                id="siteLogo"
                name="siteLogo"
                type="file"
                accept="image/*"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceMode"
                name="maintenanceMode"
                defaultChecked={settings.maintenanceMode}
              />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>

            <input
              type="hidden"
              name="enabledModules"
              value={JSON.stringify(settings.enabledModules)}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 