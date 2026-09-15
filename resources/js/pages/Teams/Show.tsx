import AddMemberModal from '@/components/Teams/AddMemberModal';
import MemberListItem from '@/components/Teams/MemberListItem';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { TeamShowProps } from '@/types/team';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Show',
        href: '/teams/{team}',
    },
];

export default function Show({ team, canManage, isOwner }: TeamShowProps) {
    const { flash, auth } = usePage().props;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    /*
     * Laravel/Inertia is the source of truth.
     *
     * We don't keep a separate members state here.
     */
    const members = team.users ?? [];

    /*
     * The owner is determined by teams.user_id.
     */
    const owner = members.find((member) => member.id === team.user_id);

    /*
     * Adding a member:
     *
     * The AddMemberModal handles the POST request.
     * Laravel returns the updated page props, so we only
     * need to close the modal.
     */
    const handleMemberAdded = () => {
        setIsAddModalOpen(false);
    };

    /*
     * Delete the entire team.
     *
     * Backend authorization still protects this route.
     * The frontend only controls whether the button is shown.
     */
    const handleDeleteTeam = () => {
        const confirmed = window.confirm(`Are you sure you want to delete "${team.name}"?\n\nThis action cannot be undone.`);

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);

        router.delete(route('teams.destroy', team.id), {
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={team.name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Flash messages */}
                    {flash?.success && (
                        <div className="mb-6 rounded-xl border border-green-200 bg-green-100/80 p-4 text-sm text-green-700 backdrop-blur-sm dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>

                                {flash.success}
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-100/80 p-4 text-sm text-red-700 backdrop-blur-sm dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>

                                {flash.error}
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route('teams.index')}
                            className="inline-flex items-center gap-1.5 text-sm text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Teams
                        </Link>

                        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            {/* Team information */}
                            <div className="min-w-0">
                                <h1 className="truncate text-3xl font-bold text-gray-900 dark:text-white">{team.name}</h1>

                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {members.length} members · {team.projects?.length ?? 0} projects
                                </p>
                            </div>

                            {/* Team actions */}
                            {(canManage || isOwner) && (
                                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                                    {/* Edit */}
                                    {canManage && (
                                        <Link
                                            href={route('teams.edit', team.id)}
                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 8.5-8.5z"
                                                />
                                            </svg>

                                            <span>Edit</span>
                                        </Link>
                                    )}

                                    {/* Add member */}
                                    {canManage && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddModalOpen(true)}
                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-900"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>

                                            <span>Add Member</span>
                                        </button>
                                    )}

                                    {/* Delete */}
                                    {isOwner && (
                                        <button
                                            type="button"
                                            onClick={handleDeleteTeam}
                                            disabled={isDeleting}
                                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-wait disabled:opacity-50 dark:border-red-900/60 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-950/30 dark:focus:ring-offset-gray-900"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-3a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>

                                            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Members */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl border border-white/20 bg-white/95 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/95">
                                <div className="p-6">
                                    <h2 className="flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white">
                                        <span>Members</span>

                                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{members.length}</span>
                                    </h2>

                                    {members.length > 0 ? (
                                        <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
                                            {members.map((member) => (
                                                <MemberListItem
                                                    key={member.id}
                                                    member={member}
                                                    teamId={team.id}
                                                    isOwner={member.id === owner?.id}
                                                    canManage={canManage}
                                                    currentUserId={auth.user?.id ?? 0}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No members yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Projects */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-white/20 bg-white/95 shadow-xl backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/95">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>

                                    {team.projects && team.projects.length > 0 ? (
                                        <div className="mt-4 space-y-3">
                                            {team.projects.map((project) => (
                                                <div
                                                    key={project.id}
                                                    className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/30"
                                                >
                                                    <div className="min-w-0">
                                                        <h3 className="truncate font-medium text-gray-900 dark:text-white">{project.name}</h3>

                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{project.tasks?.length ?? 0} tasks</p>
                                                    </div>

                                                    <span className="ml-4 shrink-0 text-sm text-gray-400 dark:text-gray-500">
                                                        {new Date(project.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No projects yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            <AddMemberModal teamId={team.id} isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={handleMemberAdded} />
        </AppLayout>
    );
}
