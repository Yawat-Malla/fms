import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import { notifyFileUpdate } from '@/lib/notifications';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

function generateFileHash(fileName: string, size: number, timestamp: number): string {
  const hash = createHash('sha256');
  hash.update(`${fileName}-${size}-${timestamp}`);
  return hash.digest('hex');
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[Add Files API] Starting file upload process...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('[Add Files API] No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folderId = parseInt(params.id);
    if (isNaN(folderId)) {
      return NextResponse.json({ error: 'Invalid folder ID' }, { status: 400 });
    }

    // Get the folder
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        fiscalYear: true,
        source: true,
        grantType: true
      }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log('[Add Files API] Processing files:', {
      folderId,
      fileCount: files.length
    });

    const savedFiles = [];
    for (const file of files) {
      if (!(file instanceof File)) {
        console.error('[Add Files API] Invalid file object:', file);
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name;
        const filePath = join(folder.path, fileName);

        // Ensure the directory exists
        await mkdir(folder.path, { recursive: true });

        // Save the file
        await writeFile(filePath, buffer);

        // Create file record in database
        const savedFile = await prisma.file.create({
          data: {
            name: fileName,
            path: filePath,
            type: file.type,
            size: file.size,
            status: 'online',
            localHash: generateFileHash(fileName, file.size, Date.now()),
            folder: {
              connect: {
                id: folder.id
              }
            },
            user: {
              connect: {
                id: session.user.id
              }
            },
            fiscalYear: folder.fiscalYear ? {
              connect: {
                id: folder.fiscalYear.id
              }
            } : undefined,
            source: folder.source ? {
              connect: {
                id: folder.source.id
              }
            } : undefined,
            grantType: folder.grantType ? {
              connect: {
                id: folder.grantType.id
              }
            } : undefined
          },
        });

        // Create notification
        await notifyFileUpdate(session.user.id, fileName, 'uploaded');
        savedFiles.push(savedFile);
      } catch (error) {
        console.error('[Add Files API] Error processing file:', error);
        // Continue with other files even if one fails
      }
    }

    if (savedFiles.length === 0) {
      console.error('[Add Files API] No files were successfully processed');
      return NextResponse.json({ error: 'Failed to upload any files' }, { status: 500 });
    }

    console.log('[Add Files API] Upload completed successfully:', {
      totalFiles: files.length,
      savedFiles: savedFiles.length
    });

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: savedFiles
    });

  } catch (error) {
    console.error('[Add Files API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 