import { useEffect, useState } from "react";
import { Permission, RoleWithPermissions, assignPermissionToRole, removePermissionFromRole, createPermission } from "@/app/actions/rolePermissions";

interface PermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: RoleWithPermissions;
    allPermissions: Permission[];
    onUpdate: () => Promise<void>;
}

export default function PermissionsModal({
    isOpen,
    onClose,
    role,
    allPermissions,
    onUpdate
}: PermissionsModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [newPermissionName, setNewPermissionName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [localPermissions, setLocalPermissions] = useState<Permission[]>([]);
    
    useEffect(() => {
        setLocalPermissions(role.permissions);
    }, [role.permissions]);

    if (!isOpen) return null;

    async function handleCreatePermission(e: React.FormEvent) {
        e.preventDefault();
        try {
            const newPermission = await createPermission(newPermissionName);
            await assignPermissionToRole(role.id, newPermission.id);
            setNewPermissionName("");
            setError(null);
            setLocalPermissions(prev => [...prev, newPermission]);
            await onUpdate();
        } catch (error) {
            setError("Failed to create permission");
        }
    }

    async function handleAssignPermission(permission: Permission) {
        try {
            await assignPermissionToRole(role.id, permission.id);
            setError(null);
            setLocalPermissions(prev => [...prev, permission]);
            await onUpdate();
        } catch (error) {
            setError("Failed to assign permission");
        }
    }

    async function handleRemovePermission(permissionId: string) {
        try {
            await removePermissionFromRole(role.id, permissionId);
            setError(null);
            setLocalPermissions(prev => prev.filter(p => p.id !== permissionId));
            await onUpdate();
        } catch (error) {
            setError("Failed to remove permission");
        }
    }

    const availablePermissions = allPermissions.filter(p => 
        !localPermissions.some(rp => rp.id === p.id) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <dialog open={isOpen} className="modal">
            <div className="modal-box w-11/12 max-w-2xl">
                <form method="dialog">
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                
                <h3 className="font-bold text-lg mb-4">
                    Manage Permissions for {role.name}
                </h3>

                {error && (
                    <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                    </div>
                )}

                <div className="divider"></div>

                {/* Add Permissions Section */}
                <div className="space-y-4">
                    <div className="form-control w-full">
                        <form onSubmit={handleCreatePermission}>
                            <label className="label">
                                <span className="label-text font-medium">Create New Permission</span>
                            </label>
                            <div className="join w-full">
                                <input
                                    type="text"
                                    value={newPermissionName}
                                    onChange={(e) => setNewPermissionName(e.target.value)}
                                    placeholder="Enter permission name"
                                    className="input input-bordered join-item w-full"
                                />
                                <button
                                    type="submit"
                                    disabled={!newPermissionName}
                                    className="btn btn-primary join-item"
                                >
                                    Create & Add
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Search Existing Permissions</span>
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search permissions..."
                            className="input input-bordered w-full"
                        />
                    </div>

                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="max-h-[40vh] overflow-y-auto menu">
                                {availablePermissions.map((permission) => (
                                    <li key={permission.id}>
                                        <a onClick={() => handleAssignPermission(permission)} className="justify-between">
                                            {permission.name}
                                            <span className="badge badge-primary">Add</span>
                                        </a>
                                    </li>
                                ))}
                                {availablePermissions.length === 0 && searchTerm && (
                                    <div className="text-center text-base-content/60 py-2">
                                        No matching permissions found
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                {/* Current Permissions Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Current Permissions</h4>
                        <div className="badge badge-neutral">
                            {localPermissions.length} permission{localPermissions.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="menu max-h-[30vh] overflow-y-auto">
                                {localPermissions.map((permission) => (
                                    <li key={permission.id}>
                                        <a onClick={() => handleRemovePermission(permission.id)} className="justify-between">
                                            {permission.name}
                                            <span className="badge badge-error badge-outline">Remove</span>
                                        </a>
                                    </li>
                                ))}
                                {localPermissions.length === 0 && (
                                    <div className="text-center text-base-content/60 py-2">
                                        No permissions assigned
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
} 