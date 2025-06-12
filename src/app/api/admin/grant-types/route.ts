import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

const EN_PATH = path.join(process.cwd(), 'src/i18n/locales/en.json');
const NE_PATH = path.join(process.cwd(), 'src/i18n/locales/ne.json');

function updateTranslationFile(langPath: string, key: string, value: string, type: 'grantTypes') {
  const data = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
  if (!data.reports) data.reports = {};
  if (!data.reports[type]) data.reports[type] = {};
  data.reports[type][key] = value;
  fs.writeFileSync(langPath, JSON.stringify(data, null, 2));
}

function deleteTranslationKey(langPath: string, key: string, type: 'grantTypes') {
  const data = JSON.parse(fs.readFileSync(langPath, 'utf-8'));
  if (data.reports && data.reports[type]) {
    delete data.reports[type][key];
    fs.writeFileSync(langPath, JSON.stringify(data, null, 2));
  }
}

export async function GET() {
  try {
    const grantTypes = await prisma.grantType.findMany();
    const en = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));
    const ne = JSON.parse(fs.readFileSync(NE_PATH, 'utf-8'));

    return NextResponse.json(
      grantTypes.map(grant => ({
        ...grant,
        translations: {
          en: en.reports?.grantTypes?.[grant.key] || grant.name,
          ne: ne.reports?.grantTypes?.[grant.key] || grant.name
        }
      }))
    );
  } catch (error) {
    console.error('Error fetching grant types:', error);
    return NextResponse.json({ error: 'Failed to fetch grant types' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { key, name, en: enVal, ne: neVal } = await req.json();
  const created = await prisma.grantType.create({ data: { key, name } });
  updateTranslationFile(EN_PATH, key, enVal, 'grantTypes');
  updateTranslationFile(NE_PATH, key, neVal, 'grantTypes');
  return NextResponse.json(created);
} 