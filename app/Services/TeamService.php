<?php

namespace App\Services;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TeamService
{
    /**
     * Create a new team.
     *
     * The authenticated user becomes:
     * - Team owner
     * - Team admin
     */
    public function createTeam(string $name, User $owner): Team
    {
        return DB::transaction(function () use ($name, $owner) {
            $team = Team::create([
                'name' => $name,
                'user_id' => $owner->id,
            ]);

            $team->users()->attach($owner->id, [
                'role' => 'admin',
            ]);

            return $team;
        });
    }

    /**
     * Add a user to a team.
     */
    public function addMember(
        Team $team,
        User $user,
        string $role = 'member'
    ): void {
        if ($team->hasUser($user)) {
            return;
        }

        if (!in_array($role, ['admin', 'member'], true)) {
            throw new \InvalidArgumentException(
                'Invalid team role.'
            );
        }

        $team->users()->attach($user->id, [
            'role' => $role,
        ]);
    }

    /**
     * Remove a user from a team.
     */
    public function removeMember(
        Team $team,
        User $user
    ): void {
        // The owner cannot be removed.
        if ($team->isOwner($user)) {
            throw new \DomainException(
                'Cannot remove the team owner.'
            );
        }

        // The target must actually be a member.
        if (!$team->hasUser($user)) {
            throw new \DomainException(
                'User is not a member of this team.'
            );
        }

        $userRole = $user->getRoleIn($team);

        // Count current admins.
        $adminCount = $team->users()
            ->wherePivot('role', 'admin')
            ->count();

        // Never allow a team to have zero admins.
        if ($userRole === 'admin' && $adminCount <= 1) {
            throw new \DomainException(
                'Cannot remove the last admin from the team.'
            );
        }

        $team->users()->detach($user->id);
    }

    /**
     * Change a user's role in a team.
     */
    public function changeRole(
        Team $team,
        User $user,
        string $newRole
    ): void {
        // Owner's role cannot be changed.
        if ($team->isOwner($user)) {
            throw new \DomainException(
                "Cannot change the team owner's role."
            );
        }

        // Target must be a team member.
        if (!$team->hasUser($user)) {
            throw new \DomainException(
                'User is not a member of this team.'
            );
        }

        // Only these roles are allowed.
        if (!in_array($newRole, ['admin', 'member'], true)) {
            throw new \InvalidArgumentException(
                'Invalid team role.'
            );
        }

        $currentRole = $user->getRoleIn($team);

        /*
         * Prevent changing admin -> member when this
         * user is the last admin.
         */
        if (
            $currentRole === 'admin' &&
            $newRole === 'member'
        ) {
            $adminCount = $team->users()
                ->wherePivot('role', 'admin')
                ->count();

            if ($adminCount <= 1) {
                throw new \DomainException(
                    'Cannot remove the last admin from the team.'
                );
            }
        }

        $updated = $team->users()->updateExistingPivot(
            $user->id,
            [
                'role' => $newRole,
            ]
        );

        /*
         * updateExistingPivot() returns the number of
         * affected rows.
         *
         * If zero rows were changed, something went wrong.
         */
        if ($updated === 0) {
            throw new \RuntimeException(
                'The member role could not be updated.'
            );
        }
    }

    /**
     * Get all members of a team.
     */
    public function getTeamMembers(
        Team $team
    ): Collection {
        return $team->users()
            ->select(
                'users.id',
                'users.name',
                'users.email'
            )
            ->get();
    }

    /**
     * Check whether a user can manage the team.
     *
     * Owner OR admin.
     */
    public function canManageTeam(
        Team $team,
        User $user
    ): bool {
        if ($team->isOwner($user)) {
            return true;
        }

        return $user->getRoleIn($team) === 'admin';
    }

    /**
     * Get users who are not already members of the team.
     */
    public function getAvailableUsers(
        Team $team,
        ?string $search = null,
        int $limit = 50
    ): Collection {
        $query = User::query()
            ->whereDoesntHave('teams', function ($query) use ($team) {
                $query->where('team_id', $team->id);
            });

        if ($search) {
            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'name',
                        'LIKE',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'email',
                        'LIKE',
                        "%{$search}%"
                    );
            });
        }

        return $query
            ->limit($limit)
            ->get([
                'id',
                'name',
                'email',
            ]);
    }

    /**
     * Check whether a user can manage team members.
     *
     * Owner OR admin.
     */
    public function canManageMembers(
        Team $team,
        User $user
    ): bool {
        if ($team->isOwner($user)) {
            return true;
        }

        return $user->getRoleIn($team) === 'admin';
    }
}