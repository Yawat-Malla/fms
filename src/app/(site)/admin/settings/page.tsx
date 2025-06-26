'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    siteName: '',
    siteNameNepali: '',
    maintenanceMode: false,
    siteLogo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // State for sources and grant types
  const [sources, setSources] = useState([]);
  const [grantTypes, setGrantTypes] = useState([]);
  const [sourceForm, setSourceForm] = useState({ key: '', name: '', en: '', ne: '' });
  const [grantTypeForm, setGrantTypeForm] = useState({ key: '', name: '', en: '', ne: '' });
  const [editingSourceId, setEditingSourceId] = useState<number | null>(null);
  const [editingGrantTypeId, setEditingGrantTypeId] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchSources();
    fetchGrantTypes();
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

  const fetchSources = async () => {
    const res = await fetch('/api/admin/sources');
    const data = await res.json();
    setSources(data);
  };
  const fetchGrantTypes = async () => {
    const res = await fetch('/api/admin/grant-types');
    const data = await res.json();
    setGrantTypes(data);
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

  // CRUD handlers for sources
  const handleSourceSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingSourceId ? 'PUT' : 'POST';
    const url = editingSourceId ? `/api/admin/sources/${editingSourceId}` : '/api/admin/sources';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sourceForm),
    });
    if (res.ok) {
      setSourceForm({ key: '', name: '', en: '', ne: '' });
      setEditingSourceId(null);
      fetchSources();
      toast.success('Source saved');
    } else {
      toast.error('Failed to save source');
    }
  };
  const handleSourceEdit = (src: any) => {
    setSourceForm({ key: src.key, name: src.name, en: src.en, ne: src.ne });
    setEditingSourceId(src.id);
  };
  const handleSourceDelete = async (id: number) => {
    if (!confirm('Delete this source?')) return;
    const res = await fetch(`/api/admin/sources/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchSources();
      toast.success('Source deleted');
    } else {
      toast.error('Failed to delete source');
    }
  };

  // CRUD handlers for grant types
  const handleGrantTypeSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingGrantTypeId ? 'PUT' : 'POST';
    const url = editingGrantTypeId ? `/api/admin/grant-types/${editingGrantTypeId}` : '/api/admin/grant-types';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grantTypeForm),
    });
    if (res.ok) {
      setGrantTypeForm({ key: '', name: '', en: '', ne: '' });
      setEditingGrantTypeId(null);
      fetchGrantTypes();
      toast.success('Grant type saved');
    } else {
      toast.error('Failed to save grant type');
    }
  };
  const handleGrantTypeEdit = (gt: any) => {
    setGrantTypeForm({ key: gt.key, name: gt.name, en: gt.en, ne: gt.ne });
    setEditingGrantTypeId(gt.id);
  };
  const handleGrantTypeDelete = async (id: number) => {
    if (!confirm('Delete this grant type?')) return;
    const res = await fetch(`/api/admin/grant-types/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchGrantTypes();
      toast.success('Grant type deleted');
    } else {
      toast.error('Failed to delete grant type');
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
                  {settings.siteLogo.startsWith('data:') ? (
                    <img
                      src={settings.siteLogo}
                      alt="Site Logo"
                      className="object-contain w-16 h-16 rounded-md bg-dark-800"
                    />
                  ) : (
                    <Image
                      src={settings.siteLogo}
                      alt="Site Logo"
                      fill
                      className="object-contain rounded-md bg-dark-800"
                    />
                  )}
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

      {/* Source Types Management */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Source Types</h2>
        <form onSubmit={handleSourceSave} className="space-y-2 mb-4">
          <div className="flex gap-2">
            <Input value={sourceForm.key} onChange={e => setSourceForm(f => ({ ...f, key: e.target.value }))} placeholder="Key (e.g. local_municipality)" required />
            <Input value={sourceForm.name} onChange={e => setSourceForm(f => ({ ...f, name: e.target.value }))} placeholder="Admin Label" required />
            <Input value={sourceForm.en} onChange={e => setSourceForm(f => ({ ...f, en: e.target.value }))} placeholder="English Translation" required />
            <Input value={sourceForm.ne} onChange={e => setSourceForm(f => ({ ...f, ne: e.target.value }))} placeholder="Nepali Translation" required />
            <Button type="submit">{editingSourceId ? 'Update' : 'Add'}</Button>
            {editingSourceId && <Button type="button" onClick={() => { setSourceForm({ key: '', name: '', en: '', ne: '' }); setEditingSourceId(null); }}>Cancel</Button>}
          </div>
        </form>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Key</th><th>Label</th><th>EN</th><th>NE</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((src: any) => (
              <tr key={src.id}>
                <td>{src.key}</td>
                <td>{src.name}</td>
                <td>{src.en}</td>
                <td>{src.ne}</td>
                <td>
                  <Button type="button" onClick={() => handleSourceEdit(src)}>Edit</Button>
                  <Button type="button" onClick={() => handleSourceDelete(src.id)} variant="danger">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Grant Types Management */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Grant Types</h2>
        <form onSubmit={handleGrantTypeSave} className="space-y-2 mb-4">
          <div className="flex gap-2">
            <Input value={grantTypeForm.key} onChange={e => setGrantTypeForm(f => ({ ...f, key: e.target.value }))} placeholder="Key (e.g. supplementary_grant)" required />
            <Input value={grantTypeForm.name} onChange={e => setGrantTypeForm(f => ({ ...f, name: e.target.value }))} placeholder="Admin Label" required />
            <Input value={grantTypeForm.en} onChange={e => setGrantTypeForm(f => ({ ...f, en: e.target.value }))} placeholder="English Translation" required />
            <Input value={grantTypeForm.ne} onChange={e => setGrantTypeForm(f => ({ ...f, ne: e.target.value }))} placeholder="Nepali Translation" required />
            <Button type="submit">{editingGrantTypeId ? 'Update' : 'Add'}</Button>
            {editingGrantTypeId && <Button type="button" onClick={() => { setGrantTypeForm({ key: '', name: '', en: '', ne: '' }); setEditingGrantTypeId(null); }}>Cancel</Button>}
          </div>
        </form>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Key</th><th>Label</th><th>EN</th><th>NE</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {grantTypes.map((gt: any) => (
              <tr key={gt.id}>
                <td>{gt.key}</td>
                <td>{gt.name}</td>
                <td>{gt.en}</td>
                <td>{gt.ne}</td>
                <td>
                  <Button type="button" onClick={() => handleGrantTypeEdit(gt)}>Edit</Button>
                  <Button type="button" onClick={() => handleGrantTypeDelete(gt.id)} variant="danger">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
} 