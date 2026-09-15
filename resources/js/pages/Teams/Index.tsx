import TeamCard from '@/components/Teams/TeamCard';
import TeamStats from '@/components/Teams/TeamStats';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { TeamIndexProps } from '@/types/team';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Team',
        href: '/teams',
    },
];

export default function Index({ teams }: TeamIndexProps) {
    const hasTeams = teams.length > 0;

    const totalMembers = teams.reduce((total, team) => total + (team.users_count ?? 0), 0);

    const totalProjects = teams.reduce((total, team) => total + (team.projects_count ?? 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teams" />

            <div className="py-6 sm:py-8 lg:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">Your Teams</h1>

                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your teams and collaborate on projects.</p>
                        </div>

                        <Link
                            href={route('teams.create')}
                            className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none sm:w-auto dark:focus:ring-offset-gray-900"
                        >
                            <span aria-hidden="true">+</span>
                            <span className="ml-1">Create New Team</span>
                        </Link>
                    </div>

                    {/* Stats */}
                    <section aria-label="Team statistics" className="mb-8">
                        <TeamStats totalTeams={teams.length} totalMembers={totalMembers} totalProjects={totalProjects} />
                    </section>

                    {/* Teams */}
                    {hasTeams ? (
                        <section aria-label="Your teams">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {teams.map((team) => (
                                    <TeamCard key={team.id} team={team} />
                                ))}
                            </div>
                        </section>
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>

                            <h2 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No teams yet</h2>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first team.</p>

                            <div className="mt-6">
                                <Link
                                    href={route('teams.create')}
                                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-900"
                                >
                                    <span aria-hidden="true">+</span>
                                    <span className="ml-1">Create Team</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
