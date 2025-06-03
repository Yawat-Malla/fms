const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearData() {
  try {
    // First delete all files
    const deletedFiles = await prisma.file.deleteMany({});
    console.log(`Deleted ${deletedFiles.count} files`);

    // Then delete all folders
    const deletedFolders = await prisma.folder.deleteMany({});
    console.log(`Deleted ${deletedFolders.count} folders`);

    console.log('Successfully cleared all data from files and folders tables');
  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData(); 