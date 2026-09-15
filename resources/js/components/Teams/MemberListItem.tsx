import { TeamMember, TeamRole } from '@/types/team';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface MemberListItemProps {
    member: TeamMember;
    teamId: number;
    isOwner: boolean;
    canManage: boolean;
    currentUserId: number;
}

export default function MemberListItem({ member, teamId, isOwner, canManage, currentUserId }: MemberListItemProps) {
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [mounted, setMounted] = useState(false);

    /*
     * createPortal needs document.body.
     *
     * document is not available during server-side rendering,
     * so we wait until the component has mounted.
     */
    useEffect(() => {
        setMounted(true);

        return () => {
            setMounted(false);
        };
    }, []);

    /*
     * The member's role comes directly from Laravel.
     *
     * We intentionally do not create local role state.
     */
    const displayRole = member.pivot.role;

    const isCurrentUser = member.id === currentUserId;

    /*
     * Managers can change another member's role.
     *
     * They cannot:
     * - change the owner's role
     * - change their own role
     */
    const canChangeRole = canManage && !isOwner && !isCurrentUser;

    /*
     * Managers can remove another member.
     *
     * They cannot:
     * - remove the owner
     * - remove themselves
     */
    const canRemove = canManage && !isOwner && !isCurrentUser;

    /*
     * Change member role.
     *
     * The new role is sent directly to Laravel.
     * We do not modify the UI optimistically.
     *
     * Laravel updates the pivot table and returns the
     * updated Inertia page props.
     */
    const handleRoleChange = (newRole: TeamRole) => {
        if (newRole === displayRole) {
            setShowRoleMenu(false);
            return;
        }

        setIsUpdating(true);

        router.put(
            route('teams.members.update', [teamId, member.id]),
            {
                role: newRole,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowRoleMenu(false);
                },

                onFinish: () => {
                    setIsUpdating(false);
                },
            },
        );
    };

    /*
     * Remove member.
     *
     * We wait for Laravel to successfully remove the
     * pivot record. We do not remove the member locally.
     */
    const handleRemove = () => {
        setIsRemoving(true);

        router.delete(route('teams.members.destroy', [teamId, member.id]), {
            preserveScroll: true,

            onSuccess: () => {
                setShowRemoveConfirm(false);
            },

            onFinish: () => {
                setIsRemoving(false);
            },
        });
    };

    /*
     * Avatar colors.
     *
     * Using the member ID makes the color deterministic:
     * the same member gets the same color after reload.
     */
    const avatarColors = [
        'bg-blue-500 dark:bg-blue-600',
        'bg-green-500 dark:bg-green-600',
        'bg-purple-500 dark:bg-purple-600',
        'bg-pink-500 dark:bg-pink-600',
        'bg-yellow-500 dark:bg-yellow-600',
        'bg-red-500 dark:bg-red-600',
        'bg-indigo-500 dark:bg-indigo-600',
        'bg-teal-500 dark:bg-teal-600',
    ];

    const avatarColor = avatarColors[member.id % avatarColors.length];

    /*
     * Close the role menu when the component is no longer
     * allowed to manage the member.
     */
    useEffect(() => {
        if (!canChangeRole) {
            setShowRoleMenu(false);
        }
    }, [canChangeRole]);

    return (
        <>
            <div className="group flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                {/* Member information */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    {/* Avatar */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white ${avatarColor}`}>
                        {member.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + email */}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>

                            {/* Owner badge */}
                            {isOwner && (
                                <span className="shrink-0 rounded-md bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                    Owner
                                </span>
                            )}

                            {/* Current user badge */}
                            {isCurrentUser && (
                                <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    You
                                </span>
                            )}

                            {/* Updating status */}
                            {isUpdating && <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">Updating...</span>}

                            {/* Removing status */}
                            {isRemoving && <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">Removing...</span>}
                        </div>

                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                </div>

                {/* Member actions */}
                <div className="flex shrink-0 items-center gap-1.5">
                    {/* Role */}
                    {canChangeRole ? (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowRoleMenu((current) => !current)}
                                disabled={isUpdating || isRemoving}
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-wait disabled:opacity-50 ${
                                    displayRole === 'admin'
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                } `}
                            >
                                <span>{displayRole}</span>

                                <svg
                                    className={`h-3 w-3 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showRoleMenu && (
                                <>
                                    {/* Outside click */}
                                    <button
                                        type="button"
                                        aria-label="Close role menu"
                                        className="fixed inset-0 z-10 h-full w-full cursor-default"
                                        onClick={() => setShowRoleMenu(false)}
                                    />

                                    {/* Role menu */}
                                    <div className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleChange('member')}
                                            disabled={isUpdating || displayRole === 'member'}
                                            className={`block w-full px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                                displayRole === 'member'
                                                    ? 'bg-gray-50 font-medium text-gray-900 dark:bg-gray-700/50 dark:text-white'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                            } `}
                                        >
                                            Member
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleRoleChange('admin')}
                                            disabled={isUpdating || displayRole === 'admin'}
                                            className={`block w-full px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                                displayRole === 'admin'
                                                    ? 'bg-gray-50 font-medium text-gray-900 dark:bg-gray-700/50 dark:text-white'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                            } `}
                                        >
                                            Admin
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                displayRole === 'admin'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            } `}
                        >
                            {displayRole}
                        </span>
                    )}

                    {/* Remove button */}
                    {canRemove && (
                        <button
                            type="button"
                            onClick={() => setShowRemoveConfirm(true)}
                            disabled={isRemoving || isUpdating}
                            title="Remove member"
                            aria-label={`Remove ${member.name}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-red-400"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Remove confirmation modal */}
            {showRemoveConfirm &&
                mounted &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="remove-member-title"
                    >
                        {/* Backdrop */}
                        <button
                            type="button"
                            aria-label="Close confirmation"
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => {
                                if (!isRemoving) {
                                    setShowRemoveConfirm(false);
                                }
                            }}
                        />

                        {/* Modal */}
                        <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-start gap-3">
                                {/* Warning icon */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13a2 2 0 001.71 3h15.64a2 2 0 001.71-3l-7.82-13a2 2 0 00-3.42 0z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <h3 id="remove-member-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Remove member?
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        This will remove <span className="font-medium text-gray-900 dark:text-white">{member.name}</span> from the
                                        team.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRemoveConfirm(false)}
                                    disabled={isRemoving}
                                    className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    disabled={isRemoving}
                                    className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-wait disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                                >
                                    {isRemoving ? 'Removing...' : 'Remove member'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
