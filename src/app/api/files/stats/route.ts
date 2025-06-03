import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const totalFiles = await prisma.file.count();
  const availableFiles = await prisma.file.count({ where: { isDeleted: false } });
  const deletedFiles = await prisma.file.count({ where: { isDeleted: true } });
  return NextResponse.json({ totalFiles, availableFiles, deletedFiles });
} 