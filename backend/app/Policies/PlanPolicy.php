<?php

namespace App\Policies;

use App\Models\Plan;
use App\Models\User;

class PlanPolicy
{
    public function create(User $user): bool
    {
        return in_array($user->role, ['seller', 'admin'], true);
    }

    public function update(User $user, Plan $plan): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'seller' && $plan->seller_id === $user->id;
    }

    public function delete(User $user, Plan $plan): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'seller' && $plan->seller_id === $user->id;
    }
}

