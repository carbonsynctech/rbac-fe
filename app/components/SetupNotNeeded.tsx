'use client';

import { useRouter } from 'next/navigation';

export default function SetupNotNeeded() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold mb-4">Setup Not Required</h2>
                    
                    <p className="mb-4">
                        The system has already been set up with a Super Admin user.
                    </p>
                    
                    <p className="text-sm text-base-content/70 mb-6">
                        If you need to manage roles and permissions, please contact the Super Admin.
                    </p>

                    <div className="card-actions justify-end">
                        <button
                            onClick={() => router.push('/admin')}
                            className="btn btn-primary"
                        >
                            Go to Admin Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 