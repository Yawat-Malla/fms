import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const grantTypes = await prisma.grantType.findMany({
      select: {
        name: true,
        key: true,
        _count: {
          select: {
            files: true
          }
        }
      }
    });

    const stats = grantTypes.map(gt => ({
      name: gt.name,
      key: gt.key,
      value: gt._count.files
    }));

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching grant type stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grant type statistics' },
      { status: 500 }
    );
  }
} 