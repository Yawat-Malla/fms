import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import archiver from 'archiver';
import { createWriteStream, createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  let tempDir: string | null = null;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const folderId = parseInt(params.id);
    if (isNaN(folderId)) {
      return new NextResponse('Invalid folder ID', { status: 400 });
    }

    console.log('Fetching folder with ID:', folderId);

    // Get the folder and all its contents recursively
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        files: {
          select: {
            id: true,
            name: true,
            path: true,
            type: true,
            size: true
          }
        },
        subfolders: {
          include: {
            files: {
              select: {
                id: true,
                name: true,
                path: true,
                type: true,
                size: true
              }
            },
            subfolders: {
              include: {
                files: {
                  select: {
                    id: true,
                    name: true,
                    path: true,
                    type: true,
                    size: true
                  }
                },
                subfolders: true
              }
            }
          }
        }
      }
    });

    if (!folder) {
      console.log('Folder not found:', folderId);
      return new NextResponse('Folder not found', { status: 404 });
    }

    console.log('Found folder:', {
      id: folder.id,
      name: folder.name,
      fileCount: folder.files.length,
      subfolderCount: folder.subfolders.length
    });

    // Create a temporary directory for the zip file
    tempDir = join(tmpdir(), `folder-${folderId}-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Create a write stream for the zip file
    const zipPath = join(tempDir, `${folder.name}.zip`);
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    // Handle archive events
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        throw err;
      }
    });

    archive.on('error', (err) => {
      throw err;
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Function to get the complete folder path
    const getFolderPath = async (folderId: number): Promise<string[]> => {
      const path: string[] = [];
      let currentFolder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { id: true, name: true, parentId: true }
      });

      while (currentFolder) {
        path.unshift(currentFolder.name);
        if (!currentFolder.parentId) break;
        currentFolder = await prisma.folder.findUnique({
          where: { id: currentFolder.parentId },
          select: { id: true, name: true, parentId: true }
        });
      }

      return path;
    };

    // Function to add files to the archive
    const addFilesToArchive = async (folder: any, currentPath: string = '') => {
      console.log('Processing folder:', {
        id: folder.id,
        name: folder.name,
        currentPath,
        fileCount: folder.files.length
      });

      // Add files in current folder
      for (const file of folder.files) {
        console.log('Processing file:', {
          id: file.id,
          name: file.name,
          path: file.path,
          type: file.type
        });

        if (!file.path) {
          console.warn(`Skipping file with no path:`, file);
          continue;
        }

        // Get the complete folder path
        const folderPath = await getFolderPath(folder.id);
        console.log('Folder path:', folderPath);

        const userFolderPath = join('user_folders', ...folderPath);
        console.log('User folder path:', userFolderPath);
        
        // Get the filename from the path
        const fileName = file.path.split('/').pop();
        if (!fileName) {
          console.warn(`Invalid file path: ${file.path}`);
          continue;
        }
        
        // Construct the complete file path
        const filePath = join(process.cwd(), 'uploads', userFolderPath, fileName);
        console.log('Full file path:', filePath);
        
        if (!filePath || !existsSync(filePath)) {
          console.warn(`File not found or invalid path: ${filePath}`);
          continue;
        }

        try {
          // Use the file's display name in the archive
          const archivePath = join(currentPath, file.name);
          console.log(`Adding file to archive: ${archivePath} from ${filePath}`);
          archive.file(filePath, { name: archivePath });
        } catch (error) {
          console.error(`Error adding file ${filePath} to archive:`, error);
        }
      }

      // Recursively add files from subfolders
      for (const subfolder of folder.subfolders) {
        if (!subfolder.name) {
          console.warn('Skipping subfolder with invalid name:', subfolder);
          continue;
        }

        const subfolderPath = join(currentPath, subfolder.name);
        console.log(`Processing subfolder: ${subfolderPath}`);
        await addFilesToArchive(subfolder, subfolderPath);
      }
    };

    // Add all files to the archive
    await addFilesToArchive(folder);

    // Finalize the archive
    await archive.finalize();

    // Wait for the write stream to finish
    await new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log('Archive finalized, total bytes:', archive.pointer());
        resolve(true);
      });
      output.on('error', reject);
    });

    // Read the zip file using Node.js streams
    const zipFile = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const readStream = createReadStream(zipPath);
      
      readStream.on('data', (chunk) => {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else {
          chunks.push(Buffer.from(chunk));
        }
      });
      readStream.on('end', () => resolve(Buffer.concat(chunks)));
      readStream.on('error', reject);
    });

    // Return the zip file
    return new NextResponse(zipFile, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${folder.name}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error downloading folder:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    // Clean up temporary files
    if (tempDir) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.error('Error cleaning up temporary directory:', error);
      }
    }
  }
} 