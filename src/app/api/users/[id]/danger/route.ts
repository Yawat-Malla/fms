import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user's data
    await prisma.$transaction([
      // Delete notifications
      prisma.notification.deleteMany({
        where: { userId }
      }),
      // Delete files
      prisma.file.deleteMany({
        where: { uploadedBy: userId }
      }),
      // Delete folders
      prisma.folder.deleteMany({
        where: { createdBy: userId }
      }),
      // Delete reports
      prisma.report.deleteMany({
        where: { createdBy: userId }
      }),
      // Delete sync logs
      prisma.syncLog.deleteMany({
        where: { initiatedBy: userId }
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id: userId }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in dangerous operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'wipe_data') {
      // Delete all user's data except the account
      await prisma.$transaction([
        // Delete notifications
        prisma.notification.deleteMany({
          where: { userId }
        }),
        // Delete files
        prisma.file.deleteMany({
          where: { uploadedBy: userId }
        }),
        // Delete folders
        prisma.folder.deleteMany({
          where: { createdBy: userId }
        }),
        // Delete reports
        prisma.report.deleteMany({
          where: { createdBy: userId }
        }),
        // Delete sync logs
        prisma.syncLog.deleteMany({
          where: { initiatedBy: userId }
        })
      ]);

      return NextResponse.json({ success: true });
    } else if (action === 'reset_settings') {
      // Reset user settings to default
      await prisma.user.update({
        where: { id: userId },
        data: {
          notificationPreferences: {
            fileUpdates: true,
            securityAlerts: true,
            systemUpdates: false
          }
        }
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in dangerous operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 