import prisma from './prisma';

export const siteConfig = {
  name: 'File Management System',
  nameNepali: 'फाइल व्यवस्थापन प्रणाली',
  defaultLogo: '/nepal-emblem.png',
  // Add other site-wide configurations here
};

export const getLogoPath = async () => {
  try {
    const settings = await prisma.systemSettings.findFirst();
    console.log('Settings from database:', settings);
    
    // Use only siteLogo field
    const logoPath = settings?.siteLogo;
    console.log('Logo path from settings:', logoPath);
    
    return logoPath || siteConfig.defaultLogo;
  } catch (error) {
    console.error('Error fetching logo path:', error);
    return siteConfig.defaultLogo;
  }
};

export const getSiteTitle = async () => {
  try {
    const settings = await prisma.systemSettings.findFirst();
    return settings?.siteName || siteConfig.name;
  } catch (error) {
    console.error('Error fetching site title:', error);
    return siteConfig.name;
  }
}; 