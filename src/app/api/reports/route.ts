import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReportType, FileFormat } from '@prisma/client';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'node:buffer';
// @ts-ignore
import * as fontkit from 'fontkit';

// Base64 font strings (truncated for brevity, use full strings in real code)
const ANNAPURNA_SIL_REGULAR_BASE64 = "AAEAAAARAQAABAAQR0RFRgB4AfYAAeGMAAABHkdQT1OSAp8yAAGP8AAAACpHU1VCA8DdaQAABqQAAAA0T1MvMkBCLSwAAEK8AAAAYGNtYXABDQGXAAACDAAAAGxjdnQgACgAigAABUgAAAAiZnBnbQ/8ANgAAAZgAAAJcGdhc3AAAAAQAAHhoAAAAAhnbHlmwhsQjwAAFrgAAEEgaGVhZAReyIkAAEBcAAAANmhoZWEH3gOIAA9AIAAAACRobXR4BEcE/AAAD3gAAAS0bG9jYQF0AhIAAAmAAAAAIW1tYXABDQF5AAwAaAAAAChtYXhwAQ4B5wAPAFAAAAAgbmFtZQOKBQMAABVYAAABinBvc3QAAwAAAAACBpAAAAAOcHJlcGr+j9wAAAXsAAAAOAAIAAgACgADAAEAAQAAAAAEAAAAAPgBTAABAAAAAAAAAAAAAAAAAAAADgABAAAAAQAAeL9GXcVfDzz1AAsD6AAAAADbTfdtAAAAANtN920AAP/ABAADgAAAAAgAAgAAAAAAAAABAAAAA4AAAAEAAABfAAEAAAAAAAEADgBEAAEAAAAAAAIABwBMAAEAAAAAAAMADgBXAAEAAAAAAAQADgCgAAEAAAAAAAUACwDDAAEAAAAAAAYADgCrAAEAAAAAAAoANADIAAMAAQQJAAAAAgB4AAoAAwABBAkAAQAMAFIAAwABBAkAAgAOAFAAAwABBAkAAwAMAFgAAwABBAkABAAMAKQAAwABBAkABQAWANQAAwABBAkABgAMAKwAAwABBAkACgA0ANAAAAADAAAAAAAAABQACgAAQABfAFMAAAAAAQAJABQACgAAQABgAFMAAAAAAQALAAIAAAAADgAAAgAAAAADAAEAAwAAAAAAAP8AIAADAAEECQAAACAAeAAGAAEECQABAAwAUgAGAAEECQACAA4AUAAGAAEECQADAAwAWAAHAAEECQAEAAwAKQAHAAEECQAFABYAzAAHAAEECQAGAAwArAAHAAEECQAKADQAyAAAAAA=";
const ANNAPURNA_SIL_BOLD_BASE64 = "AAEAAAARAQAABAAQR0RFRgB4AfYAAeGMAAABHkdQT1OSAp8yAAGP8AAAACpHU1VCA8DdaQAABqQAAAA0T1MvMkBCLSwAAEK8AAAAYGNtYXABDQGXAAACDAAAAGxjdnQgACgAigAABUgAAAAiZnBnbQ/8ANgAAAZgAAAJcGdhc3AAAAAQAAHhoAAAAAhnbHlmwhsQjwAAFrgAAEEgaGVhZAReyIkAAEBcAAAANmhoZWEH3gOIAA9AIAAAACRobXR4BEcE/AAAD3gAAAS0bG9jYQF0AhIAAAmAAAAAIW1tYXABDQF5AAwAaAAAAChtYXhwAQ4B5wAPAFAAAAAgbmFtZQOKBQMAABVYAAABinBvc3QAAwAAAAACBpAAAAAOcHJlcGr+j9wAAAXsAAAAOAAIAAgACgADAAEAAQAAAAAEAAAAAPgBTAABAAAAAAAAAAAAAAAAAAAADgABAAAAAQAAeL9GXcVfDzz1AAsD6AAAAADbTfdtAAAAANtN920AAP/ABAADgAAAAAgAAgAAAAAAAAABAAAAA4AAAAEAAABfAAEAAAAAAAEADgBEAAEAAAAAAAIABwBMAAEAAAAAAAMADgBXAAEAAAAAAAQADgCgAAEAAAAAAAUACwDDAAEAAAAAAAYADgCrAAEAAAAAAAoANADIAAMAAQQJAAAAAgB4AAoAAwABBAkAAQAMAFIAAwABBAkAAgAOAFAAAwABBAkAAwAMAFgAAwABBAkABAAMAKQAAwABBAkABQAWANQAAwABBAkABgAMAKwAAwABBAkACgA0ANAAAAADAAAAAAAAABQACgAAQABfAFMAAAAAAQAJABQACgAAQABgAFMAAAAAAQALAAIAAAAADgAAAgAAAAADAAEAAwAAAAAAAP8AIAADAAEECQAAACAAeAAGAAEECQABAAwAUgAGAAEECQACAA4AUAAGAAEECQADAAwAWAAHAAEECQAEAAwAKQAHAAEECQAFABYAzAAHAAEECQAGAAwArAAHAAEECQAKADQAyAAAAAA=";

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

  const folderWhere = {
    createdAt: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
    fiscalYear: fiscalYear ? { name: fiscalYear } : undefined,
    source: source ? { name: source } : undefined,
    grantType: grantType ? { name: grantType } : undefined,
    isDeleted: false,
    parentId: null,
  };

  const folders = await prisma.folder.findMany({
    where: folderWhere,
    include: {
      fiscalYear: true,
      source: true,
      grantType: true,
    },
  });

  const files = await prisma.file.findMany({
    where: {
      isDeleted: false,
      folder: {
        isDeleted: false,
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
        fiscalYear: fiscalYear ? { name: fiscalYear } : undefined,
        source: source ? { name: source } : undefined,
        grantType: grantType ? { name: grantType } : undefined,
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
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
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
        titleCell.font = { name: 'Annapurna SIL', bold: true, size: 16 };
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
  reportTitleRow.font = { name: 'Annapurna SIL', bold: true, size: 14 };
  reportTitleRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells(`A${worksheet.rowCount}:${String.fromCharCode(65 + Math.max(Object.keys(data.details?.[0] || {}).length - 1, 5))}${worksheet.rowCount}`);
  worksheet.addRow([]);

  // Add parameters
  worksheet.addRow(['Parameters']).font = { name: 'Annapurna SIL', bold: true };
  Object.entries(data.parameters).forEach(([key, value]) => {
    worksheet.addRow([key, value]).font = { name: 'Annapurna SIL' };
  });
  worksheet.addRow([]);

  // Add summary
  worksheet.addRow(['Summary']).font = { name: 'Annapurna SIL', bold: true };
  Object.entries(data.summary).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      worksheet.addRow([key]).font = { name: 'Annapurna SIL' };
      Object.entries(value).forEach(([subKey, subValue]) => {
        worksheet.addRow([subKey, subValue]).font = { name: 'Annapurna SIL' };
      });
    } else {
      worksheet.addRow([key, value]).font = { name: 'Annapurna SIL' };
    }
  });
  worksheet.addRow([]);

  // Add details
  if (data.details?.length > 0) {
    worksheet.addRow(['Details']).font = { name: 'Annapurna SIL', bold: true };
    // Add headers
    const headers = Object.keys(data.details[0]);
    worksheet.addRow(headers).font = { name: 'Annapurna SIL', bold: true };

    // Add data
    data.details.forEach((row: any) => {
      worksheet.addRow(Object.values(row)).font = { name: 'Annapurna SIL' };
    });
  }

  // Save workbook
  await workbook.xlsx.writeFile(filePath);
}

async function generatePDFReport(data: any, filePath: string) {
  // Load the Unicode Devanagari font
  const fontPath = path.join(process.cwd(), 'src', 'fonts', 'NotoSansDevanagari-Regular.ttf');
  if (!fs.existsSync(fontPath)) {
    throw new Error('Font file NotoSansDevanagari-Regular.ttf not found in src/fonts/. Download it from Google Fonts.');
  }
  const fontBytes = fs.readFileSync(fontPath);

  // Create a new PDF
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const nepaliFont = await pdfDoc.embedFont(fontBytes);
  const englishFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const englishFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([595, 842]); // A4 size

  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Add logo and title
  if (data.siteLogo) {
    try {
      const logoPath = path.join(process.cwd(), 'public', data.siteLogo.replace('/', ''));
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const logoWidth = 40;
        const logoHeight = 40;
        page.drawImage(logoImage, {
          x: margin,
          y: y - logoHeight,
          width: logoWidth,
          height: logoHeight,
        });
        
        const siteName = data.siteNameNepali || data.siteName || '';
        // Segment siteName into Nepali and non-Nepali parts and draw each with the correct font
        const siteNameSegments = siteName.match(/[\u0900-\u097F]+|[^\u0900-\u097F]+/g) || [];
        let currentX = margin + logoWidth + 10;
        siteNameSegments.forEach((segment: string) => {
          const isNepali = /[\u0900-\u097F]/.test(segment);
          const font = isNepali ? nepaliFont : englishFontBold;
          page.drawText(segment, {
            x: currentX,
            y: y - logoHeight / 2 - 5,
            font,
            size: 20,
            color: rgb(0, 0, 0),
          });
          currentX += font.widthOfTextAtSize(segment, 20);
        });
        y -= logoHeight + 20;
      }
    } catch (error) {
      console.log('Could not add logo to PDF report:', error);
      // Fallback for title if logo fails
      const siteName = data.siteNameNepali || data.siteName || '';
      const siteNameSegments = siteName.match(/[\u0900-\u097F]+|[^\u0900-\u097F]+/g) || [];
      let currentX = margin;
      siteNameSegments.forEach((segment: string) => {
        const isNepali = /[\u0900-\u097F]/.test(segment);
        const font = isNepali ? nepaliFont : englishFontBold;
        page.drawText(segment, {
          x: currentX,
          y,
          font,
          size: 20,
          color: rgb(0, 0, 0),
        });
        currentX += font.widthOfTextAtSize(segment, 20);
      });
      y -= 30;
    }
  }
  
  // Draw a line under the header
  y -= 10
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  })
  y -= 10;

  // Report Title
  y -= 20;
  page.drawText(data.title || 'Report', {
    x: margin,
    y,
    font: englishFontBold,
    size: 18,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // Summary
  y -= 10;
  page.drawText('Summary', { x: margin, y, font: englishFontBold, size: 16, color: rgb(0.1, 0.1, 0.1) });
  y-=5
   page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  })
  y -= 20;
  Object.entries(data.summary).forEach(([key, value]) => {
    if (y < margin) {
      page = pdfDoc.addPage();
      y = height - margin;
    }
    if (typeof value === 'object' && value !== null) {
      page.drawText(`${formatSummaryKey(key)}:`, { x: margin + 10, y, font: englishFont, size: 12 });
      y -= 15;
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (y < margin) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
        const subKeyText = `- ${subKey}: `;
        const subValueText = String(subValue);
        const subKeyWidth = englishFont.widthOfTextAtSize(subKeyText, 12);

        page.drawText(subKeyText, { x: margin + 20, y, font: englishFont, size: 12, color: rgb(0,0,0) });
        page.drawText(subValueText, { x: margin + 20 + subKeyWidth, y, font: nepaliFont, size: 12, color: rgb(0,0,0) });
        y -= 15;
      });
    } else {
      const keyText = `${formatSummaryKey(key)}: `;
      const isNumericSummary = ['totalFolders', 'totalFiles', 'totalSize'].includes(key);
      const valueText = (key === 'totalSize') ? formatFileSize(value as number) : String(value);
      const valueFont = isNumericSummary ? englishFont : nepaliFont;
      const keyWidth = englishFont.widthOfTextAtSize(keyText, 12);

      page.drawText(keyText, { x: margin + 10, y, font: englishFont, size: 12, color: rgb(0,0,0) });
      page.drawText(valueText, { x: margin + 10 + keyWidth, y, font: valueFont, size: 12, color: rgb(0,0,0) });
      y -= 15;
    }
  });


  // Details Table
  if (data.details?.length > 0) {
    y -= 10;
    page.drawText('Details', { x: margin, y, font: englishFontBold, size: 16, color: rgb(0.1, 0.1, 0.1) });
     y-=5
   page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  })
    y -= 25;

    const table = {
      headers: Object.keys(data.details[0]),
      rows: data.details.map((row: any) => Object.values(row)),
    };

    const tableTop = y;
    const rowHeight = 20;
    const colWidth = (width - 2 * margin) / table.headers.length;
    
    // Draw table header
    page.drawRectangle({
        x: margin,
        y: y - 5,
        width: width - 2 * margin,
        height: rowHeight,
        color: rgb(0.95, 0.95, 0.95),
    });

    table.headers.forEach((header, i) => {
      page.drawText(String(header), {
        x: margin + i * colWidth + 5,
        y,
        font: englishFontBold,
        size: 10,
        color: rgb(0, 0, 0),
      });
    });
    y -= rowHeight;

    // Draw table rows
    table.rows.forEach((row: any[], rowIndex: number) => {
      if (y < margin + rowHeight) {
        page = pdfDoc.addPage();
        y = height - margin;
        // Redraw headers on new page
        page.drawRectangle({
            x: margin,
            y: y - 5,
            width: width - 2 * margin,
            height: rowHeight,
            color: rgb(0.95, 0.95, 0.95),
        });
        table.headers.forEach((header, i) => {
          page.drawText(String(header), {
            x: margin + i * colWidth + 5,
            y,
            font: englishFontBold,
            size: 10,
            color: rgb(0, 0, 0),
          });
        });
        y -= rowHeight;
      }
      
      // Zebra striping
      if(rowIndex % 2 !== 0){
          page.drawRectangle({
            x: margin,
            y: y - 5,
            width: width - 2 * margin,
            height: rowHeight,
            color: rgb(0.98, 0.98, 0.98),
        });
      }
      
      row.forEach((cell, i) => {
        const cellText = String(cell);
        const segments = cellText.match(/[\u0900-\u097F]+|[^\u0900-\u097F]+/g) || [];
        let currentX = margin + i * colWidth + 5;

        segments.forEach((segment: string) => {
            const isNepali = /[\u0900-\u097F]/.test(segment);
            const font = isNepali ? nepaliFont : englishFont;
            page.drawText(segment, {
                x: currentX,
                y,
                font: font,
                size: 10,
                color: rgb(0.3, 0.3, 0.3),
            });
            currentX += font.widthOfTextAtSize(segment, 10);
        });
      });
      y -= rowHeight;
    });
  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
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

// Helper function to format summary key
function formatSummaryKey(key: string): string {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
} 