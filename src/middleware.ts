import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Combined middleware function
async function mainMiddleware(request: NextRequest) {
  // Check if we're in maintenance mode
  try {
    const response = await fetch(`${request.nextUrl.origin}/api/settings`);
    const settings = await response.json();
    
    if (settings?.maintenanceMode) {
      // Allow access to auth pages and API routes
      if (
        request.nextUrl.pathname.startsWith('/api/') ||
        request.nextUrl.pathname.startsWith('/sign-in') ||
        request.nextUrl.pathname === '/maintenance'
      ) {
        return NextResponse.next();
      }

      // Check if user is an admin
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Allow admin users to bypass maintenance mode
      if (token?.role === 'admin') {
        return NextResponse.next();
      }

      // Redirect non-admin users to maintenance page
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
  }

  // If not in maintenance mode or if there was an error, proceed with auth check
  const token = await getToken({ req: request });
  
  // If the user is not logged in and trying to access a protected route
  if (!token) {
    // Check if the route should be protected
    const isProtectedRoute = !request.nextUrl.pathname.match(
      /^\/(?:sign-in|api\/auth|_next\/static|_next\/image|favicon\.ico|.*\.png|.*\.svg).*$/
    );

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

// Export the middleware function
export default mainMiddleware;

// Export the combined config for path matching
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /favicon.ico, /sitemap.xml (static files)
     * 4. Public assets
     */
    '/((?!api/auth|_next|favicon.ico|sitemap.xml|.*\\.png|.*\\.svg).*)',
  ],
}; 