import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

// GET /api/admin/settings - Get admin settings
export async function GET() {
  try {
    const settings = await prisma.systemSettings.findFirst();
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST /api/admin/settings - Update admin settings
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const siteName = formData.get('siteName') as string;
    let siteNameNepali = formData.get('siteNameNepali') as string | null;
    siteNameNepali = siteNameNepali ?? '';
    const maintenanceMode = formData.get('maintenanceMode') === 'true';
    const enabledModules = JSON.parse(formData.get('enabledModules') as string);
    const siteLogo = formData.get('siteLogo') as File | null;

    let siteLogoPath = undefined;

    // Handle logo upload if provided
    if (siteLogo) {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'system');
      const filename = `site-logo-${Date.now()}.${siteLogo.name.split('.').pop()}`;
      const filepath = path.join(uploadsDir, filename);
      
      const bytes = await siteLogo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filepath, buffer);
      siteLogoPath = `/uploads/system/${filename}`;
    }

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
          siteLogo: siteLogoPath || undefined,
          maintenanceMode,
          enabledModules,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new settings
      settings = await prisma.systemSettings.create({
        data: {
          siteName,
          siteNameNepali,
          siteLogo: siteLogoPath,
          maintenanceMode,
          enabledModules,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to update admin settings' },
      { status: 500 }
    );
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