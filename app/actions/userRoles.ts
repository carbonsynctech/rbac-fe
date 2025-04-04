import { getRoles, storeUserRoles } from "./rolePermissions";

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
            permissions: Array<{
                id: string;
                name: string;
            }>;
        }>;
    };
}

export async function getUsers(): Promise<ClerkUser[]> {
    const response = await fetch('/api/users');
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