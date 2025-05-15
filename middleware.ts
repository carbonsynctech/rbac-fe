import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { checkSetupStatus } from "./app/actions/userRolesClerk";

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
const isSetupRoute = createRouteMatcher(['/setup']);

export default clerkMiddleware(async (auth, request) => {
    // Checking clerk session
    const { sessionClaims, userId } = await auth();
    // Getting user roles from clerk metadata
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

    // // Only check setup status for the /setup route
    // if (isSetupRoute(request)) {
    //     try {
    //         const { needsSetup } = await checkSetupStatus(userId || '');
    //         // if (!needsSetup) {
    //         //     return NextResponse.redirect(new URL('/authorized', request.url));
    //         // }
    //     } catch (error) {
    //         console.error('Error checking setup status:', error);
    //     }
    // }
    
    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
