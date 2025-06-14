import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [totalFiles, totalFolders, totalSize, recentFiles] = await Promise.all([
      prisma.file.count({
        where: {
          isDeleted: false
        }
      }),
      prisma.folder.count({
        where: {
          isDeleted: false
        }
      }),
      prisma.file.aggregate({
        where: {
          isDeleted: false
        },
        _sum: {
          size: true
        }
      }),
      prisma.file.findMany({
        where: {
          isDeleted: false
        },
        take: 5,
        orderBy: {
          lastModifiedAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          size: true,
          lastModifiedAt: true,
          type: true,
          fiscalYear: {
            select: {
              name: true
            }
          },
          source: {
            select: {
              name: true
            }
          },
          grantType: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      totalFiles,
      totalFolders,
      totalSize: totalSize._sum.size || 0,
      recentFiles: recentFiles.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        updatedAt: file.lastModifiedAt,
        type: file.type,
        fiscalYear: file.fiscalYear?.name,
        source: file.source?.name,
        grantType: file.grantType?.name
      }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 