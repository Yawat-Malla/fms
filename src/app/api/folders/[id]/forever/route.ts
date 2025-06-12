import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

async function deleteFolderAndContents(folderId: number) {
  // Get the folder first to check its path
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      files: true,
      subfolders: true
    }
  });

  if (!folder) {
    console.error('[FOREVER DELETE] Folder not found:', folderId);
    return;
  }

  // Delete all files in this folder
  for (const file of folder.files) {
    if (file.path) {
      try {
        const filePath = path.isAbsolute(file.path)
          ? file.path
          : path.join(process.cwd(), 'uploads', file.path);
        await fs.unlink(filePath).catch(() => {});
        console.log('[FOREVER DELETE] Deleted file from disk:', filePath);
      } catch (err) {
        console.error('[FOREVER DELETE] Failed to delete file from disk:', err, 'File path:', file.path);
      }
    }
  }
  await prisma.file.deleteMany({ where: { folderId } });

  // Find and delete all subfolders recursively
  for (const sub of folder.subfolders) {
    await deleteFolderAndContents(sub.id);
  }

  // Delete the physical folder if it exists
  if (folder.path) {
    try {
      const folderPath = path.isAbsolute(folder.path)
        ? folder.path
        : path.join(process.cwd(), 'uploads', folder.path);
      await fs.rm(folderPath, { recursive: true, force: true });
      console.log('[FOREVER DELETE] Deleted folder from disk:', folderPath);
    } catch (err) {
      console.error('[FOREVER DELETE] Failed to delete folder from disk:', err, 'Folder path:', folder.path);
    }
  }

  // Delete the folder from database
  await prisma.folder.delete({ where: { id: folderId } });
  console.log('[FOREVER DELETE] Deleted folder from database:', folderId);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteFolderAndContents(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FOREVER DELETE] Failed to permanently delete folder:', error);
    return NextResponse.json({ error: 'Failed to permanently delete folder' }, { status: 500 });
  }
} 