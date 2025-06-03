import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const file = await prisma.file.update({
      where: { id: parseInt(params.id) },
      data: {
        isDeleted: false,
        deletedAt: null,
        deleteAfter: null,
      },
    });
    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to restore file' }, { status: 500 });
  }
} 