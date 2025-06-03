import { Metadata } from 'next';
import prisma from '@/lib/prisma';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.systemSettings.findFirst();
  
  return {
    title: settings?.siteName || 'File Management System',
    description: 'Staff Communication and File Management System',
  };
} 