import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function generateFileHash(fileName: string, size: number, timestamp: number): string {
  const hash = createHash('sha256');
  hash.update(`${fileName}-${size}-${timestamp}`);
  return hash.digest('hex');
}

export async function POST(request: Request) {
  console.log('Upload API - Starting request processing');
    
    const session = await getServerSession(authOptions);
  console.log('Upload API - Session check:', { 
    isAuthenticated: !!session,
    userId: session?.user?.id 
  });

  if (!session) {
    console.log('Upload API - Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  try {
    console.log('Upload API - Parsing form data');
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const fiscalYearId = formData.get('fiscalYear') as string;
    const sourceId = formData.get('source') as string;
    const grantTypeId = formData.get('grantType') as string;
    const remarks = formData.get('remarks') as string;

    // Log received data for debugging
    console.log('Upload API - Received form data:', {
      title,
      fiscalYearId,
      sourceId,
      grantTypeId,
      remarks,
      formDataKeys: Array.from(formData.keys())
    });

    // Validate required fields
    if (!title || !fiscalYearId || !sourceId || !grantTypeId) {
      console.log('Upload API - Missing required fields:', {
        hasTitle: !!title,
        hasFiscalYear: !!fiscalYearId,
        hasSource: !!sourceId,
        hasGrantType: !!grantTypeId
      });
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          title: !title,
          fiscalYear: !fiscalYearId,
          source: !sourceId,
          grantType: !grantTypeId
        }
      }, { status: 400 });
    }

    console.log('Upload API - Fetching reference records');
    // Get the records by their keys instead of IDs
    const [fiscalYear, source, grantType] = await Promise.all([
      prisma.fiscalYear.findFirst({ 
        where: {
          name: fiscalYearId.startsWith('FY ') ? fiscalYearId : `FY ${fiscalYearId}`
        } 
      }),
      prisma.source.findFirst({ 
        where: { 
          OR: [
            { key: sourceId },
            { name: sourceId }
          ]
        } 
      }),
      prisma.grantType.findFirst({ 
        where: { 
          OR: [
            { key: grantTypeId },
            { name: grantTypeId }
          ]
        } 
      })
    ]);

    console.log('Upload API - Reference records found:', {
      fiscalYear: fiscalYear ? {
        id: fiscalYear.id,
        name: fiscalYear.name
      } : null,
      source: source ? {
        id: source.id,
        key: source.key
      } : null,
      grantType: grantType ? {
        id: grantType.id,
        key: grantType.key
      } : null
    });

    if (!fiscalYear || !source || !grantType) {
      console.log('Upload API - Missing reference records:', {
        fiscalYear: !fiscalYear,
        source: !source,
        grantType: !grantType,
        fiscalYearId,
        sourceId,
        grantTypeId
      });
      return NextResponse.json({ 
        error: 'One or more referenced records not found',
        details: {
          fiscalYear: !fiscalYear,
          source: !source,
          grantType: !grantType,
          fiscalYearId,
          sourceId,
          grantTypeId
        }
      }, { status: 400 });
    }

    console.log('Upload API - Fetching upload sections');
    // Get all upload sections
    const uploadSections = await prisma.uploadSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    console.log('Upload API - Found upload sections:', uploadSections.length);

    // Create main folder for this upload
    const userFoldersDir = path.join(process.cwd(), 'uploads', 'user_folders');
    const mainFolderPath = path.join(userFoldersDir, title);
    console.log('Upload API - Main folder path:', mainFolderPath);

    // Check if a folder with the same name already exists (including deleted ones)
    console.log('Upload API - Checking for existing folder');
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: title,
        parentId: null,
      },
    });

    if (existingFolder) {
      console.log('Upload API - Found existing folder with same name');
      return NextResponse.json({
        error: 'A folder with this name already exists (including in the bin). Please use a different name.'
      }, { status: 409 });
    }

    console.log('Upload API - Creating main folder');
    // Create the main folder and its parent directories if they don't exist
    await mkdir(mainFolderPath, { recursive: true });

    // Create the main folder record
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
            id: fiscalYear.id
          }
        },
        source: {
          connect: {
            id: source.id
          }
        },
        grantType: {
          connect: {
            id: grantType.id
          }
        }
      }
    });
    console.log('Upload API - Main folder created:', mainFolder.id);

    // Process files for each section
    console.log('Upload API - Starting file processing');
    const filePromises = uploadSections.map(async (section) => {
      console.log(`Upload API - Processing section: ${section.name}`);
      const files = formData.getAll(`${section.key}Files`) as File[];
      console.log(`Upload API - Found ${files.length} files for section ${section.name}`);

      if (files.length === 0) return [];

      // Create section subfolder
      const sectionFolderPath = path.join(mainFolderPath, section.name);
      console.log(`Upload API - Section folder path: ${sectionFolderPath}`);

      // Check if a subfolder with the same name already exists in this parent folder
      console.log(`Upload API - Checking for existing section folder: ${section.name}`);
      const existingSectionFolder = await prisma.folder.findFirst({
        where: {
          name: section.name,
          parentId: mainFolder.id,
        },
      });

      if (existingSectionFolder) {
        console.log(`Upload API - Found existing section folder: ${section.name}`);
        return NextResponse.json({
          error: `A folder named "${section.name}" already exists in this location (including in the bin). Please use a different name.`
        }, { status: 409 });
      }

      console.log(`Upload API - Creating section folder: ${section.name}`);
      await mkdir(sectionFolderPath, { recursive: true });

      // Create section folder record
      const sectionFolder = await prisma.folder.create({
        data: {
          name: section.name,
          path: sectionFolderPath,
          user: {
            connect: {
              id: session.user.id
            }
          },
          fiscalYear: {
            connect: {
              id: fiscalYear.id
            }
          },
          source: {
            connect: {
              id: source.id
            }
          },
          grantType: {
            connect: {
              id: grantType.id
            }
          },
          parent: {
            connect: {
              id: mainFolder.id
            }
          }
        }
      });
      console.log(`Upload API - Section folder created: ${sectionFolder.id}`);

      // Process files in this section
      console.log(`Upload API - Processing ${files.length} files for section ${section.name}`);
      return Promise.all(files.map(async (file) => {
        console.log(`Upload API - Processing file: ${file.name}`);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const timestamp = Date.now();
        const fileName = `${uuidv4()}-${file.name}`;
        const filePath = path.join(sectionFolderPath, fileName);
        
        console.log(`Upload API - Writing file to disk: ${filePath}`);
        await writeFile(filePath, buffer);

        // Generate local hash for the file
        const localHash = generateFileHash(file.name, file.size, timestamp);
        console.log(`Upload API - Generated hash for file: ${localHash}`);

        console.log(`Upload API - Creating file record in database: ${file.name}`);
        return prisma.file.create({
          data: {
            name: file.name,
            path: path.join(section.name, fileName),
            type: file.type,
            size: file.size,
            status: 'online',
            description: remarks,
            localHash,
            user: {
              connect: {
                id: session.user.id
              }
            },
            folder: {
              connect: {
                id: sectionFolder.id
              }
            },
            fiscalYear: {
              connect: {
                id: fiscalYear.id
              }
            },
            source: {
              connect: {
                id: source.id
              }
            },
            grantType: {
              connect: {
                id: grantType.id
              }
            }
          }
        });
      }));
    });

    console.log('Upload API - Waiting for all file uploads to complete');
    const uploadedFiles = await Promise.all(filePromises);
    console.log('Upload API - All files uploaded successfully');

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles.flat()
    });
  } catch (error) {
    console.error('Upload API - Error details:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal Server Error'
    }, { status: 500 });
  }
} 