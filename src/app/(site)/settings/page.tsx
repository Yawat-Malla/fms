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
    <div className="max-w-6xl">
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
            ...(session?.user?.role === 'admin' ? ['admin'] : []),
            'danger'
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={getTabButtonClasses(activeTab === tab)}
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
        {activeTab === 'admin' && session?.user?.role === 'admin' ? (
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
        ) : activeTab === 'admin' ? (
          <Card>
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold text-red-500 mb-2">
                <TranslatedText text="settings.admin.accessDenied" />
              </h2>
              <p className="text-dark-300">
                <TranslatedText text="settings.admin.accessDeniedDescription" />
              </p>
            </div>
          </Card>
        ) : null}

        {/* Danger Zone */}
        {activeTab === 'danger' && (
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
              {session?.user?.role === 'admin' && (
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
              )}
        </div>
      </Card>
        )}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          <TranslatedText text="settings.buttons.cancel" />
        </Button>
        <Button 
          variant="primary"
          onClick={handleSaveSettings}
          isLoading={isSaving}
        >
          <TranslatedText text="settings.buttons.save" />
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