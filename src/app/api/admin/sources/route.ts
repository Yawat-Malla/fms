import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const EN_PATH = path.join(process.cwd(), 'src/i18n/locales/en.json');
const NE_PATH = path.join(process.cwd(), 'src/i18n/locales/ne.json');

function updateTranslationFile(langPath: string, key: string, value: string, type: 'sources') {
  const data = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
  if (!data.reports) data.reports = {};
  if (!data.reports[type]) data.reports[type] = {};
  data.reports[type][key] = value;
  fs.writeFileSync(langPath, JSON.stringify(data, null, 2));
}

function deleteTranslationKey(langPath: string, key: string, type: 'sources') {
  const data = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
  if (data.reports && data.reports[type]) {
    delete data.reports[type][key];
    fs.writeFileSync(langPath, JSON.stringify(data, null, 2));
  }
}

export async function GET() {
  try {
    const sources = await prisma.source.findMany();
    const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));
    const ne = JSON.parse(fs.readFileSync(NE_PATH, 'utf-8'));

    return NextResponse.json(
      sources.map(source => ({
        ...source,
        translations: {
          en: en.reports?.sources?.[source.key] || source.name,
          ne: ne.reports?.sources?.[source.key] || source.name
        }
      }))
    );
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
  const { key, name, en: enVal, ne: neVal } = await req.json();

    // Validate required fields
    if (!key || !name) {
      return NextResponse.json(
        { error: 'Key and name are required' },
        { status: 400 }
      );
    }

    // Check if key already exists
    const existingSource = await prisma.source.findUnique({
      where: { key }
    });

    if (existingSource) {
      return NextResponse.json(
        { error: 'A source with this key already exists' },
        { status: 400 }
      );
    }

    // Create the source
    const created = await prisma.source.create({ 
      data: { key, name }
    });

    // Update translation files
    try {
      updateTranslationFile(EN_PATH, key, enVal || name, 'sources');
      updateTranslationFile(NE_PATH, key, neVal || name, 'sources');
    } catch (error) {
      console.error('Error updating translation files:', error);
      // Don't fail the request if translation update fails
    }

    return NextResponse.json({
      ...created,
      translations: {
        en: enVal || name,
        ne: neVal || name
      }
    });
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
} 