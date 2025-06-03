import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all reports to delete their files
    const reports = await prisma.report.findMany();
    
    // Delete all report files
    for (const report of reports) {
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
    }

    // Delete all reports from database
    await prisma.report.deleteMany();

    return NextResponse.json({ message: 'All reports deleted successfully' });
  } catch (error) {
    console.error('Error deleting reports:', error);
    return NextResponse.json(
      { error: 'Failed to delete reports' },
      { status: 500 }
    );
  }
} 