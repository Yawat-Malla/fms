import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscal-year');
    const source = searchParams.get('source');
    const grantType = searchParams.get('grant-type');

    // Build the where clause for filtering
    const where: any = {
      isDeleted: false,
      user: {
        id: session.user.id
      },
      folderId: null // Only get files that don't belong to any folder
    };

    // Add filters if they exist
    if (fiscalYear) {
      where.fiscalYear = {
        name: fiscalYear
      };
    }
    if (source) {
      where.source = {
        name: source
      };
    }
    if (grantType) {
      where.grantType = {
        name: grantType
      };
    }

    // Get files with filters
    const files = await prisma.file.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        fiscalYear: true,
        source: true,
        grantType: true
      },
      orderBy: {
        lastModifiedAt: 'desc'
      }
    });

    // Get filter options
    const fiscalYears = await prisma.fiscalYear.findMany({
      select: { name: true },
      orderBy: { name: 'desc' }
    });

    const sources = await prisma.source.findMany({
      select: { name: true },
      orderBy: { name: 'asc' }
    });

    const grantTypes = await prisma.grantType.findMany({
      select: { name: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      files,
      filterOptions: {
        fiscalYears: fiscalYears.map(fy => fy.name),
        sources: sources.map(s => s.name),
        grantTypes: grantTypes.map(gt => gt.name)
      }
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 