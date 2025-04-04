'use client';

import { useRouter } from 'next/navigation';

interface ErrorScreenProps {
    message?: string;
}

export default function ErrorScreen({ message = 'Access Denied' }: ErrorScreenProps) {
    const router = useRouter();

    return (
        <div className="hero min-h-[80vh] bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold text-error">Error</h1>
                    <p className="py-6 text-xl">{message}</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => router.back()}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
} 