'use client';
  
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';

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
  maxFileSize: number;
  allowedFileTypes: string[];
  retentionPeriod: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const { theme, language, toggleTheme, setLanguage, t } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    fullName: session?.user?.name || '',
    username: session?.user?.username || session?.user?.email?.split('@')[0] || '',
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
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    retentionPeriod: 30,
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

  // Delete Account Modal
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Clear Data Modal
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  // Update useEffect to sync with session changes
  useEffect(() => {
    if (session?.user) {
      console.log('[Settings Debug] Session updated:', session.user);
      setProfileSettings(prev => ({
        ...prev,
        fullName: session.user.name || '',
        email: session.user.email || '',
        profilePicture: session.user.profilePicture || '',
        username: session.user.username || session.user.email?.split('@')[0] || '',
      }));
    }
  }, [session]);

  // Debug logging for session changes
  useEffect(() => {
    console.log('[Settings Debug] Current session:', {
      user: session?.user,
      profilePicture: session?.user?.profilePicture,
      username: session?.user?.username,
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
              maxFileSize: settings.maxFileSize || 10,
              allowedFileTypes: settings.allowedFileTypes || ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
              retentionPeriod: settings.retentionPeriod || 30,
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

    setIsDeletingAccount(true);
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
    } finally {
      setIsDeletingAccount(false);
    }
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
      formData.append('maxFileSize', String(adminSettings.maxFileSize));
      formData.append('allowedFileTypes', JSON.stringify(adminSettings.allowedFileTypes));
      formData.append('retentionPeriod', String(adminSettings.retentionPeriod));

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
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-dark-300">Manage your account settings and preferences</p>
      </div>

      {/* Settings Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4 border-b border-gray-200 dark:border-dark-700">
          {['profile', 'preferences', 'notifications', 'admin', 'danger'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={getTabButtonClasses(activeTab === tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
        <div className="space-y-6">
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <Card className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-100">Profile Settings</h2>
              <p className="text-gray-600 dark:text-dark-300 mb-4">Update your personal information and profile picture</p>
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
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-dark-100 hover:bg-gray-50 dark:hover:bg-dark-700"
                  >
                    Change Photo
                  </label>
                </div>
              </div>
              {/* Full Name */}
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full-name"
                  value={profileSettings.fullName}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, fullName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              {/* Username */}
          <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                  Username
            </label>
              <input
                type="text"
                  id="username"
                  value={profileSettings.username}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, username: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              {/* Save Button */}
              <div className="mt-6 flex flex-col space-y-2">
                <p className="text-sm text-gray-500 dark:text-dark-300 italic">Note: Some changes may require you to log in again to take effect.</p>
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleSaveSettings}
                    isLoading={isSaving}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* General Preferences */}
        {activeTab === 'preferences' && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-dark-100 dark:text-dark-100 mb-2">General Preferences</h2>
              <p className="text-dark-300 dark:text-dark-300 mb-4">Customize your application preferences</p>
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-dark-200 dark:text-dark-200">Theme</h3>
                  <p className="text-xs text-dark-400 dark:text-dark-400">Switch between light and dark mode</p>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={theme === 'dark'}
                  onClick={toggleTheme}
                >
                  <span className="sr-only">Theme Mode</span>
                  <span
                    className={`${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                  />
                </button>
              </div>
              {/* Language Selection */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-dark-200 dark:text-dark-200">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ne')}
                  className="mt-1 block w-full rounded-md border-dark-600 bg-light-200 dark:bg-dark-700 text-dark-900 dark:text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="en">English</option>
                  <option value="ne">नेपाली</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700">
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-gray-900 dark:text-dark-100">File Updates</label>
                    <p className="text-sm text-gray-500 dark:text-dark-300">Get notified when files are updated</p>
                  </div>
                  <Switch
                    checked={notificationSettings.fileUpdates}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      fileUpdates: e.target.checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-gray-900 dark:text-dark-100">Security Alerts</label>
                    <p className="text-sm text-gray-500 dark:text-dark-300">Get notified about security-related events</p>
                  </div>
                  <Switch
                    checked={notificationSettings.securityAlerts}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      securityAlerts: e.target.checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-gray-900 dark:text-dark-100">System Updates</label>
                    <p className="text-sm text-gray-500 dark:text-dark-300">Get notified about system updates and maintenance</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      systemUpdates: e.target.checked
                    }))}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Admin Settings */}
        {activeTab === 'admin' && (
          <Card className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-100">Admin Settings</h2>
              <p className="text-gray-600 dark:text-dark-300 mb-4">Manage system-wide settings and configurations</p>
              
              {/* System Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100">System Settings</h3>
                <div className="space-y-4">
                  {/* File Upload Settings */}
                  <div>
                    <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                      Maximum File Size (MB)
                    </label>
                    <input
                      type="number"
                      id="maxFileSize"
                      value={adminSettings.maxFileSize}
                      onChange={(e) => setAdminSettings(prev => ({ ...prev, maxFileSize: Number(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>

                  {/* Allowed File Types */}
                  <div>
                    <label htmlFor="allowedFileTypes" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                      Allowed File Types
                    </label>
                    <input
                      type="text"
                      id="allowedFileTypes"
                      value={adminSettings.allowedFileTypes.join(', ')}
                      onChange={(e) => setAdminSettings(prev => ({ ...prev, allowedFileTypes: e.target.value.split(',').map(type => type.trim()) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="pdf, doc, docx, xls, xlsx"
                    />
                  </div>

                  {/* Retention Period */}
                  <div>
                    <label htmlFor="retentionPeriod" className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                      File Retention Period (days)
                    </label>
                    <input
                      type="number"
                      id="retentionPeriod"
                      value={adminSettings.retentionPeriod}
                      onChange={(e) => setAdminSettings(prev => ({ ...prev, retentionPeriod: Number(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleAdminSettingsSave}
                  isLoading={isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Danger Zone */}
        {activeTab === 'danger' && (
          <Card className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-100">Danger Zone</h2>
              <p className="text-gray-600 dark:text-dark-300 mb-4">Irreversible and destructive actions</p>
              
              {/* Delete Account */}
              <div className="border border-red-200 dark:border-red-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100">Delete Account</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-300">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteAccountModal(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>

              {/* Clear All Data */}
              <div className="border border-red-200 dark:border-red-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-dark-100">Clear All Data</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-300">
                      Delete all your uploaded files and associated data
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => setShowClearDataModal(true)}
                  >
                    Clear Data
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteAccountModal}
          onClose={() => setShowDeleteAccountModal(false)}
          title="Delete Account"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-dark-300">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAccountModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                isLoading={isDeletingAccount}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>

        {/* Clear Data Modal */}
        <Modal
          isOpen={showClearDataModal}
          onClose={() => setShowClearDataModal(false)}
          title="Clear All Data"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-dark-300">
              Are you sure you want to delete all your data? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowClearDataModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleWipeData}
                isLoading={isClearingData}
              >
                Clear Data
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button 
          variant="primary"
          onClick={handleSaveSettings}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
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