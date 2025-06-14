import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent viewers from deleting reports
    if (session.user.role === 'viewer') {
      return NextResponse.json({ error: 'Viewers cannot delete reports' }, { status: 403 });
    }

    const reportId = parseInt(params.id, 10);
    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    // Get report details before deletion
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Delete the physical file
    try {
      const fileName = `report-${report.id}-${format(new Date(report.createdAt), 'yyyy-MM-dd-HH-mm-ss')}`;
      const fileExt = report.fileFormat.toLowerCase();
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const reportsDir = path.join(uploadsDir, 'reports');
      const filePath = path.join(reportsDir, `${fileName}.${fileExt}`);
      
      await fs.unlink(filePath).catch(() => {}); // Ignore errors if file doesn't exist
    } catch (error) {
      console.error('Error deleting report file:', error);
    }

    // Delete the database record
    await prisma.report.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
} 