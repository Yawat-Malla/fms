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
    return settings?.logoUrl || siteConfig.defaultLogo;
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