import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function restoreFolderAndContents(folderId: number) {
  // Restore the folder
  await prisma.folder.update({
    where: { id: folderId },
    data: { isDeleted: false, deletedAt: null, deleteAfter: null },
  });
  // Restore all files in this folder
  await prisma.file.updateMany({
    where: { folderId },
    data: { isDeleted: false, deletedAt: null, deleteAfter: null },
  });
  // Find and restore all subfolders recursively
  const subfolders = await prisma.folder.findMany({ where: { parentId: folderId } });
  for (const sub of subfolders) {
    await restoreFolderAndContents(sub.id);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await restoreFolderAndContents(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to restore folder' }, { status: 500 });
  }
} 