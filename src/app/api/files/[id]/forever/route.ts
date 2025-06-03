import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the file record first
    const file = await prisma.file.findUnique({ where: { id: parseInt(params.id) } });
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Attempt to delete the file from the uploads folder
    if (file.path) {
      try {
        // If file.path is absolute, use as is. If relative, resolve from uploads folder.
        const filePath = path.isAbsolute(file.path)
          ? file.path
          : path.join(process.cwd(), 'uploads', file.path);
        await fs.unlink(filePath);
      } catch (err) {
        // Log but don't fail the request if file is missing
        console.error('Failed to delete file from disk:', err);
      }
    }

    // Delete from the database
    await prisma.file.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to permanently delete file' }, { status: 500 });
  }
} 