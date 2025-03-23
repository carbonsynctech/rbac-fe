'use client'

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

const Header = () => {
    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                        <li><Link href="/admin/manage">Manage</Link></li>
                        <li><Link href="/admin/assign">Assign</Link></li>
                    </ul>
                </div>
                <Link href="/" className="btn btn-ghost text-xl">UAC Admin</Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><Link href="/admin/manage">Manage</Link></li>
                    <li><Link href="/admin/assign">Assign</Link></li>
                </ul>
            </div>
            <div className="navbar-end">
                <SignedIn>
                    <li className="flex items-center">
                        <UserButton />
                    </li>
                </SignedIn>
                <SignedOut>
                    <li className="flex items-center rounded bg-black px-2 font-bold text-white">
                        <SignInButton mode="modal" />
                    </li>
                </SignedOut>
            </div>
        </div>
    )
}

export default Header;