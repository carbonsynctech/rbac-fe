import { neon } from "@neondatabase/serverless";
import { getRoles, storeUserRoles } from "./rolePermissionsNeon";

export interface ClerkUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
    emailAddresses: Array<{
        email_address: string;
    }>;
    publicMetadata: {
        roles?: Array<{
            id: string;
            name: string;
            is_admin_role: boolean;
            permissions: Array<{
                id: string;
                name: string;
            }>;
        }>;
    };
}

export async function checkSetupStatus(userId: string) {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Check if roles table is empty
    const rolesCount = await sql`SELECT COUNT(*) FROM roles`;
    const userRolesCount = await sql`SELECT COUNT(*) FROM user_roles`;

    // Check if user has any roles in Clerk
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch user from Clerk');
    }
    const userData = await response.json();
    const hasClerkRoles = userData.public_metadata?.roles?.length > 0;
    
    return {
        needsSetup: (rolesCount[0].count === 0 && userRolesCount[0].count === 0) || !hasClerkRoles
    };
}

export async function createSuperUser(userId: string): Promise<boolean> {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        
        // Create super role
        const superRole = await sql`
            INSERT INTO roles (name, is_admin_role)
            VALUES ('super', true)
            RETURNING *
        `;
        
        // Assign role to user in database
        await sql`
            INSERT INTO user_roles (user_id, role_id)
            VALUES (${userId}, ${superRole[0].id})
        `;
        
        // Update user's metadata in Clerk
        const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public_metadata: {
                    roles: [{
                        id: superRole[0].id,
                        name: 'super',
                        is_admin_role: true,
                        permissions: []
                    }]
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update user metadata in Clerk');
        }

        return true;
    } catch (error) {
        console.error('Error creating super user:', error);
        throw error instanceof Error ? error : new Error('Failed to create super user');
    }
}

export async function getUsers(): Promise<ClerkUser[]> {
    const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    const data = await response.json();
    return data.map((user: any) => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        emailAddresses: user.email_addresses.map((email: any) => ({
            email_address: email.email_address
        })),
        publicMetadata: user.public_metadata
    }));
}

export async function updateUserRoles(userId: string, roleIds: string[], operation: 'add' | 'set' = 'set') {
    try {
        const roles = await getRoles();
        const selectedRoles = roles.filter(role => roleIds.includes(role.id));
        
        // Update roles in Clerk
        const response = await fetch(`/api/users/${userId}/metadata`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public_metadata: {
                    roles: selectedRoles.map(role => ({
                        id: role.id,
                        name: role.name,
                        is_admin_role: role.is_admin_role,
                        permissions: role.permissions.map(p => ({
                            id: p.id,
                            name: p.name
                        }))
                    }))
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update user roles in Clerk');
        }

        // Store roles in database
        await storeUserRoles(userId, roleIds);

        return true;
    } catch (error) {
        console.error('Error updating user roles:', error);
        throw error instanceof Error ? error : new Error('Failed to update user roles');
    }
} 