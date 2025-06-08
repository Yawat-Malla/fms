'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import Image from 'next/image';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    siteName: '',
    siteNameNepali: '',
    maintenanceMode: false,
    siteLogo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
        siteLogo: data.siteLogo || '',
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
      const formData = new FormData();
      formData.append('siteName', settings.siteName);
      formData.append('siteNameNepali', settings.siteNameNepali);
      formData.append('maintenanceMode', settings.maintenanceMode.toString());
      if (logoFile) {
        formData.append('siteLogo', logoFile);
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedSettings = await response.json();
      setSettings({
        siteName: updatedSettings.siteName,
        siteNameNepali: updatedSettings.siteNameNepali,
        maintenanceMode: updatedSettings.maintenanceMode,
        siteLogo: updatedSettings.siteLogo,
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setLogoFile(file);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings(prev => ({
          ...prev,
          siteLogo: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
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

          <div>
            <label className="block text-sm font-medium mb-2">
              Site Logo
            </label>
            <div className="flex items-center space-x-4">
              {settings.siteLogo && (
                <div className="relative w-16 h-16">
                  <Image
                    src={settings.siteLogo}
                    alt="Site Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-500 file:text-white
                  hover:file:bg-primary-600"
              />
            </div>
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