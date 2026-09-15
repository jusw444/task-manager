import { Link } from '@inertiajs/react';
import { Team } from '@/types/team';

interface TeamCardProps {
    team: Team;
}

const avatarColors = [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-yellow-600',
    'bg-red-600',
    'bg-indigo-600',
] as const;

export default function TeamCard({ team }: TeamCardProps) {
    const memberCount = team.users_count ?? 0;
    const projectCount = team.projects_count ?? 0;

    const initials = team.name
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const avatarColor = avatarColors[team.id % avatarColors.length];

    return (
        <Link
            href={route('teams.show', team.id)}
            className="group block rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
            <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-semibold text-white ${avatarColor}`}
                            aria-hidden="true"
                        >
                            {initials}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                {team.name}
                            </h3>

                            {/* Team metadata */}
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                    <svg
                                        className="mr-1.5 h-4 w-4 shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                        />
                                    </svg>

                                    <span>
                                        {memberCount} member
                                        {memberCount !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="flex items-center">
                                    <svg
                                        className="mr-1.5 h-4 w-4 shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>

                                    <span>
                                        {projectCount} project
                                        {projectCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            {/* Created date */}
                            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                                Created{' '}
                                {new Date(team.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
