'use client';
  
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import Avatar from '@/components/ui/Avatar';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import { TranslatedText } from '@/components/TranslatedText';
import { translations } from '@/translations';
import { useTranslation } from 'react-i18next';

interface ProfileSettings {
  fullName: string;
  username: string;
  email: string;
  profilePicture: string;
  password?: string;
}

interface NotificationSettings {
    fileUpdates: boolean;
    securityAlerts: boolean;
    systemUpdates: boolean;
}

interface AdminSettings {
  siteName: string;
  siteLogo: string;
  enabledModules: string[];
  maintenanceMode: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const { theme, language, toggleTheme, setLanguage } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { t } = useTranslation();

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    fullName: session?.user?.name || '',
    username: session?.user?.email?.split('@')[0] || '',
    email: session?.user?.email || '',
    profilePicture: session?.user?.profilePicture || '',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
      fileUpdates: true,
      securityAlerts: true,
      systemUpdates: false,
  });

  // Admin Settings (only for admin users)
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    siteName: 'File Management System',
    siteLogo: '/logo.png',
    enabledModules: ['files', 'users', 'reports'],
    maintenanceMode: false,
  });

  // Admin Settings State Management
  const [isLoadingAdminSettings, setIsLoadingAdminSettings] = useState(false);
  const [adminModules] = useState([
    { id: 'files', label: 'Files Module' },
    { id: 'users', label: 'Users Management' },
    { id: 'reports', label: 'Reports & Analytics' },
    { id: 'api', label: 'API Access' },
    { id: 'analytics', label: 'Advanced Analytics' },
  ]);

  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  });

  // State for sources and grant types
  const [sources, setSources] = useState([]);
  const [grantTypes, setGrantTypes] = useState([]);
  const [sourceForm, setSourceForm] = useState({ key: '', name: '', en: '', ne: '' });
  const [grantTypeForm, setGrantTypeForm] = useState({ key: '', name: '', en: '', ne: '' });
  const [editingSourceId, setEditingSourceId] = useState<number | null>(null);
  const [editingGrantTypeId, setEditingGrantTypeId] = useState<number | null>(null);

  // Add state for upload sections
  const [uploadSections, setUploadSections] = useState([]);
  const [uploadSectionForm, setUploadSectionForm] = useState({ name: '', key: '', en: '', ne: '' });
  const [editingUploadSectionId, setEditingUploadSectionId] = useState<number | null>(null);

  // Update useEffect to sync with session changes
  useEffect(() => {
    if (session?.user) {
      console.log('[Settings Debug] Session updated:', session.user);
      setProfileSettings(prev => ({
        ...prev,
        fullName: session.user.name || '',
        email: session.user.email || '',
        profilePicture: session.user.profilePicture || '',
        username: session.user.email?.split('@')[0] || '',
      }));
    }
  }, [session]);

  // Debug logging for session changes
  useEffect(() => {
    console.log('[Settings Debug] Current session:', {
      user: session?.user,
      profilePicture: session?.user?.profilePicture,
      username: session?.user?.email?.split('@')[0] || '',
    });
  }, [session]);

  // Load admin settings
  useEffect(() => {
    const loadAdminSettings = async () => {
      if (session?.user?.role === 'admin') {
        try {
          const response = await fetch('/api/admin/settings');
          if (response.ok) {
            const settings = await response.json();
            setAdminSettings({
              siteName: settings.siteName || 'File Management System',
              siteLogo: settings.siteLogo || '/logo.png',
              enabledModules: settings.enabledModules || ['files', 'users', 'reports'],
              maintenanceMode: settings.maintenanceMode || false,
            });
          }
        } catch (error) {
          console.error('Error loading admin settings:', error);
          toast.error('Failed to load admin settings');
        }
      }
    };

    loadAdminSettings();
  }, [session?.user?.role]);

  // Load notification settings
  useEffect(() => {
    const loadNotificationSettings = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (response.ok) {
            const user = await response.json();
            if (user.notificationPreferences) {
              setNotificationSettings(user.notificationPreferences);
            }
          }
        } catch (error) {
          console.error('Error loading notification settings:', error);
        }
      }
    };

    loadNotificationSettings();
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchSources();
      fetchGrantTypes();
      fetchUploadSections();
    }
  }, [session?.user?.role]);

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

  // Add useEffect to fetch upload sections
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUploadSections();
    }
  }, [session?.user?.role]);

  const fetchUploadSections = async () => {
    const res = await fetch('/api/admin/upload-sections');
    const data = await res.json();
    setUploadSections(data);
  };

  // Add CRUD handlers for upload sections
  const handleUploadSectionSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingUploadSectionId ? 'PUT' : 'POST';
    const url = editingUploadSectionId ? `/api/admin/upload-sections/${editingUploadSectionId}` : '/api/admin/upload-sections';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: uploadSectionForm.name,
        key: uploadSectionForm.key,
        translations: {
          en: uploadSectionForm.en,
          ne: uploadSectionForm.ne
        }
      }),
    });
    if (res.ok) {
      setUploadSectionForm({ name: '', key: '', en: '', ne: '' });
      setEditingUploadSectionId(null);
      fetchUploadSections();
      toast.success('Upload section saved');
    } else {
      toast.error('Failed to save upload section');
    }
  };

  const handleUploadSectionEdit = (section: any) => {
    setUploadSectionForm({
      name: section.name,
      key: section.key,
      en: section.translations?.en || '',
      ne: section.translations?.ne || ''
    });
    setEditingUploadSectionId(section.id);
  };

  const handleUploadSectionDelete = async (id: number) => {
    if (!confirm('Delete this upload section?')) return;
    const res = await fetch(`/api/admin/upload-sections/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchUploadSections();
      toast.success('Upload section deleted');
    } else {
      toast.error('Failed to delete upload section');
    }
  };

  // Memoize the tab button classes to prevent hydration mismatch
  const getTabButtonClasses = useCallback((isActive: boolean) => {
    return isActive
      ? 'px-3 py-2 text-sm font-medium border-b-2 border-primary-500 text-primary-500'
      : 'px-3 py-2 text-sm font-medium text-dark-300 hover:text-dark-100';
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      if (session?.user?.id) {
        console.log('[Settings Debug] Starting profile update:', {
          userId: session.user.id,
          currentSettings: profileSettings
        });

        const res = await fetch(`/api/users/${session.user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profileSettings.fullName,
            email: profileSettings.email,
            profilePicture: profileSettings.profilePicture,
            username: profileSettings.username,
            notificationPreferences: notificationSettings,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error('[Settings Debug] API Error:', errorData);
          throw new Error('Failed to update settings');
        }

        // Fetch the updated user data
        const updatedUserRes = await fetch(`/api/users/${session.user.id}`);
        if (!updatedUserRes.ok) {
          throw new Error('Failed to fetch updated user data');
        }
        const updatedUser = await updatedUserRes.json();
        console.log('[Settings Debug] Fetched updated user:', updatedUser);

        // Update session with the fresh user data
        await updateSession({
          ...session,
          user: {
            ...session.user,
            name: updatedUser.name,
            email: updatedUser.email,
            profilePicture: updatedUser.profilePicture,
            username: updatedUser.username,
          }
        });

        // Update local state with the fresh data
        setProfileSettings(prev => ({
          ...prev,
          fullName: updatedUser.name,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture,
          username: updatedUser.username,
        }));

        toast.success('Settings updated successfully');

        // Force a complete refresh of the application
        router.refresh();
      } else {
        console.log('[Settings Debug] No user session found');
      }
    } catch (error) {
      console.error('[Settings Debug] Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Add this useEffect to handle initial data loading
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (response.ok) {
            const userData = await response.json();
            console.log('[Settings Debug] Loaded user data:', userData);
            setProfileSettings(prev => ({
              ...prev,
              fullName: userData.name,
              email: userData.email,
              profilePicture: userData.profilePicture,
            }));
          }
        } catch (error) {
          console.error('[Settings Debug] Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [session?.user?.id]);

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        console.log('[Settings Debug] Starting profile picture upload. Current session:', {
          hasSession: Boolean(session),
          userId: session?.user?.id,
          currentProfilePicture: session?.user?.profilePicture
        });

        const formData = new FormData();
        formData.append('file', file);

        // Upload the file
        const uploadResponse = await fetch('/api/users/upload-profile-picture', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload profile picture');
        }

        const uploadData = await uploadResponse.json();
        const profilePicturePath = uploadData.user.profilePicture;
        
        console.log('[Settings Debug] Upload successful:', {
          uploadResponse: uploadData,
          profilePicturePath
        });
        
        // Update local state
        setProfileSettings(prev => ({
          ...prev,
          profilePicture: profilePicturePath,
        }));

        if (!session?.user?.id) {
          console.error('[Settings Debug] No valid session for update');
          return;
        }

        // Update user in database
        const userUpdateResponse = await fetch(`/api/users/${session.user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profilePicture: profilePicturePath,
          }),
        });

        if (!userUpdateResponse.ok) {
          throw new Error('Failed to update user profile');
        }

        const updatedUser = await userUpdateResponse.json();
        console.log('[Settings Debug] User update successful:', updatedUser);

        // Update the session
        const updatedSession = {
          ...session,
          user: {
            ...session.user,
            profilePicture: profilePicturePath,
          },
        };

        console.log('[Settings Debug] Updating session with:', updatedSession);

        await updateSession(updatedSession);
            
        // Verify session update
        const sessionCheck = await fetch('/api/auth/session');
        const currentSession = await sessionCheck.json();
        
        console.log('[Settings Debug] Session verification:', {
          sessionUpdated: currentSession?.user?.profilePicture === profilePicturePath,
          currentSession
        });

        // Force a refresh without full page reload
            router.refresh();
            
            toast.success('Profile picture updated successfully');
      } catch (error) {
        console.error('[Settings Debug] Error:', error);
        toast.error('Failed to update profile picture');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Account',
      message: 'Are you absolutely sure you want to delete your account? This will permanently delete all your data and cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/users/${session.user.id}/danger`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete account');
          }

      toast.success('Account deleted successfully');
          router.push('/auth/signin');
        } catch (error) {
          console.error('Error deleting account:', error);
          toast.error('Failed to delete account');
    }
      },
      variant: 'danger'
    });
  };

  const handleResetSettings = async () => {
    if (!session?.user?.id) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Reset Settings',
      message: 'Are you sure you want to reset all settings to default? This will reset your notification preferences and other settings.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/users/${session.user.id}/danger`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'reset_settings' }),
          });

          if (!response.ok) {
            throw new Error('Failed to reset settings');
          }

          // Reset local state
          setNotificationSettings({
            fileUpdates: true,
            securityAlerts: true,
            systemUpdates: false,
          });

      toast.success('Settings reset successfully');
          router.refresh();
        } catch (error) {
          console.error('Error resetting settings:', error);
          toast.error('Failed to reset settings');
        }
      },
      variant: 'warning'
    });
  };

  const handleWipeData = async () => {
    if (!session?.user?.id) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Wipe Data',
      message: 'Are you absolutely sure you want to wipe all your data? This will permanently delete all your files, folders, reports, and other data. This action cannot be undone.',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/users/${session.user.id}/danger`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'wipe_data' }),
          });

          if (!response.ok) {
            throw new Error('Failed to wipe data');
          }

          toast.success('Data wiped successfully');
          router.refresh();
        } catch (error) {
          console.error('Error wiping data:', error);
          toast.error('Failed to wipe data');
        }
      },
      variant: 'danger'
    });
  };

  const handleAdminSettingsSave = async () => {
    if (session?.user?.role !== 'admin') {
      toast.error('Unauthorized');
      return;
    }

    setIsLoadingAdminSettings(true);
    try {
      const formData = new FormData();
      formData.append('siteName', adminSettings.siteName);
      formData.append('maintenanceMode', String(adminSettings.maintenanceMode));
      formData.append('enabledModules', JSON.stringify(adminSettings.enabledModules));

      const fileInput = document.querySelector('#site-logo') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append('siteLogo', fileInput.files[0]);
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update admin settings');
      }

      toast.success('Admin settings updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error saving admin settings:', error);
      toast.error('Failed to save admin settings');
    } finally {
      setIsLoadingAdminSettings(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-100">
          <TranslatedText text="settings.title" />
        </h1>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TranslatedText text="settings.profile" />
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-4 px-1 ${
              activeTab === 'notifications'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TranslatedText text="settings.notifications" />
          </button>
          {session?.user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`pb-4 px-1 ${
                activeTab === 'admin'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TranslatedText text="settings.admin" />
            </button>
          )}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <Card>
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <Avatar
                  src={profileSettings.profilePicture}
                  alt={profileSettings.fullName}
                  size="lg"
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                    id="profile-picture"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <TranslatedText text="settings.changePhoto" />
                  </label>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <TranslatedText text="settings.fullName" />
                  </label>
                  <input
                    type="text"
                    value={profileSettings.fullName}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, fullName: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <TranslatedText text="settings.email" />
                  </label>
                  <input
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, email: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    <TranslatedText text="settings.fileUpdates" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <TranslatedText text="settings.fileUpdatesDesc" />
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.fileUpdates}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        fileUpdates: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    <TranslatedText text="settings.securityAlerts" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <TranslatedText text="settings.securityAlertsDesc" />
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.securityAlerts}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        securityAlerts: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'admin' && session?.user?.role === 'admin' && (
          <Card>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <TranslatedText text="settings.siteName" />
                </label>
                <input
                  type="text"
                  value={adminSettings.siteName}
                  onChange={(e) =>
                    setAdminSettings({ ...adminSettings, siteName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <TranslatedText text="settings.enabledModules" />
                </label>
                <div className="mt-2 space-y-2">
                  {adminModules.map((module) => (
                    <label key={module.id} className="inline-flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={adminSettings.enabledModules.includes(module.id)}
                        onChange={(e) => {
                          const newModules = e.target.checked
                            ? [...adminSettings.enabledModules, module.id]
                            : adminSettings.enabledModules.filter((m) => m !== module.id);
                          setAdminSettings({ ...adminSettings, enabledModules: newModules });
                        }}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                      <span className="ml-2">{module.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="ml-3"
          >
            {isSaving ? (
              <TranslatedText text="common.saving" />
            ) : (
              <TranslatedText text="common.save" />
            )}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        variant={confirmDialog.variant}
      />
    </div>
  );
} 