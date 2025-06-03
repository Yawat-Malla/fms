import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('Upload failed: No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('Upload failed: No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Upload failed: Invalid file type', file.type);
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Create profile pictures directory if it doesn't exist
    const profilePicsDir = join(process.cwd(), 'uploads', 'profile-pictures');
    await mkdir(profilePicsDir, { recursive: true });

    // Clean up old profile picture if it exists
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { profilePicture: true }
    });

    // Generate unique filename with proper extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const filename = `${session.user.id}-${timestamp}.${fileExtension}`;
    const filepath = join(profilePicsDir, filename);
    const profilePicturePath = `/uploads/profile-pictures/${filename}`;

    console.log('Upload - File details:', {
      filename,
      filepath,
      profilePicturePath,
      fileType: file.type
    });

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    try {
      await writeFile(filepath, buffer);
      console.log('Upload - Profile picture saved successfully:', filepath);
    } catch (error) {
      console.error('Upload - Error writing file:', error);
      return NextResponse.json(
        { error: 'Failed to save profile picture' },
        { status: 500 }
      );
    }

    // Update user profile in database with the new path
    try {
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          profilePicture: profilePicturePath,
        },
      });

      console.log('Upload - Database updated successfully:', {
        userId: user.id,
        profilePicture: profilePicturePath
      });

      return NextResponse.json({
        message: 'Profile picture updated successfully',
        user: {
          ...user,
          password: undefined,
        },
      });
    } catch (error) {
      console.error('Upload - Error updating user in database:', error);
      return NextResponse.json(
        { error: 'Failed to update profile picture in database' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
} 