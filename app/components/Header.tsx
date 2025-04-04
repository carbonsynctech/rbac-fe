'use client'

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { getRoles, Role } from '@/app/actions/rolePermissions'

const Header = () => {
    const { user } = useUser()
    const [adminRoles, setAdminRoles] = useState<Role[]>([])
    const pathname = usePathname()

    // useEffect(() => {
    //     const loadAdminRoles = async () => {
    //         const userRoles = (user?.publicMetadata?.roles || []) as Role[];
    //         // Filter for admin roles that the user has
    //         const adminRoles = userRoles.filter(role => role.is_admin_role);
    //         setAdminRoles(adminRoles);
    //     }
    //     loadAdminRoles();
    // }, [user])

    const isActive = (path: string) => {
        return pathname === path ? "bg-base-300" : "";
    };

    return (
        <div className="navbar bg-neutral text-neutral-content shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        <li>
                            <Link href="/admin/manage" className={isActive("/admin/manage")}>
                                Manage
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/assign" className={isActive("/admin/assign")}>
                                Assign
                            </Link>
                        </li>
                    </ul>
                </div>
                <Link href="/" className="btn btn-ghost text-xl">RBAC Admin</Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">

                </ul>
            </div>
            <div className="navbar-end">
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal" />
                </SignedOut>
            </div>
        </div>
    )
}

export default Header;