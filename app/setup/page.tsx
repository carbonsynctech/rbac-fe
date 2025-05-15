'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createSuperUser } from '../actions/userRolesClerk';
import SetupNotNeeded from '../components/SetupNotNeeded';

export default function SetupPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(true);

    useEffect(() => {
        const checkSetup = async () => {
            if (!isLoaded || !user) return;

            try {
                const response = await fetch(`/api/setup/status?userId=${user.id}`);
                if (!response.ok) {
                    throw new Error('Failed to check setup status');
                }
                const { needsSetup } = await response.json();
                setNeedsSetup(needsSetup);
                
                // TODO: Look at this later again
                if (!needsSetup) {
                    // router.push('/authorized');
                }
            } catch (err) {
                setError('Failed to check setup status');
            } finally {
                setLoading(false);
            }
        };

        checkSetup();
    }, [isLoaded, user, router]);

    const handleAccept = async () => {
        if (!user) return;
        
        try {
            await createSuperUser(user.id);
            router.push('/admin');
        } catch (err) {
            setError('Failed to create super user');
        }
    };

    const handleReject = () => {
        router.push('/unauthorized');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Not Authorized</h1>
                    <p>Please sign in to continue.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="alert alert-error max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (!needsSetup) {
        return <SetupNotNeeded />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Welcome to RBAC Admin!</h2>
                    <p>Would you like to become a Super Admin? This will give you full access to manage roles and permissions.</p>
                    <div className="card-actions justify-end mt-4">
                        <button onClick={handleReject} className="btn btn-ghost">No, thanks</button>
                        <button onClick={handleAccept} className="btn btn-primary">Yes, make me Super Admin</button>
                    </div>
                </div>
            </div>
        </div>
    );
} 