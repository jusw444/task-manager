import TeamForm from '@/components/Teams/TeamForm';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create',
        href: '/teams/create',
    },
];

export default function Create() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Team" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Create New Team
                            </h1>

                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Create a team to collaborate with others on projects.
                            </p>

                            <div className="mt-6">
                                <TeamForm
                                    submitRoute="teams.store"
                                    method="post"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
