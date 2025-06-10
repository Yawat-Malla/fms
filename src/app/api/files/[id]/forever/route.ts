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
      console.error('[FOREVER DELETE] File not found:', params.id);
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
        console.log('[FOREVER DELETE] Deleted file from disk:', filePath);
      } catch (err) {
        // Log but don't fail the request if file is missing
        console.error('[FOREVER DELETE] Failed to delete file from disk:', err, 'File path:', file.path);
      }
    } else {
      console.warn('[FOREVER DELETE] No file path found for file:', file.id);
    }

    // Delete from the database
    await prisma.file.delete({ where: { id: parseInt(params.id) } });
    console.log('[FOREVER DELETE] Deleted file from database:', file.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FOREVER DELETE] Failed to permanently delete file:', error, 'File ID:', params.id);
    return NextResponse.json({ error: 'Failed to permanently delete file' }, { status: 500 });
  }
} 