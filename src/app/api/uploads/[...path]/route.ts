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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Join path segments without normalization
    const path = params.path.join('/');
    const filePath = join(process.cwd(), 'uploads', path);
    
    console.log('File request:', {
      requestedPath: path,
      fullPath: filePath,
      exists: existsSync(filePath)
    });

    if (!existsSync(filePath)) {
      console.error('File not found:', filePath);
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const contentType = getContentType(filePath);

      console.log('[Uploads API] Serving file:', {
        path: filePath,
        type: contentType,
      size: fileBuffer.length
      });

    // Set appropriate headers for image serving
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Length', fileBuffer.length.toString());

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Error serving file:', error);
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