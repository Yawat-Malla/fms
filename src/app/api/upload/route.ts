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
const USER_FOLDERS_DIR = join(UPLOAD_DIR, 'user_folders');

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
  
  // Check if a folder with the same name already exists in this parent folder (including deleted ones)
  const existingSectionFolder = await prisma.folder.findFirst({
    where: {
      name: sectionName,
      parentId: parentFolder.id,
    },
  });

  if (existingSectionFolder) {
    throw new Error(`A folder named "${sectionName}" already exists in this location (including in the bin). Please use a different name.`);
  }

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
    const title = formData.get('title');
    const fiscalYear = formData.get('fiscalYear');
    const source = formData.get('source');
    const grantType = formData.get('grantType');
    const remarks = formData.get('remarks');

    // Runtime type checks for string values
    if (
      typeof title !== 'string' ||
      typeof fiscalYear !== 'string' ||
      typeof source !== 'string' ||
      typeof grantType !== 'string' ||
      (remarks && typeof remarks !== 'string')
    ) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    // Debug log for received values
    console.log('[Upload API] Received:', {
      title,
      fiscalYear,
      source,
      grantType,
      remarks
    });

    if (!title || !fiscalYear || !source || !grantType) {
      return NextResponse.json({ error: 'Fiscal year, source, and grant type are required.' }, { status: 400 });
    }

    // Get files from each section
    const a4Files = formData.getAll('a4Files') as File[];
    const nepaliFiles = formData.getAll('nepaliFiles') as File[];
    const extraFiles = formData.getAll('extraFiles') as File[];
    const otherFiles = formData.getAll('otherFiles') as File[];

    console.log('[Upload API] Received files:', {
      a4Files: a4Files.length,
      nepaliFiles: nepaliFiles.length,
      extraFiles: extraFiles.length,
      otherFiles: otherFiles.length
    });

    // Get or create fiscal year
    let fiscalYearRecord = await prisma.fiscalYear.findFirst({
      where: { name: fiscalYear }
    });
    if (!fiscalYearRecord) {
      fiscalYearRecord = await prisma.fiscalYear.create({
        data: {
          name: fiscalYear,
          startDate: new Date('2022-04-14'), // TODO: Replace with correct start date
          endDate: new Date('2023-04-13'),   // TODO: Replace with correct end date
        }
      });
    }

    // Get or create source
    const sourceKey = source.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    let sourceRecord = await prisma.source.findFirst({
      where: {
        OR: [
          { name: source },
          { key: sourceKey }
        ]
      }
    });
    if (!sourceRecord) {
      sourceRecord = await prisma.source.create({
        data: {
          name: source,
          key: sourceKey
        }
      });
    }

    // Get or create grant type
    const grantTypeKey = grantType.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    let grantTypeRecord = await prisma.grantType.findFirst({
      where: {
        OR: [
          { name: grantType },
          { key: grantTypeKey }
        ]
      }
    });
    if (!grantTypeRecord) {
      grantTypeRecord = await prisma.grantType.create({
        data: {
          name: grantType,
          key: grantTypeKey
        }
      });
    }

    // Create main folder for this upload
    const mainFolderPath = join(USER_FOLDERS_DIR, title);
    
    // Ensure the user_folders directory exists
    await mkdir(USER_FOLDERS_DIR, { recursive: true });

    // Check if a folder with the same name already exists at the root level (including deleted ones)
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: title,
        parentId: null,
      },
    });

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists (including in the bin). Please use a different name.' },
        { status: 409 }
      );
    }

    await mkdir(mainFolderPath, { recursive: true });

    const mainFolder = await prisma.folder.create({
      data: {
        name: title,
        path: mainFolderPath,
        user: {
          connect: {
            id: session.user.id
          }
        },
        fiscalYear: {
          connect: {
            id: fiscalYearRecord.id
          }
        },
        source: {
          connect: {
            id: sourceRecord.id
          }
        },
        grantType: {
          connect: {
            id: grantTypeRecord.id
          }
        }
      }
    });

    // Save files for each section
    const allSavedFiles = [];
    
    if (a4Files.length > 0) {
      const savedFiles = await saveSectionFiles(
        a4Files,
        'A4',
        {
          fiscalYearId: fiscalYearRecord.id,
          sourceId: sourceRecord.id,
          grantTypeId: grantTypeRecord.id,
          remarks: remarks || undefined
        },
        session.user.id,
        mainFolder
      );
      allSavedFiles.push(...savedFiles);
    }

    if (nepaliFiles.length > 0) {
      const savedFiles = await saveSectionFiles(
        nepaliFiles,
        'Nepali',
        {
          fiscalYearId: fiscalYearRecord.id,
          sourceId: sourceRecord.id,
          grantTypeId: grantTypeRecord.id,
          remarks: remarks || undefined
        },
        session.user.id,
        mainFolder
      );
      allSavedFiles.push(...savedFiles);
    }

    if (extraFiles.length > 0) {
      const savedFiles = await saveSectionFiles(
        extraFiles,
        'Extra',
        {
          fiscalYearId: fiscalYearRecord.id,
          sourceId: sourceRecord.id,
          grantTypeId: grantTypeRecord.id,
          remarks: remarks || undefined
        },
        session.user.id,
        mainFolder
      );
      allSavedFiles.push(...savedFiles);
    }

    if (otherFiles.length > 0) {
      const savedFiles = await saveSectionFiles(
        otherFiles,
        'Other',
        {
          fiscalYearId: fiscalYearRecord.id,
          sourceId: sourceRecord.id,
          grantTypeId: grantTypeRecord.id,
          remarks: remarks || undefined
        },
        session.user.id,
        mainFolder
      );
      allSavedFiles.push(...savedFiles);
    }

    if (allSavedFiles.length === 0) {
      console.error('[Upload API] No files were successfully processed');
      return NextResponse.json({ error: 'Failed to upload any files' }, { status: 500 });
    }

    console.log('[Upload API] Upload completed successfully:', {
      totalFiles: allSavedFiles.length
    });

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: allSavedFiles
    });

  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 