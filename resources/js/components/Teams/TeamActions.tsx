import { Team } from '@/types/team';
import { Link, useForm } from '@inertiajs/react';

interface TeamActionsProps {
    team: Team;
    userRole: string;
}

export default function TeamActions({ team, userRole }: TeamActionsProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
            destroy(route('teams.destroy', team.id));
        }
    };

    return (
        <div className="flex items-center space-x-3">
            <Link
                href={route('teams.edit', team.id)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-900"
            >
                Edit Team
            </Link>

            {/* Only owner can delete */}
            {userRole === 'admin' && (
                <button
                    onClick={handleDelete}
                    disabled={processing}
                    className={`rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-900 ${processing ? 'cursor-not-allowed opacity-50' : ''} `}
                >
                    {processing ? 'Deleting...' : 'Delete Team'}
                </button>
            )}
        </div>
    );
}
