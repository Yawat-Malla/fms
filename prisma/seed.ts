import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: await hash('password123', 12),
      role: 'admin',
    },
  });

    // Create fiscal years
  const fiscalYears = await Promise.all([
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2070/71',
        startDate: new Date('2023-07-01'),
        endDate: new Date('2024-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2071/72',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2025-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2072/73',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2026-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2073/74',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2027-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2074/75',
        startDate: new Date('2027-07-01'),
        endDate: new Date('2028-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2075/76',
        startDate: new Date('2028-07-01'),
        endDate: new Date('2029-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2076/77',
        startDate: new Date('2029-07-01'),
        endDate: new Date('2030-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2077/78',
        startDate: new Date('2030-07-01'),
        endDate: new Date('2031-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2078/79',
        startDate: new Date('2031-07-01'),
        endDate: new Date('2032-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2079/80',
        startDate: new Date('2032-07-01'),
        endDate: new Date('2033-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2080/81',
        startDate: new Date('2033-07-01'),
        endDate: new Date('2034-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2081/82',
        startDate: new Date('2034-07-01'),
        endDate: new Date('2035-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2082/83',
        startDate: new Date('2035-07-01'),
        endDate: new Date('2036-06-30'),
      },
    }),
    prisma.fiscalYear.create({
      data: {
        name: 'FY 2083/84',
        startDate: new Date('2036-07-01'),
        endDate: new Date('2037-06-30'),
      },
    }),
  ]);

    // Create sources
  const sources = await Promise.all([
    prisma.source.create({
      data: { 
        name: 'Federal Government',
        key: 'federal_government'
      },
    }),
    prisma.source.create({
      data: { 
        name: 'Provincial Government',
        key: 'provincial_government'
      },
    }),
    prisma.source.create({
      data: { 
        name: 'Local Municipality',
        key: 'local_municipality'
      },
    }),
    prisma.source.create({
      data: { 
        name: 'Other',
        key: 'other'
      },
    }),
  ]);

    // Create grant types
  const grantTypes = await Promise.all([
    prisma.grantType.create({
      data: { 
        name: 'Current Expenditure',
        key: 'current_expenditure'
      },
    }),
    prisma.grantType.create({
      data: { 
        name: 'Capital Expenditure',
        key: 'capital_expenditure'
      },
    }),
    prisma.grantType.create({
      data: { 
        name: 'Supplementary Grant',
        key: 'supplementary_grant'
      },
    }),
    prisma.grantType.create({
      data: { 
        name: 'Special Grant',
        key: 'special_grant'
      },
    }),
    prisma.grantType.create({
      data: { 
        name: 'Other',
        key: 'other'
      },
    }),
  ]);

  // Create root folders
  const rootFolders = await Promise.all([
    prisma.folder.create({
      data: {
        name: 'Research Projects',
        path: '/research',
        createdBy: user.id,
        fiscalYearId: fiscalYears[0].id,
        sourceId: sources[0].id,
        grantTypeId: grantTypes[0].id,
      },
    }),
    prisma.folder.create({
      data: {
        name: 'Development Initiatives',
        path: '/development',
        createdBy: user.id,
        fiscalYearId: fiscalYears[1].id,
        sourceId: sources[1].id,
        grantTypeId: grantTypes[1].id,
      },
    }),
  ]);

  // Create subfolders
  const subfolders = await Promise.all([
    prisma.folder.create({
      data: {
        name: 'Q1 Reports',
        path: '/research/q1',
        parentId: rootFolders[0].id,
        createdBy: user.id,
        fiscalYearId: fiscalYears[0].id,
        sourceId: sources[0].id,
        grantTypeId: grantTypes[0].id,
      },
    }),
    prisma.folder.create({
      data: {
        name: 'Q2 Reports',
        path: '/research/q2',
        parentId: rootFolders[0].id,
        createdBy: user.id,
        fiscalYearId: fiscalYears[0].id,
        sourceId: sources[0].id,
        grantTypeId: grantTypes[0].id,
      },
    }),
  ]);

  // Create files
  const fileTypes = [
    { type: 'application/pdf', name: 'Report' },
    { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Document' },
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', name: 'Spreadsheet' },
    { type: 'image/jpeg', name: 'Image' },
  ];

  const files = await Promise.all([
    // Files in root folders
    ...rootFolders.flatMap((folder) =>
      fileTypes.map((fileType, index) =>
        prisma.file.create({
          data: {
            name: `${folder.name} ${fileType.name} ${index + 1}`,
            path: `${folder.path}/file${index + 1}`,
            type: fileType.type,
            size: Math.floor(Math.random() * 1000000) + 1000,
            status: Math.random() > 0.5 ? 'online' : 'offline',
            uploadedBy: user.id,
            folderId: folder.id,
            localHash: `hash-${Math.random().toString(36).substring(7)}`,
            fiscalYearId: folder.fiscalYearId,
            sourceId: folder.sourceId,
            grantTypeId: folder.grantTypeId,
          },
        })
      )
    ),
    // Files in subfolders
    ...subfolders.flatMap((folder) =>
      fileTypes.map((fileType, index) =>
        prisma.file.create({
          data: {
            name: `${folder.name} ${fileType.name} ${index + 1}`,
            path: `${folder.path}/file${index + 1}`,
            type: fileType.type,
            size: Math.floor(Math.random() * 1000000) + 1000,
            status: Math.random() > 0.5 ? 'online' : 'offline',
            uploadedBy: user.id,
            folderId: folder.id,
            localHash: `hash-${Math.random().toString(36).substring(7)}`,
            fiscalYearId: folder.fiscalYearId,
            sourceId: folder.sourceId,
            grantTypeId: folder.grantTypeId,
          },
        })
      )
    ),
  ]);

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 