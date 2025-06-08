import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { readFile } from 'fs/promises';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Join path segments without normalization
    const path = params.path.join('/');
    const filePath = join(process.cwd(), 'uploads', path);
    
    console.log('Uploads API - File request:', {
      requestedPath: path,
      fullPath: filePath,
      exists: existsSync(filePath)
    });

    // Check if the file exists
    if (!existsSync(filePath)) {
      console.error('Uploads API - File not found:', filePath);
      return new NextResponse('File not found', { status: 404 });
    }

    // For system files (like logo) or logo files, allow public access
    const isSystemFile = path.startsWith('system/') || path.startsWith('site-logo-');
    
    // For non-system files, require authentication
    if (!isSystemFile) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        console.log('Uploads API - Unauthorized access attempt for non-system file');
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const fileBuffer = await readFile(filePath);
    const contentType = getContentType(filePath);

    console.log('Uploads API - Serving file:', {
      path: filePath,
      type: contentType,
      size: fileBuffer.length,
      isSystemFile
    });

    // Set appropriate headers for image serving
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Length', fileBuffer.length.toString());

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Uploads API - Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function getContentType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  const contentTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
  };
  return contentTypes[extension || ''] || 'application/octet-stream';
} 