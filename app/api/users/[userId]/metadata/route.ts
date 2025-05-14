import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params;
        const body = await request.json();
        const newRoles = body.public_metadata?.roles || [];

        // First, get the current user data
        const getCurrentUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('getCurrentUser', getCurrentUser);

        if (!getCurrentUser.ok) {
            const error = await getCurrentUser.json();
            return NextResponse.json(error, { status: getCurrentUser.status });
        }

        const currentUser = await getCurrentUser.json();
        
        // Update user with new roles, preserving other metadata
        const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public_metadata: {
                    ...currentUser.public_metadata,
                    roles: newRoles // Directly use the new roles array
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
        console.error('Error updating user metadata:', error);
        return NextResponse.json(
            { error: 'Failed to update user metadata' },
            { status: 500 }
        );
    }
} 