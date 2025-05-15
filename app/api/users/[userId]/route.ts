import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {

        const { userId } = params;

        const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user from Clerk');
        }

        const user = await response.json();
        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
} 