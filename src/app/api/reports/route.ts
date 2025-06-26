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
import puppeteer from 'puppeteer';
import neTranslations from '@/i18n/locales/ne.json';
import BikramSambat, { ADToBS } from 'bikram-sambat-js';

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

// Helper to convert English numbers to Nepali
function toNepaliNumber(str: string | number): string {
  return String(str).replace(/[0-9]/g, d =>
    '०१२३४५६७८९'[parseInt(d)]
  );
}

// Helper to map source, grantType, fiscalYear to Nepali
function getNepaliSource(source: string) {
  const key = source.toLowerCase();
  // Try files.filters.bySource first
  const bySource = (neTranslations.files?.filters?.bySource as Record<string, string>) || {};
  if (bySource[key]) return bySource[key];
  // Then try reports.sources
  const reportSources = (neTranslations.reports?.sources as Record<string, string>) || {};
  if (reportSources[key]) return reportSources[key];
  // Fallback to key
  return source;
}
function getNepaliGrantType(type: string) {
  // Try files.filters.byGrantType first
  const byGrantType = (neTranslations.files?.filters?.byGrantType as Record<string, string>) || {};
  if (byGrantType[type]) return byGrantType[type];
  // Then try reports.grantTypes
  const reportGrantTypes = (neTranslations.reports?.grantTypes as Record<string, string>) || {};
  if (reportGrantTypes[type]) return reportGrantTypes[type];
  // Fallback to key
  return type;
}
function getNepaliFiscalYear(fy: string) {
  // Try to convert numbers to Nepali
  return toNepaliNumber(fy);
}
function getNepaliDate(date: string) {
  // Only convert numbers, not month names
  return toNepaliNumber(date);
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
      // Nepali column headings (user provided)
      const nepaliHeaders = [
        'क्र.सं.', // S.N.
        'कार्यक्रमको नाम', // Name
        'श्रोत', // Source
        'प्रकार', // grantType
        'आर्थिक वर्ष', // fiscalYear
        'प्रविष्टि मिति', // createdDate
        'कैफियत' // Remarks
      ];
      // Prepare logo as base64 data URL
      let logoDataUrl = '';
      try {
        let logoPath = reportData.siteLogo || '/nepal-emblem.png';
        if (logoPath.startsWith('/')) logoPath = logoPath.slice(1);
        const absLogoPath = path.join(process.cwd(), 'public', logoPath);
        if (fs.existsSync(absLogoPath)) {
          const logoBuffer = fs.readFileSync(absLogoPath);
          const ext = logoPath.split('.').pop()?.toLowerCase() || 'png';
          logoDataUrl = `data:image/${ext};base64,${logoBuffer.toString('base64')}`;
        }
      } catch (e) {
        logoDataUrl = '';
      }
      // Map details to match the new order and field mapping
      const detailsWithSN = reportData.details.map((row: any, idx: number) => ({
        sn: toNepaliNumber(idx + 1),
        name: row.name,
        source: getNepaliSource(row.source),
        grantType: getNepaliGrantType(row.grantType),
        fiscalYear: getNepaliFiscalYear(row.fiscalYear),
        createdAt: getNepaliDate(row.createdAt),
        remarks: ''
      }));
      // Prepare dynamic intro text with AD to BS conversion and conditional logic
      // Determine if 'all' is selected for fiscal year, date range, grant type, or source
      const isAllFiscalYear = !parameters.fiscalYear || parameters.fiscalYear === 'all';
      const isAllDateRange = !parameters.startDate || !parameters.endDate || parameters.startDate === 'all' || parameters.endDate === 'all';
      const isAllGrantType = !parameters.grantType || parameters.grantType === 'all';
      const isAllSource = !parameters.source || parameters.source === 'all';

      // Grant type and source (Nepali or 'सबै'/'सबै प्रकार')
      const selectedGrantType = isAllGrantType ? 'सबै प्रकार' : getNepaliGrantType(parameters.grantType || '');
      const selectedSource = isAllSource ? 'सबै' : getNepaliSource(parameters.source || '');
      // Fiscal year (Nepali or skip)
      let selectedFiscalYear = '';
      if (!isAllFiscalYear && parameters.fiscalYear) {
        // Fetch fiscal year name from DB if ID is provided
        const fyRecord = await prisma.fiscalYear.findUnique({
          where: { id: Number(parameters.fiscalYear) },
          select: { name: true },
        });
        if (fyRecord && fyRecord.name) {
          // Remove 'FY' prefix if present
          let fyName = fyRecord.name.trim();
          if (fyName.startsWith('FY')) {
            fyName = fyName.replace(/^FY\s*/, '');
          }
          selectedFiscalYear = getNepaliFiscalYear(fyName);
        } else {
          selectedFiscalYear = getNepaliFiscalYear(parameters.fiscalYear);
        }
      }
      // Date range (BS or 'सबै')
      let selectedStartDate = '';
      let selectedEndDate = '';
      if (isAllDateRange) {
        selectedStartDate = 'सबै';
        selectedEndDate = '';
      } else {
        // Convert AD to BS and then to Nepali numerals
        try {
          const bsStart = ADToBS(format(new Date(parameters.startDate), 'yyyy-MM-dd'));
          const bsEnd = ADToBS(format(new Date(parameters.endDate), 'yyyy-MM-dd'));
          selectedStartDate = toNepaliNumber(bsStart.replace(/-/g, '/'));
          selectedEndDate = toNepaliNumber(bsEnd.replace(/-/g, '/'));
        } catch (e) {
          selectedStartDate = '';
          selectedEndDate = '';
        }
      }
      // Compose intro text
      let introText = '';
      if (!isAllFiscalYear) {
        introText += `आर्थिक वर्ष ${selectedFiscalYear} को लागि तयार पारिएको यो प्रतिवेदनमा `;
      } else {
        introText += 'यो प्रतिवेदनमा ';
      }
      if (isAllDateRange) {
        introText += `सबै `;
      } else {
        introText += `मिति ${selectedStartDate} देखि ${selectedEndDate} को अवधिमा `;
      }
      introText += 'अपलोड गरिएका कार्यक्रमका फाइलहरूको विवरण समेटिएको छ। ';
      introText += `सो प्रतिवेदन ${selectedSource} स्रोत अन्तर्गतको ${selectedGrantType} को आधारमा तयार पारिएको हो।`;
      await generatePDFWithPuppeteer({
        siteLogo: logoDataUrl,
        siteName: reportData.siteName,
        introText,
        heading: 'समग्र विवरणहरू',
        details: detailsWithSN,
        tableHeaders: nepaliHeaders
      }, filePath);
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

  // Always use fiscalYearId for filtering
  let fiscalYearFilter = undefined;
  if (fiscalYear) {
    fiscalYearFilter = { fiscalYearId: Number(fiscalYear) };
  }

  const folders = await prisma.folder.findMany({
    where: {
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      ...fiscalYearFilter,
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
    siteLogo: settings?.siteLogo || '/nepal-emblem.png', // Use saved logo or default
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
      source: folder.source?.key || folder.source?.name || 'N/A',
      grantType: folder.grantType?.key || folder.grantType?.name || 'N/A',
      createdAt: format(new Date(folder.createdAt), 'yyyy-MM-dd'),
    })),
  };
}

async function generateMissingUploadsReport(parameters: any) {
  const { fiscalYear, source, grantType } = parameters;

  // Get system settings for site name and logo
  const settings = await prisma.systemSettings.findFirst();

  // Always use fiscalYearId for filtering
  let fiscalYearFilter = undefined;
  if (fiscalYear) {
    fiscalYearFilter = { fiscalYearId: Number(fiscalYear) };
  }

  // Get all root folders with their files, excluding subfolders
  const folders = await prisma.folder.findMany({
    where: {
      ...fiscalYearFilter,
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
    siteLogo: settings?.siteLogo || '/nepal-emblem.png', // Use saved logo or default
    parameters,
    summary: {
      totalFolders: folders.length,
      emptyFolders: folders.filter(folder => folder.files.length === 0).length,
      foldersWithFiles: folders.filter(folder => folder.files.length > 0).length,
    },
    details: folders.map(folder => ({
      name: folder.name,
      fiscalYear: folder.fiscalYear?.name || 'N/A',
      source: folder.source?.key || folder.source?.name || 'N/A',
      grantType: folder.grantType?.key || folder.grantType?.name || 'N/A',
      createdAt: format(new Date(folder.createdAt), 'yyyy-MM-dd'),
      isEmpty: folder.files.length === 0,
    })),
  };
}

async function generateCustomReport(parameters: any) {
  let { startDate, endDate, fiscalYear, source, grantType } = parameters;

  // Treat 'all', empty string, and undefined as no filter
  if (!startDate || startDate === 'all' || startDate === '') startDate = undefined;
  if (!endDate || endDate === 'all' || endDate === '') endDate = undefined;
  if (!fiscalYear || fiscalYear === 'all' || fiscalYear === '') fiscalYear = undefined;
  if (!source || source === 'all' || source === '') source = undefined;
  if (!grantType || grantType === 'all' || grantType === '') grantType = undefined;

  // Get system settings for site name and logo
  const settings = await prisma.systemSettings.findFirst();

  // Always use fiscalYearId for filtering
  let fiscalYearFilter = undefined;
  if (fiscalYear) {
    fiscalYearFilter = { fiscalYearId: Number(fiscalYear) };
  }

  const folderWhere = {
    createdAt: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
    ...fiscalYearFilter,
    source: source ? { key: source } : undefined,
    grantType: grantType ? { key: grantType } : undefined,
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
        ...fiscalYearFilter,
        source: source ? { key: source } : undefined,
        grantType: grantType ? { key: grantType } : undefined,
      },
    },
  });

  return {
    title: 'Folder Metadata Report',
    siteName: settings?.siteName || 'File Management System',
    siteLogo: settings?.siteLogo || '/nepal-emblem.png', // Use saved logo or default
    parameters,
    summary: {
      totalFolders: folders.length,
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
    },
    details: folders.map(folder => ({
      name: folder.name,
      fiscalYear: folder.fiscalYear?.name || 'N/A',
      source: folder.source?.key || folder.source?.name || 'N/A',
      grantType: folder.grantType?.key || folder.grantType?.name || 'N/A',
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
  y -= 10;
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: width - margin, y: y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 20;

  // Nepali intro paragraph
  const introText =
    'आर्थिक वर्ष २०८०/८१ को लागि तयार पारिएको यो प्रतिवेदनमा मिति २०८१/०२/१५ देखि २०८१/०३/१५ को अवधिमा अपलोड गरिएका कार्यक्रमका फाइलहरूको विवरण समेटिएको छ। सो प्रतिवेदन संघीय सरकार स्रोत अन्तर्गतको सशर्त अनुदानको आधारमा तयार पारिएको हो।';
  const introFontSize = 12;
  const introLineHeight = 18;
  const introWidth = width - 2 * margin;
  // Improved line wrapping for Nepali: wrap at character level
  let introLines = [];
  let currentLine = '';
  for (const char of introText) {
    const testLine = currentLine + char;
    const testWidth = nepaliFont.widthOfTextAtSize(testLine, introFontSize);
    if (testWidth > introWidth && currentLine) {
      introLines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) introLines.push(currentLine);
  introLines.forEach(line => {
    page.drawText(line, {
      x: margin,
      y,
      font: nepaliFont,
      size: introFontSize,
      color: rgb(0, 0, 0),
    });
    y -= introLineHeight;
  });
  y -= 10;

  // Centered heading
  const heading = 'समग्र विवरणहरू';
  const headingFontSize = 16;
  const headingWidth = nepaliFont.widthOfTextAtSize(heading, headingFontSize);
  page.drawText(heading, {
    x: margin + (introWidth - headingWidth) / 2,
    y,
    font: nepaliFont,
    size: headingFontSize,
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

// Generate PDF using Puppeteer for proper Nepali rendering
async function generatePDFWithPuppeteer(data: any, filePath: string) {
  // Prepare the HTML by rendering a template (to be created)
  const fs = require('fs');
  const path = require('path');
  const templatePath = path.join(process.cwd(), 'src', 'app', 'api', 'reports', 'report-template.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  // Simple variable replacement (for now)
  html = html.replace('{{siteLogo}}', data.siteLogo || '/nepal-emblem.png');
  html = html.replace('{{siteName}}', data.siteName || '');
  html = html.replace('{{introText}}', data.introText || '');
  html = html.replace('{{heading}}', data.heading || '');

  // Table rows
  let tableRows = '';
  if (data.details && data.details.length > 0) {
    for (const row of data.details) {
      tableRows += '<tr>' +
        `<td>${row.sn}</td>` +
        `<td>${row.name}</td>` +
        `<td>${row.source}</td>` +
        `<td>${row.grantType}</td>` +
        `<td>${row.fiscalYear}</td>` +
        `<td>${row.createdAt}</td>` +
        `<td>${row.remarks}</td>` +
        '</tr>';
    }
  }
  html = html.replace('{{tableRows}}', tableRows);

  // Table headers
  let tableHeaders = '';
  if (data.tableHeaders && Array.isArray(data.tableHeaders)) {
    tableHeaders = (data.tableHeaders as string[]).map((header: string) => `<th>${header}</th>`).join('');
  }
  html = html.replace('{{tableHeaders}}', tableHeaders);

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: filePath, format: 'A4', printBackground: true });
  await browser.close();
} 