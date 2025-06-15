import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReportType, FileFormat } from '@prisma/client';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const reportsDir = path.join(uploadsDir, 'reports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add debug logging
    console.log('Session user:', session.user);

    const body = await req.json();
    const { name, type, parameters, fileFormat } = body;

    // Validate required fields
    if (!type || !fileFormat) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate report type
    const validReportTypes = ['folder_count', 'empty_folders', 'folder_metadata', 'custom'] as const;
    if (!validReportTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      );
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Create report record
    const createdAt = new Date();
    const report = await prisma.report.create({
      data: {
        name: name || `${type} Report - ${format(createdAt, 'yyyy-MM-dd')}`,
        type: type as ReportType,
        parameters,
        fileFormat: fileFormat.toLowerCase() as FileFormat,
        createdBy: Number(session.user.id),
        createdAt,
      },
      include: {
        user: true,
      },
    });

    // Generate report based on type
    let reportData;
    switch (type) {
      case 'folder_count':
        reportData = await generateFileCountReport(parameters);
        break;
      case 'empty_folders':
        reportData = await generateMissingUploadsReport(parameters);
        break;
      case 'folder_metadata':
        reportData = await generateCustomReport(parameters);
        break;
      case 'custom':
        reportData = await generateCustomReport(parameters);
        break;
      default:
        throw new Error('Invalid report type');
    }

    // Generate file based on format
    const fileName = `report-${report.id}-${format(report.createdAt, 'yyyy-MM-dd-HH-mm-ss')}`;
    const fileExt = fileFormat.toLowerCase();
    const filePath = path.join(reportsDir, `${fileName}.${fileExt}`);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fileFormat === 'excel') {
      await generateExcelReport(reportData, filePath);
    } else {
      await generatePDFReport(reportData, filePath);
    }

    // Update report with download URL
    const downloadUrl = `/api/reports/${report.id}/download`;
    await prisma.report.update({
      where: { id: report.id },
      data: { downloadUrl },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// Helper functions for report generation
async function generateFileCountReport(parameters: any) {
  const { startDate, endDate, fiscalYear, source, grantType } = parameters;

  const folders = await prisma.folder.findMany({
    where: {
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      fiscalYear: fiscalYear ? { name: fiscalYear } : undefined,
      source: source ? { name: source } : undefined,
      grantType: grantType ? { name: grantType } : undefined,
      isDeleted: false,
    },
    include: {
      fiscalYear: true,
      source: true,
      grantType: true,
      files: {
        where: {
          isDeleted: false,
        },
      },
      subfolders: {
        where: {
          isDeleted: false,
        },
        include: {
          files: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
    },
  });

  return {
    title: 'Folder Count Report',
    parameters,
    summary: {
      totalFolders: folders.length,
      totalFiles: folders.reduce((sum, folder) => {
        const directFiles = folder.files.length;
        const subfolderFiles = folder.subfolders.reduce((subSum, subfolder) => subSum + subfolder.files.length, 0);
        return sum + directFiles + subfolderFiles;
      }, 0),
      byFiscalYear: groupBy(folders, 'fiscalYear.name'),
      bySource: groupBy(folders, 'source.name'),
      byGrantType: groupBy(folders, 'grantType.name'),
    },
    details: folders.map(folder => ({
      name: folder.name,
      path: folder.path,
      fiscalYear: folder.fiscalYear?.name || 'N/A',
      source: folder.source?.name || 'N/A',
      grantType: folder.grantType?.name || 'N/A',
      createdAt: format(new Date(folder.createdAt), 'yyyy-MM-dd'),
      totalFiles: folder.files.length + folder.subfolders.reduce((sum, subfolder) => sum + subfolder.files.length, 0),
      subfolders: folder.subfolders.length,
    })),
  };
}

async function generateMissingUploadsReport(parameters: any) {
  const { fiscalYear, source, grantType } = parameters;

  // Get all folders with their files, subfolders, and metadata
  const folders = await prisma.folder.findMany({
    where: {
      fiscalYear: fiscalYear ? { name: fiscalYear } : undefined,
      source: source ? { name: source } : undefined,
      grantType: grantType ? { name: grantType } : undefined,
      isDeleted: false,
    },
    include: {
      files: {
        where: {
          isDeleted: false,
        },
      },
      subfolders: {
        where: {
          isDeleted: false,
        },
        include: {
          files: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
      fiscalYear: true,
      source: true,
      grantType: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Find folders with no files (including subfolders)
  const foldersWithNoFiles = folders.filter(folder => {
    // Check if the folder itself has files
    if (folder.files.length > 0) {
      return false;
    }

    // Check if any subfolder has files
    const hasFilesInSubfolders = folder.subfolders.some(subfolder => subfolder.files.length > 0);
    if (hasFilesInSubfolders) {
      return false;
    }

    return true;
  });

  // Format the details with all metadata fields
  const formattedDetails = foldersWithNoFiles.map(folder => ({
    name: folder.name,
    path: folder.path,
    fiscalYear: folder.fiscalYear?.name || 'N/A',
    source: folder.source?.name || 'N/A',
    grantType: folder.grantType?.name || 'N/A',
    createdAt: format(new Date(folder.createdAt), 'yyyy-MM-dd'),
    createdBy: folder.user?.name || 'N/A',
    subfolders: folder.subfolders.length,
  }));

  return {
    title: 'Empty Folders Report',
    parameters,
    summary: {
      totalFolders: folders.length,
      emptyFolders: foldersWithNoFiles.length,
      byFiscalYear: groupBy(foldersWithNoFiles, 'fiscalYear.name'),
      bySource: groupBy(foldersWithNoFiles, 'source.name'),
      byGrantType: groupBy(foldersWithNoFiles, 'grantType.name'),
    },
    details: formattedDetails,
  };
}

async function generateCustomReport(parameters: any) {
  const { startDate, endDate, fiscalYear, source, grantType } = parameters;

  // Get all folders matching the criteria
  const folders = await prisma.folder.findMany({
    where: {
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      fiscalYear: fiscalYear ? { name: fiscalYear } : undefined,
      source: source ? { name: source } : undefined,
      grantType: grantType ? { name: grantType } : undefined,
      isDeleted: false,
    },
    include: {
      files: {
        where: {
          isDeleted: false,
            },
          },
          subfolders: {
        where: {
          isDeleted: false,
        },
        include: {
          files: {
            where: {
              isDeleted: false,
            },
          },
        },
      },
      fiscalYear: true,
      source: true,
      grantType: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Format the details with all metadata fields
  const formattedDetails = folders.map(folder => ({
    name: folder.name,
    path: folder.path,
    fiscalYear: folder.fiscalYear?.name || 'N/A',
    source: folder.source?.name || 'N/A',
    grantType: folder.grantType?.name || 'N/A',
    createdAt: format(new Date(folder.createdAt), 'yyyy-MM-dd'),
    createdBy: folder.user?.name || 'N/A',
    totalFiles: folder.files.length + folder.subfolders.reduce((sum, subfolder) => sum + subfolder.files.length, 0),
    subfolders: folder.subfolders.length,
  }));

  return {
    title: 'Custom Folder Report',
    parameters,
    summary: {
      totalFolders: folders.length,
      totalFiles: folders.reduce((sum, folder) => {
        const directFiles = folder.files.length;
        const subfolderFiles = folder.subfolders.reduce((subSum, subfolder) => subSum + subfolder.files.length, 0);
        return sum + directFiles + subfolderFiles;
      }, 0),
      byFiscalYear: groupBy(folders, 'fiscalYear.name'),
      bySource: groupBy(folders, 'source.name'),
      byGrantType: groupBy(folders, 'grantType.name'),
    },
    details: formattedDetails,
  };
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function generateExcelReport(data: any, filePath: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Add title
  worksheet.addRow([data.title]);
  worksheet.addRow([]);

  // Add parameters
  worksheet.addRow(['Parameters']);
  Object.entries(data.parameters).forEach(([key, value]) => {
    worksheet.addRow([key, value]);
  });
  worksheet.addRow([]);

  // Add summary
  worksheet.addRow(['Summary']);
  Object.entries(data.summary).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      worksheet.addRow([key]);
      Object.entries(value).forEach(([subKey, subValue]) => {
        worksheet.addRow([subKey, subValue]);
      });
    } else {
      worksheet.addRow([key, value]);
    }
  });
  worksheet.addRow([]);

  // Add details
  if (data.details?.length > 0) {
    worksheet.addRow(['Details']);
    // Add headers
    const headers = Object.keys(data.details[0]);
    worksheet.addRow(headers);

    // Add data
    data.details.forEach((row: any) => {
      worksheet.addRow(Object.values(row));
    });
  }

  // Save workbook
  await workbook.xlsx.writeFile(filePath);
}

async function generatePDFReport(data: any, filePath: string) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const lineHeight = 7;
      const margin = 15;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - (2 * margin);

      // Helper function to add text and handle page breaks
      const addText = (text: string, x: number, fontSize = 10, maxWidth?: number) => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFontSize(fontSize);
        if (maxWidth) {
          const textLines = doc.splitTextToSize(String(text), maxWidth);
          doc.text(textLines, x, yPos);
          return textLines.length * (fontSize / 3);
        } else {
          doc.text(String(text), x, yPos);
          return 1;
        }
      };

      // Add title
      doc.setFont('helvetica', 'bold');
      addText(data.title || 'Report', margin, 16);
      yPos += 15;

      // Add parameters section
      if (data.parameters) {
        doc.setFont('helvetica', 'bold');
        addText('Parameters:', margin, 12);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        Object.entries(data.parameters || {}).forEach(([key, value]) => {
          if (value) {
            yPos += addText(`${key}: ${value}`, margin + 5, 10) * lineHeight;
          }
        });
        yPos += 10;
      }

      // Add summary section
      if (data.summary) {
        doc.setFont('helvetica', 'bold');
        addText('Summary:', margin, 12);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        Object.entries(data.summary || {}).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            yPos += addText(key, margin + 5, 10) * lineHeight;
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue !== null && subValue !== undefined) {
                yPos += addText(`${subKey}: ${subValue}`, margin + 10, 10) * lineHeight;
              }
            });
          } else if (value !== null && value !== undefined) {
            yPos += addText(`${key}: ${value}`, margin + 5, 10) * lineHeight;
          }
        });
        yPos += 10;
      }

      // Add details if available
      if (data.details?.length > 0) {
        doc.setFont('helvetica', 'bold');
        addText('Details:', margin, 12);
        yPos += 10;

        // Define columns for the report
        const columns = [
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Fiscal Year', key: 'fiscalYear', width: 20 },
          { header: 'Source', key: 'source', width: 20 },
          { header: 'Grant Type', key: 'grantType', width: 20 },
          { header: 'Created Date', key: 'createdAt', width: 20 },
          { header: 'Created By', key: 'createdBy', width: 25 },
          { header: 'Subfolders', key: 'subfolders', width: 15 },
        ];

        // Calculate column widths
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
        const scaleFactor = contentWidth / totalWidth;
        const finalColumnWidths = columns.map(col => col.width * scaleFactor);

        // Draw table header
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
        doc.setTextColor(0, 0, 0);
        
        let xPos = margin;
        columns.forEach((col, index) => {
          doc.setFont('helvetica', 'bold');
          addText(col.header, xPos, 10, finalColumnWidths[index]);
          xPos += finalColumnWidths[index];
        });
        yPos += 8;

        // Draw table rows
        doc.setFont('helvetica', 'normal');
        data.details.forEach((row: any, rowIndex: number) => {
          if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            
            // Redraw header on new page
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
            xPos = margin;
            columns.forEach((col, index) => {
              doc.setFont('helvetica', 'bold');
              addText(col.header, xPos, 10, finalColumnWidths[index]);
              xPos += finalColumnWidths[index];
            });
            yPos += 8;
            doc.setFont('helvetica', 'normal');
          }

          // Draw row background (alternating)
          if (rowIndex % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
          }

          xPos = margin;
          columns.forEach((col, index) => {
            const value = row[col.key] ?? 'N/A';
            addText(String(value), xPos, 9, finalColumnWidths[index]);
            xPos += finalColumnWidths[index];
          });
          yPos += 8;
        });

        // Draw table border
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, yPos - (data.details.length * 8) - 5, contentWidth, (data.details.length * 8) + 5);
      }

      // Save the PDF
      const pdfBuffer = doc.output();
      fs.writeFileSync(filePath, pdfBuffer, 'binary');
      resolve(undefined);
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to group arrays
function groupBy(array: any[], key: string) {
  return array.reduce((result, item) => {
    const value = key.split('.').reduce((obj, key) => obj?.[key], item);
    if (!value) return result;
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
} 