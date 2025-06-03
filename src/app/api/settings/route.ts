import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await prisma.systemSettings.create({
        data: {
          siteName: 'File Management System',
          siteNameNepali: 'फाइल व्यवस्थापन प्रणाली',
          maintenanceMode: false,
          enabledModules: ['files', 'users', 'reports'],
        },
      });
      return NextResponse.json(defaultSettings);
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { siteName, siteNameNepali, maintenanceMode, logoUrl } = data;

    // First, try to find existing settings
    const existingSettings = await prisma.systemSettings.findFirst();

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.systemSettings.update({
        where: { id: existingSettings.id },
        data: {
          siteName,
          siteNameNepali,
          maintenanceMode,
          logoUrl,
        },
      });
    } else {
      // Create new settings
      settings = await prisma.systemSettings.create({
        data: {
          siteName,
          siteNameNepali,
          maintenanceMode,
          logoUrl,
          enabledModules: ['files', 'users', 'reports'],
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
} 