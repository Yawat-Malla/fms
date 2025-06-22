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
import { Buffer } from 'node:buffer';

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

  // Get system settings for site name and logo
  const settings = await prisma.systemSettings.findFirst();

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
      parentId: null, // Only get root folders, exclude subfolders
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
    },
  });

  return {
    title: 'Folder Count Report',
    siteName: settings?.siteName || 'File Management System',
    siteLogo: '/nepal-emblem.png', // Use default logo
    parameters,
    summary: {
      totalFolders: folders.length,
      totalFiles: folders.reduce((sum, folder) => sum + folder.files.length, 0),
      byFiscalYear: groupBy(folders, 'fiscalYear.name'),
      bySource: groupBy(folders, 'source.name'),
      byGrantType: groupBy(folders, 'grantType.name'),
    },
    details: folders.map(folder => ({
      name: folder.name,
      fiscalYear: folder.fiscalYear?.name || 'N/A',
      source: folder.source?.name || 'N/A',
      grantType: folder.grantType?.name || 'N/A',
      createdAt: format(new Date(folder.createdAt), 'yyyy-MM-dd'),
    })),
  };
}

async function generateMissingUploadsReport(parameters: any) {
  const { fiscalYear, source, grantType } = parameters;

  // Get system settings for site name and logo
  const settings = await prisma.systemSettings.findFirst();

  // Get all root folders with their files, excluding subfolders
  const folders = await prisma.folder.findMany({
    where: {
      fiscalYear: fiscalYear ? { name: fiscalYear } : undefined,
      source: source ? { name: source } : undefined,
      grantType: grantType ? { name: grantType } : undefined,
      isDeleted: false,
      parentId: null, // Only get root folders, exclude subfolders
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
    },
  });

  return {
    title: 'Empty Folders Report',
    siteName: settings?.siteName || 'File Management System',
    siteLogo: '/nepal-emblem.png', // Use default logo
    parameters,
    summary: {
      totalFolders: folders.length,
      emptyFolders: folders.filter(folder => folder.files.length === 0).length,
      foldersWithFiles: folders.filter(folder => folder.files.length > 0).length,
    },
    details: folders.map(folder => ({
      name: folder.name,
      fiscalYear: folder.fiscalYear?.name || 'N/A',
      source: folder.source?.name || 'N/A',
      grantType: folder.grantType?.name || 'N/A',
      createdAt: format(new Date(folder.createdAt), 'yyyy-MM-dd'),
      isEmpty: folder.files.length === 0,
    })),
  };
}

async function generateCustomReport(parameters: any) {
  const { startDate, endDate, fiscalYear, source, grantType } = parameters;

  // Get system settings for site name and logo
  const settings = await prisma.systemSettings.findFirst();

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
      parentId: null, // Only get root folders, exclude subfolders
    },
    include: {
      fiscalYear: true,
      source: true,
      grantType: true,
      files: {
        where: {
          isDeleted: false,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return {
    title: 'Folder Metadata Report',
    siteName: settings?.siteName || 'File Management System',
    siteLogo: '/nepal-emblem.png', // Use default logo
    parameters,
    summary: {
      totalFolders: folders.length,
      totalFiles: folders.reduce((sum, folder) => sum + folder.files.length, 0),
      totalSize: folders.reduce((sum, folder) => 
        sum + folder.files.reduce((fileSum, file) => fileSum + file.size, 0), 0
      ),
    },
    details: folders.map(folder => ({
      name: folder.name,
      fiscalYear: folder.fiscalYear?.name || 'N/A',
      source: folder.source?.name || 'N/A',
      grantType: folder.grantType?.name || 'N/A',
      createdAt: format(new Date(folder.createdAt), 'yyyy-MM-dd'),
    })),
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

  // Add logo and title on the same line
  if (data.siteLogo) {
    try {
      const logoPath = path.join(process.cwd(), 'public', data.siteLogo.replace('/', ''));
      if (fs.existsSync(logoPath)) {
        const imageBuffer = Buffer.from(fs.readFileSync(logoPath));
        const imageId = workbook.addImage({
          buffer: imageBuffer as any,
          extension: 'png',
        });
        
        // Set row height to accommodate logo
        worksheet.getRow(1).height = 35;

        // Add logo to the first row
        worksheet.addImage(imageId, {
          tl: { col: 0.1, row: 0.1 },
          ext: { width: 40, height: 40 }
        });
        
        // Add site name next to logo on the same row
        const titleCell = worksheet.getCell('B1');
        titleCell.value = data.siteName;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.mergeCells(`B1:${String.fromCharCode(65 + Math.max(Object.keys(data.details?.[0] || {}).length - 1, 5))}1`);
        worksheet.addRow([]); // empty row for spacing
      }
    } catch (error) {
      console.log('Could not add logo to Excel report:', error);
    }
  }

  // Add report title on the next line
  const reportTitleRow = worksheet.addRow([data.title || 'Report']);
  reportTitleRow.font = { bold: true, size: 14 };
  reportTitleRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells(`A${worksheet.rowCount}:${String.fromCharCode(65 + Math.max(Object.keys(data.details?.[0] || {}).length - 1, 5))}${worksheet.rowCount}`);
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

      // Add logo and site name on the same line
      if (data.siteLogo) {
        try {
          const logoPath = path.join(process.cwd(), 'public', data.siteLogo.replace('/', ''));
          if (fs.existsSync(logoPath)) {
            const imageBuffer = Buffer.from(fs.readFileSync(logoPath));
            const logoHeight = 25;
            const logoWidth = 25;
            doc.addImage(imageBuffer, 'PNG', margin, yPos, logoWidth, logoHeight);
            
            // Add site name next to the logo, vertically centered
            if (data.siteName) {
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(16);
              const textY = yPos + (logoHeight / 2);
              doc.text(String(data.siteName), margin + logoWidth + 5, textY, { baseline: 'middle' });
            }
            yPos += logoHeight + 10; // Move yPos below logo and add space
          }
        } catch (error) {
          console.log('Could not add logo to PDF report:', error);
        }
      } else if (data.siteName) {
        // If no logo, just add site name
        doc.setFont('helvetica', 'bold');
        addText(data.siteName, margin, 16);
        yPos += 20;
      }

      // Add report title on the next line
      doc.setFont('helvetica', 'bold');
      addText(data.title || 'Report', margin, 14);
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

        // Define columns for the report based on available data
        const availableKeys = Object.keys(data.details[0] || {});
        const columns = availableKeys.map(key => ({
          header: key.charAt(0).toUpperCase() + key.slice(1),
          key: key,
          width: 25
        }));

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