<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    /**
     * Determine whether the user can view their team list.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view a team.
     */
    public function view(User $user, Team $team): bool
    {
        return $team->hasUser($user);
    }

    /**
     * Determine whether the user can create a team.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update team details.
     */
    public function update(User $user, Team $team): bool
    {
        return $team->isOwner($user)
            || $user->getRoleIn($team) === 'admin';
    }

    /**
     * Determine whether the user can delete a team.
     */
    public function delete(User $user, Team $team): bool
    {
        return $team->isOwner($user);
    }

    /**
     * Determine whether the user can manage team members.
     */
    public function manageMembers(User $user, Team $team): bool
    {
        return $team->isOwner($user)
            || $user->getRoleIn($team) === 'admin';
    }

    /**
     * Restoration is not supported.
     */
    public function restore(User $user, Team $team): bool
    {
        return false;
    }

    /**
     * Permanent deletion is not supported.
     */
    public function forceDelete(User $user, Team $team): bool
    {
        return false;
    }
}
