import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Find the first admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'admin'
      }
    });

    if (!adminUser) {
      console.log('No admin user found');
      return;
    }

    // Update the admin user to superadmin
    const updatedUser = await prisma.user.update({
      where: {
        id: adminUser.id
      },
      data: {
        role: 'superadmin'
      }
    });

    console.log('Successfully updated user to superadmin:', {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error updating user to superadmin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin(); 