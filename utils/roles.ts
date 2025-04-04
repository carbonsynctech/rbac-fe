import { auth } from '@clerk/nextjs/server'

interface RoleWithPermissions {
    id: string;
    name: string;
    is_admin_role?: boolean;  // Add this field
    permissions: Array<{
      id: string;
      name: string;
    }>;
  }
  
  export const checkRole = async (requiredRole: string, requireAdmin: boolean = false) => {
    const { sessionClaims } = await auth()
    
    // Access the roles from the JWT token's metadata
    const userRoles = (sessionClaims?.metadata as { roles?: RoleWithPermissions[] })?.roles || []
    
    // Check if the user has the required role and admin status if required
    return userRoles.some(role => 
      role.name === requiredRole && 
      (!requireAdmin || role.is_admin_role === true)
    )
  }

// Optional: Helper to check for specific permission
export const checkPermission = async (requiredPermission: string) => {
  const { sessionClaims } = await auth()
  
  // Access the roles from the JWT token's metadata
  const userRoles = (sessionClaims?.metadata as { roles?: RoleWithPermissions[] })?.roles || []
  
  // Check if any role has the required permission
  return userRoles.some(role => 
    role.permissions.some(permission => permission.name === requiredPermission)
  )
}