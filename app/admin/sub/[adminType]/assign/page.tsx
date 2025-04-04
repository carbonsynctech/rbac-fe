'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ClerkUser, getUsers } from '@/app/actions/userRoles';
import { Role, getRoles } from '@/app/actions/rolePermissions';
import AssignRolesModal from '@/app/components/AssignRolesModal';

export default function SubAdminAssignPage() {
    const params = useParams();
    const adminType = params.adminType as string;
    const { user } = useUser();
    
    const [adminRoleId, setAdminRoleId] = useState<string>('');
    const [users, setUsers] = useState<ClerkUser[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<ClerkUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const roles = user?.publicMetadata?.roles as Array<any> || [];
        const adminRole = roles.find(
            (role) => role.name === adminType && role.is_admin_role
        );
        if (adminRole) {
            setAdminRoleId(adminRole.id);
            loadData(adminRole.id);
        }
    }, [user, adminType]);

    async function loadData(roleId: string) {
        try {
            const [usersData, rolesData] = await Promise.all([
                getUsers(),
                getRoles()
            ]);

            const filteredRoles = rolesData.filter(role => 
                role.parent_role_id === roleId
            );

            const filteredUsers = usersData.filter(user => {
                const userRoles = user.publicMetadata.roles || [];
                return userRoles.length === 0 || 
                       userRoles.some((role: any) => role.parent_role_id === roleId);
            });

            setUsers(filteredUsers);
            setRoles(filteredRoles);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    }

    const handleAssignRoles = (user: ClerkUser) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );

    if (error) return (
        <div className="min-h-screen p-8">
            <div className="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold capitalize">{adminType} User Assignment</h1>
                        <p className="text-base-content/70 mt-1">Assign {adminType} roles to users</p>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex gap-4 mb-6">
                            <div className="form-control flex-1">
                                <div className="join w-full">
                                    <div className="join-item flex items-center bg-base-200 px-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        className="input input-bordered join-item w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Current Roles</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="w-12 h-12 rounded-full">
                                                            <img
                                                                src={user.imageUrl}
                                                                alt={`${user.firstName} ${user.lastName}`}
                                                                className="rounded-full w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{user.firstName} {user.lastName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {user.emailAddresses?.[0]?.email_address || 'No email'}
                                            </td>
                                            <td>
                                                <div className="flex flex-wrap gap-2">
                                                    {(user.publicMetadata.roles?.length ?? 0) > 0 ? (
                                                        user.publicMetadata.roles?.map((role: any) => (
                                                            <div
                                                                key={role.id}
                                                                className="badge badge-outline"
                                                            >
                                                                {role.name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        'No roles assigned'
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleAssignRoles(user)}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    Assign Roles
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <AssignRolesModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                allRoles={roles}
                onUpdate={() => loadData(adminRoleId)}
            />
        </div>
    );
} 