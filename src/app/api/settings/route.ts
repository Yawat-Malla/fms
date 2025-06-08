import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Settings API - Fetching settings from database');
    const settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      console.log('Settings API - No settings found, creating default settings');
      // Create default settings if none exist
      const defaultSettings = await prisma.systemSettings.create({
        data: {
          siteName: 'File Management System',
          siteNameNepali: 'फाइल व्यवस्थापन प्रणाली',
          maintenanceMode: false,
          enabledModules: ['files', 'users', 'reports'],
        },
      });
      console.log('Settings API - Created default settings:', defaultSettings);
      return NextResponse.json(defaultSettings, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    console.log('Settings API - Found settings:', settings);
    return NextResponse.json(settings, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Settings API - Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      console.log('Settings API - Unauthorized update attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const data = await request.json();
    console.log('Settings API - Update request data:', data);
    
    const { siteName, siteNameNepali, maintenanceMode, siteLogo } = data;

    // First, try to find existing settings
    const existingSettings = await prisma.systemSettings.findFirst();
    console.log('Settings API - Existing settings:', existingSettings);

    let settings;
    if (existingSettings) {
      // Update existing settings
      console.log('Settings API - Updating existing settings');
      settings = await prisma.systemSettings.update({
        where: { id: existingSettings.id },
        data: {
          siteName,
          siteNameNepali,
          maintenanceMode,
          siteLogo,
        },
      });
    } else {
      // Create new settings
      console.log('Settings API - Creating new settings');
      settings = await prisma.systemSettings.create({
        data: {
          siteName,
          siteNameNepali,
          maintenanceMode,
          siteLogo,
          enabledModules: ['files', 'users', 'reports'],
        },
      });
    }

    console.log('Settings API - Updated settings:', settings);
    return NextResponse.json(settings, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Settings API - Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 