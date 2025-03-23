"use server";
import { neon } from "@neondatabase/serverless";

export interface Permission {
    id: string;
    name: string;
}

export interface Role {
    id: string;
    name: string;
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

export async function createRole(name: string) {
    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`INSERT INTO roles (name) VALUES (${name}) RETURNING *`;
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
    await sql`DELETE FROM roles WHERE id = ${roleId}`;
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
    const sql = neon(process.env.DATABASE_URL!);
    await sql`DELETE FROM role_permissions WHERE role_id = ${roleId} AND permission_id = ${permissionId}`;
} 