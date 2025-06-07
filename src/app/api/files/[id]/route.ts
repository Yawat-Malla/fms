import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { rm } from 'fs/promises';
import { notifyFileUpdate } from '@/lib/notifications';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const file = await prisma.file.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        fiscalYear: true,
        source: true,
        grantType: true,
        folder: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = parseInt(params.id);
    const body = await request.json();

    // Get the file first to check ownership
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { user: true }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if user is authorized (owner or admin)
    if (!file.user || (file.user.id !== session.user.id && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update the file
    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: body
    });

    // Create notification for file update
    await notifyFileUpdate(session.user.id, file.name, 'updated');

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = parseInt(params.id);

    // Get the file first to check ownership
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { user: true }
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if user is authorized (owner or admin)
    if (!file.user || (file.user.id !== session.user.id && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate delete after date (30 days from now)
    const deleteAfter = new Date();
    deleteAfter.setDate(deleteAfter.getDate() + 30);

    // Move file to bin instead of deleting
    await prisma.file.update({
      where: { id: fileId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deleteAfter
      }
    });

    // Create notification for file deletion
    await notifyFileUpdate(session.user.id, file.name, 'deleted');

    return NextResponse.json({ message: 'File moved to bin successfully' });
  } catch (error) {
    console.error('Error moving file to bin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 