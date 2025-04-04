import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import { checkRole } from '@/utils/roles'
import { NextResponse, NextRequest } from 'next/server';

interface RoleWithPermissions {
  id: string;
  name: string;
  is_admin_role?: boolean;
  permissions: Array<{
    id: string;
    name: string;
  }>;
}

// Define route matchers
const isSubAdminRoute = createRouteMatcher(['/admin/sub/(.*)']);
const isMainAdminRoute = createRouteMatcher(['/admin', '/admin/assign']);

export default clerkMiddleware(async (auth, request) => {
  const { sessionClaims } = await auth();
  const userRoles = (sessionClaims?.metadata as { roles?: RoleWithPermissions[] })?.roles || [];

  // Check for main admin routes (requires super role)
  if (isMainAdminRoute(request)) {
    const hasAccess = userRoles.some(role => role.name === 'super');

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // Check for sub-admin routes
  if (isSubAdminRoute(request)) {
    const adminType = request.nextUrl.pathname.split('/')[3];
    
    const hasAccess = userRoles.some(role => 
      role.name === adminType && 
      role.is_admin_role === true
    );

    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
