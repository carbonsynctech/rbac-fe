'use client';

import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="max-w-md w-full p-8">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                        <div className="text-5xl mb-4">🔒</div>
                        <h1 className="card-title text-2xl mb-2">Access Denied</h1>
                        <p className="text-base-content/70 mb-6">
                            Sorry, you don't have permission to access this page.
                        </p>
                        <div className="card-actions">
                            <button 
                                onClick={() => router.back()}
                                className="btn btn-primary"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5 mr-2" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                                    />
                                </svg>
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 