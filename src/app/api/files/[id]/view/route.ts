import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log('[FILE_VIEW] Session:', session);

    if (!session?.user) {
      console.log('[FILE_VIEW] No user session found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const fileId = parseInt(params.id, 10);
    console.log('[FILE_VIEW] fileId:', fileId);

    if (isNaN(fileId)) {
      console.log('[FILE_VIEW] Invalid file ID');
      return new NextResponse('Invalid file ID', { status: 400 });
    }

    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      include: {
        folder: true
      }
    });
    console.log('[FILE_VIEW] file from DB:', file);

    if (!file) {
      console.log('[FILE_VIEW] File not found in DB');
      return new NextResponse('File not found', { status: 404 });
    }

    // Get the folder path from the database
    const folderPath = file.folder?.path;
    if (!folderPath) {
      console.log('[FILE_VIEW] Folder path not found');
      return new NextResponse('File path not found', { status: 404 });
    }

    // Get the actual file name with UUID prefix
    const actualFileName = file.path.split('/').pop();
    if (!actualFileName) {
      console.log('[FILE_VIEW] Invalid file path in database');
      return new NextResponse('Invalid file path', { status: 404 });
    }

    // Construct the full file path using the actual file name
    const filePath = path.join(folderPath, actualFileName);
    console.log('[FILE_VIEW] Full file path:', filePath);

    if (!fs.existsSync(filePath)) {
      console.log('[FILE_VIEW] File does not exist on disk');
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    console.log('[FILE_VIEW] fileBuffer length:', fileBuffer.length);
    const headers = new Headers();
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      headers.set('Content-Type', 'application/pdf');
    } else {
      headers.set('Content-Type', file.type);
    }
    headers.set('Content-Disposition', `inline; filename="${file.name}"`);

    return new NextResponse(fileBuffer, {
      headers,
    });
  } catch (error: any) {
    console.error('[FILE_VIEW] Error:', error);
    return new NextResponse(`Internal error: ${error.message}`, { status: 500 });
  }
} 