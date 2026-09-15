import { TeamMember } from '@/types/team';

interface TeamMemberListProps {
    members: TeamMember[];
    isAdmin: boolean;
    currentUserRole: string | null;
}

export default function TeamMemberList({
    members,
    isAdmin,
    currentUserRole,
}: TeamMemberListProps) {
    return (
        <div className="mt-4 space-y-4">
            {members.map((member) => {
                const isOwner =
                    member.pivot.role === 'admin' &&
                    member.id === members[0]?.id;

                return (
                    <div
                        key={member.id}
                        className="flex items-center justify-between"
                    >
                        <div className="flex min-w-0 items-center space-x-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {member.name.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                    {member.name}
                                </p>

                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                    {member.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2">
                            <span
                                className={`
                                    rounded-full px-2 py-0.5 text-xs font-medium
                                    ${
                                        member.pivot.role === 'admin'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }
                                `}
                            >
                                {member.pivot.role}
                            </span>

                            {isOwner && (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    (Owner)
                                </span>
                            )}

                            {/* Admin actions could go here */}
                            {isAdmin && member.pivot.role !== 'admin' && (
                                <button className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}