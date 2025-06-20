'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactElement } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { TranslatedText } from '@/components/TranslatedText';

// Define interfaces for navigation items
interface NavigationItem {
  name: string;
  href: string;
  icon: ReactElement;
  children?: NavigationItem[];
}

interface DecadeYear {
  name: string;
  href: string;
}

interface Decade {
  name: string;
  years: DecadeYear[];
}

// Helper function to get the current Nepali fiscal year
const getCurrentNepaliFiscalYear = () => {
  const today = new Date();
  const engYear = today.getFullYear();
  const engMonth = today.getMonth() + 1; // 0-based, so +1
  // Nepali new year is around mid-April (month 4)
  let nepaliYear = engYear + 56; // Nepali year is about 56-57 years ahead
  if (engMonth >= 4) nepaliYear += 1;
  return nepaliYear;
};

// Helper function to generate fiscal years
const generateFiscalYears = (): Decade[] => {
  const currentYear = getCurrentNepaliFiscalYear();
  const startDecade = 207; // Start from 2070s
  const decades: Decade[] = [];
  
  // Generate decades from 2040s to current decade
  for (let decade = startDecade; decade <= Math.floor(currentYear / 10); decade++) {
    const decadeYears: DecadeYear[] = [];
    const startYear = decade * 10;
    const endYear = Math.min(startYear + 9, currentYear);
    
    // Generate years for this decade
    for (let year = endYear; year >= startYear; year--) {
      if (year <= currentYear) {
        const fiscalYear = `${year}/${(year + 1).toString().slice(-2)}`;
        decadeYears.push({
          name: fiscalYear,
          href: `/files?fiscal-year=${fiscalYear}`,
        });
      }
    }
    
    decades.push({
      name: `${decade}0s`,
      years: decadeYears,
    });
  }
  
  return decades;
};

// Utility to convert English numbers to Nepali
const toNepaliNumber = (input: string | number) => {
  if (typeof input !== 'string') input = String(input);
  const nepaliDigits = ['०','१','२','३','४','५','६','७','८','९'];
  return input.replace(/[0-9]/g, d => nepaliDigits[d as any]);
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { language } = useApp();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [expandedSubmenus, setExpandedSubmenus] = useState<Record<string, boolean>>({});
  const [expandedDecades, setExpandedDecades] = useState<Record<string, boolean>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedGrantType, setSelectedGrantType] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sourceOptions, setSourceOptions] = useState<{ id: string; translationKey: string; translations: any; }[]>([]);
  const [grantTypeOptions, setGrantTypeOptions] = useState<{ id: string; translationKey: string; translations: any; }[]>([]);

  // Fetch sources and grant types
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const sourcesRes = await fetch('/api/admin/sources');
        const sourcesData = await sourcesRes.json();
        setSourceOptions(sourcesData.map((source: any) => ({
          id: source.key,
          translationKey: `reports.sources.${source.key}`,
          translations: source.translations
        })));

        const grantTypesRes = await fetch('/api/admin/grant-types');
        const grantTypesData = await grantTypesRes.json();
        setGrantTypeOptions(grantTypesData.map((grant: any) => ({
          id: grant.key,
          translationKey: `reports.grantTypes.${grant.key}`,
          translations: grant.translations
        })));
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    fetchOptions();
  }, []);

  // Toggle submenu expansion
  const toggleSubmenu = (name: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Toggle sub-submenu expansion
  const toggleSubSubmenu = (name: string) => {
    setExpandedSubmenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Toggle decade expansion
  const toggleDecade = (name: string) => {
    setExpandedDecades((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Check if a path is active (exact match or starts with for parent routes)
  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      router.push('/sign-in');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle navigation with filters
  const handleFilterClick = async (href: string) => {
    try {
      // Prevent any ongoing navigation
      if (isNavigating) return;
      setIsNavigating(true);

      const url = new URL(href, window.location.origin);
      const params = url.searchParams;
      
      console.log('[Sidebar] Starting filter click handler:', {
        href,
        params: Object.fromEntries(params.entries()),
        currentPath: window.location.pathname,
        currentSearch: window.location.search
      });

      // For "All Files" navigation
      if (href === '/files') {
        console.log('[Sidebar] Navigating to all files');
        window.history.pushState({}, '', '/files');
        window.dispatchEvent(new Event('urlchange'));
        await router.push('/files');
        return;
      }

      // Create new URL with properly encoded parameters
      const newParams = new URLSearchParams();
      let filterValue = null;
      
      // Handle different filter types
      if (params.has('fiscal-year')) {
        filterValue = params.get('fiscal-year');
        if (!filterValue) return;
        // Remove any "FY " prefix if present
        filterValue = filterValue.replace('FY ', '').trim();
        newParams.set('fiscal-year', filterValue);
        setExpandedMenus({ 'Files': true });
        setExpandedSubmenus({ 'By Fiscal Year': true });
      } else if (params.has('source')) {
        filterValue = params.get('source');
        if (!filterValue) return;
        // Normalize source value
        filterValue = filterValue.toLowerCase().replace(/\s+/g, '_');
        newParams.set('source', filterValue);
        setExpandedMenus({ 'Files': true });
        setExpandedSubmenus({ 'By Source': true });
      } else if (params.has('grant-type')) {
        filterValue = params.get('grant-type');
        if (!filterValue) return;
        // Normalize grant type value
        filterValue = filterValue.toLowerCase().replace(/\s+/g, '_');
        newParams.set('grant-type', filterValue);
        setExpandedMenus({ 'Files': true });
        setExpandedSubmenus({ 'By Grant Type': true });
      }

      const newUrl = `/files?${newParams.toString()}`;
      console.log('[Sidebar] Constructed new URL:', {
        newUrl,
        filterValue,
        params: Object.fromEntries(newParams.entries())
      });

      // Update URL and trigger navigation
      window.history.pushState({}, '', newUrl);
      window.dispatchEvent(new Event('urlchange'));
      await router.push(newUrl);

      console.log('[Sidebar] Navigation completed');
    } catch (error: unknown) {
      console.error('[Sidebar] Error in handleFilterClick:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  // Helper function to check if a fiscal year is currently selected
  const isFiscalYearSelected = (year: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    const currentYear = searchParams.get('fiscal-year');
    return currentYear === year;
  };

  // Modify the Link components in the navigation items to use handleFilterClick
  const renderNavigationItem = (item: NavigationItem) => {
    const isFilterLink = item.href.includes('?');
    const isActive = pathname === item.href || 
      (item.href.includes('?') && pathname.includes(item.href.split('?')[0])) ||
      (item.href.includes('fiscal-year=') && isFiscalYearSelected(item.href.split('fiscal-year=')[1]));
    
    const className = `${
      isActive
        ? 'text-white'
        : 'text-primary-100 hover:bg-primary-600 hover:text-white'
    } group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
      isNavigating ? 'pointer-events-none opacity-50' : ''
    }`;
    
    if (isFilterLink) {
      return (
        <button
          onClick={() => handleFilterClick(item.href)}
          className={className}
          disabled={isNavigating}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.name}</span>
        </button>
      );
    }

    return (
      <Link
        href={item.href}
        className={className}
        onClick={(e) => {
          if (isNavigating) {
            e.preventDefault();
          }
        }}
      >
        {item.icon}
        <span className="flex-1">{item.name}</span>
      </Link>
    );
  };

  const navigation: NavigationItem[] = [
    {
      name: t('sidebar.home'),
      href: '/',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: t('sidebar.files'),
      href: '/files',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      children: [
        {
          name: t('files.filters.allFiles'),
          href: '/files',
          icon: (
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          name: t('files.filters.byFiscalYear'),
          href: '/files/fiscal-year',
          icon: (
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          children: generateFiscalYears().map(decade => ({
            name: language === 'ne' ? toNepaliNumber(decade.name.replace(/s$/, '')) : decade.name,
            href: '#',
            icon: (
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
            children: decade.years.map(year => ({
              name: language === 'ne' ? toNepaliNumber(year.name) : year.name,
              href: `/files?fiscal-year=${year.name}`,
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            })),
          })),
        },
        {
          name: t('files.filters.bySource.title'),
          href: '/files/source',
          icon: (
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          children: sourceOptions.map(source => ({
            name: language === 'ne' ? source.translations?.ne || source.translations?.en || source.id : source.translations?.en || source.id,
            href: `/files?source=${encodeURIComponent(source.id)}`,
            icon: (
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          })),
        },
        {
          name: t('files.filters.byGrantType.title'),
          href: '/files/grant-type',
          icon: (
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          children: grantTypeOptions.map(grantType => ({
            name: language === 'ne' ? grantType.translations?.ne || grantType.translations?.en || grantType.id : grantType.translations?.en || grantType.id,
            href: `/files?grant-type=${encodeURIComponent(grantType.id)}`,
            icon: (
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          })),
        },
      ],
    },
    ...(session?.user?.role !== 'viewer' ? [{
      name: t('sidebar.upload'),
      href: '/upload',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    }] : []),
    ...(session?.user?.role === 'superadmin' ? [{
      name: t('sidebar.users'),
      href: '/users',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    }] : []),
    ...(session?.user?.role !== 'viewer' ? [{
      name: t('sidebar.bin'),
      href: '/bin',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    }] : []),
    {
      name: t('sidebar.reports'),
      href: '/reports',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: t('sidebar.settings'),
      href: '/settings',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-primary-500 border-r border-primary-600">
      {/* User profile section */}
      <div className="flex-shrink-0 flex items-center px-6 py-5 border-b border-primary-600">
        {session && (
          <Avatar 
            imageUrl={session?.user?.profilePicture || undefined}
            name={session?.user?.name || ''}
            size="md"
            className="flex-shrink-0"
          />
        )}
        <div className="flex flex-col ml-4 min-w-0">
          <span className="text-sm font-medium text-white truncate">
            {session?.user?.name || 'Loading...'}
          </span>
          <span className="text-xs text-primary-100 truncate">
            {session?.user?.email || 'Loading...'}
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 scrollbar-thin scrollbar-thumb-primary-400 scrollbar-track-primary-600">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <>
                <motion.button
                  type="button"
                  onClick={() => toggleSubmenu(item.name)}
                  whileHover={{ scale: 1.02 }}
                  className={
                    isActive(item.href)
                      ? 'bg-primary-600 text-white group w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200'
                      : 'text-primary-100 hover:bg-primary-600 hover:text-white group w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200'
                  }
                >
                  {item.icon}
                  {item.name}
                  <motion.svg
                    animate={{ rotate: expandedMenus[item.name] ? 90 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="ml-auto h-4 w-4 text-primary-200 transition-transform duration-300 ease-in-out"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </motion.svg>
                </motion.button>
                <AnimatePresence initial={false}>
                  {expandedMenus[item.name] && item.children && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="mt-1 space-y-1 pl-10"
                    >
                      {item.children.map((subItem) => (
                        <div key={subItem.name} className="py-0.5">
                          {subItem.children ? (
                            <>
                              <motion.button
                                type="button"
                                onClick={() => toggleSubSubmenu(subItem.name)}
                                whileHover={{ scale: 1.02 }}
                                className={
                                  pathname === subItem.href
                                    ? 'bg-primary-600 text-white group w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200'
                                    : 'text-primary-100 hover:bg-primary-600 hover:text-white group w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200'
                                }
                              >
                                {subItem.icon}
                                {subItem.name}
                                <motion.svg
                                  animate={{ rotate: expandedSubmenus[subItem.name] ? 90 : 0 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                  className="ml-auto h-4 w-4 text-primary-200 transition-transform duration-300 ease-in-out"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </motion.svg>
                              </motion.button>
                              <AnimatePresence initial={false}>
                                {expandedSubmenus[subItem.name] && subItem.children && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                                    className="mt-1 space-y-1 pl-8"
                                  >
                                    {subItem.children.map((subSubItem) => (
                                      subSubItem.children ? (
                                        <div key={subSubItem.name} className="py-0.5">
                                          <motion.button
                                            type="button"
                                            onClick={() => toggleDecade(subSubItem.name)}
                                            whileHover={{ scale: 1.02 }}
                                            className={
                                              pathname === subSubItem.href
                                                ? 'bg-primary-600 text-white group w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200'
                                                : 'text-primary-100 hover:bg-primary-600 hover:text-white group w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200'
                                            }
                                          >
                                            {subSubItem.icon}
                                            {subSubItem.name}
                                            <motion.svg
                                              animate={{ rotate: expandedDecades[subSubItem.name] ? 90 : 0 }}
                                              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                                              className="ml-auto h-4 w-4 text-primary-200 transition-transform duration-300 ease-in-out"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                              />
                                            </motion.svg>
                                          </motion.button>
                                          <AnimatePresence initial={false}>
                                            {expandedDecades[subSubItem.name] && subSubItem.children && (
                                              <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                transition={{ duration: 0.18, ease: 'easeInOut' }}
                                                className="mt-1 space-y-1 pl-6"
                                              >
                                                {subSubItem.children.map((year: NavigationItem) => (
                                                  <motion.div
                                                    key={year.name}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="rounded-md"
                                                  >
                                                    <button
                                                      onClick={() => handleFilterClick(year.href)}
                                                      className="w-full text-primary-100 hover:bg-primary-600 hover:text-white group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200"
                                                    >
                                                      {year.icon}
                                                      {year.name}
                                                    </button>
                                                  </motion.div>
                                                ))}
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      ) : (
                                        <motion.div key={subSubItem.name} whileHover={{ scale: 1.02 }} className="rounded-md">
                                          {renderNavigationItem(subSubItem)}
                                        </motion.div>
                                      )
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            <motion.div whileHover={{ scale: 1.02 }} className="rounded-md">
                              {renderNavigationItem(subItem)}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} className="rounded-md">
                {renderNavigationItem(item)}
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout button */}
      <div className="px-2 py-4 border-t border-primary-600">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-primary-100 hover:bg-primary-600 hover:text-white transition-all duration-200"
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {isLoggingOut ? t('common.loading') : t('sidebar.logout')}
        </motion.button>
      </div>
    </div>
  );
} 