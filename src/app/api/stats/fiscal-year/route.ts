import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fiscalYears = await prisma.fiscalYear.findMany({
      include: {
        _count: {
          select: {
            files: true,
            folders: true
          }
        }
      }
    });

    const stats = fiscalYears.map(fy => ({
      fiscalYear: fy.name,
      fileCount: fy._count.files,
      folderCount: fy._count.folders
    }));

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching fiscal year stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fiscal year statistics' },
      { status: 500 }
    );
  }
} 