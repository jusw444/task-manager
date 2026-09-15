// resources/js/Layouts/AuthenticatedLayout.tsx

import React, { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';  // ← IMPORTANT: usePage, not useState
import { User } from '@/types';

interface Props {
    children: ReactNode;
    header?: ReactNode;
}

export default function AuthenticatedLayout({ children, header }: Props) {
    // ✅ CORRECT: Use usePage() hook, not useState()
    const { auth, flash } = usePage().props;
    const user = auth.user as User;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex shrink-0 items-center">
                                <Link href="/dashboard">
                                    <span className="text-xl font-bold text-gray-800">Task Manager</span>
                                </Link>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden space-x-8 sm:flex sm:items-center sm:ml-10">
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href={route('teams.index')}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                                >
                                    Teams
                                </Link>
                            </div>
                        </div>

                        {/* User Dropdown */}
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-700">{user.name}</span>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ✅ CORRECT: Flash Messages with proper styling */}
            {flash?.success && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {flash.success}
                    </div>
                </div>
            )}

            {flash?.error && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {flash.error}
                    </div>
                </div>
            )}

            {flash?.warning && (
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                        {flash.warning}
                    </div>
                </div>
            )}

            {/* Page Header */}
            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Page Content */}
            <main>{children}</main>
        </div>
    );
}