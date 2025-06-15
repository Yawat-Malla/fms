import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type Params = { id: string };

// PATCH /api/users/[id] - Update a user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const { id } = params;
    console.log('[API Debug] PATCH request received for user ID:', id);
    
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('[API Debug] Session:', {
      hasSession: Boolean(session),
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });

    if (!session?.user?.email) {
      console.log('[API Debug] No session or email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user by ID instead of email
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    console.log('[API Debug] Current user lookup:', {
      lookupId: session.user.id,
      found: Boolean(currentUser),
      id: currentUser?.id,
      role: currentUser?.role,
      email: currentUser?.email
    });

    if (!currentUser) {
      console.log('[API Debug] Current user not found in database');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(id);
    console.log('[API Debug] Comparing IDs:', {
      currentUserId: currentUser.id,
      targetUserId: userId,
      isAdmin: currentUser.role === 'admin'
    });

    // Allow users to update their own profile or admins to update any profile
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      console.log('[API Debug] Authorization failed - not own profile and not admin');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[API Debug] Update data:', body);

    const { name, email, profilePicture, role, active, notificationPreferences, username } = body;

    // Build update data
    const updateData: any = {};

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (notificationPreferences !== undefined) updateData.notificationPreferences = notificationPreferences;
    if (username !== undefined) updateData.username = username;

    // Only superadmin can update role and active
    if (currentUser.role === 'superadmin') {
      if (role !== undefined) updateData.role = role;
      if (typeof active === 'boolean') updateData.active = active;
    }

    console.log('[API Debug] Final update data:', updateData);

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        lastLogin: true,
        active: true,
        createdAt: true,
        profilePicture: true,
        notificationPreferences: true,
        username: true,
      },
    });

    console.log('[API Debug] User updated successfully:', user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('[API Debug] Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<Params> }
): Promise<Response> {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || currentUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(id);

    // Prevent self-deletion
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        notificationPreferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 