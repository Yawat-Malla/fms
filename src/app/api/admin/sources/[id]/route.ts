import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { key, name, en: enVal, ne: neVal } = await req.json();
  const updated = await prisma.source.update({ where: { id: Number(params.id) }, data: { key, name } });
  updateTranslationFile(EN_PATH, key, enVal, 'sources');
  updateTranslationFile(NE_PATH, key, neVal, 'sources');
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const src = await prisma.source.delete({ where: { id: Number(params.id) } });
  deleteTranslationKey(EN_PATH, src.key, 'sources');
  deleteTranslationKey(NE_PATH, src.key, 'sources');
  return NextResponse.json({ success: true });
} 