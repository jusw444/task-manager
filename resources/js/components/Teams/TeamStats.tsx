interface TeamStatsProps {
    totalTeams: number;
    totalMembers: number;
    totalProjects: number;
}

const stats = [
    {
        label: 'Total Teams',
        key: 'teams',
        icon: '🏢',
    },
    {
        label: 'Total Members',
        key: 'members',
        icon: '👥',
    },
    {
        label: 'Total Projects',
        key: 'projects',
        icon: '📋',
    },
] as const;

export default function TeamStats({
    totalTeams,
    totalMembers,
    totalProjects,
}: TeamStatsProps) {
    const values = {
        teams: totalTeams,
        members: totalMembers,
        projects: totalProjects,
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
                <div
                    key={stat.key}
                    className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                    <div className="p-5">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl dark:bg-gray-700"
                                aria-hidden="true"
                            >
                                {stat.icon}
                            </div>

                            <div className="min-w-0">
                                <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {values[stat.key]}
                                </p>

                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
