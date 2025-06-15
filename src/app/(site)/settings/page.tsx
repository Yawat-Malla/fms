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

  // Add password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
    if (!session?.user?.id || session?.user?.role !== 'superadmin') {
      toast.error('Unauthorized: Only superadmin can perform this action');
      return;
    }

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
    if (!session?.user?.id || session?.user?.role !== 'superadmin') {
      toast.error('Unauthorized: Only superadmin can perform this action');
      return;
    }

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
    if (!session?.user?.id || session?.user?.role !== 'superadmin') {
      toast.error('Unauthorized: Only superadmin can perform this action');
      return;
    }

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

  // Add password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setIsChangingPassword(true);

    try {
      // Validate passwords
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters long');
        return;
      }

      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      // Clear form and show success message
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-100">
          <TranslatedText text="settings.title" />
        </h1>
        <p className="mt-1 text-sm text-dark-300">
          <TranslatedText text="settings.subtitle" />
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4 border-b border-dark-700">
          {[
            'profile',
            'preferences',
            ...(session?.user?.role === 'admin' || session?.user?.role === 'superadmin' ? ['admin'] : []),
            ...(session?.user?.role === 'superadmin' ? ['danger'] : [])
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 ${
                activeTab === tab
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TranslatedText text={`settings.${tab}.title`} />
            </button>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-dark-100 mb-2">
                <TranslatedText text="settings.profile.title" />
              </h2>
              <p className="text-dark-300 mb-4">
                <TranslatedText text="settings.profile.pictureDescription" />
              </p>
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative h-24 w-24">
                  <Avatar
                    imageUrl={profileSettings.profilePicture}
                    name={profileSettings.fullName}
                    size="lg"
                    className="w-24 h-24"
                  />
                </div>
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
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-dark-600 rounded-md shadow-sm text-sm font-medium text-dark-100 hover:bg-dark-700"
                  >
                    <TranslatedText text="settings.profile.picture" />
                  </label>
                </div>
              </div>
              {/* Full Name */}
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-dark-200">
                  <TranslatedText text="settings.profile.fullName" />
                </label>
                <input
                  type="text"
                  id="full-name"
                  value={profileSettings.fullName}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, fullName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-dark-200">
                  <TranslatedText text="settings.profile.username" />
                </label>
                <input
                  type="text"
                  id="username"
                  value={profileSettings.username}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, username: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-dark-200">
                  <TranslatedText text="settings.profile.email" />
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              {/* Save Button */}
              <div className="mt-6 flex flex-col space-y-2">
                <p className="text-sm text-dark-300 italic">
                  <TranslatedText text="settings.profile.saveNote" />
                </p>
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSaveSettings}
                    isLoading={isSaving}
                  >
                    <TranslatedText text="settings.buttons.save" />
                  </Button>
                </div>
              </div>

              {/* Add password change form */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-dark-100 mb-4">
                  <TranslatedText text="settings.profile.changePassword" />
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-1">
                      <TranslatedText text="settings.profile.currentPassword" />
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-1">
                      <TranslatedText text="settings.profile.newPassword" />
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-1">
                      <TranslatedText text="settings.profile.confirmPassword" />
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      required
                    />
                  </div>
                  {passwordError && (
                    <div className="text-red-500 text-sm">{passwordError}</div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <TranslatedText text="common.saving" />
                      ) : (
                        <TranslatedText text="settings.profile.changePassword" />
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </Card>
        )}

        {/* Preferences & Notifications */}
        {activeTab === 'preferences' && (
          <Card>
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-dark-100 mb-2">
                <TranslatedText text="settings.preferences.title" />
              </h2>
              <p className="text-dark-300 mb-4">
                <TranslatedText text="settings.preferences.description" />
              </p>

              {/* General Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-dark-100">
                  <TranslatedText text="settings.preferences.general" />
                </h3>
                {/* Language Selection */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-dark-200">
                    <TranslatedText text="settings.language.label" />
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'ne')}
                    className="mt-1 block w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="en">
                      <TranslatedText text="settings.language.options.en" />
                    </option>
                    <option value="ne">
                      <TranslatedText text="settings.language.options.ne" />
                    </option>
                  </select>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="border-t border-dark-600 pt-6">
                <h3 className="text-lg font-medium text-dark-100 mb-4">
                  <TranslatedText text="settings.preferences.notifications" />
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-dark-100">
                        <TranslatedText text="settings.preferences.fileUpdates" />
                      </label>
                      <p className="text-sm text-dark-300">
                        <TranslatedText text="settings.preferences.fileUpdatesDescription" />
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.fileUpdates}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          fileUpdates: e.target.checked
                        }))}
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-dark-100">
                        <TranslatedText text="settings.preferences.securityAlerts" />
                      </label>
                      <p className="text-sm text-dark-300">
                        <TranslatedText text="settings.preferences.securityAlertsDescription" />
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.securityAlerts}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          securityAlerts: e.target.checked
                        }))}
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-dark-100">
                        <TranslatedText text="settings.preferences.systemUpdates" />
                      </label>
                      <p className="text-sm text-dark-300">
                        <TranslatedText text="settings.preferences.systemUpdatesDescription" />
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notificationSettings.systemUpdates}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          systemUpdates: e.target.checked
                        }))}
                      />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Admin Settings */}
        {(activeTab === 'admin' && (session?.user?.role === 'admin' || session?.user?.role === 'superadmin')) && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-dark-100 mb-2">
                <TranslatedText text="settings.admin.title" />
              </h2>
              <p className="text-dark-300 mb-4">
                <TranslatedText text="settings.admin.description" />
              </p>
              
              {/* Site Configuration */}
              <div>
                <h3 className="text-sm font-medium text-dark-200 mb-4">
                  <TranslatedText text="settings.admin.siteSettings" />
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="site-name" className="block text-sm font-medium text-dark-200">
                      <TranslatedText text="settings.admin.siteName" />
                    </label>
                    <input
                      type="text"
                      id="site-name"
                      value={adminSettings.siteName}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev,
                        siteName: e.target.value,
                      }))}
                      className="mt-1 block w-full rounded-md border-dark-600 bg-dark-700 text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="site-logo" className="block text-sm font-medium text-dark-200">
                      <TranslatedText text="settings.admin.siteLogo" />
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                      <img
                        src={adminSettings.siteLogo}
                        alt="Site Logo"
                        className="h-12 w-12 rounded-md object-contain bg-dark-800"
                      />
                      <input
                        type="file"
                        id="site-logo"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setAdminSettings(prev => ({
                                ...prev,
                                siteLogo: event.target?.result as string,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="mt-1 block w-full text-sm text-dark-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-dark-700 file:text-dark-100
                          hover:file:bg-dark-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between mt-6">
                <div>
                  <h3 className="text-sm font-medium text-dark-200">
                    <TranslatedText text="settings.admin.maintenanceMode" />
                  </h3>
                  <p className="text-xs text-dark-400">
                    <TranslatedText text="settings.admin.maintenanceModeDescription" />
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={adminSettings.maintenanceMode}
                  onChange={(e) => setAdminSettings(prev => ({
                    ...prev,
                    maintenanceMode: e.target.checked,
                  }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-dark-600 rounded"
                />
              </div>

              {/* Source Types Management */}
              <Card className="p-6 mt-8">
                <h2 className="text-xl font-semibold mb-4">Source Types</h2>
                <form onSubmit={handleSourceSave} className="space-y-2 mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <input value={sourceForm.name} onChange={e => {
                      const name = e.target.value;
                      const key = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                      setSourceForm(f => ({ ...f, name, key }));
                    }} placeholder="Admin Label" required className="input flex-1 min-w-[180px]" />
                    <input value={sourceForm.key} disabled placeholder="Generated Key" className="input flex-1 min-w-[180px] bg-gray-100" />
                    <input value={sourceForm.en} onChange={e => setSourceForm(f => ({ ...f, en: e.target.value }))} placeholder="English Translation" required className="input flex-1 min-w-[180px]" />
                    <input value={sourceForm.ne} onChange={e => setSourceForm(f => ({ ...f, ne: e.target.value }))} placeholder="Nepali Translation" required className="input flex-1 min-w-[180px]" />
                    <Button type="submit" className="h-10 px-6">{editingSourceId ? 'Update' : 'Add'}</Button>
                    {editingSourceId && <Button type="button" onClick={() => { setSourceForm({ key: '', name: '', en: '', ne: '' }); setEditingSourceId(null); }} className="h-10 px-6">Cancel</Button>}
                  </div>
                </form>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left text-dark-400">
                        <th className="px-2 py-1">Key</th>
                        <th className="px-2 py-1">Label</th>
                        <th className="px-2 py-1">EN</th>
                        <th className="px-2 py-1">NE</th>
                        <th className="px-2 py-1 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map((src: any) => (
                        <tr key={src.id} className="bg-white rounded shadow-sm">
                          <td className="px-2 py-1 font-mono text-xs text-dark-700">{src.key}</td>
                          <td className="px-2 py-1">{src.name}</td>
                          <td className="px-2 py-1">{src.translations?.en || src.en}</td>
                          <td className="px-2 py-1">{src.translations?.ne || src.ne}</td>
                          <td className="px-2 py-1 text-center">
                            <div className="flex gap-2 justify-center">
                              <button type="button" onClick={() => handleSourceEdit(src)} className="bg-white border border-blue-500 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition">Edit</button>
                              <button type="button" onClick={() => handleSourceDelete(src.id)} className="bg-white border border-red-500 text-red-600 px-3 py-1 rounded hover:bg-red-50 transition">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Grant Types Management */}
              <Card className="p-6 mt-8">
                <h2 className="text-xl font-semibold mb-4">Grant Types</h2>
                <form onSubmit={handleGrantTypeSave} className="space-y-2 mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <input value={grantTypeForm.name} onChange={e => {
                      const name = e.target.value;
                      const key = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                      setGrantTypeForm(f => ({ ...f, name, key }));
                    }} placeholder="Admin Label" required className="input flex-1 min-w-[180px]" />
                    <input value={grantTypeForm.key} disabled placeholder="Generated Key" className="input flex-1 min-w-[180px] bg-gray-100" />
                    <input value={grantTypeForm.en} onChange={e => setGrantTypeForm(f => ({ ...f, en: e.target.value }))} placeholder="English Translation" required className="input flex-1 min-w-[180px]" />
                    <input value={grantTypeForm.ne} onChange={e => setGrantTypeForm(f => ({ ...f, ne: e.target.value }))} placeholder="Nepali Translation" required className="input flex-1 min-w-[180px]" />
                    <Button type="submit" className="h-10 px-6">{editingGrantTypeId ? 'Update' : 'Add'}</Button>
                    {editingGrantTypeId && <Button type="button" onClick={() => { setGrantTypeForm({ key: '', name: '', en: '', ne: '' }); setEditingGrantTypeId(null); }} className="h-10 px-6">Cancel</Button>}
                  </div>
                </form>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left text-dark-400">
                        <th className="px-2 py-1">Key</th>
                        <th className="px-2 py-1">Label</th>
                        <th className="px-2 py-1">EN</th>
                        <th className="px-2 py-1">NE</th>
                        <th className="px-2 py-1 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grantTypes.map((gt: any) => (
                        <tr key={gt.id} className="bg-white rounded shadow-sm">
                          <td className="px-2 py-1 font-mono text-xs text-dark-700">{gt.key}</td>
                          <td className="px-2 py-1">{gt.name}</td>
                          <td className="px-2 py-1">{gt.translations?.en || gt.en}</td>
                          <td className="px-2 py-1">{gt.translations?.ne || gt.ne}</td>
                          <td className="px-2 py-1 text-center">
                            <div className="flex gap-2 justify-center">
                              <button type="button" onClick={() => handleGrantTypeEdit(gt)} className="bg-white border border-blue-500 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition">Edit</button>
                              <button type="button" onClick={() => handleGrantTypeDelete(gt.id)} className="bg-white border border-red-500 text-red-600 px-3 py-1 rounded hover:bg-red-50 transition">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Upload Sections Management */}
              <Card className="p-6 mt-8">
                <h2 className="text-xl font-semibold mb-4">Upload Sections</h2>
                <form onSubmit={handleUploadSectionSave} className="space-y-2 mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <input
                      value={uploadSectionForm.name}
                      onChange={e => {
                        const name = e.target.value;
                        const key = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                        setUploadSectionForm(f => ({ ...f, name, key }));
                      }}
                      placeholder="Admin Label"
                      required
                      className="input flex-1 min-w-[180px]"
                    />
                    <input
                      value={uploadSectionForm.key}
                      disabled
                      placeholder="Generated Key"
                      className="input flex-1 min-w-[180px] bg-gray-100"
                    />
                    <input
                      value={uploadSectionForm.en}
                      onChange={e => setUploadSectionForm(f => ({ ...f, en: e.target.value }))}
                      placeholder="English Translation"
                      required
                      className="input flex-1 min-w-[180px]"
                    />
                    <input
                      value={uploadSectionForm.ne}
                      onChange={e => setUploadSectionForm(f => ({ ...f, ne: e.target.value }))}
                      placeholder="Nepali Translation"
                      required
                      className="input flex-1 min-w-[180px]"
                    />
                    <Button type="submit" className="h-10 px-6">
                      {editingUploadSectionId ? 'Update' : 'Add'}
                    </Button>
                    {editingUploadSectionId && (
                      <Button
                        type="button"
                        onClick={() => {
                          setUploadSectionForm({ name: '', key: '', en: '', ne: '' });
                          setEditingUploadSectionId(null);
                        }}
                        className="h-10 px-6"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left text-dark-400">
                        <th className="px-2 py-1">Key</th>
                        <th className="px-2 py-1">Label</th>
                        <th className="px-2 py-1">EN</th>
                        <th className="px-2 py-1">NE</th>
                        <th className="px-2 py-1 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadSections.map((section: any) => (
                        <tr key={section.id} className="bg-white rounded shadow-sm">
                          <td className="px-2 py-1 font-mono text-xs text-dark-700">{section.key}</td>
                          <td className="px-2 py-1">{section.name}</td>
                          <td className="px-2 py-1">{section.translations?.en}</td>
                          <td className="px-2 py-1">{section.translations?.ne}</td>
                          <td className="px-2 py-1 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                type="button"
                                onClick={() => handleUploadSectionEdit(section)}
                                className="bg-white border border-blue-500 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUploadSectionDelete(section.id)}
                                className="bg-white border border-red-500 text-red-600 px-3 py-1 rounded hover:bg-red-50 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleAdminSettingsSave}
                  isLoading={isLoadingAdminSettings}
                >
                  <TranslatedText text="settings.buttons.save" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Danger Zone */}
        {activeTab === 'danger' && session?.user?.role === 'superadmin' && (
          <Card className="border border-red-500">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-red-500 mb-2">
                <TranslatedText text="settings.danger.title" />
              </h2>
              <p className="text-dark-300 mb-4">
                <TranslatedText text="settings.danger.description" />
              </p>
              
              {/* Delete Account */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-500">
                    <TranslatedText text="settings.danger.deleteAccount" />
                  </h3>
                  <p className="text-xs text-dark-400">
                    <TranslatedText text="settings.danger.deleteAccountDescription" />
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setConfirmDialog({
                    isOpen: true,
                    title: translations[language].settings.danger.deleteAccount,
                    message: translations[language].settings.danger.deleteAccountConfirm,
                    onConfirm: handleDeleteAccount,
                    variant: 'danger'
                  })}
                >
                  <TranslatedText text="settings.danger.deleteAccount" />
                </Button>
              </div>

              {/* Reset Settings */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-500">
                    <TranslatedText text="settings.danger.resetSettings" />
                  </h3>
                  <p className="text-xs text-dark-400">
                    <TranslatedText text="settings.danger.resetSettingsDescription" />
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setConfirmDialog({
                    isOpen: true,
                    title: translations[language].settings.danger.resetSettings,
                    message: translations[language].settings.danger.resetSettingsConfirm,
                    onConfirm: handleResetSettings,
                    variant: 'warning'
                  })}
                >
                  <TranslatedText text="settings.danger.resetSettings" />
                </Button>
              </div>

              {/* Wipe Data */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-500">
                    <TranslatedText text="settings.danger.wipeData" />
                  </h3>
                  <p className="text-xs text-dark-400">
                    <TranslatedText text="settings.danger.wipeDataDescription" />
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setConfirmDialog({
                    isOpen: true,
                    title: translations[language].settings.danger.wipeData,
                    message: translations[language].settings.danger.wipeDataConfirm,
                    onConfirm: handleWipeData,
                    variant: 'danger'
                  })}
                >
                  <TranslatedText text="settings.danger.wipeData" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </div>
  );
} 