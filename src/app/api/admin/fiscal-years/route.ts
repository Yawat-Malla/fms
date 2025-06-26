import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const fiscalYears = await prisma.fiscalYear.findMany({
      orderBy: { startDate: 'desc' },
      select: {
        id: true,
        name: true,
      },
    });
    return NextResponse.json(fiscalYears);
  } catch (error) {
    console.error('Error fetching fiscal years:', error);
    return NextResponse.json({ error: 'Failed to fetch fiscal years' }, { status: 500 });
  }
} 