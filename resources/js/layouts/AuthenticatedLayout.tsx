// resources/js/Layouts/AuthenticatedLayout.tsx

import { User } from '@/types';
import { Link, usePage } from '@inertiajs/react'; // ← IMPORTANT: usePage, not useState
import { ReactNode } from 'react';

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
            <nav className="border-b border-gray-100 bg-white">
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
                            <div className="hidden space-x-8 sm:ml-10 sm:flex sm:items-center">
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
                            <Link href={route('logout')} method="post" as="button" className="text-sm text-gray-500 hover:text-gray-700">
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ✅ CORRECT: Flash Messages with proper styling */}
            {flash?.success && (
                <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">{flash.success}</div>
                </div>
            )}

            {flash?.error && (
                <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">{flash.error}</div>
                </div>
            )}

            {flash?.warning && (
                <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">{flash.warning}</div>
                </div>
            )}

            {/* Page Header */}
            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            {/* Page Content */}
            <main>{children}</main>
        </div>
    );
}
