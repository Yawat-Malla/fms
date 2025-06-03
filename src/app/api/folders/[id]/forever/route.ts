import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function deleteFolderAndContents(folderId: number) {
  // Delete all files in this folder
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