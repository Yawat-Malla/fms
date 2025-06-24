import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import { FileFormat } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const reportId = parseInt(params.id, 10);

    if (isNaN(reportId)) {
      return new NextResponse('Invalid report ID', { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      return new NextResponse('Report not found', { status: 404 });
    }

    // Construct the file path using the same logic as the generation route
    const fileName = `report-${report.id}-${format(new Date(report.createdAt), 'yyyy-MM-dd-HH-mm-ss')}`;
    const fileExt = report.fileFormat.toLowerCase();
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const reportsDir = path.join(uploadsDir, 'reports');
    const filePath = path.join(reportsDir, `${fileName}.${fileExt}`);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const headers = new Headers();
      
      // Set appropriate content type
      if (report.fileFormat === FileFormat.pdf) {
        headers.set('Content-Type', 'application/pdf');
      } else {
        headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      }
      
      // Set filename for download
      const fileNameWithExt = `${report.name}.${fileExt}`;
      // Fallback for older browsers: replace non-ASCII characters
      const asciiFilename = fileNameWithExt.replace(/[^\x20-\x7E]/g, '_');
      // Modern browser support for Unicode filenames
      const encodedFilename = encodeURIComponent(fileNameWithExt);

      headers.set('Content-Disposition', `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`);

      return new NextResponse(fileBuffer, {
        headers,
      });
    } catch (error) {
      console.error('Error reading report file:', error);
      return new NextResponse('Report file not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error downloading report:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 