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
    const validReportTypes = ['file_count', 'missing_uploads', 'recently_updated', 'custom'] as const;
    if (!validReportTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
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
        createdBy: session.user.id,
        createdAt,
      },
      include: {
        user: true,
      },
    });

    // Generate report based on type
    let reportData;
    switch (type) {
      case 'file_count':
        reportData = await generateFileCountReport(parameters);
        break;
      case 'missing_uploads':
        reportData = await generateMissingUploadsReport(parameters);
        break;
      case 'recently_updated':
        reportData = await generateRecentlyUpdatedReport(parameters);
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

  const files = await prisma.file.findMany({
    where: {
      uploadedAt: {
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
    },
  });

  return {
    title: 'File Count Report',
    parameters,
    summary: {
      totalFiles: files.length,
      byFiscalYear: groupBy(files, 'fiscalYear.name'),
      bySource: groupBy(files, 'source.name'),
      byGrantType: groupBy(files, 'grantType.name'),
    },
    details: files,
  };
}

async function generateMissingUploadsReport(parameters: any) {
  const { fiscalYear, source, grantType } = parameters;

  // Get all expected file patterns
  const expectedPatterns = await prisma.filePattern.findMany({
    where: {
      fiscalYear: fiscalYear ? { name: fiscalYear } : undefined,
      source: source ? { name: source } : undefined,
      grantType: grantType ? { name: grantType } : undefined,
    },
  });

  // Get actual uploaded files
  const uploadedFiles = await prisma.file.findMany({
    where: {
      fiscalYear: fiscalYear ? { name: fiscalYear } : undefined,
      source: source ? { name: source } : undefined,
      grantType: grantType ? { name: grantType } : undefined,
      isDeleted: false,
    },
  });

  // Find missing files
  const missingFiles = expectedPatterns.filter(pattern => {
    return !uploadedFiles.some(file => 
      file.name.match(pattern.pattern) &&
      file.fiscalYear?.name === pattern.fiscalYear?.name &&
      file.source?.name === pattern.source?.name &&
      file.grantType?.name === pattern.grantType?.name
    );
  });

  return {
    title: 'Missing Uploads Report',
    parameters,
    summary: {
      totalExpected: expectedPatterns.length,
      totalUploaded: uploadedFiles.length,
      totalMissing: missingFiles.length,
    },
    details: missingFiles,
  };
}

async function generateRecentlyUpdatedReport(parameters: any) {
  const { days = 30, fiscalYear, source, grantType } = parameters;

  const files = await prisma.file.findMany({
    where: {
      lastModifiedAt: {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
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
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      lastModifiedAt: 'desc',
    },
  });

  return {
    title: 'Recently Updated Files Report',
    parameters,
    summary: {
      totalFiles: files.length,
      byUser: groupBy(files, 'user.name'),
      byFiscalYear: groupBy(files, 'fiscalYear.name'),
    },
    details: files,
  };
}

async function generateCustomReport(parameters: any) {
  // Implement custom report logic based on parameters
  return {
    title: 'Custom Report',
    parameters,
    // Add custom implementation
  };
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
    if (typeof value === 'object') {
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
      doc.setFont(undefined, 'bold');
      addText(data.title, margin, 16);
      yPos += 15;

      // Add parameters section
      doc.setFont(undefined, 'bold');
      addText('Parameters:', margin, 12);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      Object.entries(data.parameters).forEach(([key, value]) => {
        if (value) {
          yPos += addText(`${key}: ${value}`, margin + 5, 10) * lineHeight;
        }
      });
      yPos += 10;

      // Add summary section
      doc.setFont(undefined, 'bold');
      addText('Summary:', margin, 12);
      yPos += 10;
      doc.setFont(undefined, 'normal');
      Object.entries(data.summary).forEach(([key, value]) => {
        if (typeof value === 'object') {
          yPos += addText(key, margin + 5, 10) * lineHeight;
          Object.entries(value).forEach(([subKey, subValue]) => {
            yPos += addText(`${subKey}: ${subValue}`, margin + 10, 10) * lineHeight;
          });
        } else {
          yPos += addText(`${key}: ${value}`, margin + 5, 10) * lineHeight;
        }
      });
      yPos += 10;

      // Add details if available
      if (data.details?.length > 0) {
        doc.setFont(undefined, 'bold');
        addText('Details:', margin, 12);
        yPos += 10;

        // Filter and rename relevant columns
        const relevantColumns = {
          'name': 'Name',
          'fiscalYear.name': 'Fiscal Year',
          'source.name': 'Source',
          'grantType.name': 'Grant Type',
          'uploadedAt': 'Upload Date',
          'user.name': 'Uploaded By'
        };

        // Extract only relevant data
        const filteredDetails = data.details.map(item => {
          const filtered: any = {};
          Object.entries(relevantColumns).forEach(([key, label]) => {
            // Handle nested properties
            const value = key.split('.').reduce((obj, k) => obj?.[k], item);
            if (value) {
              filtered[label] = key.includes('At') ? 
                format(new Date(value), 'yyyy-MM-dd') : 
                value;
            }
          });
          return filtered;
        });

        if (filteredDetails.length > 0) {
          const headers = Object.values(relevantColumns);
          const columnWidths = headers.map(header => {
            const maxContentLength = Math.max(
              header.length,
              ...filteredDetails.map(row => String(row[header] || '').length)
            );
            return Math.min(Math.max(maxContentLength * 4, 25), 40);
          });

          // Normalize column widths to fit page
          const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
          const scaleFactor = contentWidth / totalWidth;
          const finalColumnWidths = columnWidths.map(width => width * scaleFactor);

          // Draw table header
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
          doc.setTextColor(0, 0, 0);
          
          let xPos = margin;
          headers.forEach((header, index) => {
            doc.setFont(undefined, 'bold');
            addText(header, xPos, 10, finalColumnWidths[index]);
            xPos += finalColumnWidths[index];
          });
          yPos += 8;

          // Draw table rows
          doc.setFont(undefined, 'normal');
          filteredDetails.forEach((row, rowIndex) => {
            if (yPos > pageHeight - margin) {
              doc.addPage();
              yPos = margin;
              
              // Redraw header on new page
              doc.setFillColor(240, 240, 240);
              doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
              xPos = margin;
              headers.forEach((header, index) => {
                doc.setFont(undefined, 'bold');
                addText(header, xPos, 10, finalColumnWidths[index]);
                xPos += finalColumnWidths[index];
              });
              yPos += 8;
              doc.setFont(undefined, 'normal');
            }

            // Draw row background (alternating)
            if (rowIndex % 2 === 0) {
              doc.setFillColor(250, 250, 250);
              doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
            }

            xPos = margin;
            headers.forEach((header, index) => {
              const value = row[header] || '';
              addText(String(value), xPos, 9, finalColumnWidths[index]);
              xPos += finalColumnWidths[index];
            });
            yPos += 8;
          });

          // Draw table border
          doc.setDrawColor(200, 200, 200);
          doc.rect(margin, yPos - (filteredDetails.length * 8) - 5, contentWidth, (filteredDetails.length * 8) + 5);
        }
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