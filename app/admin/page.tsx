'use client';

import { useEffect, useState } from 'react';
import { 
    Role, 
    Permission, 
    RoleWithPermissions,
    getRoles, 
    getPermissions, 
    createRole, 
    deleteRole,
    createPermission,
} from '@/app/actions/rolePermissionsNeon';
import PermissionsModal from '@/app/components/PermissionsModal';

export default function RolesAndPermissionsPage() {
    const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [isNewRoleAdmin, setIsNewRoleAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [rolesData, permissionsData] = await Promise.all([
                getRoles(),
                getPermissions()
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateRole(e: React.FormEvent) {
        e.preventDefault();
        try {
            await createRole(newRoleName, undefined, isNewRoleAdmin);
            setNewRoleName('');
            setIsNewRoleAdmin(false);
            loadData();
        } catch (err) {
            setError('Failed to create role');
        }
    }

    async function handleDeleteRole(roleId: string) {
        try {
            await deleteRole(roleId);
            if (selectedRole?.id === roleId) {
                setSelectedRole(null);
                setIsModalOpen(false);
            }
            loadData();
        } catch (err) {
            setError('Failed to delete role');
        }
    }

    function handleEditPermissions(role: RoleWithPermissions) {
        setSelectedRole(role);
        setIsModalOpen(true);
    }

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
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Roles and Permissions</h1>
                    <div className="card bg-base-200 p-4">
                        <form onSubmit={handleCreateRole} className="space-y-4">
                            <div className="join w-full">
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="New role name"
                                    className="input input-bordered join-item w-full"
                                />
                                <button 
                                    type="submit" 
                                    className="btn btn-primary join-item"
                                    disabled={!newRoleName}
                                >
                                    Add Role
                                </button>
                            </div>
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">Make this role an admin role</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={isNewRoleAdmin}
                                        onChange={(e) => setIsNewRoleAdmin(e.target.checked)}
                                    />
                                </label>
                                {isNewRoleAdmin && (
                                    <div className="text-sm text-base-content/70 mt-1">
                                        This role will be able to create and manage other roles
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        {roles.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">🎭</div>
                                <h3 className="text-lg font-semibold mb-2">No Roles Created</h3>
                                <p className="text-base-content/60">Create your first role to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="card bg-base-200"
                                    >
                                        <div className="card-body p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <h3 className="card-title text-lg">{role.name}</h3>
                                                    {(role.name === 'super' || role.is_admin_role) && (
                                                        <div className={`badge ${
                                                            role.name === 'super' 
                                                                ? 'badge-secondary' 
                                                                : 'badge-primary'
                                                        } mt-1`}>
                                                            {role.name === 'super' ? 'Super Admin' : 'Admin'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="join">
                                                    <button
                                                        onClick={() => handleEditPermissions(role)}
                                                        className="btn btn-sm join-item"
                                                    >
                                                        Manage Permissions
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="btn btn-sm btn-error join-item"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            {role.permissions.length > 0 && (
                                                <div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {role.permissions.map((permission) => (
                                                            <div
                                                                key={permission.id}
                                                                className="badge badge-outline"
                                                            >
                                                                {permission.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedRole && (
                <PermissionsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedRole(null);
                    }}
                    role={selectedRole}
                    allPermissions={permissions}
                    onUpdate={loadData}
                    onCreatePermission={async (name) => {
                        const permission = await createPermission(name);
                        await loadData();
                        return permission;
                    }}
                />
            )}
        </div>
    );
} 