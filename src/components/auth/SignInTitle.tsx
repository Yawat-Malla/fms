'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function SignInTitle() {
  const { settings, isLoading } = useSettings();

  return (
    <h2 className="text-center text-3xl font-extrabold text-white">
      {isLoading ? 'फाइल व्यवस्थापन प्रणाली' : settings?.siteNameNepali || 'फाइल व्यवस्थापन प्रणाली'}
    </h2>
  );
} 