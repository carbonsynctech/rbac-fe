import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { userId: string; roleId: string } }
) {
    try {
        const { userId, roleId } = params;

        // First, get the current user data
        const getCurrentUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!getCurrentUser.ok) {
            const error = await getCurrentUser.json();
            return NextResponse.json(error, { status: getCurrentUser.status });
        }

        const currentUser = await getCurrentUser.json();
        const currentRoles = currentUser.public_metadata?.roles || [];
        
        // Filter out the role to be removed
        const updatedRoles = currentRoles.filter((role: any) => role.id !== roleId);

        // Update user with filtered roles
        const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public_metadata: {
                    ...currentUser.public_metadata,
                    roles: updatedRoles
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to remove user role' },
            { status: 500 }
        );
    }
} 