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
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const pathParts = path.split('/');
    let currentFolder = null;

    for (const part of pathParts) {
      const folder = await prisma.folder.findFirst({
        where: {
          name: part,
          parentId: currentFolder ? currentFolder.id : null,
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

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }

      currentFolder = folder;
    }

    return NextResponse.json(currentFolder);
  } catch (error) {
    console.error('Error fetching folder by path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folder' },
      { status: 500 }
    );
  }
} 