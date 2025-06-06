'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    siteName: '',
    siteNameNepali: '',
    maintenanceMode: false,
    logoUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const data = await response.json();
      setSettings({
        siteName: data.siteName || '',
        siteNameNepali: data.siteNameNepali || '',
        maintenanceMode: data.maintenanceMode || false,
        logoUrl: data.logoUrl || '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings({
        siteName: updatedSettings.siteName,
        siteNameNepali: updatedSettings.siteNameNepali,
        maintenanceMode: updatedSettings.maintenanceMode,
        logoUrl: updatedSettings.logoUrl,
      });

      toast.success('Settings updated successfully');
      router.refresh(); // Refresh the page to update metadata
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Site Name (English)
            </label>
            <Input
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              placeholder="Enter site name in English"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Site Name (Nepali)
            </label>
            <Input
              value={settings.siteNameNepali}
              onChange={(e) => setSettings({ ...settings, siteNameNepali: e.target.value })}
              placeholder="Enter site name in Nepali"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Maintenance Mode
            </label>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Save Changes
          </Button>
        </Card>
      </form>
    </div>
  );
} 