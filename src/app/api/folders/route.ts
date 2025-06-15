import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const USER_FOLDERS_DIR = join(UPLOAD_DIR, 'user_folders');

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const path = searchParams.get('path');
    const fiscalYear = searchParams.get('fiscal-year');
    const source = searchParams.get('source');
    const grantType = searchParams.get('grant-type');

    // Build the where clause for filtering
    const where: any = {
      parentId: parentId ? parseInt(parentId) : null,
      path: path ? path : undefined,
      isDeleted: false,
    };

    // Add filters if they exist
    if (fiscalYear) {
      where.fiscalYear = {
        name: fiscalYear.startsWith('FY ') ? fiscalYear : `FY ${fiscalYear}`
      };
    }
    if (source) {
      where.source = {
        OR: [
          { key: source },
          { name: source }
        ]
      };
    }
    if (grantType) {
      where.grantType = {
        OR: [
          { key: grantType },
          { name: grantType }
        ]
      };
    }

    const folders = await prisma.folder.findMany({
      where,
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
    const { name, parentId, fiscalYearId, sourceId, grantTypeId } = body;

    // Check if a folder with the same name already exists at the same level
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name,
        parentId: parentId || null,
        isDeleted: false,
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in this location' },
        { status: 409 }
      );
    }

    try {
      // Get parent folder if it exists
      let parentFolder = null;
      if (parentId) {
        parentFolder = await prisma.folder.findUnique({
          where: { id: parentId }
        });
        if (!parentFolder) {
          return NextResponse.json(
            { error: 'Parent folder not found' },
            { status: 404 }
          );
        }
      }

      // Create the physical folder path
      const folderPath = parentFolder 
        ? join(parentFolder.path, name)
        : join(USER_FOLDERS_DIR, name);

      // Ensure the user_folders directory exists
      await mkdir(USER_FOLDERS_DIR, { recursive: true });

      // Create the physical folder
      await mkdir(folderPath, { recursive: true });

      // Create the folder record in the database
      const folder = await prisma.folder.create({
        data: {
          name,
          path: folderPath,
          parentId: parentId || null,
          createdBy: session.user.id,
          fiscalYearId,
          sourceId,
          grantTypeId,
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
  } catch (error) {
    console.error('Error in folder creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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