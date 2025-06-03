import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

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

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', ...params.path);
    
    console.log('[Uploads API] Requested file:', {
      path: params.path,
      fullPath: filePath,
      exists: existsSync(filePath)
    });

    // Security check: Ensure the file path is within the uploads directory
    const normalizedPath = path.normalize(filePath);
    const uploadsDir = path.normalize(path.join(process.cwd(), 'uploads'));
    
    if (!normalizedPath.startsWith(uploadsDir)) {
      console.error('[Uploads API] Security violation - attempted path traversal:', {
        requestedPath: filePath,
        normalizedPath,
        uploadsDir
      });
      return new NextResponse('Forbidden', { status: 403 });
    }

    try {
      // Check if file exists first
    if (!existsSync(filePath)) {
        console.error('[Uploads API] File not found:', filePath);
      return new NextResponse('File not found', { status: 404 });
    }

    // Read file
      const file = await fs.readFile(filePath);
    
      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }[ext] || 'application/octet-stream';

      console.log('[Uploads API] Serving file:', {
        path: filePath,
        type: contentType,
        size: file.length
      });

      // Return file with appropriate headers
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
          'Content-Length': file.length.toString(),
      },
    });
    } catch (error) {
      console.error('[Uploads API] Error reading file:', error);
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('[Uploads API] Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 