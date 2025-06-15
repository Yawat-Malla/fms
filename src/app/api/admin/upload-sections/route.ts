import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/upload-sections
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
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

  if (!session || session.user.role !== 'admin') {
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