"use server";
import { neon } from "@neondatabase/serverless";

export interface Permission {
    id: string;
    name: string;
}

export interface Role {
    id: string;
    name: string;
    parent_role_id: string | null;
    is_admin_role: boolean;
    permissions: Permission[];
}

export interface RoleWithPermissions extends Role {
    permissions: Permission[];
}

export async function getRoles() {
    const sql = neon(process.env.DATABASE_URL!);
    const roles = await sql`SELECT * FROM roles ORDER BY name` as Role[];
    const rolesWithPermissions: RoleWithPermissions[] = [];
    
    for (const role of roles) {
        const permissions = await sql`
            SELECT p.* FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ${role.id}
        `;
        rolesWithPermissions.push({
            id: role.id,
            name: role.name,
            parent_role_id: role.parent_role_id,
            is_admin_role: role.is_admin_role,
            permissions: permissions as Permission[]
        });
    }
    
    return rolesWithPermissions;
}

export async function getPermissions() {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT * FROM permissions ORDER BY name`;
    return result as Permission[];
}

export async function createRole(name: string, parentRoleId?: string, isAdminRole: boolean = false) {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
        INSERT INTO roles (name, parent_role_id, is_admin_role)
        VALUES (${name}, ${parentRoleId || null}, ${isAdminRole})
        RETURNING *
    `;
    return result[0] as Role;
}

export async function createPermission(name: string) {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`INSERT INTO permissions (name) VALUES (${name}) RETURNING *`;
    return result[0] as Permission;
}

export async function getRolePermissions(roleId: string) {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`
        SELECT p.* FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ${roleId}
    `;
    return result as Permission[];
}

export async function assignPermissionToRole(roleId: string, permissionId: string) {
    const sql = neon(process.env.DATABASE_URL!);
    return await sql`
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (${roleId}, ${permissionId})
        ON CONFLICT (role_id, permission_id) DO NOTHING
        RETURNING *
    `;
}

export async function deleteRole(roleId: string) {
    const sql = neon(process.env.DATABASE_URL!);
    
    try {
        // First get all users who have this role from the database
        const usersWithRole = await sql`
            SELECT user_id 
            FROM user_roles 
            WHERE role_id = ${roleId}
        `;
        
        // Delete the role from user_roles table
        await sql`DELETE FROM user_roles WHERE role_id = ${roleId}`;
        
        // Update each user's metadata in Clerk to remove the role
        for (const user of usersWithRole) {
            // First get the user's current metadata
            const userResponse = await fetch(`/api/users/${user.user_id}`);
            if (!userResponse.ok) {
                throw new Error(`Failed to fetch user ${user.user_id} from Clerk`);
            }
            const userData = await userResponse.json();
            
            // Filter out the role being deleted
            const updatedRoles = userData.public_metadata.roles?.filter(
                (role: { id: string }) => role.id !== roleId
            ) || [];

            //console.log('Updated roles:', updatedRoles);
            
            // Update the user's metadata with the filtered roles
            const updateResponse = await fetch(`/api/users/${user.user_id}/metadata`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    public_metadata: {
                        roles: updatedRoles
                    }
                })
            });

            if (!updateResponse.ok) {
                throw new Error(`Failed to update user ${user.user_id} metadata in Clerk`);
            }
        }

        // Finally delete the role itself
        await sql`DELETE FROM roles WHERE id = ${roleId}`;
        
        return true;
    } catch (error) {
        console.error('Error deleting role:', error);
        throw error instanceof Error ? error : new Error('Failed to delete role');
    }
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`DELETE FROM role_permissions WHERE role_id = ${roleId} AND permission_id = ${permissionId}`;
}

export async function getRolesByParent(parentRoleId: string | null) {
    const sql = neon(process.env.DATABASE_URL!);
    const roles = await sql`
        SELECT * FROM roles 
        WHERE parent_role_id = ${parentRoleId}
        ORDER BY name
    ` as Role[];
    return roles;
}

export async function storeUserRoles(userId: string, roleIds: string[]) {
    const sql = neon(process.env.DATABASE_URL!);
    
    // First, remove all existing roles for this user
    await sql`DELETE FROM user_roles WHERE user_id = ${userId}`;
    
    // Then insert the new roles
    if (roleIds.length > 0) {
        await sql`
            INSERT INTO user_roles (user_id, role_id)
            SELECT ${userId}, unnest(${roleIds}::uuid[])
        `;
    }
} 