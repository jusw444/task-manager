import { useForm } from '@inertiajs/react';
import { Team, TeamFormData } from '@/types/team';

interface TeamFormProps {
    // If we have a team, we're editing. If not, we're creating.
    team?: Team;

    // The route to submit to (could be different for edit/update)
    submitRoute: string;

    // Method: 'post' for create, 'put' for update
    method?: 'post' | 'put';

    // Whether the form is disabled (for viewing only)
    disabled?: boolean;
}

export default function TeamForm({
    team,
    submitRoute,
    method = 'post',
    disabled = false,
}: TeamFormProps) {
    // useForm handles form data, validation errors,
    // processing state, and form submission.
    const { data, setData, post, put, errors, processing } =
        useForm<TeamFormData>({
            // Use the existing team name when editing,
            // otherwise start with an empty string.
            name: team?.name || '',
        });

    // Determine which HTTP method to use.
    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (method === 'put') {
            put(route(submitRoute, team?.id));
        } else {
            post(route(submitRoute));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Team Name
                </label>

                <div className="mt-1">
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        disabled={disabled || processing}
                        className={`
                            block w-full rounded-md shadow-sm
                            ${
                                errors.name
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400'
                            }
                            ${
                                disabled || processing
                                    ? 'bg-gray-100 dark:bg-gray-700'
                                    : 'dark:bg-gray-700'
                            }
                        `}
                        placeholder="e.g., Design Team, Engineering Team"
                        required
                    />
                </div>

                {errors.name && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {errors.name}
                    </p>
                )}

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Choose a unique name for your team. You can always change it later.
                </p>
            </div>

            <div className="flex items-center justify-end space-x-3">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={disabled || processing}
                    className={`
                        rounded-md px-4 py-2 text-sm font-medium text-white
                        ${
                            disabled || processing
                                ? 'cursor-not-allowed bg-blue-400'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                        }
                    `}
                >
                    {processing
                        ? 'Saving...'
                        : team
                          ? 'Update Team'
                          : 'Create Team'}
                </button>
            </div>
        </form>
    );
}
