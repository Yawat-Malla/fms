import prisma from './prisma';

type NotificationType = 'file_update' | 'security_alert' | 'system_update';

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  message: string;
}

export async function createNotification({ userId, type, message }: CreateNotificationParams) {
  try {
    // Get user's notification preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true }
    });

    if (!user) return null;

    const preferences = user.notificationPreferences as {
      fileUpdates: boolean;
      securityAlerts: boolean;
      systemUpdates: boolean;
    };

    // Check if user has enabled this type of notification
    const isEnabled = (() => {
      switch (type) {
        case 'file_update':
          return preferences.fileUpdates;
        case 'security_alert':
          return preferences.securityAlerts;
        case 'system_update':
          return preferences.systemUpdates;
        default:
          return false;
      }
    })();

    if (!isEnabled) return null;

    // Create the notification
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title: type === 'file_update' ? 'File Update' : type === 'security_alert' ? 'Security Alert' : 'System Update',
        message,
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Helper functions for common notification types
export async function notifyFileUpdate(userId: number, fileName: string, action: string) {
  let message = '';
  switch (action) {
    case 'uploaded':
      message = `A new file "${fileName}" was added`;
      break;
    case 'updated':
      message = `File "${fileName}" was updated`;
      break;
    case 'deleted':
      message = `File "${fileName}" was deleted`;
      break;
    default:
      message = `File "${fileName}" was ${action}`;
  }

  return createNotification({
    userId,
    type: 'file_update',
    message,
  });
}

export async function notifySecurityAlert(userId: number, message: string) {
  return createNotification({
    userId,
    type: 'security_alert',
    message,
  });
}

export async function notifySystemUpdate(userId: number, message: string) {
  return createNotification({
    userId,
    type: 'system_update',
    message,
  });
} 