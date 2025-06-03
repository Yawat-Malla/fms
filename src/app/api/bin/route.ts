import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [folders, files] = await Promise.all([
      prisma.folder.findMany({
        where: { isDeleted: true },
        include: {
          fiscalYear: true,
          source: true,
          grantType: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.file.findMany({
        where: { isDeleted: true },
        include: {
          fiscalYear: true,
          source: true,
          grantType: true,
          user: { select: { name: true, email: true } },
        },
      }),
    ]);
    return NextResponse.json({ folders, files });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bin items' }, { status: 500 });
  }
} 