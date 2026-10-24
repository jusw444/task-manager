<?php

use App\Models\Team;
use App\Models\User;
use App\Policies\TeamPolicy;
use App\Services\TeamService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * @property TeamPolicy $policy
 * @property TeamService $service
 * @property User $owner
 * @property User $admin
 * @property User $member
 * @property User $nonMember
 * @property Team $team
 */
beforeEach(function () {
    $this->policy = new TeamPolicy;
    $this->service = app(TeamService::class);

    $this->owner = User::factory()->create();
    $this->admin = User::factory()->create();
    $this->member = User::factory()->create();
    $this->nonMember = User::factory()->create();

    // The service creates the team and attaches the owner as admin.
    $this->team = $this->service->createTeam(
        'Developer Team',
        $this->owner
    );

    $this->service->addMember(
        $this->team,
        $this->admin,
        'admin'
    );

    $this->service->addMember(
        $this->team,
        $this->member,
        'member'
    );
});

test('team owner, admin, and member can view the team', function () {
    expect($this->policy->view($this->owner, $this->team))->toBeTrue()
        ->and($this->policy->view($this->admin, $this->team))->toBeTrue()
        ->and($this->policy->view($this->member, $this->team))->toBeTrue();
});

test('non-member cannot view the team', function () {
    expect($this->policy->view($this->nonMember, $this->team))->toBeFalse();
});

test('owner and admin can update the team', function () {
    expect($this->policy->update($this->owner, $this->team))->toBeTrue()
        ->and($this->policy->update($this->admin, $this->team))->toBeTrue();
});

test('regular member and non-member cannot update the team', function () {
    expect($this->policy->update($this->member, $this->team))->toBeFalse()
        ->and($this->policy->update($this->nonMember, $this->team))->toBeFalse();
});

test('only the owner can delete the team', function () {
    expect($this->policy->delete($this->owner, $this->team))->toBeTrue()
        ->and($this->policy->delete($this->admin, $this->team))->toBeFalse()
        ->and($this->policy->delete($this->member, $this->team))->toBeFalse()
        ->and($this->policy->delete($this->nonMember, $this->team))->toBeFalse();
});

test('owner and admin can manage team members', function () {
    expect($this->policy->manageMembers($this->owner, $this->team))->toBeTrue()
        ->and($this->policy->manageMembers($this->admin, $this->team))->toBeTrue();
});

test('regular member and non-member cannot manage team members', function () {
    expect($this->policy->manageMembers($this->member, $this->team))->toBeFalse()
        ->and($this->policy->manageMembers($this->nonMember, $this->team))->toBeFalse();
});

test('authenticated users can view the team list and create teams', function () {
    expect($this->policy->viewAny($this->owner))->toBeTrue()
        ->and($this->policy->create($this->owner))->toBeTrue();
});
