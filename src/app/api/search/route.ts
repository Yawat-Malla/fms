import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return new NextResponse('Query parameter is required', { status: 400 });
    }

    // Search in files
    const files = await prisma.file.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        uploadedBy: session.user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        path: true,
        description: true,
        uploadedAt: true,
        lastModifiedAt: true,
      },
      take: 10,
    });

    // Search in folders
    const folders = await prisma.folder.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        createdBy: session.user.id,
      },
      select: {
        id: true,
        name: true,
        path: true,
        createdAt: true,
        lastModifiedAt: true,
      },
      take: 10,
    });

    // Combine and sort results
    const results = [
      ...files.map(file => ({
        ...file,
        isFolder: false,
        sortDate: file.lastModifiedAt,
      })),
      ...folders.map(folder => ({
        ...folder,
        isFolder: true,
        sortDate: folder.lastModifiedAt,
      }))
    ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 