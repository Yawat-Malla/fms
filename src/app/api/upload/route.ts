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

async function saveSectionFiles(
  files: File[],
  sectionName: string,
  metadata: {
    fiscalYearId: number;
    sourceId: number;
    grantTypeId: number;
    remarks?: string;
  },
  userId: number,
  parentFolder: any
) {
  if (files.length === 0) return [];

  // Create section subfolder path
  const sectionDir = join(parentFolder.path, sectionName);
  await mkdir(sectionDir, { recursive: true });

  // Create a folder record for this section
  const sectionFolder = await prisma.folder.create({
    data: {
      name: sectionName,
      path: sectionDir,
      user: {
        connect: {
          id: userId
        }
      },
      fiscalYear: {
        connect: {
          id: metadata.fiscalYearId
        }
      },
      source: {
        connect: {
          id: metadata.sourceId
        }
      },
      grantType: {
        connect: {
          id: metadata.grantTypeId
        }
      },
      parent: {
        connect: {
          id: parentFolder.id
        }
      }
    },
  });

  const savedFiles = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const filePath = join(sectionDir, fileName);

    await writeFile(filePath, buffer);

    const savedFile = await prisma.file.create({
      data: {
        name: fileName,
        path: filePath,
        type: file.type,
        size: file.size,
        status: 'online',
        description: metadata.remarks || null,
        localHash: generateFileHash(fileName, file.size, Date.now()),
        folder: {
          connect: {
            id: sectionFolder.id
          }
        },
        user: {
          connect: {
            id: userId
          }
        },
        fiscalYear: {
          connect: {
            id: metadata.fiscalYearId
          }
        },
        source: {
          connect: {
            id: metadata.sourceId
          }
        },
        grantType: {
          connect: {
            id: metadata.grantTypeId
          }
        }
      },
    });

    // Create notification for file upload
    await notifyFileUpdate(userId, fileName, 'uploaded');

    savedFiles.push(savedFile);
  }

  return savedFiles;
}

export async function POST(request: Request) {
  try {
    console.log('[Upload API] Starting file upload process...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('[Upload API] No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderId = formData.get('folderId') as string;

    console.log('[Upload API] Received request:', {
      fileCount: files.length,
      folderId,
      userId: session.user.id
    });

    if (!files || files.length === 0) {
      console.error('[Upload API] No files provided');
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Get folder information if folderId is provided
    let folder = null;
    if (folderId) {
      folder = await prisma.folder.findUnique({
        where: { id: parseInt(folderId) },
        include: {
          fiscalYear: true,
          source: true,
          grantType: true
        }
      });

      if (!folder) {
        console.error('[Upload API] Folder not found:', folderId);
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      console.log('[Upload API] Creating uploads directory');
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const savedFiles = [];
    for (const file of files) {
      console.log('[Upload API] Processing file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name;
      const filePath = folder 
        ? join(folder.path, fileName)
        : join(UPLOAD_DIR, fileName);

      // Ensure the directory exists
      await mkdir(folder ? folder.path : UPLOAD_DIR, { recursive: true });

      // Save the file
      await writeFile(filePath, buffer);
      console.log('[Upload API] File saved to:', filePath);

      // Create file record in database
      const savedFile = await prisma.file.create({
        data: {
          name: fileName,
          path: filePath,
          type: file.type,
          size: file.size,
          status: 'online',
          localHash: generateFileHash(fileName, file.size, Date.now()),
          folder: folder ? {
            connect: {
              id: folder.id
            }
          } : undefined,
          user: {
            connect: {
              id: session.user.id
            }
          },
          fiscalYear: folder?.fiscalYear ? {
            connect: {
              id: folder.fiscalYear.id
            }
          } : undefined,
          source: folder?.source ? {
            connect: {
              id: folder.source.id
            }
          } : undefined,
          grantType: folder?.grantType ? {
            connect: {
              id: folder.grantType.id
            }
          } : undefined
        },
      });

      console.log('[Upload API] File record created:', savedFile.id);

      // Create notification
      await notifyFileUpdate(session.user.id, fileName, 'uploaded');
      savedFiles.push(savedFile);
    }

    console.log('[Upload API] Upload completed successfully');
    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: savedFiles
    });

  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 