'use server';

import { checkSetupStatus as checkDatabaseSetup, createSuperRole, getRoles, storeUserRoles } from "./rolePermissionsNeon";
//import { createClerkClient } from '@clerk/backend';
import { clerkClient } from '@clerk/nextjs/server';


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

// Seems to be fully working
export async function checkSetupStatus(userId: string): Promise<{ needsSetup: boolean }> {
    // Check database status
    const { rolesCount, userRolesCount } = await checkDatabaseSetup();
    
    // Check if user has any roles in Clerk
    try {
        //const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        const hasClerkRoles = (user.publicMetadata.roles as Array<any> || []).length > 0;
        
        return {
            needsSetup: (rolesCount === 0 && userRolesCount === 0) || !hasClerkRoles
        };
    } catch (error) {
        console.error('Error fetching user from Clerk:', error);
        // If we can't find the user, assume setup is needed
        return { needsSetup: true };
    }
}

// Checking this now
export async function createSuperUser(userId: string): Promise<boolean> {
    try {
        // Create super role in database
        const superRole = await createSuperRole(userId);
        
        // Update user's metadata in Clerk
        //const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
                roles: [{
                    id: superRole.id,
                    name: 'super',
                    is_admin_role: true,
                    permissions: []
                }]
            }
        });

        return true;
    } catch (error) {
        console.error('Error creating super user:', error);
        throw error instanceof Error ? error : new Error('Failed to create super user');
    }
}

export async function getUsers(): Promise<ClerkUser[]> {
    //const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerk = await clerkClient();
    const { data: users } = await clerk.users.getUserList();
    return users.map((user: any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        emailAddresses: user.emailAddresses.map((email: any) => ({
            email_address: email.emailAddress
        })),
        publicMetadata: user.publicMetadata
    }));
}

export async function updateUserRoles(userId: string, roleIds: string[], operation: 'add' | 'set' = 'set') {
    try {
        const roles = await getRoles();
        const selectedRoles = roles.filter(role => roleIds.includes(role.id));
        
        // Update roles in Clerk
        //const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(userId, {
            publicMetadata: {
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
        });

        // Store roles in database
        await storeUserRoles(userId, roleIds);

        return true;
    } catch (error) {
        console.error('Error updating user roles:', error);
        throw error instanceof Error ? error : new Error('Failed to update user roles');
    }
} 