'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createSuperUser, checkSetupStatus } from '@/app/actions/userRolesClerk';
import { useRouter } from 'next/navigation';
import SetupNotNeeded from '@/app/components/SetupNotNeeded';

export default function SetupPage() {
    const { user, isLoaded } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function checkSetup() {
            if (!user) return;
            try {
                const { needsSetup } = await checkSetupStatus(user.id);
                setNeedsSetup(needsSetup);
            } catch (err) {
                setError('Failed to check setup status');
            } finally {
                setIsLoading(false);
            }
        }
        checkSetup();
    }, [user]);

    const handleAccept = async () => {
        if (!user) return;
        
        setIsLoading(true);
        setError(null);
        try {
            await createSuperUser(user.id);
            router.push('/admin');
        } catch (err) {
            setError('Failed to set up super user. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = () => {
        router.push('/unauthorized');
    };

    if (!isLoaded || isLoading) {
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
                    <p>Please sign in to access this page.</p>
                </div>
            </div>
        );
    }

    if (!needsSetup) {
        return <SetupNotNeeded />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold mb-4">Welcome to RBAC Admin</h2>
                    
                    <p className="mb-4">
                        You are the first user to access this system. Would you like to become the Super Admin?
                    </p>
                    
                    <p className="text-sm text-base-content/70 mb-6">
                        As a Super Admin, you will have full access to manage roles, permissions, and user assignments.
                    </p>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="card-actions justify-end gap-2">
                        <button
                            onClick={handleReject}
                            className="btn btn-ghost"
                            disabled={isLoading}
                        >
                            No, thanks
                        </button>
                        <button
                            onClick={handleAccept}
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Setting up...
                                </>
                            ) : (
                                'Yes, make me Super Admin'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 