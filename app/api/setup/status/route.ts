import { NextResponse } from 'next/server';
import { checkSetupStatus } from '@/app/actions/userRolesClerk';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const status = await checkSetupStatus(userId);
        return NextResponse.json(status);
    } catch (error) {
        console.error('Error checking setup status:', error);
        return NextResponse.json({ error: 'Failed to check setup status' }, { status: 500 });
    }
} 