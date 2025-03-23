'use client';

import { useEffect, useState } from 'react';

interface User {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    email_address?: string;
}

const UserCard = ({ user }: { user: User }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-4">
            <div className="flex items-center gap-4">
                {user.image_url && (
                    <img 
                        src={user.image_url} 
                        alt={`${user.first_name || 'User'}'s avatar`}
                        className="w-12 h-12 rounded-full"
                    />
                )}
                <div>
                    <h2 className="text-xl font-semibold">
                        {user.first_name} {user.last_name}
                    </h2>
                    {/* <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p> */}
                </div>
            </div>
        </div>
    );
};

const AdminPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Page</h1>
            
            {loading && <p>Loading users...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            
            <div className="space-y-4">
                {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                ))}
            </div>
        </div>
    );
};

export default AdminPage;

