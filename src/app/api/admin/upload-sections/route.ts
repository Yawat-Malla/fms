import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to check if user has admin privileges
const hasAdminPrivileges = (role?: string) => {
  return role === 'admin' || role === 'superadmin';
};

// GET /api/admin/upload-sections
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !hasAdminPrivileges(session.user.role)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const sections = await prisma.uploadSection.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching upload sections:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/admin/upload-sections
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !hasAdminPrivileges(session.user.role)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, key, translations } = body;

    // Validate required fields
    if (!name || !key) {
      return new NextResponse(
        JSON.stringify({ message: 'Name and key are required' }),
        { status: 400 }
      );
    }

    // Validate translations
    if (!translations || typeof translations !== 'object') {
      return new NextResponse(
        JSON.stringify({ message: 'Translations must be an object' }),
        { status: 400 }
      );
    }

    // Check if key already exists
    const existingSection = await prisma.uploadSection.findUnique({
      where: { key }
    });

    if (existingSection) {
      return new NextResponse(
        JSON.stringify({ message: 'An upload section with this key already exists' }),
        { status: 400 }
      );
    }

    // Get the highest order value
    const lastSection = await prisma.uploadSection.findFirst({
      orderBy: { order: 'desc' }
    });
    const order = (lastSection?.order || 0) + 1;

    const section = await prisma.uploadSection.create({
      data: {
        name,
        key,
        translations,
        order
      }
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error creating upload section:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Failed to create upload section',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}

// PUT /api/admin/upload-sections/:id
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !hasAdminPrivileges(session.user.role)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, key, translations } = body;

    // Validate required fields
    if (!name || !key) {
      return new NextResponse(
        JSON.stringify({ message: 'Name and key are required' }),
        { status: 400 }
      );
    }

    // Validate translations
    if (!translations || typeof translations !== 'object') {
      return new NextResponse(
        JSON.stringify({ message: 'Translations must be an object' }),
        { status: 400 }
      );
    }

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
    return new NextResponse(
      JSON.stringify({ 
        message: 'Failed to update upload section',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}

// DELETE /api/admin/upload-sections/:id
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || !hasAdminPrivileges(session.user.role)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.uploadSection.delete({
      where: { id: parseInt(params.id) }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting upload section:', error);
    return new NextResponse(
      JSON.stringify({ 
        message: 'Failed to delete upload section',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
} 