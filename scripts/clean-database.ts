import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('Starting database cleanup...');

    // Delete data in reverse order of dependencies
    console.log('Deleting Reports...');
    await prisma.report.deleteMany();

    console.log('Deleting SyncLogs...');
    await prisma.syncLog.deleteMany();

    console.log('Deleting Files...');
    await prisma.file.deleteMany();

    console.log('Deleting Folders...');
    await prisma.folder.deleteMany();

    console.log('Deleting GrantTypes...');
    await prisma.grantType.deleteMany();

    console.log('Deleting Sources...');
    await prisma.source.deleteMany();

    console.log('Deleting FiscalYears...');
    await prisma.fiscalYear.deleteMany();

    console.log('Database cleanup completed successfully!');
  } catch (error) {
    console.error('Error during database cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase(); 