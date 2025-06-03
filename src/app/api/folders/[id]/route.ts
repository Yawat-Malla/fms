import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { join } from 'path';
import { rm } from 'fs/promises';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        files: {
          where: { isDeleted: false },
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
          where: { isDeleted: false },
          include: {
            files: {
              where: { isDeleted: false },
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
          },
        },
        fiscalYear: true,
        source: true,
        grantType: true,
      },
    });

    if (!folder) {
      return new NextResponse('Folder not found', { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error fetching folder:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name } = await request.json();
    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }

    const folder = await prisma.folder.update({
      where: { id: parseInt(params.id) },
      data: { name },
      include: {
        files: true,
        subfolders: true,
        fiscalYear: true,
        source: true,
        grantType: true,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error updating folder:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function moveFolderToBin(folderId: number) {
  const deleteAfter = new Date();
  deleteAfter.setDate(deleteAfter.getDate() + 30);

  // Get the folder with all its subfolders and files
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      files: true,
      subfolders: true,
    },
  });

  if (!folder) return;

  // Move all files in the folder to bin
  await prisma.file.updateMany({
    where: { folderId: folder.id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deleteAfter,
    },
  });

  // Move all subfolders to bin recursively
  for (const subfolder of folder.subfolders) {
    await moveFolderToBin(subfolder.id);
  }

  // Move the folder itself to bin
  await prisma.folder.update({
    where: { id: folder.id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deleteAfter,
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const folderId = parseInt(params.id);
    await moveFolderToBin(folderId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 