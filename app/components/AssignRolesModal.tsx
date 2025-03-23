import { useEffect, useState } from "react";
import { Role } from "@/app/actions/rolePermissions";
import { ClerkUser, updateUserRoles } from "@/app/actions/userRoles";

interface AssignRolesModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: ClerkUser | null;
    allRoles: Role[];
    onUpdate: () => Promise<void>;
}

export default function AssignRolesModal({
    isOpen,
    onClose,
    user,
    allRoles,
    onUpdate
}: AssignRolesModalProps) {
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && isOpen) {
            // Initialize selected roles from user's current roles
            const userRoleIds = new Set(user.publicMetadata.roles?.map(role => role.id) || []);
            setSelectedRoles(userRoleIds);
        }
    }, [user, isOpen]);

    const handleToggleRole = async (roleId: string) => {
        setSelectedRoles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(roleId)) {
                newSet.delete(roleId);
            } else {
                newSet.add(roleId);
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        if (!user) return;
        
        setUpdating(true);
        setError(null);
        try {
            await updateUserRoles(user.id, Array.from(selectedRoles));
            await onUpdate();
            onClose();
        } catch (err) {
            setError('Failed to update roles');
        } finally {
            setUpdating(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <dialog open={isOpen} className="modal">
            <div className="modal-box w-11/12 max-w-2xl">
                <form method="dialog">
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                
                <h3 className="font-bold text-lg mb-4">
                    Assign Roles to {user.firstName} {user.lastName}
                </h3>

                {error && (
                    <div className="alert alert-error mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                    </div>
                )}

                <div className="overflow-y-auto max-h-96">
                    <div className="space-y-4">
                        {allRoles.map(role => (
                            <label
                                key={role.id}
                                className="flex items-start gap-4 p-4 hover:bg-base-200 rounded-lg cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox mt-1"
                                    checked={selectedRoles.has(role.id)}
                                    onChange={() => handleToggleRole(role.id)}
                                />
                                <div>
                                    <div className="font-medium">{role.name}</div>
                                    {role.permissions && role.permissions.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {role.permissions.map(permission => (
                                                <div
                                                    key={permission.id}
                                                    className="badge badge-sm"
                                                >
                                                    {permission.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="modal-action">
                    <button
                        onClick={onClose}
                        className="btn"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updating}
                        className="btn btn-primary"
                    >
                        {updating ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
} 