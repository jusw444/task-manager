<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use App\Services\TeamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __construct(
        protected TeamService $teamService
    ) {}

    /**
     * Display all teams the authenticated user belongs to.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $teams = $user->teams()
            ->withCount([
                'projects',
                'users',
            ])
            ->get();

        return Inertia::render('Teams/Index', [
            'teams' => $teams,
        ]);
    }

    /**
     * Display a specific team.
     */
    public function show(
        Team $team,
        Request $request
    ): Response {
        $user = $request->user();

        /*
         * Only team members can view the team.
         */
        if (! $team->hasUser($user)) {
            abort(
                403,
                'You do not have access to this team.'
            );
        }

        /*
         * Load everything needed by the Show page.
         *
         * Team::users() already includes the role pivot.
         */
        $team->load([
            'projects.tasks.user',
            'users' => function ($query) {
                $query->select(
                    'users.id',
                    'users.name',
                    'users.email'
                );
            },
        ]);

        $userRole = $user->getRoleIn($team);

        return Inertia::render('Teams/Show', [
            'team' => $team,
            'userRole' => $userRole,
            'canManage' => $this->teamService
                ->canManageTeam($team, $user),
            'isOwner' => $team->isOwner($user),
        ]);
    }

    /**
     * Show create-team form.
     */
    public function create(): Response
    {
        return Inertia::render('Teams/Create');
    }

    /**
     * Store a new team.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:teams,name',
            ],
        ]);

        $team = $this->teamService->createTeam(
            $validated['name'],
            $request->user()
        );

        return redirect()
            ->route('teams.show', $team)
            ->with(
                'success',
                'Team created successfully!'
            );
    }

    /**
     * Show edit-team form.
     */
    public function edit(
        Team $team,
        Request $request
    ): Response {
        $user = $request->user();

        if (! $this->teamService->canManageTeam(
            $team,
            $user
        )) {
            abort(
                403,
                'You do not have permission to edit this team.'
            );
        }

        return Inertia::render('Teams/Edit', [
            'team' => $team,
        ]);
    }

    /**
     * Update a team.
     */
    public function update(
        Request $request,
        Team $team
    ) {
        $user = $request->user();

        if (! $this->teamService->canManageTeam(
            $team,
            $user
        )) {
            abort(
                403,
                'You do not have permission to update this team.'
            );
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:teams,name,'.$team->id,
            ],
        ]);

        $team->update([
            'name' => $validated['name'],
        ]);

        return redirect()
            ->route('teams.show', $team)
            ->with(
                'success',
                'Team updated successfully!'
            );
    }

    /**
     * Delete a team.
     *
     * Only the owner can delete the team.
     */
    public function destroy(
        Team $team,
        Request $request
    ) {
        $user = $request->user();

        if (! $team->isOwner($user)) {
            abort(
                403,
                'Only the team owner can delete this team.'
            );
        }

        $team->delete();

        return redirect()
            ->route('teams.index')
            ->with(
                'success',
                'Team deleted successfully!'
            );
    }

    /**
     * Get users who aren't currently members.
     */
    public function availableUsers(
        Team $team,
        Request $request
    ): JsonResponse {
        $user = $request->user();

        if (! $this->teamService->canManageMembers(
            $team,
            $user
        )) {
            return response()->json(
                ['error' => 'Unauthorized'],
                403
            );
        }

        $search = $request->query('search');

        $limit = min(
            (int) $request->query('limit', 50),
            100
        );

        $users = $this->teamService->getAvailableUsers(
            $team,
            $search,
            $limit
        );

        return response()->json($users);
    }

    /**
     * Add a member.
     */
    public function addMember(
        Team $team,
        Request $request
    ) {
        $currentUser = $request->user();

        if (! $this->teamService->canManageMembers(
            $team,
            $currentUser
        )) {
            abort(
                403,
                'You do not have permission to add members.'
            );
        }

        $validated = $request->validate([
            'user_id' => [
                'required',
                'exists:users,id',
            ],
            'role' => [
                'required',
                'in:admin,member',
            ],
        ]);

        $newMember = User::findOrFail(
            $validated['user_id']
        );

        if ($team->hasUser($newMember)) {
            return back()->with(
                'error',
                'User is already a member of this team.'
            );
        }

        $this->teamService->addMember(
            $team,
            $newMember,
            $validated['role']
        );

        return back()->with(
            'success',
            'Member added successfully!'
        );
    }

    /**
     * Remove a member.
     */
    public function removeMember(
        Team $team,
        User $user,
        Request $request
    ) {
        $currentUser = $request->user();

        if (! $this->teamService->canManageMembers(
            $team,
            $currentUser
        )) {
            abort(
                403,
                'You do not have permission to remove members.'
            );
        }

        /*
         * Don't allow a manager to remove themselves.
         */
        if ($currentUser->id === $user->id) {
            return back()->with(
                'error',
                'You cannot remove yourself from the team.'
            );
        }

        try {
            $this->teamService->removeMember(
                $team,
                $user
            );
        } catch (\DomainException $e) {
            return back()->with(
                'error',
                $e->getMessage()
            );
        }

        return back()->with(
            'success',
            'Member removed successfully!'
        );
    }

    /**
     * Change a member's role.
     */
    public function changeMemberRole(
        Team $team,
        User $user,
        Request $request
    ) {
        $currentUser = $request->user();

        if (! $this->teamService->canManageMembers(
            $team,
            $currentUser
        )) {
            abort(
                403,
                'You do not have permission to change roles.'
            );
        }

        $validated = $request->validate([
            'role' => [
                'required',
                'in:admin,member',
            ],
        ]);

        try {
            $this->teamService->changeRole(
                $team,
                $user,
                $validated['role']
            );
        } catch (
            \DomainException|
            \InvalidArgumentException|
            \RuntimeException $e
        ) {
            return back()->with(
                'error',
                $e->getMessage()
            );
        }

        return back()->with(
            'success',
            'Role updated successfully!'
        );
    }
}
