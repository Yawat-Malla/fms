import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

async function deleteFolderAndContents(folderId: number) {
  // Delete all files in this folder
  const files = await prisma.file.findMany({ where: { folderId } });
  for (const file of files) {
    if (file.path) {
      try {
        const filePath = path.isAbsolute(file.path)
          ? file.path
          : path.join(process.cwd(), 'uploads', file.path);
        await fs.unlink(filePath).catch(() => {});
      } catch (err) {
        console.error('[FOREVER DELETE] Failed to delete file from disk:', err, 'File path:', file.path);
      }
    }
  }
  await prisma.file.deleteMany({ where: { folderId } });
  // Find and delete all subfolders recursively
  const subfolders = await prisma.folder.findMany({ where: { parentId: folderId } });
  for (const sub of subfolders) {
    await deleteFolderAndContents(sub.id);
  }
  // Delete the folder itself
  await prisma.folder.delete({ where: { id: folderId } });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteFolderAndContents(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to permanently delete folder' }, { status: 500 });
  }
} 