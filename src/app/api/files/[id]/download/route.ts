import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const fileId = parseInt(params.id, 10);

    if (isNaN(fileId)) {
      return new NextResponse('Invalid file ID', { status: 400 });
    }

    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Ensure the file path is properly resolved relative to the project root
    const filePath = path.isAbsolute(file.path) 
      ? file.path 
      : path.join(process.cwd(), file.path.replace(/^\/+/, ''));
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      const headers = new Headers();
      headers.set('Content-Type', 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${file.name}"`);
      
      return new NextResponse(fileBuffer, {
        headers,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 