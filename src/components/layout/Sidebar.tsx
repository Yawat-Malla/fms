'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { ReactElement } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Avatar } from '@/components/ui/Avatar';

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

// Add static lists for sources and grant types
const sourceFilters = [
  { id: 'federal', name: 'Federal Government', icon: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ) },
  { id: 'provincial', name: 'Provincial Government', icon: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ) },
  { id: 'local', name: 'Local Municipality', icon: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) },
  { id: 'other', name: 'Other', icon: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ) },
];
const grantTypeFilters = [
  { id: 'current', name: 'Current Expenditure', icon: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ) },
  { id: 'capital', name: 'Capital Expenditure', icon: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ) },
  { id: 'supplementary', name: 'Supplementary Grant', icon: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
  ) },
  { id: 'special', name: 'Special Grant', icon: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
  ) },
  { id: 'other', name: 'Other Grant', icon: (
    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ) },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, mounted } = useApp();
  const { data: session } = useSession();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [expandedSubmenus, setExpandedSubmenus] = useState<Record<string, boolean>>({});
  const [expandedDecades, setExpandedDecades] = useState<Record<string, boolean>>({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedGrantType, setSelectedGrantType] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Debug logging
  useEffect(() => {
    if (mounted) {
      console.log('[Sidebar Debug] Current language:', language);
      console.log('[Sidebar Debug] Translation test - Home:', t('sidebar.home'));
      console.log('[Sidebar Debug] Translation test - Files:', t('sidebar.files'));
    }
  }, [language, t, mounted]);

  // Debug logging for session data
  useEffect(() => {
    if (mounted) {
      console.log('[Sidebar Debug] Session data:', {
        user: session?.user,
        name: session?.user?.name,
        email: session?.user?.email,
        profilePicture: session?.user?.profilePicture,
      });
    }
  }, [session, mounted]);

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
      
      console.log('[Sidebar] Handling filter click:', {
        href,
        originalParams: Object.fromEntries(params.entries())
      });

      // For "All Files" navigation
      if (href === '/files') {
        console.log('[Sidebar] Navigating to all files');
        window.history.pushState({}, '', '/files');
        window.dispatchEvent(new Event('urlchange'));
        await router.push('/files');
        return;
      }
      
      // Update filter states immediately
      if (params.has('fiscal-year')) {
        const year = params.get('fiscal-year');
        if (!year) return;

        console.log('[Sidebar] Processing fiscal year:', year);

        // Create new URL with properly encoded parameters
        const newParams = new URLSearchParams();
        newParams.set('fiscal-year', year);
        
        const newUrl = `${url.pathname}?${newParams.toString()}`;
        console.log('[Sidebar] Navigating to:', newUrl);

        // Update UI state immediately
        setExpandedMenus({ 'Files': true });
        setExpandedSubmenus({ 'By Fiscal Year': true });
        
        // Update URL and trigger navigation
        window.history.pushState({}, '', newUrl);
        window.dispatchEvent(new Event('urlchange'));
        await router.push(newUrl);
      } else if (params.has('source')) {
        setExpandedMenus({ 'Files': true });
        setExpandedSubmenus({ 'By Source': true });
        window.history.pushState({}, '', href);
        window.dispatchEvent(new Event('urlchange'));
        await router.push(href);
      } else if (params.has('grant-type')) {
        setExpandedMenus({ 'Files': true });
        setExpandedSubmenus({ 'By Grant Type': true });
        window.history.pushState({}, '', href);
        window.dispatchEvent(new Event('urlchange'));
        await router.push(href);
      } else {
        window.history.pushState({}, '', href);
        window.dispatchEvent(new Event('urlchange'));
        await router.push(href);
      }
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
        ? 'text-dark-100'
        : 'text-dark-300 hover:bg-dark-700/50 hover:text-dark-100'
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
            name: decade.name,
            href: '#',
            icon: (
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
            children: decade.years.map(year => ({
              name: year.name,
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          children: [
            {
              name: t('files.filters.bySource.federal'),
              href: '/files?source=Federal Government',
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              name: t('files.filters.bySource.provincial'),
              href: '/files?source=Provincial Government',
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              name: t('files.filters.bySource.local'),
              href: '/files?source=Local Municipality',
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
            {
              name: t('files.filters.bySource.other'),
              href: '/files?source=Other',
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          ],
        },
        {
          name: t('files.filters.byGrantType.title'),
          href: '/files/grant-type',
          icon: (
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          children: [
            {
              name: t('files.filters.byGrantType.currentExpenditure'),
              href: '/files?grant-type=Current Expenditure',
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              name: t('files.filters.byGrantType.capitalExpenditure'),
              href: '/files?grant-type=Capital Expenditure',
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              name: t('files.filters.byGrantType.supplementaryGrant'),
              href: '/files?grant-type=Supplementary Grant',
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              ),
            },
            {
              name: t('files.filters.byGrantType.specialGrant'),
              href: '/files?grant-type=Special Grant',
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ),
            },
            {
              name: t('files.filters.byGrantType.otherGrants'),
              href: '/files?grant-type=Other Grant',
              icon: (
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          ],
        },
      ],
    },
    {
      name: t('sidebar.upload'),
      href: '/upload',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    },
    {
      name: t('sidebar.users'),
      href: '/users',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: t('sidebar.bin'),
      href: '/bin',
      icon: (
        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
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

  // Render loading state while not mounted
  if (!mounted) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700">
        <div className="flex-shrink-0 flex items-center px-6 py-5 border-b border-gray-200 dark:border-dark-700">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-dark-600 animate-pulse"></div>
          <div className="ml-4 space-y-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-dark-600 rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-gray-200 dark:bg-dark-600 rounded animate-pulse"></div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-dark-600 rounded animate-pulse mb-2"></div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700">
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center space-x-3">
          <Avatar 
              imageUrl={session?.user?.profilePicture}
              name={session?.user?.name || 'User'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-300 truncate">
                {session?.user?.email || 'user@example.com'}
              </p>
            </div>
        </div>
      </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="px-2 py-4 space-y-1">
            {/* Home */}
            <Link
              href="/"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/')
                  ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                    fill="none"
                stroke="currentColor"
                    viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {t('sidebar.home')}
            </Link>

            {/* Files Section */}
            <div>
              <button
                onClick={() => toggleSubmenu('Files')}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                  isActive('/files')
                    ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  {t('sidebar.files')}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedMenus['Files'] ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Files Submenu */}
              <AnimatePresence>
                {expandedMenus['Files'] && (
                    <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 mt-1 space-y-1">
                      {/* All Files */}
                      <Link
                        href="/files"
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          isActive('/files') && !selectedFiscalYear && !selectedSource && !selectedGrantType
                            ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
                        }`}
                      >
                        Files
                      </Link>

                      {/* By Fiscal Year */}
                      <div>
                        <button
                          onClick={() => toggleSubSubmenu('By Fiscal Year')}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                            selectedFiscalYear
                              ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
                          }`}
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="ml-2">By Fiscal Year</span>
                          </div>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              expandedSubmenus['By Fiscal Year'] ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Fiscal Years Submenu */}
                        <AnimatePresence>
                          {expandedSubmenus['By Fiscal Year'] && (
                                  <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 mt-1 space-y-1">
                                {generateFiscalYears().map((decade) => (
                                  <div key={decade.name}>
                                    <button
                                      onClick={() => toggleDecade(decade.name)}
                                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                                        expandedDecades[decade.name]
                                          ? 'bg-gray-100 text-gray-900 dark:bg-dark-700/50 dark:text-dark-100'
                                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
                                      }`}
                                    >
                                      <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {decade.name}
                                      </span>
                                      <svg
                                        className={`w-4 h-4 transition-transform ${
                                          expandedDecades[decade.name] ? 'rotate-180' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M19 9l-7 7-7-7"
                                        />
                                      </svg>
                                    </button>

                                    {/* Years Submenu */}
                                    <AnimatePresence>
                                      {expandedDecades[decade.name] && (
                                              <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="pl-4 mt-1 space-y-1">
                                            {decade.years.map((year) => (
                                              <Link
                                                    key={year.name}
                                                href={year.href}
                                                      onClick={() => handleFilterClick(year.href)}
                                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                                  isFiscalYearSelected(year.name)
                                                    ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
                                                }`}
                                              >
                                                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                      </svg>
                                                      {year.name}
                                              </Link>
                                                ))}
                                          </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                    ))}
                              </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                      </div>

                      {/* By Source */}
                      <div>
                        <button
                          onClick={() => toggleSubSubmenu('By Source')}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                            selectedSource
                              ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
                          }`}
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            <span className="ml-2">By Source</span>
                          </div>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              expandedSubmenus['By Source'] ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Sources Submenu */}
                        <AnimatePresence>
                          {expandedSubmenus['By Source'] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 mt-1 space-y-1">
                                {sourceFilters.map((source) => (
                                  <Link
                                    key={source.id}
                                    href={`/files?source=${encodeURIComponent(source.name)}`}
                                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100"
                                  >
                                    {source.icon}
                                    {source.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        </div>

                      {/* By Grant Type */}
                      <div>
                        <button
                          onClick={() => toggleSubSubmenu('By Grant Type')}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                            selectedGrantType
                              ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
                          }`}
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="ml-2">By Grant Type</span>
                          </div>
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              expandedSubmenus['By Grant Type'] ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Grant Types Submenu */}
                        <AnimatePresence>
                          {expandedSubmenus['By Grant Type'] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 mt-1 space-y-1">
                                {grantTypeFilters.map((type) => (
                                  <Link
                                    key={type.id}
                                    href={`/files?grant-type=${encodeURIComponent(type.name)}`}
                                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100"
                                  >
                                    {type.icon}
                                    {type.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
              </motion.div>
            )}
              </AnimatePresence>
          </div>

            {/* Upload */}
            <Link
              href="/upload"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/upload')
                  ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {t('sidebar.upload')}
            </Link>

            {/* Users */}
            <Link
              href="/users"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/users')
                  ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {t('sidebar.users')}
            </Link>

            {/* Bin */}
            <Link
              href="/bin"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/bin')
                  ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {t('sidebar.bin')}
            </Link>

            {/* Reports */}
            <Link
              href="/reports"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/reports')
                  ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t('sidebar.reports')}
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive('/settings')
                  ? 'bg-primary-500/10 text-primary-500 dark:bg-primary-500/10 dark:text-primary-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-700/50 dark:hover:text-dark-100'
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {t('sidebar.settings')}
            </Link>
          </div>
      </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-700">
          <button
          onClick={handleLogout}
          disabled={isLoggingOut}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 dark:text-dark-100 dark:bg-dark-700 dark:hover:bg-dark-600"
        >
            {isLoggingOut ? (
              <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin dark:border-dark-100" />
            ) : (
              <>
          <svg
                  className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
                  viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
                    strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
                {t('sidebar.logout')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 