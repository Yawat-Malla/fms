const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdminAccount() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    if (args.length !== 2) {
      console.error('Usage: npm run create-superadmin <email> <password>');
      process.exit(1);
    }

    const [email, password] = args;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format');
      process.exit(1);
    }

    // Validate password length
    if (password.length < 8) {
      console.error('Password must be at least 8 characters long');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('User with this email already exists');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create superadmin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'superadmin',
        active: true,
      },
    });

    console.log('Superadmin account created successfully:');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
  } catch (error) {
    console.error('Error creating superadmin account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdminAccount(); 