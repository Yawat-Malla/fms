import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/admin/upload-sections/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, key, translations } = body;

    const section = await prisma.uploadSection.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        key,
        translations
      }
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating upload section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/admin/upload-sections/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.uploadSection.delete({
      where: { id: parseInt(params.id) }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting upload section:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 