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
    const parentId = searchParams.get('parentId');
    const path = searchParams.get('path');

    const folders = await prisma.folder.findMany({
      where: {
        parentId: parentId ? parseInt(parentId) : null,
        path: path ? path : undefined,
        isDeleted: false,
      },
      include: {
        files: {
          where: {
            isDeleted: false,
          },
          include: {
            fiscalYear: true,
            source: true,
            grantType: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        subfolders: {
          where: {
            isDeleted: false,
          },
          include: {
            files: {
              where: {
                isDeleted: false,
              },
              include: {
                fiscalYear: true,
                source: true,
                grantType: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            fiscalYear: true,
            source: true,
            grantType: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        fiscalYear: true,
        source: true,
        grantType: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        parent: {
          include: {
            fiscalYear: true,
            source: true,
            grantType: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, parentId, path, createdBy } = body;

    const folder = await prisma.folder.create({
      data: {
        name,
        parentId: parentId || null,
        path: path || '/',
        createdBy: createdBy || null,
      },
      include: {
        files: true,
        subfolders: true,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }

    // Set isDeleted to true and calculate deleteAfter date (30 days from now)
    const deleteAfter = new Date();
    deleteAfter.setDate(deleteAfter.getDate() + 30);

    const folder = await prisma.folder.update({
      where: {
        id: parseInt(id),
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deleteAfter,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
} 