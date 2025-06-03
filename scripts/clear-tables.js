const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTables() {
  try {
    // Delete in order to handle foreign key constraints
    await prisma.file.deleteMany({});
    await prisma.folder.deleteMany({});
    await prisma.fiscalYear.deleteMany({});
    await prisma.source.deleteMany({});
    await prisma.grantType.deleteMany({});
    await prisma.syncLog.deleteMany({});
    await prisma.report.deleteMany({});
    console.log('All tables cleared successfully except users table');
  } catch (error) {
    console.error('Error clearing tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTables(); 