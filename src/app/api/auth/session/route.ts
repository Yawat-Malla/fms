import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.json(session);
  } catch (error) {
    console.error('Session get error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { user } = body;

    if (!user) {
      return new NextResponse('Invalid request body', { status: 400 });
    }

    // Update the session
    session.user = {
      ...session.user,
      ...user,
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error('Session update error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 