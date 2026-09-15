import TeamForm from '@/components/Teams/TeamForm';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Team } from '@/types/team';
import { Head } from '@inertiajs/react';

interface EditProps {
    team: Team;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit',
        href: '/teams/{team}/edit',
    },
];

export default function Edit({ team }: EditProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${team.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Team: {team.name}</h1>

                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Update your team's information.</p>

                            <div className="mt-6">
                                <TeamForm team={team} submitRoute="teams.update" method="put" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
