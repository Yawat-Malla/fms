import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Helper function to check if user has admin privileges
const hasAdminPrivileges = (role?: string) => {
  return role === 'admin' || role === 'superadmin';
};

// GET /api/admin/settings - Get admin settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !hasAdminPrivileges(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const settings = await prisma.systemSettings.findFirst();
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/admin/settings - Update admin settings
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !hasAdminPrivileges(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const siteName = (formData.get('siteName') as string)?.trim() || 'File Management System';
    const siteNameNepali = (formData.get('siteNameNepali') as string)?.trim() || 'फाइल व्यवस्थापन प्रणाली';
    const maintenanceMode = formData.get('maintenanceMode') === 'true';
    const logoFile = formData.get('siteLogo') as File | null;

    let logoPath = '';
    if (logoFile) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        console.error('Error creating uploads directory:', error);
      }

      // Get the file extension from the original filename
      const originalName = logoFile.name;
      const extension = path.extname(originalName);
      
      // Generate a unique filename with the original extension
      const timestamp = Date.now();
      const filename = `site-logo-${timestamp}${extension}`;
      const filePath = path.join(uploadsDir, filename);
      
      console.log('Saving logo file:', {
        originalName,
        extension,
        filename,
        filePath
      });

      await writeFile(filePath, buffer);
      logoPath = `/uploads/${filename}`;
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
          maintenanceMode,
          ...(logoPath && { siteLogo: logoPath }),
        },
      });
    } else {
      // Create new settings
      settings = await prisma.systemSettings.create({
        data: {
          siteName,
          siteNameNepali,
          maintenanceMode,
          siteLogo: logoPath,
          enabledModules: ['files', 'users', 'reports'],
        },
      });
    }

    console.log('Updated settings:', settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || !hasAdminPrivileges(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { siteName, siteNameNepali, maintenanceMode, siteLogo } = data;

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
          siteLogo,
        },
      });
    } else {
      // Create new settings
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

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
} 